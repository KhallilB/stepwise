# 0006. Package connected practice tools locally with Tauri and Ollama

**Status:** Proposed 2026-11-02. Local implementation exists; public distribution remains unverified. Adds a desktop target alongside [0003](0003-react-router-on-cloudflare-workers.md); browser hosting choice remains unchanged.

## Context

The owner requested separate lab and Stepwise apps in this repository, connected under the interview platform, then chose a local downloadable app with bundled Ollama to avoid hosted review costs. The existing React lab owns 76 challenges, an isolated browser runner, notebook and coaching UI. Stepwise owns algorithm traces and walkthroughs. Both use React and kbui.

Primary drivers are no per-review API charges, reuse of existing practice behavior, and bounded runtime overhead. A separate browser origin is not required inside the downloadable app. Its local profile is preference data, not an account. No existing browser storage can move into a desktop origin automatically.

## Decision

Use a macOS-first Tauri 2 shell with a static frontend that composes the two separately buildable browser apps, and let restricted native commands own a bundled Ollama runtime.

The Bun workspace places each feature app under `apps/`, with shared navigation/profile storage in `packages/platform`. Desktop does not bundle a JavaScript server. It loads feature routes lazily on one local origin. Existing notebook keys remain unchanged; validated notebook import transfers drafts, notes and progress explicitly.

Rust fixes the runtime executable, arguments, private loopback endpoint and app model directory. Offered model names are allowlisted; cloud inference is disabled. Native prompts use bundled challenge requirements and exclude reference solutions. Four explicit permissions expose only status, model download, review and operation-specific cancellation to the trusted main window. No general filesystem, process or HTTP command is exposed.

Ollama executable, native libraries and license notices travel together. Model weights download only after user action. One download or review runs at once, with bounded request/response sizes and cancellation. Model unload after review trades lower idle memory for slower next review. Profile and progress remain device-local; no account or cross-device sync is added.

## Alternatives

- **Keep dev server plus installed Ollama:** smallest development change, but does not provide requested self-contained download.
- **Electron:** bundled Chromium/Node could offer more uniform editor behavior. Accept as fallback if packaged WKWebView cannot preserve editor/runtime or privilege boundaries; extra runtime overhead has not been benchmarked on this workload.
- **Tauri plus Bun server sidecar:** retains server routes but adds another process/runtime and lifecycle boundary. Static composition removes that requirement.
- **Hosted small-model review:** simpler to access remotely, but contradicts owner's current local-only direction and needs billing/access controls.

## Evidence and remaining limits

Observed on Apple Silicon macOS, 2026-11-02: both browser apps build independently; static desktop build succeeds; a local `.app` with runtime is approximately 622 MiB before model weights, including required model-runner helpers. Native tests exercise relocated runtime startup on a private port, shutdown, allowlisted models, submission bounds, cumulative stage requirements and cancellation identity. Playwright Chromium and WebKit exercise the built frontend, including editor/checks, opaque preview access denial, persistence/import and mocked native setup commands.

Follow-up on 2026-11-03: real 7B inference and native review IPC pass; frontend parser accepts actual feedback. Generated native ACL rejects all four commands from opaque iframe/data/remote origins and the preview window in Tauri’s supported test runtime. This does not prove every packaged WebView attribution behavior, review quality, or public signing/notarization. Tauri documents iframe attribution differences on Linux/Android; those targets are excluded from current support. Independent refuter's principal objection was this new native privilege boundary, followed by packaged WebView compatibility and runtime relocation. The signed bundle’s actual runtime also passes real review through the native dispatcher using the app-owned model cache. Static browser tests and native harness tests reduce those risks; actual WKWebView frame attribution remains unverified.

## Revisit if

- Packaged WKWebView fails editor workers, runtime checks or native privilege isolation: evaluate Electron with the same workload.
- Model feedback is too weak or model/context memory exceeds target hardware: change offered model choice or reconsider local-only inference with owner.
- Users need shared accounts, reliable cross-device state or centrally managed reviews: revisit persistence and service ownership before adding sync.
- Runtime cannot be redistributed with verified libraries, licenses and signatures: revisit bundling instead of silently depending on a system install.

## References

- [Desktop behavior, packaging and checks](../desktop.md)
- [Tauri capabilities](https://v2.tauri.app/security/capabilities/)
- [Tauri frontend configuration](https://v2.tauri.app/start/frontend/)
- [Ollama local API](https://docs.ollama.com/api/introduction)
