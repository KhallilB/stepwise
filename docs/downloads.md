# Download Interview Practice

The React lab, Stepwise and a local solution reviewer in one macOS app.

**Preview release is being prepared.** Published downloads will appear on [GitHub Releases](https://github.com/KhallilB/stepwise/releases). No public app asset is available yet.

## Requirements

macOS 14 or later on Apple Silicon. Intel Mac, Windows and Linux downloads are not verified. The app bundles Ollama; no separate installation, API key or developer tools are needed.

Model weights download separately. The 7B option uses about 4.7 GB of disk space; the 1.5B option uses about 986 MB with weaker feedback. Leave extra memory and disk space for inference. Internet is needed for the first model download; reviews then run locally without a per-review charge.

## Install the preview

1. From the release, download `Interview-Practice-macos-arm64.zip`, extract it and move Interview Practice to Applications.
2. Open the app. This preview has an ad-hoc signature and is not Apple notarized, so macOS may block it.
3. If you trust this repository and downloaded its release asset, open **System Settings → Privacy & Security**, choose **Open Anyway** for Interview Practice, then confirm **Open**. See [Apple's opening instructions](https://support.apple.com/en-us/102445).

Each release includes a `.zip.sha256` file. To verify a download, place both files together and run `shasum -a 256 -c Interview-Practice-macos-arm64.zip.sha256` in that folder.

## First review

Open **Local reviewer**, choose a model and press **Download / use selected model**. Then start a frontend challenge, edit your implementation and run its checks. Choose **Finish & review**, type your reasoning and request feedback. Scores are coaching; compare them with the behavior checks. Speech transcription is not included in this preview.

## Keep your work

Save your name and goal in **Profile**. Drafts, progress and reviews save on this device. Use profile and notebook Export controls for backups or transfers between browser and desktop. Export current work before importing a backup. There is no account or automatic sync.

Updates replace the app, not its saved data. Keep backups, and check the release notes before updating.

[Source](https://github.com/KhallilB/stepwise) · [Developer setup](desktop.md) · [Release process](publishing.md)
