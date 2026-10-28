# Stepwise

**Write a solution. Watch it run, one step at a time.**

Stepwise is a practice platform for data structures and algorithms. You pick a problem, write a solution and press **Walk through**. Stepwise runs your code step by step and draws the data the way it is taught: arrays with pointers, grids, linked lists and trees.

```text
 1   3   5   7   9  11  13  15
                lo mid      hi
Step 6 of 6 · "nums[5] is 11. Found it."
```

Each step comes with one plain sentence. When a test fails, the walkthrough opens at the step where it went wrong.

> **Status:** planning. This repository contains the design. No application code exists yet.

## Why Stepwise

Practice sites report whether an answer is correct, not why it fails. Visualizers animate prepared examples, not the learner's own code. Stepwise connects the two: it draws your code, including your mistakes, as the data structure it operates on.

## First release

- 30 original problems in Python
- Code runs in the browser, with no account required
- Step forward and back, play, scrub and change speed from the keyboard
- Six views selected automatically: array, grid, linked list, binary tree, hash map and recursion
- Jump directly to the failing step

## Documentation

| Document | Contents |
|---|---|
| [Product](docs/product.md) | Audience, release scope, assumptions and success measures |
| [Design](docs/design.md) | Screens, views, motion, keyboard and accessibility |
| [Technical design](docs/technical.md) | Architecture, stack, data formats, limits and testing |
| [Building on kbui](docs/kbui.md) | Components available in kbui and those still to add |
| [Roadmap](docs/roadmap.md) | Phases, risks and open questions |
| [Decision records](docs/decisions/README.md) | Rationale for the major choices |

The [original specification](docs/specs/2026-10-27-stepwise-spec.html) holds the full detail these documents summarize.

## License

[MIT](LICENSE)
