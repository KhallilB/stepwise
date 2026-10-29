# Building on kbui

Stepwise's interface is built with [kbui](https://github.com/KhallilB/kbui), our shared React component library. The rule is simple: if a Stepwise screen needs a component kbui doesn't have, we add it to kbui instead of building it here. Things only Stepwise needs, like the views, the runners and the detector, stay in this repository. [Decision 0002](decisions/0002-build-on-kbui.md) explains why.

## What kbui already covers

Most of the interface. Buttons, the step-control toolbar, panels, badges, status indicators, callouts for errors and limits, search and filter inputs, the speed selector, switches for settings, the loading bar, tooltips, the settings dialog, scrolling panels, cards and the page grid all exist today.

## What we need to add

Rough sizes: S is about a day, M two to three days, L four to six.

**Release A (M5), before the first real walkthrough**

| | Component | What Stepwise uses it for | Size |
|---|---|---|---|
| G1 | Visualization colors | Every view | S |
| G2 | Resizable panels | The editor and view split | L |
| G3 | Slider with markers | The step timeline | M |
| G4 | Tabs | Test cases, problem statement | M |
| G5 | Keyboard key label | Shortcut hints | S |
| G6 | Screen-reader announcer | Step narration | S |
| G7 | Code colors and an editor theme | The editor | M |

**Release B (M9), before the full library**

| | Component | What Stepwise uses it for | Size |
|---|---|---|---|
| G8 | Drawer | The problem statement | M |
| G9 | Table | The library, test results, and the table version of each view | L |
| G10 | Toast | "Solved" and "Draft restored" messages | M |
| G11 | Popover | Switching views | M |
| G12 | Collapsible section | Error details | S |
| G13 | Loading placeholder | The library and workspace | S |
| G14 | Empty state | No search results, no attempts yet | S |
| G15 | Keyboard shortcuts | Every shortcut, and the shortcut list | M |
| G20 | Split layouts | The workspace on desktop, tablet and phone | L |

**For v1:** a command palette (G16), a read-only code block (G17), an account menu (G18) and a small trend chart (G19).

## Changes to kbui itself

The visualization colors need to stay clearly apart from kbui's accent and status colors, and we'll check them for color blindness and contrast in both themes. We also need two new animation timings, one for trees and graphs rearranging and one for the pulse when a value changes. Controls need 44 px touch targets on phones. And step-by-step arrow keys can't clash with the toolbar's own arrow-key navigation.

## How we work

Each new component ships the way every kbui component does, with a story, tests, a screenshot check and an accessibility scan. We build each group just before the Stepwise milestone that needs it, and nothing for Stepwise until the learner study says go. If we ever need a stopgap component inside Stepwise, it comes with a ticket to move it into kbui before the next milestone.
