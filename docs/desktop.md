# Desktop development

Interview Practice uses Tauri 2 and macOS WKWebView. The desktop shell loads the React lab and Stepwise on one local origin. Both browser apps remain independently buildable.

| Location | Owns |
|---|---|
| `apps/interview-lab` | Challenges, editor, preview, checks and notebook |
| `apps/stepwise` | Algorithm library and prepared walkthroughs |
| `apps/desktop` | Desktop shell, local reviewer and packaging |
| `packages/platform` | Shared navigation, profile and walkthrough progress |

## Build

Use macOS 14+, Rust, Xcode command-line tools and Bun 1.3.11.

```sh
bun install --frozen-lockfile
bun run desktop:dev
bun run desktop:build
```

Builds fetch Ollama 0.40.13 from its official release and verify the archive against [the runtime pin](../apps/desktop/third-party/ollama-runtime.json). Cached archives are verified again before use. The entire runtime, helper libraries and license notices are bundled. A recursive input inventory records file hashes before app signing. Model weights download separately on explicit request; the build does not change a system Ollama installation.

`OLLAMA_RUNTIME_DIR` is a development override and requires `INTERVIEW_ALLOW_UNPINNED_RUNTIME=1`. Published builds must use the verified pin.

The app appears in `apps/desktop/src-tauri/target/release/bundle/macos/`; ZIP and SHA-256 sidecar appear in the sibling `downloads/` directory. Packaging checks the ad-hoc signature and ZIP integrity. This preview is not Apple notarized. Build architecture follows the host; only Apple Silicon is currently verified.

## Reviewer and saved work

The native backend owns the runtime, model directory and private loopback endpoint. Only the offered 7B and 1.5B models are allowed. Cloud support and cloud fallback are disabled. One review or model download runs at once; closing the app cancels work and stops its own process group.

Reviews use a 16K context, at most 2,500 output tokens and a 180-second timeout. Models unload after each request to reduce idle memory. Prompts contain the current challenge, learner code and explanation; reference answers and future-stage requirements are excluded. Feedback is advisory, and malformed responses never become scores. Desktop speech transcription is not bundled.

Profile and notebook data use validated, versioned local storage. Unchanged cached values skip writes. Storage failures remain visible; practice can continue in memory. Browser and desktop origins have separate storage. Use their Export/Import controls to move work; notebook import replaces drafts, notes and progress, while prior feedback stays in the exported backup. Export current work first. No account or automatic cross-device sync exists.

## Checks

```sh
bun run check             # Both browser apps, lint, types and units
bun run build             # Independent browser production builds
bun run check:desktop     # Built frontend in Chromium/WebKit; Rust checks
bun run test:native:e2e   # Real WKWebView journey and real local 7B review
bun run desktop:build     # Production package, signature, ZIP and checksum
```

Native end-to-end automation builds a separate debug test app with an isolated identifier, WebView store and app-data directory. It uses the official embedded WebDriver plugin with the production commands, capabilities and CSP. Model weights may be cloned from the app-owned cache. It never edits your profile or system Ollama cache.

The journey saves a profile, quits and relaunches, runs real learner checks, requests a real Ollama review, and verifies saved feedback after reload. Its hostile opaque iframe sends authenticated requests for all four native commands. Actual WKWebView ACL replies deny them, and native audit logging confirms no handlers ran. The trusted shell's review request succeeds.

The driver is an optional `native-e2e` feature. Default production builds exclude it; release builds with that feature are rejected. Native proof describes this instrumented app, not a byte-identical retail binary. An infinite loop in learner code can still stall the WebView.

`bun run test:live-review` also runs direct-model and native-IPC checks, followed by the production feedback parser. Set `INTERVIEW_TEST_RUNTIME_DIR` and `INTERVIEW_TEST_DATA_DIR` to test an extracted release against its bundled runtime and app-owned model cache.

See [Downloads](downloads.md) for installation and [Publishing](publishing.md) for release requirements.
