# Interview Practice

Practice frontend interviews and explore algorithms, with a local reviewer when you need feedback.

[Downloads](docs/downloads.md) · [Documentation](docs/README.md) · [Source and releases](https://github.com/KhallilB/stepwise)

- **React lab:** 76 exercises, a multi-file editor, isolated live preview, behavior checks and a practice notebook.
- **Stepwise:** algorithm walkthroughs with pointers, grids and queues. These use prepared traces; Stepwise does not execute learner code yet.
- **Desktop:** both apps together, with bundled Ollama. Download a model once; subsequent reviews run on your Mac without an API key or per-review fee.

Profile, drafts, progress and feedback save on your device. Export backups before moving between browser and desktop; there is no account or automatic sync.

## Run from source

```sh
bun install --frozen-lockfile
bun run dev             # React lab: http://localhost:5173/react-lab
bun run dev:stepwise    # Stepwise: http://localhost:5174
bun run desktop:dev    # macOS app and local reviewer
```

The browser apps build and deploy separately. Desktop setup needs macOS 14+, Rust and Xcode command-line tools; downloaded app users need none of those developer tools. See [Contributing](CONTRIBUTING.md) and [Desktop development](docs/desktop.md).

The [frontend curriculum](docs/frontend-curriculum.md) separates runnable exercises from proposed work. Stepwise's [product roadmap](docs/roadmap.md) tracks the algorithm product.

## License

[MIT](LICENSE). Bundled runtime notices travel with the app.
