# Personal React interview lab

Open `/react-lab` locally or choose **React interview lab** from Stepwise's library.
76 authored challenges span Very easy, Easy, Medium, Hard, and Very hard across eight personal
learning milestones. Seven 35–40 minute builds add constraints in three cumulative stages.
Difficulty, milestone, progress, and topic search combine in the URL.
See the [112-problem curriculum](frontend-curriculum.md) for the runnable catalog,
coverage boundaries, authoring standards, and 36 explicitly proposed exercises.

**Algorithms in the UI** adds 12 practical DSA/JavaScript collection exercises: price-card
transforms, availability quantifiers, product lookup, sales aggregation, page merging, numeric
ranking, tag facets, sliding traffic windows, binary-search transcript seeking, comment trees,
two-stack navigation, and dependency scheduling. Learners implement a usable feature and an
exported algorithm. Checks call that function inside the isolated preview with independent
fixtures; binary search and sliding windows also have indexed-read budgets. Preserve the named
export from `App.tsx`, re-exporting it if you move the implementation to another file.

The brief identifies **Build from scratch** or **Debug existing code**. The 12 algorithm/UI
exercises and seven staged builds start with only `export default function App() { return null; }`.
Learners choose imports, hooks, state, helpers, event handlers, and markup. Where needed,
`fixtures.ts` provides exported data, contract types, or local services; it does not provide
the algorithm or UI state. Requirements name the tested algorithm export and UI labels,
outputs, and data attributes, so the empty editor does not hide the observable contract.
The other 57 exercises retain their buggy implementations for diagnosis.

Each build brief states the feature goal, **Sample data**, **Starting UI**, and at least three
input/action/expected-UI examples. These describe the finished feature, not an interface supplied
by the starter. Examples cover ordinary interaction plus empty, invalid, repeated, or failed work.
The seven staged builds reveal each stage's examples only when that stage unlocks; earlier
examples remain available in Brief. Implementation guidance stays behind explicit hints, and
the full reference remains behind answer disclosure. Samples do not insert any code into App.

All 57 debugging exercises also include **Sample data**, **Expected starting UI**, and three
input/action/expected-UI examples (171 total). These state the intended contract; the supplied
implementation may differ. Public titles, summaries, tags, and acceptance criteria describe the
feature and its observable outcomes without naming the defect or prescribing a repair. Exact
native/ARIA semantics and fixture APIs remain contractual where checks require them. Diagnosis
and implementation guidance remain in opt-in hints and the disclosed answer. Challenge ids,
buggy starters, reference code, authored checks, and saved learner work remain unchanged.

Staged service fixtures stay separate from learner state. `createStarService()` owns transport
attempts and exposes `write()`/`calls`; `createDocumentService()` owns the simulated server and
exposes `read()`, `saveRemote()`, `remoteEdit()`, and `calls`. Create a stable service instance
and implement UI state yourself. Existing drafts remain intact; **Reset code** restores the
new minimal starter when you choose to discard an older draft.

## Read, build, review

1. **Read:** each challenge opens on its brief, acceptance criteria, timebox, and current
   cumulative constraints. Start project opens the IDE; saved drafts offer Resume project.
   Editor/runtime execution starts only after this action. The interview timer remains optional.
2. **Build:** code and live output share the workspace. Brief / Reference are compact
   practice controls. File navigation belongs to the editor: its explorer icon toggles a
   collapsible tree beside code, with open-file tabs in the editor header. Explorer state
   stays independent of brief and coaching panes. Pause over Brief/Reference on desktop
   for an inline preview; brief pointer passes leave the editor undisturbed. Keyboard focus
   opens it immediately. Moving into the pane or focusing its contents keeps it open.
   Use Keep open or click its trigger to pin it; hover never replaces pinned context.
   Click another trigger to switch. Escape dismisses a quick preview and restores trigger
   focus; Collapse context returns space to code. Entry motion respects reduced motion.
3. **Review:** Finish & review opens implementation coaching beside the code. The coach is
   first mounted through this action. Review my implementation explicitly sends the current
   source, optional explanation, and active requirements to the selected model. Back to code
   supports another attempt with the same draft. Recorded reasoning and feedback remain
   available across tool switches after review has been opened.

Phones retain Code / Preview / Tools surfaces and tap access to context. Main actions stay
in the viewport; long code, brief, references, and feedback scroll inside their panes.
Open the explorer from Code on phones; selecting a file closes it and returns focus to
its toggle. Escape closes the explorer with the same focus restoration on any screen.
The context and editor/preview splits, plus the Console/Checks height, remain resizable.
Keyboard arrows operate named kbui separators. Pane/file changes preserve code models,
undo history, and the running preview. Timer, pane sizes, open files, hints, and rubric
checkboxes are session-local; source, notes, stage, outcomes, and feedback save on device.

## Checks, coaching, and answers

Live preview recompiles after a 700 ms pause. Each refresh resets component state; this is
not state-preserving React Fast Refresh. Pause Live preview to batch changes; Reload
preview resets output deliberately. Run checks mounts each authored check fresh and only
accepts results for the current source and stage. Passing a build stage unlocks the next
while retaining earlier checks. Type diagnostics and runtime checks establish different facts.
In the Checks dock, opt-in Auto checks verifies the latest source/stage after a 1.2 second
pause. It runs independently of Live preview, serializes runs, and never grants completion.
Each run resets preview state. Switching it off pauses future automatic runs; an active run
can finish. Auto checks applies to the Preview browser runner. No learner source is uploaded.

Checks shows one summary and a single requirement list on every screen. Failures expand
inline automatically; click a check or use Enter/Space to open or close its details. Passed
checks start collapsed. New runs restore these defaults. Check settings contains Run with,
Auto checks and Clear; these controls stay hidden until requested. The list/detail split,
filters, paging and phone picker have been removed. Changed drafts show outdated results and
never reuse completion evidence. Focus checks expands the dock; Restore coding layout keeps
editor models and live output mounted. The smaller default dock leaves more room for code;
its divider remains adjustable.

In **Check settings**, choose **Run with → Playwright · Chromium**, then **Run checks**, to verify the current draft in a
separate local browser. The development-only Vite middleware in `apps/interview-lab/dev/react-lab-playwright.ts`
drives a fresh lab page with Playwright, selects the Preview runner there, executes the same
authored runtime assertions, and returns matching names/results for the requested stage.
Build stages include earlier requirements. This does not run the repository-wide test suite,
typecheck the whole project, certify accessibility, or award challenge completion. Use editor
Problems and final review for those separate learning tasks.

Playwright verification preserves the user's live preview, is manually triggered, and can
be cancelled. Run IDs, source snapshots and stages prevent stale responses becoming current
results. Reset, stage transitions, answer disclosure and unmount cancel pending requests.
The endpoint accepts only same-origin JSON on the actual loopback development server, bounds
drafts to 30,000 characters and request bodies to 150 KB, allows one browser run at a time,
and cancels after 30 seconds or disconnect. Browser contexts are temporary, downloads and
service workers are disabled, and requests outside the app origin are blocked. Learner code
executes only inside the existing opaque preview iframe, never inside Node.

The installed `@playwright/test` and Chromium provide this locally. If Chromium is absent,
install it with `bunx playwright install chromium`; the runner stays disabled until available.
Production builds omit this middleware and retain Preview browser checks. No cloud runner or
new dependency is introduced.

Monaco uses the automatic React JSX transform and bundled React/JSX runtime declarations.
Sibling modules share a virtual project; F12 opens definitions in existing file tabs.
React snippets, type diagnostics, bracket/indent guides, formatting, and quick fixes remain
available. Editor options lists shortcuts. Runtime emission uses the same JSX mode.
Problem loading formats every starter and reference file with the same Prettier engine: two-space
indentation, an 80-column target, consistent quotes, semicolons, JSX layout, and a trailing
newline. Both editors receive prepared source immediately; **Reset code** uses it too.
Reference solutions use this same style after answer disclosure, including sibling modules.
The React and CSS code blocks in this guide follow the same formatter settings.
An untouched starter saved by an older version also displays formatted source. Edited and
unfinished learner drafts retain their exact contents, and loading does not rewrite the
notebook. Formatting changes presentation; the exercise's intentional behavior bugs remain.
Code wraps by default at the smaller of the viewport width and 80 columns, with continuation
indentation. Editor options can disable wrapping without rewriting the saved source.
**⌘/Ctrl S** formats and saves the active file. Draft recovery still saves each edit while
typing, including incomplete syntax. Save, the floating Format action, and Shift Alt F share
lazy-loaded Prettier with two-space indentation for TSX and CSS. Formatting fits the editor's
available columns, capped at 80 (minimum 40); long literals can exceed that target and still
wrap visually. Monaco formatting retains undo and rejects unfinished syntax without replacing
the draft. Plain editor also supports the Save shortcut at an 80-column target.
Prettier 3.9.10 is a direct dependency,
reusing the version already installed through React Router tooling.

Approved G7 JSX highlighting uses the same lazy-loaded parser to distinguish markup from
TypeScript generics, comparisons, comments and strings. Tags, attributes and JSX text reuse
VS Dark colors; JavaScript expressions keep native highlighting. Malformed drafts fall back
to native tokens until parsing succeeds. This is syntax coloring, separate from diagnostics.

Reference provides challenge-specific official documentation, two progressive concept hints, and a discussion
follow-up. The complete reference implementation is withheld from the active workspace.

Final coaching is designed around evidence, Socratic questions, concrete experiments, and
next practice targets. It receives no reference explanation or solution. The server rejects
fenced code and full-component-shaped responses without inventing a score. Conceptual
suggestions can still make a fix clearer; model output needs critical reading.
Four equally weighted 0–5 dimensions produce a 100-point coaching score: correctness,
reasoning, communication, and tradeoffs. Missing explanation is treated as missing evidence.
The model does not execute code, assess accent, or predict hiring outcomes. Changed source,
notes, or stage labels prior feedback stale. Up to three reviews per challenge are retained.

Complete challenge is a final-review action requiring current passing checks, all build
stages, and a nonempty personal explanation. Rubric ticks remain private self-review.

**Show answer** requires explicit confirmation that it ends the attempt. The saved outcome
is **Answer viewed**, distinct from completion and excluded from completed counts. Its
reference code/explanation then becomes readable; the learner's own draft is preserved.
The ended attempt stays ended after reload and cannot silently resume editing. Reset
challenge starts a fresh attempt. The next-practice recommendation skips ended attempts.

## Reset and persistence

**Reset challenge** and dashboard **Reset all progress** use kbui confirmation dialogs.
They list the saved code, notes, stage progress, completion, answer-viewed outcome, and local
coaching history that will be erased. Cancel preserves everything. Export notebook first
if a portable copy is wanted; resets affect only this browser's React lab data.

The version-1 notebook remains readable with older entries. Optional per-challenge reset
tokens distinguish deletion from untouched state and invalidate old reviews. A reset
remounts the active workspace, returning to the brief and starter. If feedback cleanup is
blocked after the notebook resets, a specific warning explains that older files remain
excluded from new attempts and exports.

Cross-tab writes preserve unrelated current entries and honor deletions. An active draft
changed/reset elsewhere stays visible with a conflict banner; no automatic save restores
it. Load other tab's draft adopts the external state, while Keep this tab's draft is an
explicit restoration choice. Keeping an older draft cannot reopen an answer-ended attempt;
reset is required to begin a fresh one. A late model response cannot write feedback after its attempt
was reset. Export includes current notebook data and matching-generation coaching, with no
import or cross-device sync. Storage failure exposes a warning and retains in-memory work.

## Editor and output

Monaco is lazy-loaded with installed React types, snippets, search, commands, formatting,
and diagnostics. The floating format icon formats the active file. Ctrl/Cmd Enter runs
checks; Ctrl/Cmd F finds text; F1 opens commands. React hook snippets need imports.
Editor options offers a plain kbui Textarea fallback and Monaco Tab-focus guidance.

App.tsx is the project entry. Up to 20 authored JS/TS/JSX/TSX modules resolve relative
imports; React is the supported package. A bounded tagged JSON snapshot in the existing
code field stores multi-file projects. Closing a tab keeps its code/model/undo history for
the session. Arrow keys/Home/End navigate tabs; Delete closes one. Tree arrows disclose
folders and move focus; Enter opens files. Closing the last tab leaves project/output alive.

Console and Checks share a resizable lower panel. Console captures bounded snapshots of
log/info/warn/error/debug and runtime errors, with Clear and Collapse controls. Runtime
errors open Console; running checks selects Checks. React Strict Mode and repeated mounts
can repeat logs. Captured objects are text snapshots, not live inspectors.

## Local models and voice

Ollama is the default review provider. `devstral:24b` is installed on this machine and a
real synthetic-submission review returned validated guidance with the revised prompt.
Use Check connection in final review. Override defaults in ignored `.dev.vars`, then restart:

```dotenv
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_REVIEW_MODEL=devstral:24b
LOCAL_TRANSCRIBE_URL=http://127.0.0.1:8000/v1
LOCAL_TRANSCRIBE_MODEL=Systran/faster-whisper-small
```

Speech needs a separately running Whisper-compatible service, such as
[Speaches](https://speaches.ai/usage/speech-to-text/), with the configured model installed.
No speech server/model was installed in this work. Review and speech readiness are reported
independently. Local endpoints accept loopback HTTP only; redirects are rejected. Select
installed local models rather than cloud-backed aliases. Local failures never trigger cloud fallback.

Cloud remains explicit and optional per capability:

```dotenv
REACT_LAB_REVIEW_PROVIDER=openai
REACT_LAB_SPEECH_PROVIDER=openai
OPENAI_API_KEY=your-server-api-key
OPENAI_REVIEW_MODEL=gpt-5-mini
```

Omitting a selector keeps that capability local. Keys remain server-side. Coaching endpoints
are disabled in production and restricted to loopback development hosts/local-origin POSTs.
Local requests allow three minutes for model loading; OpenAI Responses uses `store: false`.

Record explanation asks for microphone access. Stop releases it. Recording may continue
while inspecting code/references; a visible Stop control remains available. Segments cap at
three minutes/7 MB. Send audio & transcribe is explicit; text appends to the latest notes.
A full notes field retains uninserted transcript for copying. Audio stays in memory and is
discarded on navigation/reset. Typed practice works without speech or a model service.

## Design and ownership

The lab inherits Stepwise's default kbui neutral surfaces, persimmon accent, typography,
focus/status roles, and tactile materials in system light/dark modes. Monaco retains VS Dark
with nested kbui dark chrome; the isolated preview embeds installed kbui foundations.

kbui supplies Container, Split, Grid, Inline, Panel/Handle/Toggle, Card, Heading, Text, Code,
Button, Input, Select, Switch, Textarea, Checkbox, Badge, Status, Progress, Callout, Tooltip,
and confirmation Dialog. Approved G4 Tabs and G21 File Tree stopgaps remain; shared replacements
belong in a separate kbui session. Approved G7 JSX coloring is marked in `jsx-highlighting.ts`;
the shared editor theme remains future work.

Curriculum owns practice contracts/checks; `progress.ts` owns outcomes, reset generations,
and storage validation. `use-notebook.ts` coordinates persistence/conflicts. Workspace owns
UI phase and submitted check identity. Coach validates structured feedback and attempt identity.
These personal milestones do not change the algorithm M1–M13 roadmap, learner-study gates,
or product `progress.json`.

The local React/React DOM/TypeScript runtime is generated by dev/build and fetched after
project start. Learner code runs in an opaque iframe without allow-same-origin. CSP blocks
network/resource loads and form navigation; the parent document also limits frame destinations
with `frame-src 'self'`, including sessions entered through the library. A blocked navigation
can replace the preview document; fix the navigation and reload the preview. Source/run ids
reject obsolete messages. This
personal sandbox cannot preempt infinite main-thread loops. Its 15-second timeout/Stop
cannot terminate a blocked browser thread; public hostile execution needs separate isolation.

## Verification and owner walkthrough

Commands: `bun run check`, `bun run build`. Browser checks cover authored bugs/references,
stages, editor/undo/file navigation, responsive layouts, voice/provider mocks, explicit
answer termination, reset scope/cancellation, cross-tab deletion, partial cleanup, and late
model responses. New authored starters/references also pass strict TSX validation.

1. Open State across modules, read the brief, and Start project. Use the editor's explorer
   icon to open Counter.tsx, edit it, close/reopen its tab, and undo. Code should remain.
   Pin Brief while browsing files; both panes should stay open independently.
2. Hover Brief and Reference. The inline pane leaves editor/output visible; enter it to
   read, leave or press Escape to close, and click to pin. Repeat using keyboard focus.
3. Finish & review with a broken attempt. Request local coaching, inspect evidence/questions,
   then Back to code and try again. No full reference component should appear.
4. Choose Show answer, cancel once, then confirm. The attempt ends as Answer viewed and
   survives reload without increasing completed count. Reset it to restore its starter.
5. Edit two challenges. Reset one and confirm the other remains. Cancel Reset all progress
   once, export if wanted, then confirm; counts, drafts, stages, and coaching should clear.
6. Repeat with another tab open and with phone width/system dark mode. An old active draft
   requires conflict resolution before saving; discarded inactive entries must not reappear.

Real microphone/transcription and manual screen-reader verification remain owner checks.

## Expanded curriculum owner checks

1. Open `/react-lab?level=Very+easy`. Nine challenges appear. Tab to **An action deserves
   a button**, press Enter, read the brief, and choose **Start project**. Run checks: the
   incomplete starter fails. Replace its clickable div with a native `button type="button"`;
   run again and try Tab, Space, and Enter in the preview.
2. Open `/react-lab/responsive-grid`. Implement its narrow/wide requirements, run checks,
   then compare the preview at phone and desktop widths. Repeat **Long names should not
   break the row** with its full unbroken name: the action must remain visible.
3. Open `/react-lab/dialog-focus`. After an attempt, use **Finish & review**, then **Show
   answer** if needed; this ends that attempt. For an editable reference experiment, copy
   the reference, reset the challenge, and paste it into the editor. Open settings, type a
   name, press Escape, and reopen: focus returns correctly and the draft remains.
4. Open `/react-lab/async-combobox`. Type `a`, quickly replace with `gr`, and verify only
   Grace remains. Try arrows, Enter, and Escape during pending suggestions. Check **A saved
   name is not always the current draft** by typing again during Save and retrying `fail`.
5. Filter Medium and Components & contracts: 14 results appear; the milestone total stays
   18. Reload and confirm filters persist. Clear filters to restore 76. First/last
   challenge navigation has no previous/next destination beyond the catalog boundaries.
6. At 390px, confirm difficulty/milestone filters remain reachable, then open a challenge
   and use Code / Preview / Tools. Repeat the catalog and a layout exercise in dark mode.

kbui: existing Select, Input, Card, Grid, Inline, Progress, Badge, and typography reused.
No new shell component, dependency, gap, or stopgap. Learner snippets intentionally use
native HTML and local CSS within the existing isolated React teaching environment.

## Practical algorithms owner checks

1. Open `/react-lab?track=algorithms`. Twelve exercises span Very easy through Very hard.
   Filter Hard, then search `binary`: only **Seek the next transcript cue with binary
   search** remains. Reload and confirm all filters persist. Repeat at 390px width.
2. Start **Turn records into useful price cards** and run its starter: incorrect cent
   conversion fails. Divide cents by 100 in `projectProducts`, rerun, and toggle empty.
   Cards must retain ids/order and show 12.50 and 3.00 when restored.
3. Start **Merge pages without repeating records**. Implement the contract, then load
   the next page twice: three rows remain and record a shows New. Reset restores Old.
   In **Count products per tag**, repeated labels count once per product, not globally.
4. In the transcript exercise, try time 5 (first duplicate), 6 (next cue), 10 (past end),
   and an empty field. A linear scan can render these examples correctly but must fail
   the large-input read-budget check. Traffic windows similarly reject repeated prefix scans.
5. In **Turn flat replies into an expandable comment outline**, expand intro then reply,
   collapse intro, and reopen: descendants retain expansion and depths. In prototype
   history, visit Guide, API, Back, then Examples: Forward is disabled.
6. In **Plan a release without violating dependencies**, compare valid, cycle, and missing
   dependency scenarios. Independent work stays schedulable; blocked descendants remain
   visible. Return to the valid scenario to recover. This is the last current challenge:
   no next-challenge destination should appear. Repeat first-challenge keyboard navigation
   and Code / Preview / Tools switching on a phone.

kbui: existing catalog Select/Input/Card/Badge/Progress/layout/type components reused.
No new shell control, dependency, gap, or stopgap. Algorithm views use the existing native-HTML
learner environment; named-function checks remain inside its sandbox.

## CSS and Tailwind

Every challenge offers `styles.css` in the existing file selector and explorer. It is applied
automatically; `import "./styles.css"` is also supported. Additional authored CSS files support
static side-effect imports and relative CSS `@import` paths. Existing JavaScript-only drafts
keep their original stored representation until a stylesheet edit needs a project snapshot.
CSS shares the current 20-file and 30,000-character project limits.
An imported project already at the file limit keeps its existing files without adding a
virtual stylesheet. Inline styles and Tailwind utilities remain available there.

Use normal styles, inline React styles, Tailwind utilities, or a combination. For example:

```tsx
export default function App() {
  return (
    <section className="rounded-lg bg-indigo-500 p-4 text-white md:p-8">
      Hello
    </section>
  );
}
```

Or give the element `className="card"` and edit `styles.css`:

```css
.card {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}
```

Tailwind CSS 4.3.3 is bundled locally in the isolated preview. Its compiler generates utilities
from rendered class names, including classes added by interactions. Responsive, hover/focus,
arbitrary-value utilities, `@theme`, and `@apply` work without a CDN or network access. For example:

```css
@theme {
  --color-brand: #2563eb;
}
.card {
  @apply rounded-lg bg-brand p-4 text-white;
}
```

Default utilities preserve the preview's existing baseline styles. Add `@import "tailwindcss";`
to opt into Tailwind Preflight too. Ordinary authored CSS follows generated utilities, so normal
specificity and source order determine overrides. CSS has its own Monaco syntax service,
standard formatting, and Tailwind directive recognition. CSS Modules, Sass/Less, external
plugins, and project filesystem scanning are outside this browser environment. External
resource loads remain blocked by the existing CSP; stylesheet text stays inside the iframe.

Owner checks:

1. Start any challenge, choose **Plain editor** if useful, and add a `div` with
   `className="p-4 bg-[#123456]"`. Live output should have 16px padding and a dark blue background.
   Add a responsive utility and compare phone/desktop widths.
2. Open **styles.css** from the file selector or explorer. Add `.card { padding: 13px; }`
   and apply `className="card"` in App.tsx. Output updates; reload, resume, and confirm both
   files remain. Closing/reopening the CSS tab preserves its editor state.
3. Try the `@theme`/`@apply` example. An unknown utility in `@apply` should report an error
   while keeping the draft. Correct it to recover; clear the stylesheet to remove its styling.
   In Monaco, **Format** should format CSS rather than parse it as TypeScript.

kbui: existing file controls and editor surfaces reused. No new component gap or stopgap.
Tailwind applies to learner output; the application shell continues to use kbui.

Sources: [Tailwind browser usage](https://tailwindcss.com/docs/installation/play-cdn),
[theme variables](https://tailwindcss.com/docs/theme), and
[directives](https://tailwindcss.com/docs/functions-and-directives).
