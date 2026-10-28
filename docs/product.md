# Product

## The problem

Data structures and algorithms make sense once you can see the data change. Most learners never get to. Their code runs a loop forty times in a blink and they see the final answer. A debugger tells them `i = 3, j = 7`, when what they need is to see `i` and `j` as arrows on the array. Visualizers help with the concept, but they animate someone else's example, not the bug in your own BFS.

Stepwise lets you write a solution and then watch it run, one step at a time, drawn the way a teacher would sketch it.

## Who it's for

Our main audience is **visual learners**: self-taught developers and bootcamp graduates who are comfortable with basic JavaScript but lose the thread once indexes, pointers or recursion show up.

We also expect **interview candidates**, who know the patterns by name but can't always explain why a solution works, and **computer science students** checking coursework. **Instructors** come later, in v2, when we add shared walkthroughs and class views.

What they're trying to do:

- When my answer is wrong, show me the moment my code did something I didn't expect.
- When I don't understand a solution, let me watch it run on a small input.
- When I learn a pattern like two pointers or BFS, show me what it looks like so I recognize it next time.

## How it works

You pick a problem, write a solution, and press **Walk through**. Your code runs in the browser with every step recorded. Stepwise works out what your data is (an array with two pointers, a grid, a linked list, a tree) and draws it that way, with one plain sentence per step. If a test fails, the walkthrough opens at the step where things went wrong.

## What we still need to prove

All of this rests on assumptions we haven't tested. Phase 0 of the [roadmap](roadmap.md) tests them with real learners before we build the product, and we stop or rethink if the first one fails.

| We believe | We're wrong if |
|---|---|
| Seeing their own code as a picture helps learners fix bugs faster | Fewer than 5 of 8 participants fix a planted bug faster than with print statements |
| Stepwise can pick the right view on its own | It picks the wrong one for more than 15% of common solutions |
| Rewriting code to trace it doesn't change what it does | Any reference solution or planted bug gives a different result traced than untraced |
| Learners step backwards, not just forwards | Fewer than 30% of walkthroughs use step-back or scrub |

## What ships when

**First release.** Thirty original JavaScript problems across the common patterns. Code runs in the browser and progress is saved on your device, so no account is needed. Walk mode with stepping, playback and a scrubber. Six views that Stepwise picks for you, plus a general fallback. A sentence for every step. Jump to the failing step. A live mode that re-runs as you type.

**v1.** Predict mode, which pauses and asks what happens next. A comparison with a reference solution that shows where yours first differs. Click any value to jump to the step that changed it. Graph, DP table, heap, stack, queue and string views. TypeScript, and Python running in the browser. Paste in your own problem. Share a walkthrough by link.

**v2.** Java, C++, Go and Rust, run on our servers. Tools for instructors.

### What we're not doing

- A huge problem bank. Thirty problems with good visuals are worth more than three thousand without.
- Contests, leaderboards or social feeds.
- A full IDE with files, packages or a terminal.
- Writing code on a phone. Phones can watch and step through a walkthrough.

## How we'll measure it

| Measure | First-release target |
|---|---|
| New visitors who finish a walkthrough in their first session | 60% |
| Median time from landing to the first picture | Under 60 seconds |
| Walkthroughs that use step-back, scrub or jump | 40% |
| Learners who fix a failing solution within 10 minutes after a walkthrough, compared with those who didn't open one | 15 points higher |
| Learners who come back within a week | 25% |
| "I understand why my solution works," rated after solving | Median 4 out of 5 |
| Walkthroughs where the learner keeps the view Stepwise picked | 85% |

We also hold three guardrails: at least 99.5% of sessions without a crash, interactions that respond within 100 ms for most users, and no more than 2% of runs hitting a time limit.

## Problem content

We write every problem ourselves. Well-known problems are fine as inspiration, but we don't copy text, names or numbering from other platforms.
