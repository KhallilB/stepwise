fn main() {
    tauri_build::try_build(tauri_build::Attributes::new().app_manifest(
        tauri_build::AppManifest::new().commands(&[
            "ollama_status",
            "start_model_download",
            "review_solution",
            "cancel_local_operation",
        ]),
    ))
    .expect("Tauri build configuration invalid");
}
