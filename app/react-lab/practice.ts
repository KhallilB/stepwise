import type { Challenge } from "./types";

export const practice: Challenge[] = [
  {
    id: "disclosure",
    track: "architecture",
    title: "A disclosure that tells the truth",
    summary: "A small interaction with a complete accessible contract.",
    minutes: 12,
    level: "Easy",
    tags: ["Accessibility", "Semantics", "Disclosure"],
    brief:
      "The shipping-details button changes text but never exposes its state or hides the content. Build a native-button disclosure that supports keyboard activation without custom keyboard handlers.",
    requirements: [
      "Details starts collapsed; toggle it with Shipping details.",
      "aria-expanded describes the visible state and aria-controls names the details element.",
      "Keep the button focused when toggling; do not remove the controlled element.",
    ],
    starter: `import { useState } from "react";
export default function App() {
  const [open, setOpen] = useState(false);
  return <section><button onClick={() => setOpen(!open)}>Shipping details</button><p id="shipping">Arrives in 3 days</p></section>;
}`,
    solution: `import { useState } from "react";
export default function App() {
  const [open, setOpen] = useState(false);
  return <section><button aria-expanded={open} aria-controls="shipping" onClick={() => setOpen(v => !v)}>Shipping details</button><p id="shipping" hidden={!open}>Arrives in 3 days</p></section>;
}`,
    checks: [
      {
        name: "Initial state and control relationship agree",
        script: `equal(find('button').getAttribute('aria-expanded'), 'false'); equal(find('button').getAttribute('aria-controls'), 'shipping'); assert(find('#shipping').hidden, 'Initially hide details');`,
      },
      {
        name: "Repeated toggles preserve focus and visibility",
        script: `find('button').focus(); await click('Shipping details'); equal(find('button').getAttribute('aria-expanded'), 'true'); assert(!find('#shipping').hidden, 'Reveal details'); equal(document.activeElement, find('button')); await click('Shipping details'); assert(find('#shipping').hidden, 'Collapse again');`,
      },
    ],
    hints: [
      "Visible state and announced state share one source of truth.",
      "Use a stable id for the controlled content.",
      "Bind hidden={!open}, aria-expanded={open}, and aria-controls to that id.",
    ],
    explanation:
      "A native button already handles Enter and Space. State controls both visibility and the accessibility attribute, preventing contradictory descriptions. Keeping the content mounted preserves its identity. A disclosure differs from a modal: it does not trap focus or move focus on opening.",
    rubric: [
      "Explain why a button fits the action.",
      "Keep visual and semantic state synchronized.",
      "Describe how you would test Enter and Space with assistive technology.",
    ],
    followUp:
      "How would multiple disclosure instances avoid duplicate ids, and when would you choose an accordion rather than independent disclosures?",
    resource: "https://react.dev/reference/react/useId",
  },
  {
    id: "password-toggle",
    track: "architecture",
    title: "Reveal without submitting",
    summary: "An innocent form button accidentally submits the form.",
    minutes: 12,
    level: "Easy",
    tags: ["Forms", "HTML", "Accessibility"],
    brief:
      "A password reveal button submits the form because HTML buttons inside forms default to submit. Repair its semantics while retaining the entered password and an understandable toggle state.",
    requirements: [
      "Show password toggles type between password and text without submitting or erasing input.",
      "Keep the label Show password stable and expose aria-pressed.",
      "Sign in is the only submit action; announce Submitted after submission.",
    ],
    starter: `import { useState } from "react";
export default function App() {
  const [show, setShow] = useState(false), [sent, setSent] = useState(false);
  return <form onSubmit={e => {e.preventDefault(); setSent(true);}}><label>Password<input aria-label="Password" type={show ? 'text' : 'password'} /></label><button onClick={() => setShow(!show)}>Show password</button><button type="submit">Sign in</button><p role="status">{sent ? 'Submitted' : 'Not submitted'}</p></form>;
}`,
    solution: `import { useState } from "react";
export default function App() {
  const [show, setShow] = useState(false), [sent, setSent] = useState(false);
  return <form onSubmit={e => {e.preventDefault(); setSent(true);}}><label>Password<input aria-label="Password" type={show ? 'text' : 'password'} /></label><button type="button" aria-pressed={show} onClick={() => setShow(v => !v)}>Show password</button><button type="submit">Sign in</button><p role="status">{sent ? 'Submitted' : 'Not submitted'}</p></form>;
}`,
    checks: [
      {
        name: "Reveal preserves value without submission",
        script: `await input('[aria-label="Password"]', 'secret'); await click('Show password'); equal(find('input').type, 'text'); equal(value('input'), 'secret'); equal(text('[role="status"]'), 'Not submitted'); equal(find('button').getAttribute('aria-pressed'), 'true');`,
      },
      {
        name: "Hide and submit remain independent",
        script: `await click('Show password'); await click('Show password'); equal(find('input').type, 'password'); equal(find('button').getAttribute('aria-pressed'), 'false'); await click('Sign in'); equal(text('[role="status"]'), 'Submitted');`,
      },
    ],
    hints: [
      "Check the default type of a button inside a form.",
      "Use separate semantics for submit and toggle actions.",
      "Give the toggle type=button and bind aria-pressed to show.",
    ],
    explanation:
      "HTML form semantics operate before React-specific concerns. Explicit button types prevent incidental submission. A stable toggle label with aria-pressed communicates state without removing the input or clearing its value. Real authentication still belongs on the server; this exercise only models interaction.",
    rubric: [
      "Identify the HTML default causing submission.",
      "Preserve input through visibility changes.",
      "Separate toggle state from form status.",
    ],
    followUp:
      "How would you support password managers, autocomplete, validation errors, and a pending submission without blocking a user's ability to correct input?",
    resource: "https://react.dev/reference/react-dom/components/input",
  },
  {
    id: "immutable-cart",
    track: "mental-model",
    title: "Update one item, keep the others",
    summary: "A mutated cart refuses to render its changed quantity.",
    minutes: 15,
    level: "Easy",
    tags: ["Immutability", "Arrays", "Identity"],
    brief:
      "Incrementing one cart item's quantity mutates the existing array and passes the same reference to React. Replace only the changed data while preserving stable ids and the other quantities.",
    requirements: [
      "Add Tea increments only Tea; Add Coffee increments only Coffee.",
      "Derive the total item count from current quantities.",
      "Create a new array and changed item; do not force renders or mutate shared data.",
    ],
    starter: `import { useState } from "react";
export default function App() {
  const [items, setItems] = useState([{id:'tea', name:'Tea', qty:1}, {id:'coffee', name:'Coffee', qty:2}]);
  function add(id: string) { const item = items.find(i => i.id === id); if (!item) return; item.qty++; setItems(items); }
  return <section>{items.map(i => <div key={i.id}><output aria-label={i.name}>{i.qty}</output><button onClick={() => add(i.id)}>Add {i.name}</button></div>)}<output aria-label="Total items">{items.reduce((n, i) => n + i.qty, 0)}</output></section>;
}`,
    solution: `import { useState } from "react";
export default function App() {
  const [items, setItems] = useState([{id:'tea', name:'Tea', qty:1}, {id:'coffee', name:'Coffee', qty:2}]);
  function add(id: string) { setItems(current => current.map(i => i.id === id ? {...i, qty:i.qty + 1} : i)); }
  return <section>{items.map(i => <div key={i.id}><output aria-label={i.name}>{i.qty}</output><button onClick={() => add(i.id)}>Add {i.name}</button></div>)}<output aria-label="Total items">{items.reduce((n, i) => n + i.qty, 0)}</output></section>;
}`,
    checks: [
      {
        name: "One update renders only the intended quantity",
        script: `await click('Add Tea'); equal(text('[aria-label="Tea"]'), '2'); equal(text('[aria-label="Coffee"]'), '2'); equal(text('[aria-label="Total items"]'), '4');`,
      },
      {
        name: "Interleaved edits compose",
        script: `await click('Add Coffee'); await click('Add Tea'); await click('Add Coffee'); equal(text('[aria-label="Tea"]'), '2'); equal(text('[aria-label="Coffee"]'), '4'); equal(text('[aria-label="Total items"]'), '6');`,
      },
    ],
    hints: [
      "React compares state references to decide whether an update can be skipped.",
      "Copying only the array still mutates a previous item snapshot.",
      "Map over the current array and copy the item matching id.",
    ],
    explanation:
      "An immutable update preserves previous render snapshots and gives React a new state reference. Copy the changed path, retain unchanged items, and derive totals instead of maintaining duplicate state. DOM checks prove behavior; reviewing the update establishes the non-mutation constraint.",
    rubric: [
      "Explain shallow versus nested copies.",
      "Choose a functional updater for composed edits.",
      "Distinguish object identity from list keys.",
    ],
    followUp:
      "If a cart item has nested options and a remote price quote, which parts should be copied locally and which data should remain server-authoritative?",
    resource: "https://react.dev/learn/updating-arrays-in-state",
  },
  {
    id: "search-empty",
    track: "mental-model",
    title: "Search without losing the source",
    summary: "Clearing a search cannot restore results that were overwritten.",
    minutes: 15,
    level: "Easy",
    tags: ["Search", "Derived state", "Empty states"],
    brief:
      "The search filters its already-filtered results, permanently discarding names. Keep the source intact and derive matches from a normalized query. Treat whitespace as an empty query.",
    requirements: [
      "Search Ada, Grace, and Linus case-insensitively, trimming surrounding whitespace.",
      "Show No matches in a status region when empty.",
      "Clear restores all three names and the input value.",
    ],
    starter: `import { useState } from "react";
const names = ['Ada', 'Grace', 'Linus'];
export default function App() {
  const [query, setQuery] = useState(''), [results, setResults] = useState(names);
  function search(value: string) { setQuery(value); setResults(results.filter(n => n.includes(value))); }
  return <section><label>Search<input aria-label="Search" value={query} onChange={e => search(e.target.value)} /></label><button onClick={() => search('')}>Clear</button><ul aria-label="Matches">{results.map(n => <li key={n}>{n}</li>)}</ul>{!results.length && <p role="status">No matches</p>}</section>;
}`,
    solution: `import { useState } from "react";
const names = ['Ada', 'Grace', 'Linus'];
export default function App() {
  const [query, setQuery] = useState('');
  const results = names.filter(n => n.toLowerCase().includes(query.trim().toLowerCase()));
  return <section><label>Search<input aria-label="Search" value={query} onChange={e => setQuery(e.target.value)} /></label><button onClick={() => setQuery('')}>Clear</button><ul aria-label="Matches">{results.map(n => <li key={n}>{n}</li>)}</ul>{!results.length && <p role="status">No matches</p>}</section>;
}`,
    checks: [
      {
        name: "Normalized queries always use the original collection",
        script: `await input('input', '  ADA  '); equal(find('ul').children.length, 1); equal(text('li'), 'Ada'); await input('input', 'grace'); equal(text('li'), 'Grace');`,
      },
      {
        name: "Empty state recovers through Clear",
        script: `await input('input', 'nobody'); equal(text('[role="status"]'), 'No matches'); await click('Clear'); equal(value('input'), ''); equal(find('ul').children.length, 3);`,
      },
    ],
    hints: [
      "Filtering an output as if it were source data loses information.",
      "Only query needs local state here.",
      "Derive results from names using query.trim().toLowerCase().",
    ],
    explanation:
      "A query is independent input; matches are a projection. Retaining the source makes clearing and replacing the query reversible. Normalization is an explicit search policy; international search may require locale-aware comparison and different accent handling.",
    rubric: [
      "Identify the actual source of truth.",
      "Explain empty versus failed results.",
      "Describe normalization as a product decision.",
    ],
    followUp:
      "How would searching thousands of remote records change ownership, loading states, keyboard interaction, and the meaning of Clear?",
    resource: "https://react.dev/learn/you-might-not-need-an-effect",
  },
  {
    id: "form-errors",
    track: "architecture",
    title: "Validation that helps recovery",
    summary: "A form rejects input without telling the user how to fix it.",
    minutes: 25,
    level: "Medium",
    tags: ["Forms", "Validation", "Accessibility"],
    brief:
      "Build a two-field contact form. Validation runs on submit, explains each invalid field, and moves focus to the first error. Keep drafts intact after rejection and clear obsolete errors after a valid submit. Use a simple exercise email rule: non-space text, @, non-space text, dot, non-space text.",
    requirements: [
      "Name and Email are required after trimming; email must meet the specified exercise rule.",
      "Link each error using aria-describedby and set aria-invalid on invalid inputs.",
      "Focus Name first when both fields fail. Valid submit announces Saved and removes errors; use noValidate so your feedback owns this exercise.",
    ],
    starter: `import { useState } from "react";
export default function App() {
  const [name, setName] = useState(''), [email, setEmail] = useState('');
  return <form noValidate onSubmit={e => e.preventDefault()}><label>Name<input aria-label="Name" value={name} onChange={e => setName(e.target.value)} /></label><label>Email<input aria-label="Email" value={email} onChange={e => setEmail(e.target.value)} /></label><button>Save contact</button><p role="status">Not saved</p></form>;
}`,
    solution: `import { useRef, useState } from "react";
export default function App() {
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [errors, setErrors] = useState<Partial<Record<"name" | "email", string>>>({}), [saved, setSaved] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null), emailRef = useRef<HTMLInputElement>(null);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const next: Partial<Record<"name" | "email", string>> = {};
    if (!name.trim()) next.name = 'Enter a name';
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.trim())) next.email = 'Enter a valid email';
    setErrors(next); setSaved(Object.keys(next).length === 0);
    if (next.name) nameRef.current?.focus(); else if (next.email) emailRef.current?.focus();
  }
  return <form noValidate onSubmit={submit}><label>Name<input ref={nameRef} aria-label="Name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} value={name} onChange={e => {setName(e.target.value); setSaved(false);}} /></label>{errors.name && <p id="name-error">{errors.name}</p>}<label>Email<input ref={emailRef} aria-label="Email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} value={email} onChange={e => {setEmail(e.target.value); setSaved(false);}} /></label>{errors.email && <p id="email-error">{errors.email}</p>}<button>Save contact</button><p role="status">{saved ? 'Saved' : 'Not saved'}</p></form>;
}`,
    checks: [
      {
        name: "Rejection links errors and focuses the first field",
        script: `await click('Save contact'); const name = find('[aria-label="Name"]'); equal(name.getAttribute('aria-invalid'), 'true'); equal(name.getAttribute('aria-describedby'), 'name-error'); equal(text('#name-error'), 'Enter a name'); equal(document.activeElement, name); equal(find('[aria-label="Email"]').getAttribute('aria-invalid'), 'true');`,
      },
      {
        name: "Recovery retains drafts and clears stale errors",
        script: `await input('[aria-label="Name"]', 'Ada'); await input('[aria-label="Email"]', 'bad'); await click('Save contact'); equal(document.activeElement, find('[aria-label="Email"]')); equal(value('[aria-label="Name"]'), 'Ada'); await input('[aria-label="Email"]', 'ada@example.test'); await click('Save contact'); equal(text('[role="status"]'), 'Saved'); assert(!document.querySelector('#email-error'), 'Remove obsolete errors'); equal(find('[aria-label="Email"]').getAttribute('aria-invalid'), 'false');`,
      },
    ],
    hints: [
      "Compute all errors before deciding whether submission succeeds.",
      "Focus requires refs; error text needs stable ids.",
      "Set the next errors object, then focus the first invalid field.",
    ],
    explanation:
      "Validation is a recoverable interaction, not a boolean gate. A single submit decision yields field errors and success state. Refs handle focus; ids associate messages with controls. The exercise regex is deliberately limited and never substitutes for server validation or email verification.",
    rubric: [
      "Explain validation timing and error ownership.",
      "Preserve user input on rejection.",
      "Separate client usability from server authority.",
    ],
    followUp:
      "How would you combine server field errors, a form-level error summary, and unsaved-change protection without losing a user's corrected draft?",
    resource: "https://react.dev/reference/react-dom/components/form",
  },
  {
    id: "pagination",
    track: "production",
    title: "Pagination follows the result set",
    summary: "Filtering on the last page produces an empty, impossible page.",
    minutes: 25,
    level: "Medium",
    tags: ["Pagination", "Search", "Boundaries"],
    brief:
      "Six products display two per page. Keep navigation bounded and reset the page when Query changes. A query with no results should read Page 1 of 1 with both navigation buttons disabled.",
    requirements: [
      "Results shows two names per page, in source order; Next and Previous stay within bounds.",
      "Query filters case-insensitively and resets to page 1 in the same event.",
      "Page output reports Page X of Y, with at least one page even for no matches.",
    ],
    starter: `import { useState } from "react";
const names = ['Apple', 'Apricot', 'Banana', 'Berry', 'Cherry', 'Date'];
export default function App() {
  const [query, setQuery] = useState(''), [page, setPage] = useState(1);
  const results = names.filter(n => n.toLowerCase().includes(query.toLowerCase())), pages = Math.ceil(results.length / 2);
  return <section><input aria-label="Query" value={query} onChange={e => setQuery(e.target.value)} /><ul aria-label="Results">{results.slice((page-1)*2,page*2).map(n => <li key={n}>{n}</li>)}</ul><output aria-label="Page">Page {page} of {pages}</output><button onClick={() => setPage(p => p-1)}>Previous</button><button onClick={() => setPage(p => p+1)}>Next</button></section>;
}`,
    solution: `import { useState } from "react";
const names = ['Apple', 'Apricot', 'Banana', 'Berry', 'Cherry', 'Date'];
export default function App() {
  const [query, setQuery] = useState(''), [page, setPage] = useState(1);
  const results = names.filter(n => n.toLowerCase().includes(query.toLowerCase())), pages = Math.max(1, Math.ceil(results.length / 2));
  return <section><input aria-label="Query" value={query} onChange={e => {setQuery(e.target.value); setPage(1);}} /><ul aria-label="Results">{results.slice((page-1)*2,page*2).map(n => <li key={n}>{n}</li>)}</ul><output aria-label="Page">Page {page} of {pages}</output><button disabled={page <= 1} onClick={() => setPage(p => Math.max(1,p-1))}>Previous</button><button disabled={page >= pages} onClick={() => setPage(p => Math.min(pages,p+1))}>Next</button></section>;
}`,
    checks: [
      {
        name: "Navigation remains bounded at first and last pages",
        script: `await click('Previous'); equal(text('[aria-label="Page"]'), 'Page 1 of 3'); await click('Next'); await click('Next'); await click('Next'); equal(text('[aria-label="Page"]'), 'Page 3 of 3'); equal(text('li'), 'Cherry'); assert(Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Next').disabled, 'Disable next at end');`,
      },
      {
        name: "Filtering resets the page and empty results remain navigable",
        script: `await click('Next'); await click('Next'); await input('input', 'ap'); equal(text('[aria-label="Page"]'), 'Page 1 of 1'); equal(find('ul').children.length, 2); await input('input', 'missing'); equal(text('[aria-label="Page"]'), 'Page 1 of 1'); assert(Array.from(document.querySelectorAll('button')).every(b => b.disabled), 'Disable both controls');`,
      },
    ],
    hints: [
      "Page is valid only relative to a particular result set.",
      "Reset query and page together instead of correcting an invalid render in an effect.",
      "Clamp handlers, disable boundary controls, and derive a minimum page count of one.",
    ],
    explanation:
      "Pagination adds an invariant: the current page belongs to the current result set. Event-owned resets avoid intermediate impossible pages. Disabled controls explain boundaries, while bounded handlers also defend the invariant. Remote cursor pagination needs a different contract than this local numbered list.",
    rubric: [
      "State the page-bound invariant.",
      "Explain why filtering resets page.",
      "Compare numbered and cursor pagination.",
    ],
    followUp:
      "How would you preserve filters and page in the URL, handle deleted last-page records, and avoid stale remote page responses?",
    resource: "https://react.dev/learn/choosing-the-state-structure",
  },
  {
    id: "sort-table",
    track: "production",
    title: "A sortable table with a stable contract",
    summary: "Sorting numbers as strings puts 12 before 3.",
    minutes: 25,
    level: "Medium",
    tags: ["Tables", "Sorting", "Accessibility"],
    brief:
      "A score table sorts numeric values lexicographically and mutates its source data. Implement reversible numeric sorting with name as a tie-breaker. Keep the score header's aria-sort aligned with the displayed order.",
    requirements: [
      "Sort score starts ascending: Ada 3, Grace 3, Linus 12.",
      "Clicking Sort score toggles descending, then ascending; tie order stays alphabetical.",
      "Keep table/header semantics and expose ascending or descending through aria-sort.",
    ],
    starter: `import { useState } from "react";
const rows = [{name:'Linus',score:12},{name:'Grace',score:3},{name:'Ada',score:3}];
export default function App() {
  const [descending, setDescending] = useState(false);
  const sorted = rows.sort((a,b) => String(a.score).localeCompare(String(b.score)));
  return <table><thead><tr><th>Name</th><th><button onClick={() => setDescending(!descending)}>Sort score</button></th></tr></thead><tbody>{sorted.map(r => <tr key={r.name}><td>{r.name}</td><td>{r.score}</td></tr>)}</tbody></table>;
}`,
    solution: `import { useState } from "react";
const rows = [{name:'Linus',score:12},{name:'Grace',score:3},{name:'Ada',score:3}];
export default function App() {
  const [descending, setDescending] = useState(false);
  const sorted = [...rows].sort((a,b) => (descending ? b.score-a.score : a.score-b.score) || a.name.localeCompare(b.name));
  return <table><thead><tr><th scope="col">Name</th><th scope="col" aria-sort={descending ? 'descending' : 'ascending'}><button onClick={() => setDescending(v => !v)}>Sort score</button></th></tr></thead><tbody>{sorted.map(r => <tr key={r.name}><td>{r.name}</td><td>{r.score}</td></tr>)}</tbody></table>;
}`,
    checks: [
      {
        name: "Initial numeric order uses an alphabetical tie-breaker",
        script: `equal(text('tbody tr:first-child td'), 'Ada'); equal(text('tbody tr:last-child td'), 'Linus'); equal(find('th[aria-sort]').getAttribute('aria-sort'), 'ascending');`,
      },
      {
        name: "Direction changes preserve ties and table semantics",
        script: `await click('Sort score'); equal(text('tbody tr:first-child td'), 'Linus'); equal(text('tbody tr:nth-child(2) td'), 'Ada'); equal(find('th[aria-sort]').getAttribute('aria-sort'), 'descending'); await click('Sort score'); equal(text('tbody tr:first-child td'), 'Ada');`,
      },
    ],
    hints: [
      "Numeric values need numeric comparison.",
      "Array.sort mutates its receiver.",
      "Copy rows; compare scores by direction, then names when the score difference is zero.",
    ],
    explanation:
      "Sorting is a derived view, so copy the source and store only the chosen direction. An explicit tie-breaker gives deterministic output. aria-sort belongs on the column header and communicates the same direction as the comparator. Locale, missing values, and server sorting require additional explicit policies.",
    rubric: [
      "Avoid mutation of shared source data.",
      "Explain deterministic tie-breaking.",
      "Keep semantic and visual sort states aligned.",
    ],
    followUp:
      "If this became a server-paginated table with null scores and localized names, where would sorting live and how would you prevent sorting only the current page?",
    resource: "https://react.dev/learn/updating-arrays-in-state",
  },
  {
    id: "debounced-preview",
    track: "async",
    title: "Debounce the work, not the typing",
    summary: "A delayed value makes typing feel broken.",
    minutes: 25,
    level: "Medium",
    tags: ["Debounce", "Effects", "Cleanup"],
    brief:
      "A search input delays its controlled value, making fast typing unreliable. Keep the draft immediate and debounce only the committed search value by 120ms. Cancel obsolete timers and support an immediate Clear.",
    requirements: [
      "Query reflects each keystroke immediately.",
      "Committed query changes only after a 120ms pause; only the latest draft commits.",
      "Clear cancels pending work and immediately resets both values; clean up on unmount.",
    ],
    starter: `import { useState } from "react";
export default function App() {
  const [query, setQuery] = useState('');
  return <section><input aria-label="Query" value={query} onChange={e => {const value=e.target.value; setTimeout(() => setQuery(value),120);}} /><button onClick={() => setQuery('')}>Clear</button><output aria-label="Committed query">{query}</output></section>;
}`,
    solution: `import { useEffect, useState } from "react";
export default function App() {
  const [query, setQuery] = useState(''), [committed, setCommitted] = useState('');
  useEffect(() => {const timer=setTimeout(() => setCommitted(query),120); return () => clearTimeout(timer);},[query]);
  return <section><input aria-label="Query" value={query} onChange={e => setQuery(e.target.value)} /><button onClick={() => {setQuery(''); setCommitted('');}}>Clear</button><output aria-label="Committed query">{committed}</output></section>;
}`,
    checks: [
      {
        name: "Typing is immediate but work waits for the pause",
        script: `await input('input', 'Ada'); equal(value('input'), 'Ada'); equal(text('output'), ''); await wait(160); equal(text('output'), 'Ada');`,
      },
      {
        name: "Latest draft wins and Clear prevents delayed resurrection",
        script: `await input('input', 'Ada'); await input('input', 'Grace'); await wait(160); equal(text('output'), 'Grace'); await input('input', 'Linus'); await click('Clear'); equal(value('input'), ''); equal(text('output'), ''); await wait(170); equal(text('output'), '');`,
      },
    ],
    hints: [
      "A controlled input must reflect its change event immediately.",
      "Keep draft and committed values separate because they have different timing.",
      "Use effect cleanup to cancel the timer for the previous draft.",
    ],
    explanation:
      "Draft and committed query are legitimately separate states because they represent different moments. Debouncing side work preserves responsive typing. Cleanup prevents obsolete timers from committing, while Clear is a direct user event that can reset both values immediately. Network results still need their own request-order policy.",
    rubric: [
      "Separate input responsiveness from deferred work.",
      "Explain timer cleanup on changes and unmount.",
      "Distinguish debounce, throttle, and deferred rendering.",
    ],
    followUp:
      "Would useDeferredValue enforce an exact debounce interval? How would you combine debouncing with abortable requests and cached results?",
    resource: "https://react.dev/reference/react/useEffect",
  },
  {
    id: "retry-request",
    track: "async",
    title: "Retry without a request storm",
    summary: "Recover a read failure while keeping one request in flight.",
    minutes: 30,
    level: "Medium",
    tags: ["Async", "Retry", "Failure recovery"],
    brief:
      "The provided read fixture rejects its first attempt and succeeds on the next. Build explicit idle/loading/error/success feedback. Retry must be deliberate; repeated clicks while pending must not create overlapping requests. The fixture is local and must remain unchanged.",
    requirements: [
      "Load starts one request; expose Loading in a status region and disable Load while pending.",
      "Show Service unavailable in an alert on failure and expose Retry.",
      "Retry succeeds with Ready; Request count is 2 after one failure and one successful retry. No automatic retries.",
    ],
    starter: `import { useRef, useState } from "react";
export default function App() {
  const attempts = useRef(0), [count,setCount]=useState(0), [status,setStatus]=useState('Idle');
  function read() { const attempt=++attempts.current; setCount(attempt); return new Promise<string>((resolve,reject) => setTimeout(() => attempt===1 ? reject(new Error('Service unavailable')) : resolve('Ready'),90)); }
  async function load() { setStatus('Loading'); try {setStatus(await read());} catch {setStatus('Failed');} }
  return <section><button onClick={load}>Load</button><p role="status">{status}</p><output aria-label="Request count">{count}</output></section>;
}`,
    solution: `import { useRef, useState } from "react";
export default function App() {
  const attempts = useRef(0), pending=useRef(false), [count,setCount]=useState(0), [status,setStatus]=useState('Idle');
  function read() { const attempt=++attempts.current; setCount(attempt); return new Promise<string>((resolve,reject) => setTimeout(() => attempt===1 ? reject(new Error('Service unavailable')) : resolve('Ready'),90)); }
  async function load() { if(pending.current) return; pending.current=true; setStatus('Loading'); try {setStatus(await read());} catch {setStatus('Failed');} finally {pending.current=false;} }
  return <section><button disabled={status==='Loading'} onClick={load}>Load</button>{status==='Failed' && <><p role="alert">Service unavailable</p><button onClick={load}>Retry</button></>}<p role="status">{status}</p><output aria-label="Request count">{count}</output></section>;
}`,
    checks: [
      {
        name: "A pending read rejects duplicate starts and exposes failure",
        script: `await click('Load'); equal(text('[role="status"]'), 'Loading'); assert(find('button').disabled, 'Disable while pending'); await click('Load'); await wait(130); equal(text('[role="alert"]'), 'Service unavailable'); equal(text('output'), '1');`,
      },
      {
        name: "Explicit retry recovers without stale error",
        script: `await click('Load'); await wait(130); await click('Retry'); await wait(130); equal(text('[role="status"]'), 'Ready'); equal(text('output'), '2'); assert(!document.querySelector('[role="alert"]'), 'Clear error on success');`,
      },
    ],
    hints: [
      "Represent request status explicitly instead of inferring success from missing errors.",
      "A synchronous pending guard also protects against starts before React commits a render.",
      "Release the guard in finally; show Retry only after failure.",
    ],
    explanation:
      "A disabled control communicates pending work; a synchronous guard enforces the one-request rule. Retry belongs to a recoverable error state and clears that error as a new attempt begins. This read fixture is safe to repeat. Mutations require idempotency and acknowledgement rules before retrying.",
    rubric: [
      "Defend the single-flight invariant.",
      "Distinguish retryable reads from unsafe repeated mutations.",
      "Describe cancellation and unmount behavior for a real transport.",
    ],
    followUp:
      "How would you add cancellation, exponential backoff with jitter, a retry budget, and a non-retryable authorization error without an infinite recovery loop?",
    resource: "https://react.dev/learn/synchronizing-with-effects",
  },
  {
    id: "keyboard-listbox",
    track: "architecture",
    title: "Focus is not selection",
    summary: "Build a single-select listbox with an explicit commit action.",
    minutes: 30,
    level: "Hard",
    tags: ["Keyboard", "ARIA", "Focus management"],
    brief:
      "A theme picker treats focused and selected options as the same thing. Implement a single-select listbox where arrows explore and Enter or Space commits. Start with Calm selected. Use buttons as options inside the labelled listbox for this bounded exercise; a production abstraction needs assistive-technology testing.",
    requirements: [
      "Options Calm, Contrast, and Paper use roving tabIndex; initially only Calm is tabbable and selected.",
      "Arrow Up/Down wrap; Home/End move focus only. Enter or Space selects the focused option.",
      "Clicking an option focuses and selects it. Exactly one option has aria-selected=true; output Selected theme names it.",
    ],
    starter: `import { useState } from "react";
const themes=['Calm','Contrast','Paper'];
export default function App() { const [selected,setSelected]=useState('Calm'); return <section><div role="listbox" aria-label="Theme">{themes.map(name => <button key={name} role="option" aria-selected={selected===name} onClick={() => setSelected(name)}>{name}</button>)}</div><output aria-label="Selected theme">{selected}</output></section>; }`,
    solution: `import { useRef, useState } from "react";
const themes=['Calm','Contrast','Paper'];
export default function App() {
  const [selected,setSelected]=useState('Calm'), [focused,setFocused]=useState(0), refs=useRef<Array<HTMLButtonElement | null>>([]);
  function move(index: number) {setFocused(index); refs.current[index]?.focus();}
  return <section><div role="listbox" aria-label="Theme">{themes.map((name,index) => <button ref={el => {refs.current[index]=el;}} key={name} role="option" tabIndex={focused===index ? 0 : -1} aria-selected={selected===name} onFocus={() => setFocused(index)} onClick={() => {move(index); setSelected(name);}} onKeyDown={e => {
    if(['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(e.key)) e.preventDefault();
    if(e.key==='ArrowDown') move((index+1)%themes.length);
    if(e.key==='ArrowUp') move((index+themes.length-1)%themes.length);
    if(e.key==='Home') move(0); if(e.key==='End') move(themes.length-1);
    if(e.key==='Enter' || e.key===' ') setSelected(name);
  }}>{name}</button>)}</div><output aria-label="Selected theme">{selected}</output></section>;
}`,
    checks: [
      {
        name: "Arrows explore without selecting and Enter commits",
        script: `const first=find('[role="option"]'); first.focus(); first.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true})); await wait(20); equal(document.activeElement.textContent,'Contrast'); equal(text('output'),'Calm'); document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); await wait(20); equal(text('output'),'Contrast'); equal(document.querySelectorAll('[role="option"][aria-selected="true"]').length,1);`,
      },
      {
        name: "Home, End, wrap and click preserve one tab stop",
        script: `const first=find('[role="option"]'); first.focus(); first.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true})); await wait(20); equal(document.activeElement.textContent,'Paper'); document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true})); await wait(20); equal(document.activeElement.textContent,'Calm'); document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true})); await wait(20); document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true})); await wait(20); equal(text('output'),'Paper'); await click('Contrast'); equal(text('output'),'Contrast'); equal(document.querySelectorAll('[role="option"][tabindex="0"]').length,1);`,
      },
    ],
    hints: [
      "Keep focused index independent from committed selection.",
      "Store element refs so navigation moves actual DOM focus.",
      "Prevent default scrolling for handled keys and give exactly one option tabIndex=0.",
    ],
    explanation:
      "This picker uses explicit selection, so focus navigation must not silently commit a setting. Roving tabIndex makes the composite one tab stop while refs move internal focus. The chosen keyboard contract must stay consistent with semantics. Native selects are preferable when their interaction meets the product need.",
    rubric: [
      "Explain focus versus selection.",
      "Defend the chosen keyboard model.",
      "Identify required manual screen-reader and disabled-option testing.",
    ],
    followUp:
      "How would typeahead, disabled options, dynamically removed options, and a large virtualized list change focus ownership and the active-descendant strategy?",
    resource: "https://react.dev/learn/manipulating-the-dom-with-refs",
  },
  {
    id: "undo-history",
    track: "mental-model",
    title: "Undo, redo, and a new branch",
    summary: "Redo restores edits from a history branch that no longer exists.",
    minutes: 30,
    level: "Hard",
    tags: ["Reducer", "Undo", "State machines"],
    brief:
      "Implement a bounded text history. Each change is a checkpoint in this exercise. Undo/Redo move between snapshots; typing after Undo discards the abandoned future. Keep at most five past snapshots and ignore unchanged values.",
    requirements: [
      "Draft begins empty. Undo and Redo are disabled at their boundaries.",
      "Undo restores the previous draft; Redo reapplies it. A new edit clears all future history.",
      "Keep at most five past entries; Past count reports the retained count. Use one coherent state transition.",
    ],
    starter: `import { useState } from "react";
export default function App() {const [draft,setDraft]=useState(''); return <section><input aria-label="Draft" value={draft} onChange={e => setDraft(e.target.value)} /><button>Undo</button><button>Redo</button><output aria-label="Past count">0</output></section>;}`,
    solution: `import { useReducer } from "react";
type HistoryState = { past: string[]; present: string; future: string[] };
type Action = { type: 'edit'; value: string } | { type: 'undo' | 'redo' };
function reduce(state: HistoryState,action: Action): HistoryState {
  const {past,present,future}=state;
  if(action.type==='edit') return action.value===present ? state : {past:[...past,present].slice(-5),present:action.value,future:[]};
  if(action.type==='undo' && past.length) return {past:past.slice(0,-1),present:past[past.length-1],future:[present,...future]};
  if(action.type==='redo' && future.length) return {past:[...past,present].slice(-5),present:future[0],future:future.slice(1)};
  return state;
}
export default function App() {const [state,dispatch]=useReducer(reduce,{past:[],present:'',future:[]}); return <section><input aria-label="Draft" value={state.present} onChange={e => dispatch({type:'edit',value:e.target.value})} /><button disabled={!state.past.length} onClick={() => dispatch({type:'undo'})}>Undo</button><button disabled={!state.future.length} onClick={() => dispatch({type:'redo'})}>Redo</button><output aria-label="Past count">{state.past.length}</output></section>;}`,
    checks: [
      {
        name: "History can move both directions",
        script: `assert(find('button').disabled, 'Undo starts disabled'); await input('input','A'); await input('input','B'); await click('Undo'); equal(value('input'),'A'); await click('Redo'); equal(value('input'),'B');`,
      },
      {
        name: "New branches discard future and retained history is bounded",
        script: `await input('input','A'); await input('input','B'); await click('Undo'); await input('input','C'); await click('Redo'); equal(value('input'),'C'); assert(Array.from(document.querySelectorAll('button')).find(b => b.textContent==='Redo').disabled, 'Abandoned future is gone'); for(let i=0;i<9;i++) await input('input',String(i)); equal(text('output'),'5'); for(let i=0;i<6;i++) await click('Undo'); equal(value('input'),'3');`,
      },
    ],
    hints: [
      "History is past, present, and future, not two independent booleans.",
      "Undo moves present into future; Redo moves it back into past.",
      "Every edit appends the old present, caps past to five, and empties future.",
    ],
    explanation:
      "One reducer makes a history transition atomic. Clearing future on edit is a branch rule, not UI cleanup. Capping history bounds memory, while ignoring identical values avoids meaningless checkpoints. Real editors group typing into transactions and track selection, composition, and document operations rather than storing every keystroke as a full snapshot.",
    rubric: [
      "State the history invariants.",
      "Explain branching and memory bounds.",
      "Discuss snapshot versus operation-based history.",
    ],
    followUp:
      "How would you group edits into undo transactions and preserve selection while keeping remote collaborative edits outside local undo history?",
    resource: "https://react.dev/learn/extracting-state-logic-into-a-reducer",
  },
  {
    id: "request-cache",
    track: "async",
    title: "Cache data without caching intent",
    summary: "Fast tab changes confuse request identity and the selected record.",
    minutes: 35,
    level: "Hard",
    tags: ["Caching", "Request deduplication", "Race conditions"],
    brief:
      "A profile picker loads Ada slowly and Grace quickly. Cache successful records by id and reuse a pending promise per id. Only the currently selected id may be displayed; a late response may populate the cache but must not take over the screen. Keep the fixture inside App so every mount starts isolated.",
    requirements: [
      "Ada and Grace buttons select profiles; output Profile shows Loading until that id resolves, then its name.",
      "Ada takes 150ms and Grace takes 30ms. Revisiting a resolved profile displays it immediately without a new request.",
      "Repeated selection of a pending id issues one request. Request count reports total calls, not selections.",
    ],
    starter: `import { useRef, useState } from "react";
export default function App() {
  const attempts=useRef(0), [count,setCount]=useState(0), [profile,setProfile]=useState('Choose a profile');
  function load(id: string) {setCount(++attempts.current); return new Promise<string>(resolve => setTimeout(() => resolve(id),id==='Ada'?150:30));}
  async function select(id: string) {setProfile('Loading'); setProfile(await load(id));}
  return <section><button onClick={() => select('Ada')}>Ada</button><button onClick={() => select('Grace')}>Grace</button><output aria-label="Profile">{profile}</output><output aria-label="Request count">{count}</output></section>;
}`,
    solution: `import { useRef, useState } from "react";
export default function App() {
  const attempts=useRef(0), cache=useRef(new Map<string, string>()), pending=useRef(new Map<string, Promise<string>>()), [count,setCount]=useState(0), [selected,setSelected]=useState<string | null>(null), [,refresh]=useState(0);
  function load(id: string) {setCount(++attempts.current); return new Promise<string>(resolve => setTimeout(() => resolve(id),id==='Ada'?150:30));}
  function select(id: string) {
    setSelected(id); if(cache.current.has(id) || pending.current.has(id)) return;
    const request=load(id); pending.current.set(id,request);
    request.then(value => {cache.current.set(id,value); pending.current.delete(id); refresh(n => n+1);});
  }
  return <section><button onClick={() => select('Ada')}>Ada</button><button onClick={() => select('Grace')}>Grace</button><output aria-label="Profile">{selected ? cache.current.get(selected) ?? 'Loading' : 'Choose a profile'}</output><output aria-label="Request count">{count}</output></section>;
}`,
    checks: [
      {
        name: "Slow responses fill cache without replacing selected intent",
        script: `await click('Ada'); await click('Grace'); await wait(200); equal(text('[aria-label="Profile"]'),'Grace'); equal(text('[aria-label="Request count"]'),'2'); await click('Ada'); equal(text('[aria-label="Profile"]'),'Ada'); equal(text('[aria-label="Request count"]'),'2');`,
      },
      {
        name: "Pending requests deduplicate by record identity",
        script: `await click('Ada'); await click('Ada'); equal(text('[aria-label="Request count"]'),'1'); await wait(190); equal(text('[aria-label="Profile"]'),'Ada'); await click('Grace'); await wait(70); await click('Ada'); equal(text('[aria-label="Request count"]'),'2'); equal(text('[aria-label="Profile"]'),'Ada');`,
      },
    ],
    hints: [
      "Selection is user intent; a response is data for one cache key.",
      "Use separate maps for resolved values and pending requests.",
      "Render the selected id's cached value instead of setting a global profile from every response.",
    ],
    explanation:
      "Keyed data ownership removes the race between selected intent and request completion. A response updates its own cache entry; rendering still follows selection. Pending deduplication prevents duplicate transport work. This bounded success-only fixture omits expiry, failure, invalidation, cancellation, and shared cache lifecycle, all required decisions for a production cache.",
    rubric: [
      "Separate selection from keyed data.",
      "Explain pending deduplication versus result reuse.",
      "Identify missing production cache policies.",
    ],
    followUp:
      "How would you add per-key errors, stale-while-revalidate, bounded eviction, user-scoped cache keys, and mutation invalidation without showing another user's cached data?",
    resource: "https://react.dev/learn/you-might-not-need-an-effect",
  },
];
