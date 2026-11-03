import { advancedBuilds } from "./advanced-builds";
import { algorithmPractice } from "./algorithm-practice";
import { configureStarter } from "./build-starters";
import { builds } from "./builds";
import { configureDebugBrief } from "./debug-briefs";
import { designPractice } from "./design-practice";
import { foundations } from "./foundations";
import { frontendHard } from "./frontend-hard";
import { frontendPractice } from "./frontend-practice";
import { practice } from "./practice";
import { writeProject } from "./project";
import { type Challenge, difficultyLevels } from "./types";

export const tracks = [
  {
    id: "web-foundations",
    number: "01",
    title: "Web foundations",
    description: "Start with native HTML, labelled controls, and small state transitions.",
    outcome: "Build a useful interaction and explain its browser behavior.",
  },
  {
    id: "interface-design",
    number: "02",
    title: "Layout & design",
    description: "Practice responsive geometry, typography, tokens, content, and localization.",
    outcome: "Translate a concrete design brief into resilient interface behavior.",
  },
  {
    id: "mental-model",
    number: "03",
    title: "Render & state",
    description: "Reason about snapshots, identity, and sources of truth.",
    outcome: "Explain what React renders, when, and why.",
  },
  {
    id: "async",
    number: "04",
    title: "Effects & async",
    description: "Make time, cleanup, and competing requests predictable.",
    outcome: "Keep behavior correct when events arrive out of order.",
  },
  {
    id: "architecture",
    number: "05",
    title: "Components & contracts",
    description: "Own state transitions, accessible interactions, and recovery.",
    outcome: "Build components whose contracts survive edge cases.",
  },
  {
    id: "production",
    number: "06",
    title: "Production judgment",
    description: "Measure work, recover mutations, and synchronize external state.",
    outcome: "Defend a solution's correctness and tradeoffs under pressure.",
  },
  {
    id: "algorithms",
    number: "07",
    title: "Algorithms in the UI",
    description: "Apply JavaScript collections and data structures to useful frontend features.",
    outcome: "Choose an algorithm, preserve user intent, and explain its costs and boundaries.",
  },
  {
    id: "build",
    number: "08",
    title: "Interview builds",
    description: "Start small. Add constraints. Keep earlier behavior working.",
    outcome: "Ship a coherent feature in 35–40 minutes and defend its evolution.",
  },
] as const;

export const challenges: Challenge[] = [
  {
    id: "snapshot",
    track: "mental-model",
    title: "State is a snapshot",
    summary: "Three updates. One render. An unexpected count.",
    minutes: 20,
    level: "Easy",
    tags: ["State", "Batching", "Closures"],
    brief:
      "A ticket counter should reserve three seats with one click. The current handler calls the setter three times, but reserves only one. Diagnose the captured value and fix the update without changing the UI contract.",
    requirements: [
      "Reserve 3 adds exactly three seats, including on repeated clicks.",
      "Reset returns the counter to zero.",
      "Explain replacement updates versus functional updates.",
    ],
    starter: `import { useState } from "react";
export default function App() {
  const [count, setCount] = useState(0);
  function reserve() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  }
  return <section>
    <h2>Seat reservations</h2>
    <output aria-label="Reserved seats">{count}</output>
    <button onClick={reserve}>Reserve 3</button>
    <button onClick={() => setCount(0)}>Reset</button>
  </section>;
}`,
    solution: `import { useState } from "react";
export default function App() {
  const [count, setCount] = useState(0);
  function reserve() {
    setCount(c => c + 1);
    setCount(c => c + 1);
    setCount(c => c + 1);
  }
  return <section>
    <h2>Seat reservations</h2>
    <output aria-label="Reserved seats">{count}</output>
    <button onClick={reserve}>Reserve 3</button>
    <button onClick={() => setCount(0)}>Reset</button>
  </section>;
}`,
    checks: [
      {
        name: "One click reserves three seats",
        script: `await click("Reserve 3"); equal(text("output"), "3");`,
      },
      {
        name: "Repeated clicks compose; reset clears",
        script: `await click("Reserve 3"); await click("Reserve 3"); equal(text("output"), "6"); await click("Reset"); equal(text("output"), "0");`,
      },
    ],
    hints: [
      "Every call in this handler sees the same render's count.",
      "Passing a value queues a replacement; it does not mutate count in this closure.",
      "Use setCount(c => c + 1) so each update receives the pending state.",
    ],
    explanation:
      "React gives each render a state snapshot. All three count + 1 expressions evaluate against that snapshot, so each queues the same replacement. Functional updates compose against the pending value. One setCount(c => c + 3) also meets this UI contract; three updaters expose the queue's behavior.",
    rubric: [
      "Explain why the original result is 1 without calling state setters synchronous mutations.",
      "Compare one +3 updater with three +1 updaters.",
      "Keep updater functions pure, including under Strict Mode.",
    ],
    followUp:
      "What would happen if the handler queued an updater, then setCount(10), then another updater? Predict the final state before running it.",
    resource: "https://react.dev/learn/queueing-a-series-of-state-updates",
  },
  {
    id: "identity",
    track: "mental-model",
    title: "Identity survives a reorder",
    summary: "A reordered list sends an edit to the wrong person.",
    minutes: 25,
    level: "Easy",
    tags: ["Keys", "Identity", "Local state"],
    brief:
      "A reviewer list lets each row keep a private draft. Reverse the list after editing Ada's draft: the value follows the position instead of Ada. Preserve row identity through reordering.",
    requirements: [
      "Each person keeps their draft after Reverse order.",
      "Repeated reorders preserve both edits.",
      "Use stable identity supplied by the data.",
    ],
    starter: `import { useState } from "react";
function Reviewer({ person }) {
  const [note, setNote] = useState("");
  return <label>{person.name}<input aria-label={person.name + " note"} value={note} onChange={e => setNote(e.target.value)} /></label>;
}
export default function App() {
  const [people, setPeople] = useState([{ id: "ada", name: "Ada" }, { id: "grace", name: "Grace" }]);
  return <section><h2>Review queue</h2>
    <button onClick={() => setPeople(p => [...p].reverse())}>Reverse order</button>
    {people.map((person, index) => <Reviewer key={index} person={person} />)}
  </section>;
}`,
    solution: `import { useState } from "react";
function Reviewer({ person }) {
  const [note, setNote] = useState("");
  return <label>{person.name}<input aria-label={person.name + " note"} value={note} onChange={e => setNote(e.target.value)} /></label>;
}
export default function App() {
  const [people, setPeople] = useState([{ id: "ada", name: "Ada" }, { id: "grace", name: "Grace" }]);
  return <section><h2>Review queue</h2>
    <button onClick={() => setPeople(p => [...p].reverse())}>Reverse order</button>
    {people.map(person => <Reviewer key={person.id} person={person} />)}
  </section>;
}`,
    checks: [
      {
        name: "Ada's draft follows Ada",
        script: `await input('[aria-label="Ada note"]', "Ship it"); await click("Reverse order"); equal(value('[aria-label="Ada note"]'), "Ship it");`,
      },
      {
        name: "Both drafts survive repeated reorder",
        script: `await input('[aria-label="Ada note"]', "A"); await input('[aria-label="Grace note"]', "G"); await click("Reverse order"); equal(value('[aria-label="Grace note"]'), "G"); await click("Reverse order"); equal(value('[aria-label="Ada note"]'), "A");`,
      },
    ],
    hints: [
      "A key tells React which existing component instance belongs to a new element.",
      "An index identifies a position. A person can change positions.",
      "Use person.id as the row's key; generating new keys would remount every row.",
    ],
    explanation:
      "React associates state with an element's position, type, and key. Index keys preserve the component at each position while a different person's props move into it. Stable person ids let React move the existing row and its draft together. Random keys instead discard state on each render.",
    rubric: [
      "Distinguish identity from rendering order.",
      "Explain when index keys can be acceptable.",
      "Describe deliberately resetting a form with a changed key.",
    ],
    followUp:
      "If new people arrive before the server assigns ids, where should stable client ids be created, and how would you reconcile them with server ids?",
    resource: "https://react.dev/learn/preserving-and-resetting-state",
  },
  {
    id: "derived",
    track: "mental-model",
    title: "One source of truth",
    summary: "A cart total drifts from the quantity it describes.",
    minutes: 20,
    level: "Easy",
    tags: ["Derived state", "State modeling"],
    brief:
      "The cart stores both quantity and total. Adding works, but Reset leaves the price behind. Remove the impossible state rather than synchronizing two setters in every event handler.",
    requirements: [
      "The total always equals quantity × 12.",
      "Reset clears quantity and total.",
      "Keep only independently changeable values in state.",
    ],
    starter: `import { useState } from "react";
export default function App() {
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(12);
  function add() { setQuantity(q => q + 1); setTotal(t => t + 12); }
  return <section><h2>Workshop tickets</h2>
    <p>Quantity: <output data-testid="quantity">{quantity}</output></p>
    <p>Total: $<output data-testid="total">{total}</output></p>
    <button onClick={add}>Add ticket</button>
    <button onClick={() => setQuantity(0)}>Reset cart</button>
  </section>;
}`,
    solution: `import { useState } from "react";
export default function App() {
  const [quantity, setQuantity] = useState(1);
  const total = quantity * 12;
  return <section><h2>Workshop tickets</h2>
    <p>Quantity: <output data-testid="quantity">{quantity}</output></p>
    <p>Total: $<output data-testid="total">{total}</output></p>
    <button onClick={() => setQuantity(q => q + 1)}>Add ticket</button>
    <button onClick={() => setQuantity(0)}>Reset cart</button>
  </section>;
}`,
    checks: [
      {
        name: "Reset cannot leave a stale total",
        script: `await click("Reset cart"); equal(text('[data-testid="total"]'), "0");`,
      },
      {
        name: "Adding after reset computes the right price",
        script: `await click("Reset cart"); await click("Add ticket"); equal(text('[data-testid="quantity"]'), "1"); equal(text('[data-testid="total"]'), "12");`,
      },
    ],
    hints: [
      "Which value can change independently: total, quantity, or both?",
      "An effect would add a second render and another synchronization obligation.",
      "Store quantity; calculate const total = quantity * 12 during rendering.",
    ],
    explanation:
      "Redundant state introduces combinations the domain cannot represent. A computed total removes those combinations. A trivial multiplication does not need memoization or an effect. If pricing later comes from a server quote, that quote has independent authority and deserves its own explicit state and freshness rules.",
    rubric: [
      "Identify independent versus derived state.",
      "Explain why an effect is unnecessary.",
      "Name when a server quote becomes independent data.",
    ],
    followUp:
      "Now add a discount code validated by a server. What belongs in local state, and how do you prevent a stale discount response changing a newer cart?",
    resource: "https://react.dev/learn/choosing-the-state-structure",
  },
  {
    id: "race",
    track: "async",
    title: "The response that arrived last",
    summary: "An older search overwrites the user's latest intent.",
    minutes: 35,
    level: "Medium",
    tags: ["Effects", "Race conditions", "Cleanup"],
    brief:
      "Searches for Ada take longer than searches for Grace. Click both quickly and the older Ada response wins. Keep displayed results consistent with the latest query, including when effects are restarted.",
    requirements: [
      "The latest query wins regardless of response order.",
      "A single search still resolves normally.",
      "Invalidate work when its effect is cleaned up.",
    ],
    starter: `import { useEffect, useState } from "react";
const search = query => new Promise(resolve => setTimeout(() => resolve(query), query === "Ada" ? 160 : 20));
export default function App() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("No results");
  useEffect(() => {
    if (!query) return;
    setResult("Loading " + query);
    search(query).then(name => setResult(name));
  }, [query]);
  return <section><h2>People search</h2>
    <button onClick={() => setQuery("Ada")}>Search Ada</button>
    <button onClick={() => setQuery("Grace")}>Search Grace</button>
    <p role="status">{result}</p>
  </section>;
}`,
    solution: `import { useEffect, useState } from "react";
const search = query => new Promise(resolve => setTimeout(() => resolve(query), query === "Ada" ? 160 : 20));
export default function App() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("No results");
  useEffect(() => {
    if (!query) return;
    let ignore = false;
    setResult("Loading " + query);
    search(query).then(name => { if (!ignore) setResult(name); });
    return () => { ignore = true; };
  }, [query]);
  return <section><h2>People search</h2>
    <button onClick={() => setQuery("Ada")}>Search Ada</button>
    <button onClick={() => setQuery("Grace")}>Search Grace</button>
    <p role="status">{result}</p>
  </section>;
}`,
    checks: [
      {
        name: "A stale Ada response cannot replace Grace",
        script: `await click("Search Ada"); await click("Search Grace"); await wait(220); equal(text('[role="status"]'), "Grace");`,
      },
      {
        name: "A single search resolves",
        script: `await click("Search Ada"); await wait(220); equal(text('[role="status"]'), "Ada");`,
      },
    ],
    hints: [
      "Response arrival order does not express user intent.",
      "Each effect invocation needs its own validity flag, invalidated by cleanup.",
      "Return cleanup that sets ignore = true; only commit results when !ignore. With real fetch, also consider AbortController.",
    ],
    explanation:
      "Each effect owns an invocation of the request. Cleanup invalidates that invocation when its query changes or the component unmounts. Ignoring stale results protects correctness even when cancellation is unavailable. AbortController can also stop supported network work, but cancellation and ordering are separate concerns. Development Strict Mode probes cleanup with an additional setup/cleanup cycle.",
    rubric: [
      "Explain the losing request's lifecycle.",
      "Distinguish ignoring stale results from canceling work.",
      "Account for loading, error, empty, and unmounted states in a production design.",
    ],
    followUp:
      "Add caching, pagination, and retry. Where would you move request ownership, and how would you key cached pages without mixing different searches?",
    resource: "https://react.dev/learn/synchronizing-with-effects",
  },
  {
    id: "cleanup",
    track: "async",
    title: "A subscription with an owner",
    summary: "Room changes leave invisible listeners behind.",
    minutes: 25,
    level: "Medium",
    tags: ["Custom hooks", "Subscriptions", "Strict Mode"],
    brief:
      "A room hook subscribes to browser events but never disconnects. Switching rooms leaves stale listeners receiving messages. Give every setup a matching cleanup.",
    requirements: [
      "After changing rooms, old-room messages have no effect.",
      "Current-room messages update once.",
      "The effect's subscription lifetime follows room identity.",
    ],
    starter: `import { useEffect, useState } from "react";
function useRoom(room) {
  const [message, setMessage] = useState("Quiet");
  const [deliveries, setDeliveries] = useState(0);
  useEffect(() => {
    const receive = event => { setMessage(event.detail); setDeliveries(count => count + 1); };
    window.addEventListener(room, receive);
  }, [room]);
  return { message, deliveries };
}
export default function App() {
  const [room, setRoom] = useState("lobby");
  const { message, deliveries } = useRoom(room);
  const send = name => window.dispatchEvent(new CustomEvent(name, { detail: "Message from " + name }));
  return <section><h2>Room subscriptions</h2>
    <button onClick={() => setRoom("studio")}>Join studio</button>
    <button onClick={() => send("lobby")}>Send lobby</button>
    <button onClick={() => send("studio")}>Send studio</button>
    <output>{message}</output><output aria-label="Deliveries">{deliveries}</output>
  </section>;
}`,
    solution: `import { useEffect, useState } from "react";
function useRoom(room) {
  const [message, setMessage] = useState("Quiet");
  const [deliveries, setDeliveries] = useState(0);
  useEffect(() => {
    const receive = event => { setMessage(event.detail); setDeliveries(count => count + 1); };
    window.addEventListener(room, receive);
    return () => window.removeEventListener(room, receive);
  }, [room]);
  return { message, deliveries };
}
export default function App() {
  const [room, setRoom] = useState("lobby");
  const { message, deliveries } = useRoom(room);
  const send = name => window.dispatchEvent(new CustomEvent(name, { detail: "Message from " + name }));
  return <section><h2>Room subscriptions</h2>
    <button onClick={() => setRoom("studio")}>Join studio</button>
    <button onClick={() => send("lobby")}>Send lobby</button>
    <button onClick={() => send("studio")}>Send studio</button>
    <output>{message}</output><output aria-label="Deliveries">{deliveries}</output>
  </section>;
}`,
    checks: [
      {
        name: "Old-room messages are ignored after switching",
        script: `await click("Join studio"); await click("Send lobby"); equal(text("output"), "Quiet"); equal(text('[aria-label="Deliveries"]'), "0");`,
      },
      {
        name: "Current-room subscription remains live",
        script: `await click("Join studio"); await click("Send studio"); equal(text("output"), "Message from studio"); equal(text('[aria-label="Deliveries"]'), "1"); await click("Send lobby"); equal(text("output"), "Message from studio"); equal(text('[aria-label="Deliveries"]'), "1"); await click("Send studio"); equal(text('[aria-label="Deliveries"]'), "2");`,
      },
    ],
    hints: [
      "React runs cleanup before setting up an effect with changed dependencies.",
      "Removing a listener requires the same function identity used to add it.",
      "Return () => window.removeEventListener(room, receive) from the effect.",
    ],
    explanation:
      "The effect invocation owns both the event name and listener function. Its cleanup closes over that exact pair. This makes room changes and unmounts symmetrical. A custom hook shares subscription logic; it does not automatically share state between callers. Strict Mode helps expose missing cleanup during development.",
    rubric: [
      "Pair setup and cleanup with the same listener identity.",
      "Explain cleanup on dependency change and unmount.",
      "Distinguish shared hook logic from shared state.",
    ],
    followUp:
      "If several widgets subscribe to the same room, should they own separate connections or share an external store? Explain connection lifetime and ownership.",
    resource: "https://react.dev/learn/reusing-logic-with-custom-hooks",
  },
  {
    id: "stale",
    track: "async",
    title: "Yesterday's closure",
    summary: "A long-lived listener always sees the first count.",
    minutes: 25,
    level: "Medium",
    tags: ["Closures", "Effects", "Functional updates"],
    brief:
      "A keyboard-like event listener installs once, then keeps reading the initial count. Make every event increment correctly while maintaining proper listener cleanup.",
    requirements: [
      "Each pulse increments the current count.",
      "Repeated events compose correctly.",
      "Keep setup and cleanup balanced.",
    ],
    starter: `import { useEffect, useState } from "react";
export default function App() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const pulse = () => setCount(count + 1);
    window.addEventListener("pulse", pulse);
    return () => window.removeEventListener("pulse", pulse);
  }, []);
  return <section><h2>Event counter</h2>
    <output>{count}</output>
    <button onClick={() => window.dispatchEvent(new Event("pulse"))}>Send pulse</button>
  </section>;
}`,
    solution: `import { useEffect, useState } from "react";
export default function App() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const pulse = () => setCount(c => c + 1);
    window.addEventListener("pulse", pulse);
    return () => window.removeEventListener("pulse", pulse);
  }, []);
  return <section><h2>Event counter</h2>
    <output>{count}</output>
    <button onClick={() => window.dispatchEvent(new Event("pulse"))}>Send pulse</button>
  </section>;
}`,
    checks: [
      {
        name: "Two events produce two updates",
        script: `await click("Send pulse"); await click("Send pulse"); equal(text("output"), "2");`,
      },
      {
        name: "Five events accumulate",
        script: `for (let i = 0; i < 5; i++) await click("Send pulse"); equal(text("output"), "5");`,
      },
    ],
    hints: [
      "The installed callback closes over the render that created it.",
      "This operation needs the previous state, not a captured count value.",
      "Use a functional updater inside the listener. Then the effect does not read count.",
    ],
    explanation:
      "An empty dependency list does not make a closure see future state. A functional updater delegates previous-state access to React, avoiding a count dependency for this operation. Adding count as a dependency is another correct solution here, but it reinstalls the listener after every increment. Do not suppress dependencies when an effect actually reads reactive values.",
    rubric: [
      "Explain closure capture rather than blaming asynchronous setters.",
      "Compare functional updates with resubscription.",
      "Explain why refs are not a blanket replacement for dependencies.",
    ],
    followUp:
      "Suppose the listener also reports the latest theme without needing to reconnect. How would you separate reactive synchronization from non-reactive event logic?",
    resource: "https://react.dev/learn/removing-effect-dependencies",
  },
  {
    id: "reducer",
    track: "architecture",
    title: "Make invalid transitions impossible",
    summary: "A cart reducer accepts quantities below zero.",
    minutes: 30,
    level: "Medium",
    tags: ["Reducers", "Invariants", "Immutability"],
    brief:
      "A reducer represents cart quantity, but accepts an invalid decrement and mishandles reset. Protect the invariant at the state transition boundary, rather than relying on disabled buttons.",
    requirements: [
      "Quantity never falls below zero.",
      "Reset always returns zero.",
      "Multiple increments and decrements remain predictable.",
    ],
    starter: `import { useReducer } from "react";
function reducer(quantity, action) {
  if (action.type === "add") return quantity + 1;
  if (action.type === "remove") return quantity - 1;
  return quantity;
}
export default function App() {
  const [quantity, dispatch] = useReducer(reducer, 0);
  return <section><h2>Cart transitions</h2><output>{quantity}</output>
    <button onClick={() => dispatch({ type: "add" })}>Add</button>
    <button onClick={() => dispatch({ type: "remove" })}>Remove</button>
    <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
  </section>;
}`,
    solution: `import { useReducer } from "react";
function reducer(quantity, action) {
  switch (action.type) {
    case "add": return quantity + 1;
    case "remove": return Math.max(0, quantity - 1);
    case "reset": return 0;
    default: return quantity;
  }
}
export default function App() {
  const [quantity, dispatch] = useReducer(reducer, 0);
  return <section><h2>Cart transitions</h2><output>{quantity}</output>
    <button onClick={() => dispatch({ type: "add" })}>Add</button>
    <button onClick={() => dispatch({ type: "remove" })}>Remove</button>
    <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
  </section>;
}`,
    checks: [
      {
        name: "Remove cannot underflow",
        script: `await click("Remove"); await click("Remove"); equal(text("output"), "0");`,
      },
      {
        name: "Reset returns to the initial state",
        script: `await click("Add"); await click("Add"); await click("Reset"); equal(text("output"), "0");`,
      },
      {
        name: "Ordinary transitions still compose",
        script: `await click("Add"); await click("Add"); await click("Remove"); equal(text("output"), "1");`,
      },
    ],
    hints: [
      "The reducer owns which state transitions are valid.",
      "A disabled control alone would not protect other dispatchers.",
      "Clamp remove at zero and implement reset explicitly. Keep the reducer pure.",
    ],
    explanation:
      "A reducer centralizes transitions so every dispatcher shares the same rules. Clamping protects the nonnegative quantity invariant at its owner. A discriminated action union would add exhaustive checking in a typed production component. Unknown-action handling is an explicit API decision, not an excuse to silently hide known mistakes.",
    rubric: [
      "Enforce invariants at the reducer, not only in presentation.",
      "Keep transitions immutable and deterministic.",
      "Describe a typed action union and unknown-action policy.",
    ],
    followUp:
      "Add stock limits, server price updates, and an optimistic checkout. Which transitions stay in this reducer, and which belong to a remote authority?",
    resource: "https://react.dev/learn/extracting-state-logic-into-a-reducer",
  },
  {
    id: "accessible",
    track: "architecture",
    title: "A form with a real contract",
    summary: "A visually working form fails keyboard and validation flows.",
    minutes: 35,
    level: "Medium",
    tags: ["Accessibility", "Forms", "Focus"],
    brief:
      "The signup action lives on a clickable div and the input has no accessible name. Build a native submit flow that names its input, reports errors, and returns focus to the invalid field.",
    requirements: [
      "Email has a visible, programmatically associated label.",
      "Invalid submission announces an error and focuses email.",
      "Valid submission shows confirmation and supports native form submission.",
    ],
    starter: `import { useState } from "react";
export default function App() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  return <section><h2>Workshop signup</h2>
    <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
    <div onClick={() => setMessage("You're registered")}>Register</div>
    <p>{message}</p>
  </section>;
}`,
    solution: `import { useRef, useState } from "react";
export default function App() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const field = useRef(null);
  function submit(event) {
    event.preventDefault();
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      setError("Enter a valid email"); setMessage(""); field.current.focus(); return;
    }
    setError(""); setMessage("You're registered");
  }
  return <section><h2>Workshop signup</h2>
    <form onSubmit={submit} noValidate>
      <label htmlFor="email">Email</label>
      <input id="email" ref={field} type="email" value={email} aria-invalid={!!error} aria-describedby={error ? "email-error" : undefined} onChange={e => setEmail(e.target.value)} />
      {error && <p id="email-error" role="alert">{error}</p>}
      <button type="submit">Register</button>
    </form>
    <p role="status">{message}</p>
  </section>;
}`,
    checks: [
      {
        name: "Email has an associated visible label",
        script: `const field = find("input"); assert(field.id && find('label').htmlFor === field.id, "Associate a visible label with email");`,
      },
      {
        name: "Invalid submit announces and focuses",
        script: `await click("Register"); equal(text('[role="alert"]'), "Enter a valid email"); assert(document.activeElement === find("input"), "Focus the invalid field");`,
      },
      {
        name: "Native form submission registers a valid address",
        script: `await input("input", "ada@example.com"); const form = find("form"); form.requestSubmit(); await wait(40); equal(text('[role="status"]'), "You're registered");`,
      },
    ],
    hints: [
      "A clickable div does not inherit button or form keyboard behavior.",
      "Use form onSubmit, a submit button, and a label linked by htmlFor/id.",
      "On invalid input, expose role=alert, aria-invalid and aria-describedby, then focus the input through a ref.",
    ],
    explanation:
      "Native form semantics provide submission behavior for keyboard and assistive technology users. Validation needs a named field, an associated explanation, an announcement, and a useful focus destination. This exercise's small email check is deliberately illustrative; production validation also needs server authority and a policy that avoids rejecting valid addresses unnecessarily.",
    rubric: [
      "Prefer native semantics before adding ARIA.",
      "Connect error text, invalid state, and focus recovery.",
      "Separate client convenience from server validation authority.",
    ],
    followUp:
      "Turn this into a reusable field API that supports async validation and multiple fields. Where do ids, focus management, and form-level error summaries belong?",
    resource: "https://react.dev/reference/react-dom/components/input",
  },
  {
    id: "recovery",
    track: "architecture",
    title: "Recover at the right boundary",
    summary: "A failed widget has no path back to a working state.",
    minutes: 35,
    level: "Medium",
    tags: ["Error boundaries", "Recovery", "Composition"],
    brief:
      "A report widget deliberately throws while loading. Its existing error boundary has no way to recover. Keep the rest of the page available and make Retry remount the widget with a healthy input.",
    requirements: [
      "The page heading survives a widget error.",
      "The fallback contains a keyboard-operable Retry button.",
      "Retry clears the boundary and renders the healthy report.",
    ],
    starter: `import { Component, useState } from "react";
class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p role="alert">Report unavailable</p> : this.props.children; }
}
function Report({ broken }) {
  if (broken) throw new Error("Report failed");
  return <p>Report ready</p>;
}
export default function App() {
  const [broken, setBroken] = useState(true);
  return <section><h2>Analytics workspace</h2>
    <Boundary><Report broken={broken} /></Boundary>
  </section>;
}`,
    solution: `import { Component, useState } from "react";
class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div><p role="alert">Report unavailable</p><button onClick={this.props.onRetry}>Retry</button></div> : this.props.children; }
}
function Report({ broken }) {
  if (broken) throw new Error("Report failed");
  return <p>Report ready</p>;
}
export default function App() {
  const [broken, setBroken] = useState(true);
  return <section><h2>Analytics workspace</h2>
    <Boundary key={String(broken)} onRetry={() => setBroken(false)}><Report broken={broken} /></Boundary>
  </section>;
}`,
    checks: [
      {
        name: "The workspace survives a local failure",
        script: `equal(text("h2"), "Analytics workspace"); equal(text('[role="alert"]'), "Report unavailable");`,
      },
      {
        name: "Retry resets the failed boundary",
        script: `await click("Retry"); assert(document.querySelector("#root").textContent.includes("Report ready"), "Retry must render the recovered report"); assert(!document.querySelector('[role="alert"]'), "Clear the error fallback");`,
      },
    ],
    hints: [
      "An error boundary's failed state persists even if its child's props change.",
      "A retry must change the failing input and reset the boundary state.",
      "Provide onRetry and change the boundary key with the recovered input, or implement an explicit reset contract.",
    ],
    explanation:
      "A local boundary keeps unrelated page content available. Recovery needs both a corrected dependency and a reset boundary; changing only the child does not clear failed state. Key-based remounting is a small explicit reset mechanism here. Error boundaries do not generally catch event-handler errors, rejected asynchronous work, or errors inside themselves.",
    rubric: [
      "Choose boundaries by meaningful recovery units.",
      "Explain why correcting props alone may not reset a boundary.",
      "Separate render failures from async and event-handler failures.",
    ],
    followUp:
      "How would a route-level boundary differ from a widget boundary? Define logging, retry limits, and recovery behavior for a lazy-loaded chunk failure.",
    resource:
      "https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary",
  },
  {
    id: "memo",
    track: "production",
    title: "Skip redundant catalog calculations",
    summary: "An unrelated theme change repeats instrumented filtering.",
    minutes: 30,
    level: "Medium",
    tags: ["Calculation reuse", "Memoization", "Instrumentation"],
    brief:
      "Filtering a catalog is instrumented with a visible calculation count. Toggling the theme should not repeat filtering, but changing the query must recompute. Optimize the demonstrated work without changing its result.",
    requirements: [
      "An unrelated theme change does not recalculate filtering.",
      "A query change still updates matching results.",
      "Explain when memoization costs more than it saves.",
    ],
    starter: `import { useState, useMemo } from "react";
const products = ["React patterns", "TypeScript systems", "React testing"];
let calculations = 0;
function filter(query) { calculations++; return products.filter(p => p.toLowerCase().includes(query.toLowerCase())); }
export default function App() {
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);
  const results = filter(query);
  return <section data-theme={dark ? "dark" : "light"}><h2>Catalog explorer</h2>
    <label>Query<input value={query} onChange={e => setQuery(e.target.value)} /></label>
    <button onClick={() => setDark(d => !d)}>Toggle theme</button>
    <p data-testid="calculations">{calculations}</p>
    <ul>{results.map(p => <li key={p}>{p}</li>)}</ul>
  </section>;
}`,
    solution: `import { useState, useMemo } from "react";
const products = ["React patterns", "TypeScript systems", "React testing"];
let calculations = 0;
function filter(query) { calculations++; return products.filter(p => p.toLowerCase().includes(query.toLowerCase())); }
export default function App() {
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);
  const results = useMemo(() => filter(query), [query]);
  return <section data-theme={dark ? "dark" : "light"}><h2>Catalog explorer</h2>
    <label>Query<input value={query} onChange={e => setQuery(e.target.value)} /></label>
    <button onClick={() => setDark(d => !d)}>Toggle theme</button>
    <p data-testid="calculations">{calculations}</p>
    <ul>{results.map(p => <li key={p}>{p}</li>)}</ul>
  </section>;
}`,
    checks: [
      {
        name: "Theme changes skip the demonstrated calculation",
        script: `const before = text('[data-testid="calculations"]'); await click("Toggle theme"); equal(text('[data-testid="calculations"]'), before);`,
      },
      {
        name: "Query changes recompute correct results",
        script: `await input("input", "typescript"); equal(find("ul").children.length, 1); assert(text("ul").includes("TypeScript systems"), "Keep matching results");`,
      },
    ],
    hints: [
      "The counter exposes work, not a reliable performance benchmark.",
      "The calculation depends on query and stable module-level products, not dark.",
      "Memoize filter(query) with [query]. If products were a prop, it would also be a dependency.",
    ],
    explanation:
      "useMemo can skip recalculation when dependencies are unchanged. It is an optimization, not semantic storage or a guarantee React never recomputes. This exercise uses a deliberately impure counter as instrumentation; real calculations should remain pure. Measure production-like workloads with the Profiler before choosing memoization, virtualization, or deferring work.",
    rubric: [
      "Name the measured bottleneck and correct dependencies.",
      "Treat memoization as an optimization, not a correctness requirement.",
      "Compare memoization, virtualization, and responsive scheduling.",
    ],
    followUp:
      "Scale to 100,000 searchable rows. What would you measure first, and when would you choose useDeferredValue, a worker, server filtering, or list virtualization?",
    resource: "https://react.dev/reference/react/useMemo",
  },
  {
    id: "optimistic",
    track: "production",
    title: "Optimism needs a rollback",
    summary: "A failed save leaves the UI claiming success.",
    minutes: 40,
    level: "Medium",
    tags: ["Optimistic UI", "Mutations", "Failure states"],
    brief:
      "A bookmark switches on immediately, then a simulated server rejects the save. Restore the last confirmed value and expose recovery. The local fixture always rejects so failure behavior is repeatable.",
    requirements: [
      "Bookmark updates immediately while saving.",
      "A rejected save restores the previous state and reports an error.",
      "Prevent overlapping saves while one request is pending.",
    ],
    starter: `import { useState } from "react";
const save = () => new Promise((_, reject) => setTimeout(() => reject(new Error("Could not save")), 120));
export default function App() {
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function toggle() {
    setSaved(!saved); setPending(true); setError("");
    try { await save(); } catch (error) { setError(error.message); }
    finally { setPending(false); }
  }
  return <section><h2>Reading list</h2>
    <button aria-pressed={saved} onClick={toggle}>Bookmark</button>
    <p role="status">{pending ? "Saving" : saved ? "Saved" : "Not saved"}</p>
    {error && <p role="alert">{error}</p>}
  </section>;
}`,
    solution: `import { useState } from "react";
const save = () => new Promise((_, reject) => setTimeout(() => reject(new Error("Could not save")), 120));
export default function App() {
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function toggle() {
    if (pending) return;
    const previous = saved;
    setSaved(!saved); setPending(true); setError("");
    try { await save(); } catch (error) { setSaved(previous); setError(error.message); }
    finally { setPending(false); }
  }
  return <section><h2>Reading list</h2>
    <button aria-pressed={saved} disabled={pending} onClick={toggle}>Bookmark</button>
    <p role="status">{pending ? "Saving" : saved ? "Saved" : "Not saved"}</p>
    {error && <p role="alert">{error}</p>}
  </section>;
}`,
    checks: [
      {
        name: "Pending save is optimistic and prevents overlapping clicks",
        script: `await click("Bookmark"); equal(find("button").getAttribute("aria-pressed"), "true"); assert(find("button").disabled, "Disable overlapping saves");`,
      },
      {
        name: "Rejection rolls back and allows retry",
        script: `await click("Bookmark"); await wait(180); equal(find("button").getAttribute("aria-pressed"), "false"); equal(text('[role="alert"]'), "Could not save"); assert(!find("button").disabled, "Allow retry after failure");`,
      },
    ],
    hints: [
      "Optimistic state is tentative until the server confirms it.",
      "Capture the previous value before updating and restore it on rejection.",
      "Rollback in catch; disable the button while pending and guard the handler too.",
    ],
    explanation:
      "A local optimistic update needs a confirmed baseline, a pending state, and an explicit failure transition. Serializing this small mutation prevents one rollback from overwriting a newer optimistic action. More complex systems may use mutation ids, version checks, or a queue. A timeout does not prove the server rejected a request; real retries need idempotency and reconciliation.",
    rubric: [
      "Define tentative versus confirmed state.",
      "Protect rollback from overlapping mutation races.",
      "Discuss ambiguous network failure and idempotent retry.",
    ],
    followUp:
      "Allow rapid toggles and synchronize across tabs. How do you prevent an older response or rollback overwriting a newer intent?",
    resource: "https://react.dev/reference/react/useOptimistic",
  },
  {
    id: "external-store",
    track: "production",
    title: "A store outside React",
    summary: "An external value changes, but its subscriber stays stale.",
    minutes: 35,
    level: "Medium",
    tags: ["External stores", "Subscriptions", "Client state"],
    brief:
      "A module-level store updates its value, but the component captures it once with useState. Subscribe through React's external-store contract and provide a stable snapshot.",
    requirements: [
      "The rendered count follows external writes.",
      "Repeated external updates remain visible.",
      "Keep subscribe stable and snapshots referentially stable when unchanged.",
    ],
    starter: `import { useState, useSyncExternalStore } from "react";
let count = 0;
const listeners = new Set();
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener); };
const getSnapshot = () => count;
function increment() { count++; listeners.forEach(listener => listener()); }
export default function App() {
  const [value] = useState(getSnapshot());
  return <section><h2>External counter</h2><output>{value}</output>
    <button onClick={increment}>External increment</button>
  </section>;
}`,
    solution: `import { useSyncExternalStore } from "react";
let count = 0;
const listeners = new Set();
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener); };
const getSnapshot = () => count;
function increment() { count++; listeners.forEach(listener => listener()); }
export default function App() {
  const value = useSyncExternalStore(subscribe, getSnapshot, () => 0);
  return <section><h2>External counter</h2><output>{value}</output>
    <button onClick={increment}>External increment</button>
  </section>;
}`,
    checks: [
      {
        name: "External writes update the subscriber",
        script: `await click("External increment"); equal(text("output"), "1");`,
      },
      {
        name: "Several writes remain synchronized",
        script: `await click("External increment"); await click("External increment"); await click("External increment"); equal(text("output"), "3");`,
      },
    ],
    hints: [
      "Reading an external value once does not subscribe to future changes.",
      "The store already exposes subscribe and getSnapshot; React has a hook for that contract.",
      "Use useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot). The primitive count is already a stable snapshot.",
    ],
    explanation:
      "useSyncExternalStore integrates stores React does not own. subscribe returns cleanup, getSnapshot stays identical while the store is unchanged, and getServerSnapshot supplies consistent server/hydration data when SSR applies. Returning a fresh object every read violates the cached-snapshot expectation. For app-owned state, prefer ordinary React state or context before adding an external store.",
    rubric: [
      "Separate reading a snapshot from subscribing to changes.",
      "Explain snapshot stability and unsubscribe ownership.",
      "Describe matching server and hydration snapshots.",
    ],
    followUp:
      "Replace count with a nested immutable store and selectors. How would you avoid notifying unrelated widgets while preserving consistent snapshots during concurrent rendering?",
    resource: "https://react.dev/reference/react/useSyncExternalStore",
  },
  ...builds,
];

export function findChallenge(id: string): Challenge | undefined {
  return challenges.find((challenge) => challenge.id === id);
}

const snapshot = challenges.find((challenge) => challenge.id === "snapshot");
if (snapshot)
  challenges.push({
    ...snapshot,
    id: "modular-snapshot",
    track: "architecture",
    title: "State across modules",
    summary: "Debug a counter across component boundaries.",
    brief:
      "App composes a Counter from another module. Fix the queued updates in Counter.tsx while keeping the public UI contract. Use the Explorer and file tabs to follow the import.",
    starter: writeProject({
      "App.tsx":
        'import Counter from "./Counter";\nexport default function App() { return <Counter />; }',
      "Counter.tsx": snapshot.starter,
    }),
    solution: writeProject({
      "App.tsx":
        'import Counter from "./Counter";\nexport default function App() { return <Counter />; }',
      "Counter.tsx": snapshot.solution,
    }),
  });

challenges.push(
  ...practice,
  ...advancedBuilds,
  ...foundations,
  ...designPractice,
  ...frontendPractice,
  ...frontendHard,
  ...algorithmPractice,
);

challenges.sort((a, b) => difficultyLevels.indexOf(a.level) - difficultyLevels.indexOf(b.level));
for (const [index, challenge] of challenges.entries())
  challenges[index] = configureDebugBrief(configureStarter(challenge));
