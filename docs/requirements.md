# Requirements

This is what the first release has to do. A feature is done when its check passes, not when it looks finished.

| Feature | What it does | Done when |
|---|---|---|
| Problem library | Lists problems with pattern, difficulty and your status. Filter by pattern and difficulty, search by title. Filters are remembered. | The list loads in under 100 ms, and every problem can be opened with Tab and Enter. |
| Problem statement | Opens in a drawer over the editor, with examples and constraints. | P toggles it, and focus returns to the editor when it closes. |
| Editor | Python highlighting, indentation, bracket matching and simple completion. Starter code per problem. Drafts save after a second of idle time. | Typing has no lag in a 200-line file, and a reload brings your draft back. |
| Run tests | Runs every visible test off the main thread and shows expected and actual values. | Results appear within 500 ms once Python has loaded. |
| Walk through | Runs one test with tracing on and opens walk mode, starting with the first failing test. Records up to 5,000 steps and says so if it stops early. | A 5,000-step trace is ready in under 400 ms and opens at step 1. |
| Step controls | Back, play, next, scrubber, first and last step, and four speeds. Step over or out of a function. Click a line number to jump to the next time it runs. | Each step draws within one frame, and scrubbing stays above 50 fps. |
| Code and state in sync | Highlights the current line. A variables panel shows locals and briefly marks any that changed. The call stack appears when one function calls another. | An automated test confirms the line, views and variables always come from the same step. |
| Automatic views | Picks up to three main views and labels the choice, for example "Grid + BFS". You can switch or pin any view, and pins are remembered per problem. | Every reference solution gets the view we intended. |
| Narration | One sentence per step, built from templates for each kind of action: compare, assign, append, pop, call, return and branch. | No step is missing a sentence, and screen readers announce each one. |
| Jump to failure | On an error, opens at the failing step and marks it on the timeline. On a wrong answer, opens at the final return with an option to watch from the start. | End-to-end tests with planted bugs open at the right step. |
| Live mode | Off by default. When on, re-runs 400 ms after you stop typing. If your code breaks, the last working walkthrough stays on screen, dimmed, and the view tries to stay on the same line. | A minute of continuous typing never shows a blank view. |
| Progress and accounts | Everything works without an account. Signing in with an email link or GitHub syncs drafts, progress and pinned views. | Signing in after solving three problems keeps all three marked as solved. |
| Runaway code | Stops runs at 5,000 steps, 3 seconds or a memory cap. The Stop button responds within 100 ms. The message points at the likely cause, such as "The loop on line 4 may never end." | `while True: pass` never freezes the tab. |
