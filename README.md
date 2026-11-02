# Stepwise

**Write a solution. Watch it run, one step at a time.**

Data structures and algorithms are learned by following data as it changes, yet most tools show only the final result. Practice sites report that an answer is wrong, not where it went wrong. Visualizers animate prepared examples, not your own code.

Stepwise closes that gap. Pick a problem, write a solution and press **Walk through**. Stepwise runs your code step by step and draws the data the way it is taught: arrays with pointers, grids, linked lists and trees.

```text
 1   3   5   7   9  11  13  15
                lo mid      hi
Step 6 of 6 · "nums[5] is 11. Found it."
```

Each step comes with one plain sentence. When a test fails, the walkthrough opens at the step where it went wrong.

> **Status:** building the clickable algorithm prototype ([M1](docs/roadmap.md#m1--clickable-prototype)). The binary search walkthrough runs from a hand-written trace. The separate personal React lab below executes learner code. The design is in [`docs/`](docs).

## Personal React practice

Run `bun run dev` and open `/react-lab` for 76 interactive frontend challenges,
from Very easy to Very hard, including HTML, responsive CSS, design, accessibility,
React, practical algorithms, and seven progressive 35–40 minute builds. Edit TSX, run cumulative behavior checks, record spoken explanations, and request AI coaching.
Drafts and feedback save on your device. Monaco supports React snippets and live preview.
Use Tailwind utilities or edit `styles.css`; both work locally in the isolated preview.
Coaching defaults to local Ollama; speech uses a local Whisper-compatible server. OpenAI is optional and explicit.
See [React lab](docs/react-lab.md) for scope and limits. Personal learning milestones stay
separate from the algorithm product roadmap.
The [112-problem curriculum](docs/frontend-curriculum.md) distinguishes 76 runnable exercises
from 36 proposed browser/server and design-evaluation exercises.

## License

[MIT](LICENSE)
