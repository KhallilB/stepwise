use serde::Deserialize;
use serde_json::Value;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Submission {
    pub challenge_id: String,
    pub code: String,
    pub explanation: String,
    pub stage: Option<usize>,
}

pub fn allowed_model(name: &str) -> bool {
    matches!(name, "qwen2.5-coder:7b" | "qwen2.5-coder:1.5b")
}
pub fn review_input(submission: &Submission, catalog: &Value) -> Result<Value, String> {
    if submission.code.trim().is_empty()
        || submission.code.chars().count() > 30000
        || submission.explanation.chars().count() > 12000
    {
        return Err("Submission exceeds practice limits.".into());
    }
    let challenge = catalog["challenges"]
        .as_array()
        .and_then(|items| {
            items
                .iter()
                .find(|item| item["id"].as_str() == Some(&submission.challenge_id))
        })
        .ok_or("Unknown challenge.")?;
    let stage = submission.stage.unwrap_or(0);
    let stages = challenge["stages"].as_array();
    if stage >= stages.map_or(1, Vec::len) {
        return Err("Invalid build stage.".into());
    }
    let requirements = stages.map_or_else(
        || challenge["requirements"].clone(),
        |items| {
            Value::Array(
                items
                    .iter()
                    .take(stage + 1)
                    .flat_map(|item| {
                        item["constraints"]
                            .as_array()
                            .into_iter()
                            .flatten()
                            .cloned()
                    })
                    .collect(),
            )
        },
    );
    let mut build_brief = challenge["buildBrief"].clone();
    if let Some(examples) = build_brief["examples"].as_array() {
        let visible = examples
            .iter()
            .filter(|item| item["stage"].as_u64().unwrap_or(0) <= stage as u64)
            .cloned()
            .collect();
        build_brief["examples"] = Value::Array(visible);
    }
    Ok(
        serde_json::json!({"challenge": {"kind":challenge["kind"],"buildBrief":build_brief,"debugBrief":challenge["debugBrief"],"title":challenge["title"],"brief":challenge["brief"],"requirements":requirements,"rubric":challenge["rubric"]},"code":submission.code,"explanation":submission.explanation}),
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    fn submission() -> Submission {
        Submission {
            challenge_id: "test".into(),
            code: "export default function App() {}".into(),
            explanation: "test reasoning".into(),
            stage: Some(0),
        }
    }
    fn catalog() -> Value {
        serde_json::json!({"challenges":[{"id":"test","title":"Test","brief":"Fix","requirements":["one"],"rubric":[],"stages":[{"title":"First","constraints":["first"]},{"title":"Second","constraints":["second"]}]}]})
    }
    #[test]
    fn only_local_allowlisted_models() {
        assert!(allowed_model("qwen2.5-coder:7b"));
        assert!(allowed_model("qwen2.5-coder:1.5b"));
        for name in [
            "qwen2.5-coder:7b:cloud",
            "https://evil/model",
            "../model",
            "gemma4:cloud",
        ] {
            assert!(!allowed_model(name));
        }
    }
    #[test]
    fn cumulative_requirements_never_include_future_stage() {
        let input = review_input(&submission(), &catalog()).unwrap();
        assert_eq!(
            input["challenge"]["requirements"],
            serde_json::json!(["first"])
        );
        let second = Submission {
            stage: Some(1),
            ..submission()
        };
        assert_eq!(
            review_input(&second, &catalog()).unwrap()["challenge"]["requirements"],
            serde_json::json!(["first", "second"])
        );
    }
    #[test]
    fn build_review_includes_only_current_stage_examples() {
        let mut catalog = catalog();
        catalog["challenges"][0]["kind"] = serde_json::json!("build");
        catalog["challenges"][0]["buildBrief"] = serde_json::json!({"inputs":"sample rows", "initialUi":"empty panel", "examples":[{"stage":0,"expected":"first"},{"stage":1,"expected":"future"}]});
        let input = review_input(&submission(), &catalog).unwrap();
        assert_eq!(
            input["challenge"]["buildBrief"]["examples"],
            serde_json::json!([{"stage":0,"expected":"first"}])
        );
    }
    #[test]
    fn debug_review_keeps_public_behavior_examples() {
        let mut catalog = catalog();
        catalog["challenges"][0]["debugBrief"] = serde_json::json!({"inputs":"counter", "initialUi":"zero", "examples":[{"expected":"three seats"}]});
        assert_eq!(
            review_input(&submission(), &catalog).unwrap()["challenge"]["debugBrief"],
            catalog["challenges"][0]["debugBrief"]
        );
    }
    #[test]
    fn rejects_unknown_empty_oversized_or_future_submissions() {
        for bad in [
            Submission {
                challenge_id: "missing".into(),
                ..submission()
            },
            Submission {
                code: " ".into(),
                ..submission()
            },
            Submission {
                code: "x".repeat(30001),
                ..submission()
            },
            Submission {
                explanation: "x".repeat(12001),
                ..submission()
            },
            Submission {
                stage: Some(2),
                ..submission()
            },
        ] {
            assert!(review_input(&bad, &catalog()).is_err());
        }
    }
}
