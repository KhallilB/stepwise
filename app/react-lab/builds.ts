import type { Challenge } from "./types";

const directoryStages = [
  {
    title: "A useful baseline",
    minutes: 10,
    constraints: [
      "Use a Query input, a Results list, and a Clear button with these accessible names.",
      "Match names case-insensitively; show No people found when empty.",
    ],
    checks: [
      {
        name: "Query filters names case-insensitively",
        script: `await input('[aria-label="Query"]', "ADA"); await wait(220); equal(find('[aria-label="Results"]').children.length, 1); assert(text('[aria-label="Results"]').includes("Ada"), "Return Ada");`,
      },
      {
        name: "Empty results recover through Clear",
        script: `await input('[aria-label="Query"]', "nobody"); await wait(220); assert(document.querySelector("#root").textContent.includes("No people found"), "Explain empty results"); await click("Clear"); await wait(50); equal(find('[aria-label="Results"]').children.length, 3);`,
      },
    ],
  },
  {
    title: "Compose two filters",
    minutes: 12,
    constraints: [
      "Add a Frontend only toggle button using aria-pressed.",
      "Intersect role and query filters without storing a redundant filtered list.",
    ],
    checks: [
      {
        name: "Role toggle intersects with query and can reset",
        script: `await click("Frontend only"); equal(find('button[aria-pressed]').getAttribute('aria-pressed'), "true"); equal(find('[aria-label="Results"]').children.length, 1); await input('[aria-label="Query"]', "Grace"); await wait(220); equal(find('[aria-label="Results"]').children.length, 0); await click("Frontend only"); equal(find('[aria-label="Results"]').children.length, 1);`,
      },
    ],
  },
  {
    title: "The network changes the rules",
    minutes: 13,
    constraints: [
      "Use the provided loadPeople fixture. Older responses must never replace newer intent.",
      "Expose Loading in a status region, errors in an alert, and recover with Clear. No network or extra packages.",
    ],
    checks: [
      {
        name: "Latest intent wins an out-of-order request race",
        script: `await input('[aria-label="Query"]', "Ada"); await input('[aria-label="Query"]', "Grace"); await wait(240); equal(find('[aria-label="Results"]').children.length, 1); assert(text('[aria-label="Results"]').includes("Grace"), "Ignore Ada's stale result");`,
      },
      {
        name: "Failure is announced and Clear recovers",
        script: `await input('[aria-label="Query"]', "error"); await wait(220); equal(text('[role="alert"]'), "Search unavailable"); await click("Clear"); await wait(70); equal(find('[aria-label="Results"]').children.length, 3); assert(!document.querySelector('[role="alert"]'), "Clear stale errors");`,
      },
    ],
  },
];
const directoryFixture = `const people = [{ id: "ada", name: "Ada", role: "Frontend" }, { id: "grace", name: "Grace", role: "Platform" }, { id: "linus", name: "Linus", role: "Systems" }];
function loadPeople(query) {
  return new Promise((resolve, reject) => setTimeout(() => {
    if (query.toLowerCase() === "error") reject(new Error("Search unavailable"));
    else resolve(people.filter(p => p.name.toLowerCase().includes(query.toLowerCase())));
  }, query.toLowerCase() === "ada" ? 160 : 20));
}`;
const boardStages = [
  {
    title: "Capture the work",
    minutes: 10,
    constraints: [
      "New task input, Add task button, Tasks list. Ignore blank/whitespace tasks.",
      "Create stable ids when adding, not during rendering.",
    ],
    checks: [
      {
        name: "Add trims valid tasks and rejects blanks",
        script: `await input('[aria-label="New task"]', "   "); await click("Add task"); equal(find('[aria-label="Tasks"]').children.length, 0); await input('[aria-label="New task"]', "  Alpha  "); await click("Add task"); equal(find('[aria-label="Tasks"]').children.length, 1); assert(text('[aria-label="Tasks"]').includes("Alpha"), "Keep a trimmed task");`,
      },
    ],
  },
  {
    title: "Identity and derived views",
    minutes: 15,
    constraints: [
      "Each task has Complete <title> button with aria-pressed.",
      "Active only toggles a derived view; hidden tasks retain identity and completion.",
    ],
    checks: [
      {
        name: "Completed tasks hide without deleting data",
        script: `await input('[aria-label="New task"]', "Alpha"); await click("Add task"); await input('[aria-label="New task"]', "Beta"); await click("Add task"); await click("Complete Alpha"); await click("Active only"); equal(find('[aria-label="Tasks"]').children.length, 1); assert(text('[aria-label="Tasks"]').includes("Beta"), "Keep active task"); await click("Active only"); equal(find('[aria-label="Tasks"]').children.length, 2);`,
      },
    ],
  },
  {
    title: "Reversible changes, bounded state",
    minutes: 15,
    constraints: [
      "Delete <title> removes a task; Undo last delete restores its identity and position.",
      "At most 5 tasks, including completed tasks. Disable Add task at capacity; enforce the same bound in the handler.",
    ],
    checks: [
      {
        name: "Delete can be undone at the original position",
        script: `await input('[aria-label="New task"]', "Alpha"); await click("Add task"); await input('[aria-label="New task"]', "Beta"); await click("Add task"); await click("Delete Alpha"); equal(find('[aria-label="Tasks"]').children.length, 1); await click("Undo last delete"); equal(find('[aria-label="Tasks"]').children.length, 2); assert(find('[aria-label="Tasks"]').firstElementChild.textContent.includes("Alpha"), "Restore original position");`,
      },
      {
        name: "Task capacity is enforced",
        script: `for (let i = 0; i < 5; i++) { await input('[aria-label="New task"]', 'Task ' + i); await click("Add task"); } await input('[aria-label="New task"]', "Overflow"); await click("Add task"); equal(find('[aria-label="Tasks"]').children.length, 5); assert(Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Add task').disabled, "Disable adding at capacity");`,
      },
    ],
  },
];
const checkoutStages = [
  {
    title: "Price from first principles",
    minutes: 10,
    constraints: [
      "Quantity starts at 1, stays between 1 and 5; Add ticket and Remove ticket are controls.",
      "Quantity output uses aria-label Quantity. Total output uses aria-label Total, formatted with 2 decimals. Tickets cost $12.",
    ],
    checks: [
      {
        name: "Quantity drives price within its lower bound",
        script: `await click("Remove ticket"); equal(text('[aria-label="Quantity"]'), "1"); await click("Add ticket"); equal(text('[aria-label="Quantity"]'), "2"); equal(text('[aria-label="Total"]'), "24.00");`,
      },
    ],
  },
  {
    title: "A pricing rule without drift",
    minutes: 12,
    constraints: [
      "Promo code input and Apply promo button. SAVE10 (case-insensitive, trimmed) applies 10% off.",
      "Invalid codes clear a prior discount and announce Invalid promo. Adding tickets retains valid discounts; no redundant total state.",
    ],
    checks: [
      {
        name: "Valid discount composes with later quantity changes",
        script: `await input('[aria-label="Promo code"]', " save10 "); await click("Apply promo"); equal(text('[aria-label="Total"]'), "10.80"); await click("Add ticket"); equal(text('[aria-label="Total"]'), "21.60");`,
      },
      {
        name: "Invalid promo clears a previous discount",
        script: `await input('[aria-label="Promo code"]', "SAVE10"); await click("Apply promo"); await input('[aria-label="Promo code"]', "bad"); await click("Apply promo"); equal(text('[aria-label="Total"]'), "12.00"); equal(text('[role="alert"]'), "Invalid promo");`,
      },
    ],
  },
  {
    title: "An order is a state machine",
    minutes: 18,
    constraints: [
      "Use the provided placeOrder fixture: first attempt rejects after 120ms, second succeeds.",
      "Place order disables during submission; freeze price edits, expose pending/confirmed status, recover from Checkout failed, and allow retry.",
      "Never let quantity exceed 5. No real payment or external requests.",
    ],
    checks: [
      {
        name: "Failed order recovers and retry confirms",
        script: `await click("Place order"); assert(Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Place order').disabled, "Prevent overlapping orders"); await wait(180); equal(text('[role="alert"]'), "Checkout failed"); await click("Place order"); await wait(180); equal(text('[role="status"]'), "Order confirmed"); assert(!document.querySelector('[role="alert"]'), "Clear error on retry");`,
      },
      {
        name: "Quantity cannot exceed stock",
        script: `for (let i = 0; i < 8; i++) await click("Add ticket"); equal(text('[aria-label="Quantity"]'), "5");`,
      },
    ],
  },
];
const orderFixture = `let attempts = 0;
const placeOrder = () => new Promise((resolve, reject) => setTimeout(() => {
  attempts++; if (attempts === 1) reject(new Error("Checkout failed")); else resolve({ id: "order-1" });
}, 120));`;

export const builds: Challenge[] = [
  {
    id: "build-directory",
    track: "build",
    title: "Build a resilient directory",
    summary: "A simple filter becomes an accessible, race-safe search experience.",
    minutes: 35,
    level: "Hard",
    tags: ["Staged build", "Async", "Composition"],
    brief:
      "Build a people directory from a small fixture. Ship a useful baseline, combine filters, then adapt when results become asynchronous. Each stage adds constraints; all earlier behavior must keep working.",
    requirements: [
      "Complete all three stages in a 35-minute timebox.",
      "Keep one source of truth per independent value; use stable person ids.",
      "Preserve all previous checks when introducing the next requirement.",
    ],
    starter: `import { useEffect, useState } from "react";\n${directoryFixture}\nexport default function App() {\n  return <section><h2>People directory</h2><p>Build the baseline first.</p></section>;\n}`,
    solution: `import { useEffect, useState } from "react";
${directoryFixture}
export default function App() {
  const [query, setQuery] = useState("");
  const [frontend, setFrontend] = useState(false);
  const [results, setResults] = useState(people);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let ignore = false;
    setError("");
    if (!query) { setResults(people); setPending(false); return; }
    setPending(true);
    loadPeople(query).then(data => { if (!ignore) setResults(data); })
      .catch(error => { if (!ignore) { setError(error.message); setResults([]); } })
      .finally(() => { if (!ignore) setPending(false); });
    return () => { ignore = true; };
  }, [query]);
  const visible = results.filter(person => !frontend || person.role === "Frontend");
  return <section><h2>People directory</h2>
    <label>Query<input aria-label="Query" value={query} onChange={e => setQuery(e.target.value)} /></label>
    <button onClick={() => { setQuery(""); setFrontend(false); }}>Clear</button>
    <button aria-pressed={frontend} onClick={() => setFrontend(value => !value)}>Frontend only</button>
    <p role="status">{pending ? "Loading" : visible.length ? visible.length + " people" : "No people found"}</p>
    {error && <p role="alert">{error}</p>}
    <ul aria-label="Results">{visible.map(person => <li key={person.id}>{person.name} · {person.role}</li>)}</ul>
  </section>;
}`,
    stages: directoryStages,
    checks: directoryStages.flatMap((stage) => stage.checks),
    hints: [
      "Keep query and role as independent inputs; derive their intersection.",
      "Give each request invocation a cleanup guard; Clear must invalidate pending work too.",
      "Keep prior-stage tests running while adding the async boundary. Distinguish pending, empty, and error states.",
    ],
    explanation:
      "The baseline is a filtering problem; later stages change who owns the results and when they become authoritative. Query and role stay independent, while the visible list is derived. Effect cleanup invalidates outdated work. A production directory would separate cache keys, pagination, cancellation, and request status without pushing server state into a general UI store.",
    rubric: [
      "Explain state ownership as the requirements evolve.",
      "Demonstrate a stale request and its cleanup path.",
      "Describe keyboard, loading, empty, and error states without losing earlier behavior.",
    ],
    followUp:
      "Design a 100,000-person version with paginated results and URL filters. Explain cache keys, request cancellation, virtualized results, accessible loading announcements, and what you would measure.",
    resource: "https://react.dev/learn/you-might-not-need-an-effect",
  },
  {
    id: "build-board",
    track: "build",
    title: "Build a reversible task board",
    summary: "Capture tasks, preserve identity, then add undo under a hard limit.",
    minutes: 40,
    level: "Hard",
    tags: ["Staged build", "Invariants", "Identity"],
    brief:
      "Build a compact task board with real state constraints. Start with reliable input, add a filtered view, then introduce reversible deletion and a five-task capacity. The list, not the view, owns task identity.",
    requirements: [
      "Complete all three stages in 40 minutes.",
      "All transitions are immutable; never key tasks by list position.",
      "The five-task limit includes hidden and completed tasks.",
    ],
    starter: `import { useRef, useState } from "react";\nexport default function App() {\n  return <section><h2>Task board</h2><p>Start with task capture.</p></section>;\n}`,
    solution: `import { useRef, useState } from "react";
export default function App() {
  const [draft, setDraft] = useState("");
  const [tasks, setTasks] = useState([]);
  const [active, setActive] = useState(false);
  const [deleted, setDeleted] = useState(null);
  const id = useRef(0);
  function add(event) {
    event.preventDefault();
    if (!draft.trim() || tasks.length >= 5) return;
    setTasks([...tasks, { id: ++id.current, title: draft.trim(), done: false }]); setDraft("");
  }
  function remove(task) {
    setDeleted({ task, index: tasks.indexOf(task) });
    setTasks(tasks.filter(item => item.id !== task.id));
  }
  function undo() {
    if (!deleted || tasks.length >= 5) return;
    const next = [...tasks]; next.splice(deleted.index, 0, deleted.task); setTasks(next); setDeleted(null);
  }
  const visible = tasks.filter(task => !active || !task.done);
  return <section><h2>Task board</h2>
    <form onSubmit={add}><label>New task<input aria-label="New task" value={draft} onChange={e => setDraft(e.target.value)} /></label><button disabled={tasks.length >= 5}>Add task</button></form>
    <button aria-pressed={active} onClick={() => setActive(value => !value)}>Active only</button>
    <ul aria-label="Tasks">{visible.map(task => <li key={task.id}>{task.title}
      <button aria-pressed={task.done} onClick={() => setTasks(tasks.map(item => item.id === task.id ? { ...item, done: !item.done } : item))}>Complete {task.title}</button>
      <button onClick={() => remove(task)}>Delete {task.title}</button>
    </li>)}</ul>
    <button disabled={!deleted || tasks.length >= 5} onClick={undo}>Undo last delete</button>
    <p role="status">{tasks.length} of 5 tasks</p>
  </section>;
}`,
    stages: boardStages,
    checks: boardStages.flatMap((stage) => stage.checks),
    hints: [
      "Create ids in add(), and derive the active view from the authoritative task list.",
      "Undo needs the deleted task and its original position, not just its title.",
      "Enforce capacity in add/undo transitions as well as disabled controls; hidden tasks still count.",
    ],
    explanation:
      "Task identity belongs to the data, while filtering is a projection. Immutable transitions preserve local reasoning and make undo explicit. The example keeps one reversible deletion, with its original index and full state. Restoring under capacity is a domain rule, not merely a button style. A reducer becomes useful as commands and invariants grow.",
    rubric: [
      "Explain authoritative versus visible collections.",
      "Prove identity survives filtering and undo.",
      "Defend the scope of undo and its interaction with capacity.",
    ],
    followUp:
      "Extend to collaborative editing with server-assigned ids and undo after concurrent changes. What does undo mean when another user edited or deleted the same task?",
    resource: "https://react.dev/learn/updating-arrays-in-state",
  },
  {
    id: "build-checkout",
    track: "build",
    title: "Build a checkout that recovers",
    summary: "Simple arithmetic grows into pricing rules and a recoverable order flow.",
    minutes: 40,
    level: "Hard",
    tags: ["Staged build", "Forms", "State machines"],
    brief:
      "Build a ticket checkout using local fixtures only. Start with quantity and price, introduce a discount, then handle a rejected order and retry. Model authoritative values and transitions before layering on more setters.",
    requirements: [
      "Complete three stages in 40 minutes without external packages.",
      "Quantity remains 1–5 and totals have exactly two decimal places.",
      "Submission does not issue overlapping orders; retry must recover from failure.",
    ],
    starter: `import { useState } from "react";\n${orderFixture}\nexport default function App() {\n  return <section><h2>Ticket checkout</h2><p>Begin with quantity and price.</p></section>;\n}`,
    solution: `import { useState } from "react";
${orderFixture}
export default function App() {
  const [quantity, setQuantity] = useState(1);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const pending = status === "pending";
  const locked = pending || status === "confirmed";
  const total = (quantity * 12 * (discount ? .9 : 1)).toFixed(2);
  function apply() {
    const valid = promo.trim().toUpperCase() === "SAVE10";
    setDiscount(valid); setError(valid ? "" : "Invalid promo");
  }
  async function submit() {
    if (locked) return;
    setStatus("pending"); setError("");
    try { await placeOrder(); setStatus("confirmed"); }
    catch (error) { setStatus("idle"); setError(error.message); }
  }
  return <section><h2>Ticket checkout</h2>
    <output aria-label="Quantity">{quantity}</output>
    <button disabled={locked || quantity >= 5} onClick={() => setQuantity(q => Math.min(5, q + 1))}>Add ticket</button>
    <button disabled={locked || quantity <= 1} onClick={() => setQuantity(q => Math.max(1, q - 1))}>Remove ticket</button>
    <label>Promo code<input aria-label="Promo code" disabled={locked} value={promo} onChange={e => setPromo(e.target.value)} /></label>
    <button disabled={locked} onClick={apply}>Apply promo</button>
    <output aria-label="Total">{total}</output>
    <button disabled={locked} onClick={submit}>Place order</button>
    <p role="status">{pending ? "Placing order" : status === "confirmed" ? "Order confirmed" : "Ready"}</p>
    {error && <p role="alert">{error}</p>}
  </section>;
}`,
    stages: checkoutStages,
    checks: checkoutStages.flatMap((stage) => stage.checks),
    hints: [
      "Compute price from quantity and the applied discount; do not mirror total in state.",
      "Draft promo text and an applied discount are different facts. Invalid application clears the discount.",
      "Use explicit idle/pending/confirmed states; freeze edits while an order is pending and reset on rejection.",
    ],
    explanation:
      "A pricing rule changes the derivation, not the ownership of total. Submission introduces a state machine and a boundary where the server would become authoritative. Disabling edits preserves the submitted snapshot in this small exercise. Real money uses server-side price validation, appropriate currency arithmetic, and idempotent order creation; this fixture models no payment.",
    rubric: [
      "Explain draft versus applied pricing state.",
      "Enumerate submission transitions and failure recovery.",
      "Distinguish client constraints from server price and payment authority.",
    ],
    followUp:
      "A checkout request times out after the server creates the order. Design safe retry, stock checks, and reconciliation without double charging or claiming failure prematurely.",
    resource: "https://react.dev/learn/reacting-to-input-with-state",
  },
];
