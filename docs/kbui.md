# Building on kbui

Stepwise's interface uses [kbui](https://github.com/KhallilB/kbui), a React component library built on Base UI. When Stepwise needs a component kbui lacks, it is added to kbui rather than built in Stepwise. Code specific to Stepwise, such as the views, runners and detector, stays in this repository. See [decision 0002](decisions/0002-build-on-kbui.md).

## Available today

Button, Toolbar, Panel, Badge, Status, Callout, Stat, Input, Select, Menu, RadioGroup, Switch, Progress, Tooltip, Dialog, ScrollArea, NumberField, Card and Grid cover most of the interface.

## To add

Sizes: S is about a day, M two to three days, L four to six.

**Before Phase 1**

| | Addition | Used for | Size |
|---|---|---|---|
| G1 | Visualization color tokens | Every view | S |
| G2 | Resizable panels | Editor and view split | L |
| G3 | Slider with markers | Step timeline | M |
| G4 | Tabs | Test cases, statement | M |
| G5 | Kbd | Shortcut hints | S |
| G6 | Screen-reader announcer | Step narration | S |
| G7 | Code highlighting tokens and editor theme | Editor | M |

**Before the first release**

| | Addition | Used for | Size |
|---|---|---|---|
| G8 | Drawer | Problem statement | M |
| G9 | Table | Library, results, table view of each visualization | L |
| G10 | Toast | Notifications | M |
| G11 | Popover | View switcher | M |
| G12 | Collapsible | Error details | S |
| G13 | Skeleton | Loading states | S |
| G14 | EmptyState | Empty search and history | S |
| G15 | Keyboard shortcut hook | All shortcuts | M |
| G20 | Split layouts for desktop, tablet and phone | Workspace | L |

**v1:** command palette (G16), read-only code block (G17), avatar and account menu (G18), sparkline (G19).

## Changes to kbui itself

- Visualization colors must stay distinct from kbui's accent and status colors, and be checked for color blindness and contrast in both themes.
- Two new motion durations: tree and graph relayout (about 320 ms) and a value-change pulse (400 ms).
- Phone-sized controls need 44 px touch targets.
- Global arrow-key stepping must not conflict with Toolbar's arrow-key navigation.

## Workflow

- Each kbui addition ships with its standard story, test, screenshot and accessibility scan.
- kbui releases are grouped by Stepwise phase.
- A temporary component in Stepwise is allowed only with a ticket to move it into kbui in the same phase.
