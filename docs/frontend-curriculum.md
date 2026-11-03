# Frontend and algorithm practice curriculum

The curriculum has **112 defined problem slots: 76 runnable exercises and 36 proposed
exercises**. Proposed exercises are not available in the lab and do not count toward
completion. This is a coverage plan, not evidence that every aspect of frontend work is taught.

The runnable catalog lives in `apps/interview-lab/app/react-lab/curriculum.ts`. Existing challenge ids and
notebook storage remain unchanged. New sessions progress from Very easy through Very hard;
milestone and difficulty filters let experienced learners choose another entry point.

## Difficulty contract

| Level | Runnable | Proposed | Reasoning demand |
| --- | ---: | ---: | --- |
| Very easy | 9 | 4 | One native browser concept or small state transition; about 10–12 minutes. |
| Easy | 21 | 8 | One bounded component or concrete layout brief; about 12–25 minutes. |
| Medium | 27 | 8 | Several coordinated states, lifecycle rules, or interaction requirements; about 20–40 minutes. |
| Hard | 14 | 10 | Competing intent, reusable contracts, recovery, or multiple interacting constraints; current fixtures take 30–40 minutes. |
| Very hard | 5 | 6 | Cumulative feature builds with versioning, virtualization, or independent concurrent operations; current fixtures take 40–50 minutes. |
| Total | 76 | 36 | Timeboxes are practice guidance, not hiring levels or validated learner difficulty. |

The proposed browser/server capstones need multiple sessions. Do not force real routing,
offline synchronization, or performance investigation into the current 40-minute fixture limit.
Validate difficulty with learner attempts, hints used, failure patterns, and explanations.

## Coverage and evidence boundaries

| Area | Runnable coverage | Evidence still needed |
| --- | --- | --- |
| HTML and semantics | Buttons, labels, alternatives, checkboxes, select, landmarks, grouped radios | Manual assistive-technology and browser compatibility checks |
| CSS and responsive design | Grid, flex wrapping, long text, fluid images, container queries, logical properties | Intermediate widths, zoom, text expansion, varied fonts and real content |
| Visual design | Supplied spacing/type briefs, theme consumers, empty-state explanation and recovery | Human review of hierarchy, aesthetics, content quality, and product suitability |
| React and TypeScript | State identity, derived state, hooks, reducers, callbacks, runtime payload validation | Broader typed API design and refactoring work |
| Algorithms and collections | Product transforms, quantifiers, lookup, aggregation, ordered deduplication, numeric ranking, facets, sliding windows, binary search, DFS, stacks, dependency queues | Broader algorithm families, representative workloads, and reasoning beyond specific operation-count fixtures |
| Forms and accessibility | Validation, focus, dialog, tabs, listbox, combobox, bulk selection, dependent fields | IME, screen readers, disabled/dynamic options, multiple widget instances |
| Async and recovery | Ordering, cancellation fixture, rollback, retries, caching, inline drafts, conflicts | Real HTTP, server authority, ambiguous failures, production cancellation |
| Performance | Calculation counts, bounded DOM, fixed-height scroll geometry | Browser traces, network/bundle evidence, frame rate, interaction and layout-shift measurements |
| Localization | Currency formatting, code-point counting, RTL layout | Translated content, plural rules, dates, mixed-direction text, grapheme policies |
| Routing, storage, delivery | Discussed in follow-ups | Dedicated browser/server exercises listed below |

The sandbox allows React and authored relative modules, CSS files, Tailwind utilities, native HTML, and local
promise fixtures. It denies network and origin storage. Native controls in learner code are
intentional teaching material; the Stepwise application shell continues to compose kbui.
Tailwind's compiler is bundled with the preview; origin privileges and transport access remain
unchanged. See [CSS and Tailwind](react-lab.md#css-and-tailwind) for authoring and verification.

## Exercise authoring contract

Each runnable exercise has a concrete user situation, explicit acceptance criteria, a broken
or incomplete starter, a working reference, at least two independent observable checks,
three progressive hints, three reasoning prompts, a follow-up, and a primary-source resource.
The browser suite must detect the starter's gap and pass the reference. Checks should accept
alternative correct implementations rather than require a particular hook or CSS declaration.

Starter policy distinguishes 19 **build** exercises (all algorithm/UI and staged builds) from
57 **debugging** exercises. Build editors contain only an empty default App entry; they supply
no UI state, hooks, solution functions, handlers, or markup. Data, types, and simulated services
live separately in `fixtures.ts`. Debugging exercises retain the faulty implementation needed
for diagnosis. Build requirements must document every tested export, fixture API, accessible
label, output format, and required data attribute instead of relying on a prebuilt UI to reveal
that contract. Register new builds in `build-starters.ts`; the catalog-level checks cover all
build/algorithm ids and require minimal, strictly valid starter files.

Every build also registers a definition in `build-briefs.ts`: a product goal, concrete supplied
inputs, initial visible behavior, outcome constraints, and at least three named examples with
input, action, and expected UI. Staged examples identify their zero-based stage and become
visible cumulatively as stages unlock. Include success and recovery/boundary cases; retain exact
labels and formats required by checks. Describe behavior instead of hooks, internal state
recipes, code bodies, or step-by-step algorithm instructions. Keep implementation hints separate.

Every debugging exercise registers in `debug-briefs.ts` with a neutral product title, outcome
brief, sample inputs, expected initial UI, acceptance criteria, and at least three named
input/action/expected-UI examples. State intended behavior, not the starter's actual failure,
root cause, faulty line, or repair strategy. Public tags use broad milestone topics so they do
not disclose a specific fix. Include repeated, boundary, keyboard, error, or recovery scenarios
where applicable. Audit values against the fixtures, reference, and independent checks; retain
tested native/ARIA and fixture contracts. Keep diagnosis in explicit hints and answer disclosure.
The same brief renderer serves builds and debugging; examples never modify learner code.

Layout checks inspect geometry at specified widths. Design checks implement a supplied brief;
they do not score beauty. A calculation counter is instrumentation, not a speed benchmark.
Code-point counts are not grapheme counts. An AbortSignal timer fixture is not proof of HTTP
cancellation. Client subscription checks are not SSR/hydration proof.

Add first/last, empty, repeated action, rejection, stale work, keyboard, and content-resilience
cases when the stated contract includes them. Avoid claiming keyboard support from a click
assertion alone. The new browser suite also exercises actual Space activation and dialog Escape.

## Existing exercise calibration

Retain all 32 existing ids. Reclassify bounded request ordering, cleanup, stale closure, reducer,
single-field form, render-boundary recovery, calculation reuse, serialized rollback, external
subscription, and retry exercises as Medium. Keep keyboard listbox, undo branching, keyed cache,
and cumulative builds at Hard or Very hard. The module-navigation snapshot is deliberate
reinforcement of the snapshot concept, not a new React concept.

The subscription fixture's delivery count verifies exactly-once handling in its local event
scenario; it makes no claim about distributed message delivery. The external-store exercise
stays client-only, with hydration in its follow-up. Calculation reuse is labelled as such.

## Proposed exercises: 36, not yet implemented

Each entry names the user-visible contract and the environment/proof required before it can
enter the runnable catalog. A future exercise must satisfy the authoring contract above.

### Very easy: four additions

| Problem | Acceptance contract | Environment and proof |
| --- | --- | --- |
| Navigation preserves browser behavior | A destination opens through a real link; keyboard activation and destination are correct. | Sandbox plus real keyboard activation; full routing comes later. |
| Find the keyboard focus | Every supplied action has a visible focus treatment in both supplied themes. | Browser keyboard sequence, computed focus treatment, visual inspection. |
| Required fields explain themselves | Required versus optional input is stated visibly and native validation prevents an empty submission. | Sandbox form submission and browser constraint-validation checks. |
| A figure needs a useful caption | A chart illustration retains a caption and a concise text equivalent with meaningful structure. | Sandbox semantics plus human editorial review. |

### Easy: eight additions

| Problem | Acceptance contract | Environment and proof |
| --- | --- | --- |
| Name icon-only actions | Every icon action has an unambiguous accessible name; decorative icons are silent. | Accessibility tree plus keyboard activation. |
| A slider reports its unit | A native range input updates a labelled value with units and obeys min/max/step. | Sandbox input events and real arrow keys. |
| A multiline draft stays controlled | Editing and reset preserve line breaks and the correct draft. | Sandbox textarea input and reset checks. |
| Help text belongs to its field | Instructions remain visible and associated without replacing the field label. | Sandbox native label and description relationships. |
| Design a complete card state set | Supplied default, focus, selected, disabled, and error specifications are distinguishable. | Browser interaction, supplied design brief, human visual review. |
| Relative sizing survives larger text | Text growth preserves content and core actions at 200% text size. | Browser text-size/zoom setup, geometry, keyboard and visual checks. |
| Localize singular and plural messages | Zero, one, and several records use supplied locale-specific messages. | Sandbox fixtures and independent expected outputs. |
| Format an instant in two time zones | One instant produces the specified local dates/times, including a day boundary. | Fixed instant/time-zone fixtures; no live-clock assumptions. |

### Medium: eight additions

| Problem | Acceptance contract | Environment and proof |
| --- | --- | --- |
| Filters survive Back and Forward | Query, sort, and page restore from URL history, including malformed parameters. | Router-enabled browser harness; reload and history checks. |
| A typed hook models all outcomes | Consumers handle idle, pending, success, and failure without impossible combinations. | Type-level negative fixtures and observable runtime checks. |
| Server errors return to the right fields | Field and form errors retain corrected input and focus the appropriate recovery target. | Deterministic server adapter; stale-error and retry checks. |
| Conditional multistep registration | Hidden steps stop blocking validation; navigating backward retains valid answers. | Sandbox cumulative transition and validation checks. |
| Validate a file selection | Unsupported type and size have useful errors; replacement and clearing recover. | Browser file-input fixtures, including rejected and empty selections. |
| Implement an annotated wireframe | Hierarchy, spacing, actions, and responsive changes meet the supplied brief. | Supplied artifact, geometry checks, human design review. |
| Write the missing regression test | A test fails on the supplied bug and passes after an independently implemented repair. | Test-authoring workspace and known buggy/correct variants. |
| Rich text preserves its rendering boundary | Supplied text, markup, and URL cases follow an explicit allowlist policy. | Appropriate sanitizer/parser dependency, hostile fixtures, browser boundary checks. |

### Hard: ten additions

| Problem | Acceptance contract | Environment and proof |
| --- | --- | --- |
| Refresh a shared cache after mutation | Relevant views refresh, unrelated keys remain intact, and user scopes never mix. | Shared cache fixture with failure, invalidation, and scope checks. |
| Upload files with bounded concurrency | Per-file progress, abort, retry, and queue limits remain independent. | Controlled upload endpoint; deterministic progress and failure scheduling. |
| Cancel a real HTTP search | Replacement and clearing abort transport where supported and reject stale parsing results. | Local HTTP endpoint, request observations, delayed headers/body fixtures. |
| Preserve drafts through navigation | Confirmed leave, cancelled leave, reload, and history navigation follow a stated policy. | Real routing/browser harness and navigation checks. |
| Restore a versioned browser draft | Old, missing, corrupt, oversized, and inaccessible storage recover without dropping valid work. | Origin-enabled storage harness and versioned fixtures. |
| Repair a hydration mismatch | Server and client initial output agree across deterministic locale/data mismatch cases. | Actual server rendering and hydrateRoot diagnostics. |
| Recover a failed lazy route | Failed module delivery offers recovery while other routes remain navigable. | Bundled multi-route app; controlled module delivery failures. |
| Fix a measured slow interaction | A trace identifies a specific bottleneck and an improved implementation meets the supplied workload target. | Representative browser workload and before/after traces. |
| Stop a page from shifting | Delayed image/font/content fixtures expose shifts; repair meets a supplied measured budget. | Loading browser harness and layout-shift observations. |
| Choose a valid date range | Locale display, unavailable dates, range bounds, and the specified time-zone policy agree. | Fixed calendar fixtures, keyboard checks, manual accessibility review. |

### Very hard: six additions

| Problem | Acceptance contract | Environment and proof |
| --- | --- | --- |
| An offline editor keeps its promises | Durable drafts and queued writes recover after reconnect; conflicts require an explicit decision. | Storage-enabled browser plus versioned local server; interruption/replay tests. |
| Collaborative review comments | Duplicate/out-of-order events, reconnect, permissions, and concurrent edits reconcile against server revisions. | Controlled realtime protocol and authoritative server; adversarial event sequences. |
| An editable virtualized data grid | Navigation, editing, sorting, and selection remain coherent across unmounted rows. | Large dataset, browser geometry/focus tests, representative performance and assistive-technology evaluation. |
| An order survives ambiguous failure | Timeout, duplicate submission, retry, and reconciliation produce one server-authoritative order. | Idempotent local server contract; lost-response and duplicate-request tests. |
| A progressively enhanced server form | Initial HTML, no-JavaScript submission, hydration, validation, and recovery meet the same user contract. | SSR server, enabled/disabled-JavaScript browser tests, accessibility review. |
| Evolve a shared design system | Three contrasting consumer surfaces adopt a component change with specified compatibility, responsive, and accessibility guarantees. | Separate design-system/consumer fixtures, type/runtime compatibility checks, human design review. |

## Practical algorithms in frontend work

The **Algorithms in the UI** milestone combines 12 editable React features with named pure
algorithms. The two algorithm-library walkthroughs remain separate fixed traces. These new
exercises require both correct feature behavior and correct algorithm results.

| Exercise | Frontend application | Algorithm or JavaScript collection choice |
| --- | --- | --- |
| product-projection | Turn records into useful price cards | `map`; preserve identity and source data |
| stock-availability | Any stock is not the same as all stock | `filter`, `some`, `every`; explicit empty-collection semantics |
| cart-lookup | Find one product and handle its absence | `find`; first match and explicit absence |
| sales-summary | Aggregate a sales dashboard from its records | `reduce`; quantity-weighted totals and safe grouping keys |
| merge-feed-pages | Merge pages without repeating records | `Map`; latest payload, first-seen order, idempotent delivery |
| rank-products | Sort the view without sorting the source | Numeric comparator, independent tie policy, `toSorted` or copy before `sort` |
| tag-facets | Count products per tag, not repeated labels | `flatMap`, per-product `Set`, frequency `Map` |
| activity-window | Count recent activity with a sliding window | Sliding window and monotonic two pointers |
| timeline-seek | Seek the next transcript cue with binary search | Lower-bound binary search, duplicate and endpoint handling |
| comment-tree | Turn flat replies into an expandable comment outline | Adjacency index and iterative depth-first traversal |
| command-history | Prototype Back and Forward with two stacks | Two stacks, immutable transitions, abandoned future branches |
| dependency-planner | Plan a release without violating dependencies | Indegrees, adjacency, FIFO topological scheduling, unresolved dependencies |

Each algorithm stays exported from `App.tsx`; it can be re-exported from another authored
module. Authored checks receive the freshly mounted entry module as `exercise` and invoke its
named functions with independent fixtures. Existing DOM check helpers are unchanged. Exported
functions and their fixtures execute inside the same opaque iframe; this adds no network,
storage, host-code execution, or package access for learner drafts. Unit tests evaluate only
the repository-authored reference strings, never stored learner drafts.

Checks cover frozen inputs, empty collections, duplicate ids/tags/timestamps, missing records,
orphan roots, navigation branches, cycles, missing prerequisites, and blocked descendants.
Timestamp proxies enforce at most 25,000 indexed reads over 5,000 sorted events and at most
18 over 65,536 sorted cues. They fail early when the budget is exceeded. These are deterministic
work checks for specified fixtures, not universal asymptotic proofs, frame-rate measurements,
or protection against arbitrary infinite loops. Explanation rubrics still require reasoning
about preconditions, invariants, memory, and unmeasured work.

Correct alternatives are accepted when they meet the same observable contract; checks do not
require a particular array method name in the learner's source. Keep complexity claims precise:
JavaScript Map specifies average sublinear access; sorting algorithms are engine-dependent;
immutable stack-array copies add linear copying even when abstract push/pop are constant-time.

## Sources

Coverage is informed by primary documentation, not copied exercise text:
[React learning](https://react.dev/learn),
[WAI page structure](https://www.w3.org/WAI/tutorials/page-structure/),
[WAI forms](https://www.w3.org/WAI/tutorials/forms/),
[ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/),
[Learn CSS](https://web.dev/learn/css),
[Learn Responsive Design](https://web.dev/learn/design), and
[Learn Performance](https://web.dev/learn/performance),
[MDN Array methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array),
[MDN Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), and
[Cornell's complexity and lower-bound analysis](https://courses.cis.cornell.edu/courses/cs2110/2026fa/lectures/lec05/).

## Runnable catalog: 76

The following table is a snapshot of the authored catalog. Update it when adding, removing,
or recalibrating a challenge; source ids remain the authority for saved work.

| ID | Problem | Difficulty | Milestone |
| --- | --- | --- | --- |
| semantic-action | Notification signup | Very easy | Web foundations |
| field-labels | Delivery name entry | Very easy | Web foundations |
| image-alt | Product image descriptions | Very easy | Web foundations |
| preference-checkbox | Email update preference | Very easy | Web foundations |
| first-counter | Ticket quantity picker | Very easy | Web foundations |
| character-count | Message length indicator | Very easy | Web foundations |
| native-select | Delivery selection | Very easy | Web foundations |
| page-landmarks | Workshop page navigation | Very easy | Web foundations |
| product-projection | Turn records into useful price cards | Very easy | Algorithms in the UI |
| snapshot | Seat reservation counter | Easy | Render & state |
| identity | Reviewer drafts | Easy | Render & state |
| derived | Ticket cart totals | Easy | Render & state |
| modular-snapshot | Seat reservations across files | Easy | Components & contracts |
| disclosure | Shipping details disclosure | Easy | Components & contracts |
| password-toggle | Password visibility control | Easy | Components & contracts |
| immutable-cart | Cart item quantities | Easy | Render & state |
| search-empty | People finder | Easy | Render & state |
| responsive-grid | Responsive product shelf | Easy | Layout & design |
| long-content | Record row with long content | Easy | Layout & design |
| toolbar-wrap | Report action toolbar | Easy | Layout & design |
| fluid-image | Responsive illustration card | Easy | Layout & design |
| spacing-tokens | Summary card spacing | Easy | Layout & design |
| readable-type | Reading panel typography | Easy | Layout & design |
| empty-recovery | Resource search recovery | Easy | Layout & design |
| locale-price | Localized price display | Easy | Layout & design |
| fieldset-group | Delivery method choices | Easy | Layout & design |
| component-callback | Plan selection controls | Easy | Layout & design |
| stock-availability | Any stock is not the same as all stock | Easy | Algorithms in the UI |
| cart-lookup | Find one product and handle its absence | Easy | Algorithms in the UI |
| sales-summary | Aggregate a sales dashboard from its records | Easy | Algorithms in the UI |
| race | People search results | Medium | Effects & async |
| cleanup | Room message delivery | Medium | Effects & async |
| stale | Event pulse counter | Medium | Effects & async |
| reducer | Cart quantity transitions | Medium | Components & contracts |
| accessible | Workshop signup form | Medium | Components & contracts |
| recovery | Report retry flow | Medium | Components & contracts |
| memo | Catalog search and theme | Medium | Production judgment |
| optimistic | Bookmark save feedback | Medium | Production judgment |
| external-store | External counter display | Medium | Production judgment |
| form-errors | Contact form feedback | Medium | Components & contracts |
| pagination | Product result pages | Medium | Production judgment |
| sort-table | Sortable score table | Medium | Production judgment |
| debounced-preview | Search preview timing | Medium | Effects & async |
| retry-request | Service request retry | Medium | Effects & async |
| responsive-navigation | Responsive primary navigation | Medium | Components & contracts |
| container-card | Workshop summary card | Medium | Components & contracts |
| rtl-layout | Bidirectional notice layout | Medium | Components & contracts |
| theme-tokens | Summary card themes | Medium | Components & contracts |
| bulk-selection | Filtered product selection | Medium | Components & contracts |
| dependent-selects | Shipping destination selection | Medium | Components & contracts |
| dialog-focus | Settings dialog interaction | Medium | Components & contracts |
| tab-contract | Project information tabs | Medium | Components & contracts |
| payload-validation | Profile data acceptance | Medium | Components & contracts |
| hook-isolation | Independent note cards | Medium | Components & contracts |
| merge-feed-pages | Merge pages without repeating records | Medium | Algorithms in the UI |
| rank-products | Sort the view without sorting the source | Medium | Algorithms in the UI |
| tag-facets | Count products per tag, not repeated labels | Medium | Algorithms in the UI |
| build-directory | Build a resilient directory | Hard | Interview builds |
| build-board | Build a reversible task board | Hard | Interview builds |
| build-checkout | Build a checkout that recovers | Hard | Interview builds |
| keyboard-listbox | Keyboard theme picker | Hard | Components & contracts |
| undo-history | Draft editing history | Hard | Render & state |
| request-cache | Profile picker requests | Hard | Effects & async |
| async-combobox | Asynchronous name suggestions | Hard | Production judgment |
| inline-editing | Editable profile name | Hard | Production judgment |
| abortable-search | Search cancellation feedback | Hard | Production judgment |
| reorder-focus | Playlist ordering controls | Hard | Production judgment |
| activity-window | Count recent activity with a sliding window | Hard | Algorithms in the UI |
| timeline-seek | Seek the next transcript cue with binary search | Hard | Algorithms in the UI |
| comment-tree | Turn flat replies into an expandable comment outline | Hard | Algorithms in the UI |
| command-history | Prototype Back and Forward with two stacks | Hard | Algorithms in the UI |
| build-virtual-feed | Build a bounded activity feed | Very hard | Interview builds |
| build-async-registration | Build a version-aware registration form | Very hard | Interview builds |
| build-concurrent-stars | Build independent optimistic mutations | Very hard | Interview builds |
| build-conflict-editor | Build an editor that survives conflicts | Very hard | Interview builds |
| dependency-planner | Plan a release without violating dependencies | Very hard | Algorithms in the UI |
