import { algorithmBuildFixtures } from "./algorithm-practice";
import { writeProject } from "./project";
import type { Challenge } from "./types";

const emptyApp = "export default function App() {\n  return null;\n}\n";

const algorithmContracts: Record<string, string[]> = {
  "product-projection": [
    "Export projectProducts(items: readonly Product[]) returning { id, label } records. Import Product and products from ./fixtures if useful.",
    "Render a ul of cards, each li carrying data-id equal to the product id and the formatted label as its text. Show the card count in an output. Toggle empty switches between the fixture and no products, then restores it.",
  ],
  "stock-availability": [
    "Export stockSummary(items: readonly Stock[]) returning { available: string[], any: boolean, all: boolean }. Use stock from ./fixtures initially.",
    "Render outputs named Available, Any available, and All available. Available joins ids with commas or shows None; booleans read true/false. Toggle empty clears and restores the fixture.",
  ],
  "cart-lookup": [
    "Export lookupProduct(items: readonly Product[], id: string), returning the original Product or null. Products come from ./fixtures.",
    "A labelled Product id input starts at tea. One output shows the matching name or Product not found. Typing changes the lookup immediately.",
  ],
  "sales-summary": [
    "Export summarizeSales(items: readonly Sale[]) returning { units, cents, byCategory }, where byCategory maps category names to total quantities. Use sales from ./fixtures.",
    "Outputs named Units and Revenue show total units and two-decimal revenue in whole currency units. A ul lists category: quantity in first-seen category order. Toggle empty clears and restores sales.",
  ],
  "merge-feed-pages": [
    "Export mergePages(previous: readonly Item[], next: readonly Item[]) returning merged records. The fixtures export first and second pages.",
    "Start with first. Load next page merges second; Reset feed restores first. Render one li per record, with data-id and the name as text, plus an output for count.",
  ],
  "rank-products": [
    "Export rankProducts(items: readonly Ranked[], descending: boolean) returning ordered records. Initially sort ranked from ./fixtures ascending.",
    "A Descending toggle switches direction. Render li elements with data-id in result order, and an output showing the unchanged source ids joined with commas.",
  ],
  "tag-facets": [
    "Export tagCounts(items: readonly Tagged[]) returning { tag, count } records ordered by tag. Start with tagged from ./fixtures.",
    "Render a ul whose li elements have data-tag and text tag: count, plus an output with the number of products. React only toggles filtering to records containing react; Toggle empty clears and restores the current view.",
  ],
  "activity-window": [
    "Export windowCounts(times: readonly number[], span: number) returning counts. The fixture exports times; the initial span is 5.",
    "Window 3 and Window 5 choose the span. Render one li per timestamp carrying data-count equal to its computed count, and an output for the peak (0 when empty).",
  ],
  "timeline-seek": [
    "Export lowerBound(times: readonly number[], target: number) returning an insertion index. Use the times fixture. A labelled Playhead input starts at 5.",
    "One output reads Cue <index> at <timestamp>s, No later cue past the end, or Enter a finite time for blank/non-finite input. Input edits update the result.",
  ],
  "comment-tree": [
    "Export visibleComments(items: readonly Comment[], expanded: ReadonlySet<string>) returning comment records with depth. Use comments from ./fixtures and start with no expanded branches.",
    "Render an ol of visible comments with data-id and data-depth on each li. Show depth in text and indentation. Branch buttons read Toggle <id> and expose aria-expanded. One output shows the visible count. Collapsing an ancestor retains descendant expansion choices.",
  ],
  "command-history": [
    "Export navigate(state: NavState, action: NavAction) returning a new NavState. The fixture exports the contract types; create your own initial Home state with empty back/forward histories.",
    "Guide, API, and Examples visit those pages; Back and Forward navigate and are disabled when their histories are empty. Outputs named Page, Back depth, and Forward depth report current state.",
  ],
  "dependency-planner": [
    "Export planRelease(tasks: readonly Task[]) returning { order: string[], blocked: string[] }. Start with base from ./fixtures.",
    "Valid dependencies uses base; Introduce cycle makes button depend on form; Missing dependency adds deploy depending on unknown and notify depending on deploy. An ol lists ordered ids. One output joins blocked ids with commas or reads None. A status reads Ready to release or Some tasks have unresolved dependencies.",
  ],
};

const stagedFixtures: Record<string, string> = {
  "build-directory": `export const people = [{ id: "ada", name: "Ada", role: "Frontend" }, { id: "grace", name: "Grace", role: "Platform" }, { id: "linus", name: "Linus", role: "Systems" }];
export function loadPeople(query: string) {
  return new Promise<typeof people>((resolve, reject) => setTimeout(() => {
    if (query.toLowerCase() === "error") reject(new Error("Search unavailable"));
    else resolve(people.filter(person => person.name.toLowerCase().includes(query.toLowerCase())));
  }, query.toLowerCase() === "ada" ? 160 : 20));
}`,
  "build-checkout": `let attempts = 0;
export function placeOrder() { return new Promise<{id: string}>((resolve, reject) => setTimeout(() => {
  attempts++; if (attempts === 1) reject(new Error("Checkout failed")); else resolve({ id: "order-1" });
}, 120)); }`,
  "build-virtual-feed":
    "export const events = Array.from({length:1000}, (_,i) => ({id:i+1,name:'Event '+(i+1)}));",
  "build-async-registration": `export function checkName(name: string) { return new Promise<boolean>(resolve => setTimeout(() => resolve(name !== "ada"), name === "ada" ? 150 : 30)); }
export function saveName(name: string) { return new Promise<string>(resolve => setTimeout(() => resolve(name), 100)); }`,
  "build-concurrent-stars": `export function createStarService() {
  const attempts: Record<string, number> = {Ada: 0, Grace: 0};
  let calls = 0;
  function write(name: string, value: boolean) {
    const attempt = (attempts[name] ?? 0) + 1;
    attempts[name] = attempt; calls++;
    return new Promise<boolean>((resolve, reject) => setTimeout(() => name === "Ada" && attempt === 1 ? reject(new Error("Rejected")) : resolve(value), name === "Ada" ? 150 : 30));
  }
  return {write, get calls() { return calls; }};
}`,
  "build-conflict-editor": `export type Snapshot = {text: string; revision: number};
export function createDocumentService() {
  let server: Snapshot = {text: "Server draft", revision: 1};
  let calls = 0;
  function read() { return {...server}; }
  function saveRemote(text: string, expected: number) {
    calls++;
    return new Promise<Snapshot>((resolve, reject) => setTimeout(() => {
      if (expected !== server.revision) reject(read());
      else { server = {text, revision: expected + 1}; resolve(read()); }
    }, 90));
  }
  function remoteEdit() { server = {text: "Remote revision", revision: server.revision + 1}; }
  return {read, saveRemote, remoteEdit, get calls() { return calls; }};
}`,
};

const stagedContracts: Record<string, string[]> = {
  "build-directory": [
    "fixtures.ts exports people and loadPeople(query). Import the data and local service yourself; its timing and rejection behavior are part of the task.",
  ],
  "build-board": [],
  "build-checkout": [
    "fixtures.ts exports placeOrder(). Preserve this local service; create your own UI state and submission handlers.",
  ],
  "build-virtual-feed": [
    "fixtures.ts exports events: 1,000 records with id and name. Build the complete filter, scrolling UI, and navigation yourself.",
  ],
  "build-async-registration": [
    "fixtures.ts exports checkName(name) and saveName(name). Implement username validation yourself: at least three ASCII letters, with surrounding whitespace trimmed for validation and transport.",
  ],
  "build-concurrent-stars": [
    "fixtures.ts exports createStarService(). Create one stable service instance for the exercise; write(name, value) returns a promise and calls counts transport attempts. It supplies transport behavior only; create optimistic/confirmed state and per-person pending ownership yourself. Start with Ada and Grace unstarred.",
  ],
  "build-conflict-editor": [
    "fixtures.ts exports Snapshot and createDocumentService(). Create one stable service instance: read() returns a copied server snapshot, saveRemote(text, expectedRevision) acknowledges or rejects with the latest Snapshot, remoteEdit() simulates another writer, and calls counts transport attempts. Model draft, baseline, pending, and conflict state yourself.",
  ],
};

export function configureStarter(challenge: Challenge): Challenge {
  const contracts = algorithmContracts[challenge.id] ?? stagedContracts[challenge.id];
  if (!contracts) return { ...challenge, kind: "debug" };
  const fixture = algorithmBuildFixtures[challenge.id] ?? stagedFixtures[challenge.id];
  return {
    ...challenge,
    kind: "build",
    starter: fixture ? writeProject({ "App.tsx": emptyApp, "fixtures.ts": fixture }) : emptyApp,
    requirements: [
      "Start from the empty App entry point. Write your own state, imports, event handlers, helper functions, and markup; fixture files provide only data, contract types, or local services.",
      ...contracts,
      ...challenge.requirements.filter(
        (requirement) => !requirement.startsWith("Keep the named algorithm exported"),
      ),
      ...(challenge.track === "algorithms"
        ? [
            "Export the named algorithm from App.tsx (re-export it if moved). Independent-input checks call that export as well as checking your UI.",
          ]
        : []),
    ],
  };
}
