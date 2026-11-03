mod policy;
mod runtime;
#[cfg(all(feature = "native-e2e", not(debug_assertions)))]
compile_error!("native-e2e is restricted to debug test builds");
use policy::Submission;
use runtime::{Reviewer, Status};
use std::sync::Arc;
use tauri::{Manager, State};

#[tauri::command]
async fn ollama_status(reviewer: State<'_, Arc<Reviewer>>) -> Result<Status, String> {
    #[cfg(feature = "native-e2e")]
    eprintln!("NATIVE_E2E command=ollama_status");
    reviewer.status().await
}
#[tauri::command]
async fn start_model_download(
    model: String,
    reviewer: State<'_, Arc<Reviewer>>,
) -> Result<(), String> {
    #[cfg(feature = "native-e2e")]
    eprintln!("NATIVE_E2E command=start_model_download");
    reviewer.inner().download(model).await
}
#[tauri::command]
async fn review_solution(
    submission: Submission,
    request_id: String,
    reviewer: State<'_, Arc<Reviewer>>,
) -> Result<serde_json::Value, String> {
    #[cfg(feature = "native-e2e")]
    eprintln!("NATIVE_E2E command=review_solution");
    reviewer.review(submission, request_id).await
}
#[tauri::command]
fn cancel_local_operation(operation_id: String, reviewer: State<'_, Arc<Reviewer>>) {
    #[cfg(feature = "native-e2e")]
    eprintln!("NATIVE_E2E command=cancel_local_operation");
    reviewer.cancel(&operation_id);
}

pub fn run() {
    let builder = tauri::Builder::default();
    #[cfg(feature = "native-e2e")]
    let builder = builder.plugin(tauri_plugin_wdio_webdriver::init());
    let app = builder
        .setup(|app| {
            let runtime_dir = if cfg!(debug_assertions) && !cfg!(feature = "native-e2e") {
                std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("resources/ollama")
            } else {
                app.path().resource_dir()?.join("ollama")
            };
            let data_dir = app.path().app_data_dir()?;
            #[cfg(feature = "native-e2e")]
            let data_dir = {
                if app.config().identifier != "pro.kcb.interview-practice.native-e2e" {
                    return Err("native-e2e requires the isolated test app configuration".into());
                }
                let _ = data_dir;
                std::path::PathBuf::from(std::env::var("INTERVIEW_E2E_DATA_DIR")?)
            };
            let reviewer = Reviewer::new(runtime_dir, data_dir).map_err(std::io::Error::other)?;
            app.manage(Arc::new(reviewer));
            Ok(())
        })
        .invoke_handler(command_handler())
        .build(app_context())
        .expect("Desktop app configuration invalid");
    app.run(|handle, event| {
        if let tauri::RunEvent::Exit = event {
            handle.state::<Arc<Reviewer>>().shutdown();
        }
    });
}

#[cfg(test)]
mod permission_tests {
    use super::*;
    use tauri::test::{get_ipc_response, mock_builder, INVOKE_KEY};
    use tauri::{
        ipc::{CallbackFn, InvokeBody},
        webview::InvokeRequest,
    };

    #[test]
    fn native_capabilities_allow_shell_and_deny_learner_origins() {
        let reviewer = Reviewer::new(std::path::PathBuf::new(), std::env::temp_dir()).unwrap();
        let app = mock_builder()
            .manage(Arc::new(reviewer))
            .invoke_handler(command_handler())
            .build(app_context())
            .unwrap();
        let main = tauri::WebviewWindowBuilder::new(&app, "main", Default::default())
            .build()
            .unwrap();
        let preview = tauri::WebviewWindowBuilder::new(&app, "preview", Default::default())
            .build()
            .unwrap();
        let invoke =
            |window: &tauri::WebviewWindow<tauri::test::MockRuntime>, url: &str, command: &str| {
                get_ipc_response(
                    window,
                    InvokeRequest {
                        cmd: command.into(),
                        callback: CallbackFn(0),
                        error: CallbackFn(1),
                        url: url.parse().unwrap(),
                        body: InvokeBody::Json(serde_json::json!({"operationId":"test"})),
                        headers: Default::default(),
                        invoke_key: INVOKE_KEY.into(),
                    },
                )
            };
        assert!(
            invoke(&main, "tauri://localhost", "cancel_local_operation").is_ok(),
            "trusted local shell must reach registered command"
        );
        for origin in [
            "about:srcdoc",
            "https://evil.invalid",
            "data:text/html,learner",
        ] {
            for command in [
                "ollama_status",
                "start_model_download",
                "review_solution",
                "cancel_local_operation",
            ] {
                let error = invoke(&main, origin, command)
                    .expect_err("untrusted origin must fail native capability check")
                    .to_string();
                assert!(
                    error.contains(command) && error.contains("not allowed"),
                    "untrusted origin {origin} must fail ACL for {command}: {error}"
                );
            }
        }
        let error = invoke(&preview, "tauri://localhost", "cancel_local_operation")
            .expect_err("preview label has no native capability")
            .to_string();
        assert!(
            error.contains("not allowed"),
            "preview must fail ACL: {error}"
        );
    }
}

fn app_context<R: tauri::Runtime>() -> tauri::Context<R> {
    let context = tauri::generate_context!();
    #[cfg(feature = "native-e2e")]
    let context = {
        let mut context = context;
        for window in &mut context.config_mut().app.windows {
            window.data_store_identifier = Some(*b"InterviewTest001");
        }
        context
    };
    context
}

fn command_handler<R: tauri::Runtime>(
) -> impl Fn(tauri::ipc::Invoke<R>) -> bool + Send + Sync + 'static {
    tauri::generate_handler![
        ollama_status,
        start_model_download,
        review_solution,
        cancel_local_operation
    ]
}

#[cfg(test)]
mod live_ipc_tests {
    use super::*;
    #[test]
    #[ignore = "Uses downloaded local model and real inference through Tauri dispatcher"]
    fn real_review_through_native_ipc() {
        let root = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        let reviewer = Arc::new(
            Reviewer::new(runtime::test_runtime_dir(), runtime::test_model_data_dir()).unwrap(),
        );
        tauri::async_runtime::block_on(async {
            for _ in 0..100 {
                if reviewer.status().await.unwrap().phase == "ready" {
                    return;
                }
                tokio::time::sleep(std::time::Duration::from_millis(100)).await;
            }
            panic!("Install local review model via real_ollama_review first");
        });
        let app = tauri::test::mock_builder()
            .manage(reviewer.clone())
            .invoke_handler(command_handler())
            .build(app_context())
            .unwrap();
        let main = tauri::WebviewWindowBuilder::new(&app, "main", Default::default())
            .build()
            .unwrap();
        let body = serde_json::json!({"requestId":"live-ipc-proof", "submission": {
            "challengeId":"snapshot", "stage":0,
            "code":"import { useState } from 'react'; export default function App() { const [count,setCount]=useState(0); return <button onClick={()=>{setCount(c=>c+1);setCount(c=>c+1);setCount(c=>c+1)}}>{count}</button>; }",
            "explanation":"React composes the three functional updaters against pending state, so each click increments by three instead of reusing the same render snapshot."
        }});
        let response = tauri::test::get_ipc_response(
            &main,
            tauri::webview::InvokeRequest {
                cmd: "review_solution".into(),
                callback: tauri::ipc::CallbackFn(0),
                error: tauri::ipc::CallbackFn(1),
                url: "tauri://localhost".parse().unwrap(),
                body: tauri::ipc::InvokeBody::Json(body),
                headers: Default::default(),
                invoke_key: tauri::test::INVOKE_KEY.into(),
            },
        )
        .expect("trusted review IPC should complete real inference");
        let output: serde_json::Value = response.deserialize().unwrap();
        assert_eq!(output["model"], "qwen2.5-coder:7b");
        assert!(!output["review"]["summary"]
            .as_str()
            .unwrap_or("")
            .is_empty());
        std::fs::write(
            root.join("target/live-ipc-review-result.json"),
            serde_json::to_vec_pretty(&output).unwrap(),
        )
        .unwrap();
        reviewer.shutdown();
    }
}
