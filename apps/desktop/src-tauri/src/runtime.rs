use crate::policy::{allowed_model, review_input, Submission};
use serde::Serialize;
use serde_json::{json, Value};
use std::{
    fs,
    net::TcpListener,
    path::PathBuf,
    process::{Child, Command, Stdio},
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};
use tokio::sync::Semaphore;
use tokio_util::sync::CancellationToken;

#[derive(Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Status {
    pub phase: String,
    pub model: String,
    pub completed: u64,
    pub total: u64,
    pub error: Option<String>,
    pub operation_id: Option<String>,
}
struct Operation {
    id: String,
    cancel: CancellationToken,
}
struct Server {
    child: Child,
    base: String,
}
pub struct Reviewer {
    runtime_dir: PathBuf,
    data_dir: PathBuf,
    server: Mutex<Option<Server>>,
    status: Mutex<Status>,
    operation: Mutex<Option<Operation>>,
    gate: Arc<Semaphore>,
    client: reqwest::Client,
    download: Mutex<Option<tauri::async_runtime::JoinHandle<()>>>,
}
fn lock<T>(mutex: &Mutex<T>) -> std::sync::MutexGuard<'_, T> {
    mutex
        .lock()
        .unwrap_or_else(std::sync::PoisonError::into_inner)
}

impl Reviewer {
    pub fn new(runtime_dir: PathBuf, data_dir: PathBuf) -> Result<Self, String> {
        fs::create_dir_all(&data_dir)
            .map_err(|_| "Cannot create local practice data directory.")?;
        let model = fs::read_to_string(data_dir.join("model.json"))
            .ok()
            .and_then(|raw| serde_json::from_str::<String>(&raw).ok())
            .filter(|name| allowed_model(name))
            .unwrap_or_else(|| "qwen2.5-coder:7b".into());
        let client = reqwest::Client::builder()
            .redirect(reqwest::redirect::Policy::none())
            .no_proxy()
            .connect_timeout(Duration::from_secs(3))
            .build()
            .map_err(|_| "Cannot initialize local review client.")?;
        Ok(Self {
            runtime_dir,
            data_dir,
            server: Mutex::new(None),
            status: Mutex::new(Status {
                phase: "starting".into(),
                model,
                ..Status::default()
            }),
            operation: Mutex::new(None),
            gate: Arc::new(Semaphore::new(1)),
            client,
            download: Mutex::new(None),
        })
    }
    // Fixed resource executable and arguments; frontend never chooses paths or URLs.
    fn ensure_server(&self) -> Result<String, String> {
        let mut guard = lock(&self.server);
        if let Some(server) = guard.as_mut() {
            if server
                .child
                .try_wait()
                .map_err(|_| "Cannot inspect local reviewer.")?
                .is_none()
            {
                return Ok(server.base.clone());
            }
            *guard = None;
        }
        let listener =
            TcpListener::bind("127.0.0.1:0").map_err(|_| "Cannot reserve private review port.")?;
        let address = listener
            .local_addr()
            .map_err(|_| "Cannot read private review port.")?;
        drop(listener);
        let mut command = Command::new(self.runtime_dir.join("ollama"));
        command
            .arg("serve")
            .current_dir(&self.runtime_dir)
            .env("OLLAMA_HOST", address.to_string())
            .env("OLLAMA_MODELS", self.data_dir.join("models"))
            .env("OLLAMA_NO_CLOUD", "1")
            .env("OLLAMA_MAX_LOADED_MODELS", "1")
            .env("OLLAMA_NUM_PARALLEL", "1")
            .env("OLLAMA_KEEP_ALIVE", "0")
            .env("OLLAMA_ORIGINS", "")
            .env_remove("OLLAMA_API_KEY")
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null());
        #[cfg(unix)]
        {
            use std::os::unix::process::CommandExt;
            command.process_group(0);
        }
        let child = command
            .spawn()
            .map_err(|_| "Bundled Ollama could not start. Reinstall complete desktop bundle.")?;
        let base = format!("http://{address}");
        *guard = Some(Server {
            child,
            base: base.clone(),
        });
        Ok(base)
    }
    async fn tags(&self, base: &str) -> Result<Value, String> {
        let response = self
            .client
            .get(format!("{base}/api/tags"))
            .timeout(Duration::from_secs(3))
            .send()
            .await
            .map_err(|_| "Local reviewer is starting. Retry shortly.")?;
        bounded_json(response, 128000).await
    }
    pub async fn status(&self) -> Result<Status, String> {
        let base = self.ensure_server()?;
        let mut status = lock(&self.status).clone();
        if status.phase == "downloading" || status.phase == "reviewing" || status.phase == "failed"
        {
            return Ok(status);
        }
        match self.tags(&base).await {
            Ok(tags) => {
                let ready = tags["models"].as_array().is_some_and(|items| {
                    items.iter().any(|item| {
                        item["name"].as_str() == Some(&status.model)
                            && item.get("remote_host").is_none()
                    })
                });
                status.phase = if ready { "ready" } else { "missing" }.into();
            }
            Err(_) => status.phase = "starting".into(),
        }
        Ok(self.update_idle_status(&status.model, &status.phase))
    }
    fn update_idle_status(&self, model: &str, phase: &str) -> Status {
        let mut current = lock(&self.status);
        // A response started before a download must not overwrite its operation identity.
        if current.model != model
            || matches!(
                current.phase.as_str(),
                "downloading" | "reviewing" | "failed"
            )
        {
            return current.clone();
        }
        current.phase = phase.into();
        current.clone()
    }
    fn start_operation(&self, id: String, phase: &str) -> CancellationToken {
        let cancel = CancellationToken::new();
        *lock(&self.operation) = Some(Operation {
            id: id.clone(),
            cancel: cancel.clone(),
        });
        let mut status = lock(&self.status);
        status.phase = phase.into();
        status.operation_id = Some(id);
        status.error = None;
        status.completed = 0;
        status.total = 0;
        cancel
    }
    fn finish(&self, error: Option<String>) {
        *lock(&self.operation) = None;
        let mut status = lock(&self.status);
        status.phase = if error.is_some() {
            "failed"
        } else {
            "starting"
        }
        .into();
        status.error = error;
        status.operation_id = None;
    }
    pub fn cancel(&self, id: &str) {
        if let Some(operation) = lock(&self.operation).as_ref() {
            if operation.id == id {
                operation.cancel.cancel();
            }
        }
    }
    pub async fn download(self: &Arc<Self>, model: String) -> Result<(), String> {
        if !allowed_model(&model) {
            return Err("Choose an offered local model.".into());
        }
        let permit = self
            .gate
            .clone()
            .try_acquire_owned()
            .map_err(|_| "One local review or download can run at a time.")?;
        let base = self.ensure_server()?;
        fs::write(
            self.data_dir.join("model.json"),
            serde_json::to_vec(&model).map_err(|_| "Invalid model setting.")?,
        )
        .map_err(|_| "Cannot save selected model.")?;
        lock(&self.status).model = model.clone();
        let cancel = self.start_operation("model-download".into(), "downloading");
        let owner = self.clone();
        let task = tauri::async_runtime::spawn(async move {
            let result = tokio::select! {
                _ = cancel.cancelled() => Err("Model download cancelled. Retry resumes verified layers.".into()),
                result = owner.pull(&base, &model) => result,
            };
            owner.finish(result.err());
            drop(permit);
        });
        *lock(&self.download) = Some(task);
        Ok(())
    }
    async fn pull(&self, base: &str, model: &str) -> Result<(), String> {
        let mut response = self
            .client
            .post(format!("{base}/api/pull"))
            .json(&json!({"model":model,"stream":true}))
            .timeout(Duration::from_secs(1800))
            .send()
            .await
            .map_err(|_| "Model download could not start. Check internet connection.")?;
        if !response.status().is_success() {
            return Err("Model registry refused download.".into());
        }
        let mut buffer = Vec::new();
        let mut success = false;
        while let Some(chunk) = response
            .chunk()
            .await
            .map_err(|_| "Download interrupted. Retry resumes verified layers.")?
        {
            buffer.extend_from_slice(&chunk);
            while let Some(end) = buffer.iter().position(|byte| *byte == b'\n') {
                let line: Vec<_> = buffer.drain(..=end).collect();
                let value: Value =
                    serde_json::from_slice(&line).map_err(|_| "Invalid download progress.")?;
                if value.get("error").is_some() {
                    return Err(
                        "Model download failed. Check available disk space and connection.".into(),
                    );
                }
                let mut status = lock(&self.status);
                if let Some(total) = value["total"].as_u64() {
                    status.total = total;
                    status.completed = value["completed"].as_u64().unwrap_or(0).min(total);
                }
                if value["status"] == "success" {
                    success = true;
                }
            }
            if buffer.len() > 64000 {
                return Err("Oversized download response.".into());
            }
        }
        if success {
            Ok(())
        } else {
            Err("Download ended before verification completed. Retry download.".into())
        }
    }
    pub async fn review(
        &self,
        submission: Submission,
        request_id: String,
    ) -> Result<Value, String> {
        if request_id.is_empty() || request_id.len() > 64 {
            return Err("Invalid review request ID.".into());
        }
        let catalog: Value = serde_json::from_str(include_str!("../generated/review-catalog.json"))
            .map_err(|_| "Bundled review catalog invalid.")?;
        let input = review_input(&submission, &catalog)?;
        let _permit = self
            .gate
            .clone()
            .try_acquire_owned()
            .map_err(|_| "Local reviewer busy. Wait or cancel current operation.")?;
        let status = self.status().await?;
        if status.phase != "ready" {
            return Err("Download a local review model in Local reviewer first.".into());
        }
        let base = self.ensure_server()?;
        let cancel = self.start_operation(request_id, "reviewing");
        let result = tokio::select! {
            _ = cancel.cancelled() => Err("Local review cancelled.".into()),
            result = self.chat(&base, &status.model, &catalog, input) => result,
        };
        self.finish(None);
        result
    }
    async fn chat(
        &self,
        base: &str,
        model: &str,
        catalog: &Value,
        input: Value,
    ) -> Result<Value, String> {
        let response = self.client.post(format!("{base}/api/chat")).json(&json!({
            "model":model,"stream":false,"format":catalog["schema"],"keep_alive":0,
            "messages":[{"role":"system","content":catalog["instructions"]},{"role":"user","content":input.to_string()}],
            "options":{"temperature":0.2,"num_predict":2500,"num_ctx":16384}
        })).timeout(Duration::from_secs(180)).send().await.map_err(|_| "Local review timed out or stopped. No score recorded.")?;
        let value = bounded_json(response, 80000).await?;
        if value["done"] != true {
            return Err("Local model did not finish. No score recorded.".into());
        }
        let review: Value = serde_json::from_str(
            value["message"]["content"]
                .as_str()
                .ok_or("Local model returned no feedback.")?,
        )
        .map_err(|_| "Local model returned invalid feedback. No score recorded.")?;
        Ok(json!({"model":model,"review":review}))
    }
    pub fn shutdown(&self) {
        if let Some(operation) = lock(&self.operation).as_ref() {
            operation.cancel.cancel();
        }
        if let Some(task) = lock(&self.download).take() {
            task.abort();
        }
        if let Some(mut server) = lock(&self.server).take() {
            #[cfg(unix)]
            unsafe {
                libc::kill(-(server.child.id() as i32), libc::SIGTERM);
            }
            let until = Instant::now() + Duration::from_secs(2);
            while Instant::now() < until {
                if matches!(server.child.try_wait(), Ok(Some(_))) {
                    return;
                }
                std::thread::sleep(Duration::from_millis(20));
            }
            #[cfg(unix)]
            unsafe {
                libc::kill(-(server.child.id() as i32), libc::SIGKILL);
            }
            let _ = server.child.kill();
            let _ = server.child.wait();
        }
    }
}
impl Drop for Reviewer {
    fn drop(&mut self) {
        if let Some(operation) = lock(&self.operation).as_ref() {
            operation.cancel.cancel();
        }
        if let Some(task) = lock(&self.download).take() {
            task.abort();
        }
        if let Some(mut server) = lock(&self.server).take() {
            #[cfg(unix)]
            unsafe {
                libc::kill(-(server.child.id() as i32), libc::SIGTERM);
            }
            let _ = server.child.kill();
            let _ = server.child.try_wait();
        }
    }
}
async fn bounded_json(mut response: reqwest::Response, limit: usize) -> Result<Value, String> {
    if !response.status().is_success() {
        return Err("Local model request failed. No score recorded.".into());
    }
    let mut bytes = Vec::new();
    while let Some(chunk) = response
        .chunk()
        .await
        .map_err(|_| "Local model response interrupted.")?
    {
        if bytes.len() + chunk.len() > limit {
            return Err("Local model response exceeded limit.".into());
        }
        bytes.extend_from_slice(&chunk);
    }
    serde_json::from_slice(&bytes).map_err(|_| "Local model returned unreadable data.".into())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn bundled_runtime_is_private_and_stops_on_shutdown() {
        let resources = std::env::var_os("INTERVIEW_TEST_RUNTIME_DIR")
            .map(PathBuf::from)
            .unwrap_or_else(|| PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("resources/ollama"));
        assert!(
            resources.join("ollama").exists(),
            "Run desktop prepare:runtime before native tests"
        );
        let data =
            std::env::temp_dir().join(format!("interview-runtime-test-{}", std::process::id()));
        let reviewer = Reviewer::new(resources, data.clone()).unwrap();
        let base = reviewer.ensure_server().unwrap();
        assert!(base.starts_with("http://127.0.0.1:"));
        assert_ne!(base, "http://127.0.0.1:11434");
        let mut ready = false;
        for _ in 0..50 {
            if reviewer.tags(&base).await.is_ok() {
                ready = true;
                break;
            }
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
        assert!(ready, "relocated bundled runtime must find its libraries");
        assert_eq!(reviewer.status().await.unwrap().phase, "missing");
        reviewer.shutdown();
        assert!(reviewer.tags(&base).await.is_err());
        fs::remove_dir_all(data).unwrap();
    }
    #[test]
    fn late_status_cannot_erase_active_download() {
        let reviewer = Reviewer::new(PathBuf::new(), std::env::temp_dir()).unwrap();
        reviewer.start_operation("model-download".into(), "downloading");
        let status = reviewer.update_idle_status("qwen2.5-coder:7b", "missing");
        assert_eq!(status.phase, "downloading");
        assert_eq!(status.operation_id.as_deref(), Some("model-download"));
    }
    #[test]
    fn stale_cancel_cannot_cancel_new_operation() {
        let reviewer = Reviewer::new(PathBuf::new(), std::env::temp_dir()).unwrap();
        let current = reviewer.start_operation("new-request".into(), "reviewing");
        reviewer.cancel("old-request");
        assert!(!current.is_cancelled());
        reviewer.cancel("new-request");
        assert!(current.is_cancelled());
    }
}

#[cfg(test)]
mod live_tests {
    use super::*;
    #[tokio::test]
    #[ignore = "Downloads local 7B model; runs real Ollama inference"]
    async fn real_ollama_review() {
        let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        let reviewer = Arc::new(Reviewer::new(test_runtime_dir(), test_model_data_dir()).unwrap());
        let model = "qwen2.5-coder:7b";
        for _ in 0..100 {
            if reviewer.status().await.unwrap().phase != "starting" {
                break;
            }
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
        reviewer.download(model.into()).await.unwrap();
        let until = Instant::now() + Duration::from_secs(1800);
        loop {
            let status = reviewer.status().await.unwrap();
            assert_ne!(status.phase, "failed", "{:?}", status.error);
            if status.phase == "ready" {
                break;
            }
            assert!(Instant::now() < until, "model download timeout");
            tokio::time::sleep(Duration::from_secs(2)).await;
        }
        let submission = Submission {
            challenge_id: "snapshot".into(),
            code: "import { useState } from 'react'; export default function App() { const [count,setCount]=useState(0); return <button onClick={()=>{setCount(count+1);setCount(count+1);setCount(count+1)}}>{count}</button>; }".into(),
            explanation: "Each call uses the same render snapshot, so this increments by one. Functional updaters would compose three increments.".into(),
            stage: None,
        };
        let output = reviewer
            .review(submission, "live-review-proof".into())
            .await
            .unwrap();
        let review = &output["review"];
        assert!(!review["summary"].as_str().unwrap_or("").is_empty());
        for name in ["correctness", "reasoning", "communication", "tradeoffs"] {
            assert!(review[name]["score"]
                .as_u64()
                .is_some_and(|score| score <= 5));
            assert!(!review[name]["evidence"].as_str().unwrap_or("").is_empty());
        }
        assert!(!review.to_string().contains("```"));
        fs::write(
            root.join("target/live-review-result.json"),
            serde_json::to_vec_pretty(&output).unwrap(),
        )
        .unwrap();
        println!("Real local review completed with {model}; structured evidence saved in target/live-review-result.json");
        reviewer.shutdown();
    }
}

#[cfg(test)]
pub(crate) fn test_runtime_dir() -> std::path::PathBuf {
    std::env::var_os("INTERVIEW_TEST_RUNTIME_DIR")
        .map(std::path::PathBuf::from)
        .unwrap_or_else(|| {
            std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("resources/ollama")
        })
}

#[cfg(test)]
pub(crate) fn test_model_data_dir() -> std::path::PathBuf {
    std::env::var_os("INTERVIEW_TEST_DATA_DIR")
        .map(std::path::PathBuf::from)
        .unwrap_or_else(|| {
            std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("target/live-review-data")
        })
}
