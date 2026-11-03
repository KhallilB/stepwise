# Source and releases

[KhallilB/stepwise](https://github.com/KhallilB/stepwise) is the canonical home for source, issues, reviews and documentation. Keep the lab, Stepwise and desktop app in this repository, with independent builds.

Commit source, lockfiles, runtime pins, build scripts and license notices. Keep generated builds, model weights, caches and runtime binaries out of Git. App ZIPs and checksums belong in GitHub Releases.

## Changes and review

Each active chat uses its own branch/worktree. One integration branch brings finished work together. Preserve signed source commits when updating dependencies between PRs; do not replace another chat's changes with a content-only copy.

The existing React stack is [#12, lab foundation](https://github.com/KhallilB/stepwise/pull/12), followed by [#13, briefs and examples](https://github.com/KhallilB/stepwise/pull/13). Keep that order. The separately reviewed [foundation policy](review-existing-lab.md) permits one capped review of the existing foundation; all tests and review obligations still apply. Normal limits resume once it reaches main.

`Platform checks` runs on every PR, including PRs based on another feature branch. It installs locked dependencies, runs both apps' checks, builds browser apps, and tests the built desktop frontend when present. Native macOS and real-model tests remain separate release checks. Make this job required on main after its first successful GitHub run.

## Publish a desktop preview

Use `desktop-v<version>` tags and match the Tauri and Cargo versions. Tag a clean, reviewed source commit containing the reconciled app changes. Fetch current main and complete affected checks before tagging.

1. Run the commands in [Desktop development](desktop.md), including real WKWebView permissions and a real Ollama review. Save the source commit, commands, platform and results.
2. Build with the pinned runtime. Verify the default release excludes the test driver, its signature is valid, the ZIP extracts correctly, and the extracted runtime can produce a review.
3. Verify the SHA-256 sidecar independently. Record the runtime version and archive digest from the pin.
4. Create a draft GitHub prerelease. Attach `Interview-Practice-macos-arm64.zip` and its `.sha256` file. Include requirements, install/update instructions, source commit, verification results and known limits.
5. Verify the uploaded assets, then publish. This first preview is ad-hoc signed and not notarized; include the opening steps from [Downloads](downloads.md). A stable release needs Developer ID signing and Apple notarization.
6. Add the exact version-specific asset link to Downloads and verify it. Link kcb.pro to that page when the site is deployed.

Keep each published archive immutable. Changed source or packaging needs a new version. Preserve installation docs at the same source tag as the build. Use a version-specific link for previews; a stable `releases/latest/download/...` shortcut can follow the first stable release.

GitHub documents [release links](https://docs.github.com/en/repositories/releasing-projects-on-github/linking-to-releases) and [releases with assets](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository).
