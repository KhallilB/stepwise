import type { Challenge, Stage } from "./types";

const feedStages: Stage[] = [
  {
    title: "Filter a useful feed",
    minutes: 10,
    constraints: [
      "Use 1,000 items named Event 1 through Event 1000, with stable numeric ids.",
      "Query matches case-insensitively; output Result count reports all matches, including unmounted ones. Show No events when empty.",
    ],
    checks: [
      {
        name: "Filtering reports the full matching collection",
        script: `equal(text('[aria-label="Result count"]'),'1000'); await input('[aria-label="Query"]','Event 999'); equal(text('[aria-label="Result count"]'),'1'); equal(text('[data-row]'),'Event 999');`,
      },
      {
        name: "Empty state can recover",
        script: `await input('[aria-label="Query"]','missing'); equal(text('[aria-label="Result count"]'),'0'); assert(document.querySelector("#root").textContent.includes('No events'),'Explain empty results'); await input('[aria-label="Query"]',''); equal(text('[aria-label="Result count"]'),'1000');`,
      },
    ],
  },
  {
    title: "Bound the rendered work",
    minutes: 15,
    constraints: [
      "Feed is a 160px-high scroll region. Rows are exactly 32px high; use a spacer for the full scroll extent.",
      "Mount at most 10 data-row elements regardless of collection size. Overscan is allowed. Row positioning must match scroll offset, not just replace text in a fixed list.",
    ],
    checks: [
      {
        name: "DOM size stays bounded while the scroll extent represents all rows",
        script: `const feed=find('[aria-label="Feed"]'); assert(document.querySelectorAll('[data-row]').length<=10,'Mount at most ten rows'); assert(feed.scrollHeight>=32000,'Preserve the full scroll extent'); equal(Math.round(feed.clientHeight),160);`,
      },
      {
        name: "Scrolling renders the correct window",
        script: `const feed=find('[aria-label="Feed"]'); feed.scrollTop=16000; feed.dispatchEvent(new Event('scroll',{bubbles:true})); await wait(30); const row=find('[data-row="501"]'); const a=row.getBoundingClientRect(),b=feed.getBoundingClientRect(); assert(Math.abs(a.top-b.top)<=2,'Position Event 501 at viewport start'); assert(document.querySelectorAll('[data-row]').length<=10,'Keep DOM bounded');`,
      },
    ],
  },
  {
    title: "Keep navigation and filtering coherent",
    minutes: 15,
    constraints: [
      "Jump to end scrolls to the last matching item, even after filtering.",
      "Changing Query resets both scroll position and the rendered window. Feed is keyboard focusable and labelled; this is a read-only feed, not an ARIA listbox.",
      "No virtualization packages. Discuss variable heights, focusable rows, and screen-reader limits separately; fixed-height checks do not prove those cases.",
    ],
    checks: [
      {
        name: "Jump reaches the last row without mounting the whole list",
        script: `await click('Jump to end'); await wait(30); assert(find('[data-row="1000"]'),'Render last item'); const feed=find('[aria-label="Feed"]'); assert(feed.scrollTop>=31840,'Scroll to end'); equal(feed.tabIndex,0);`,
      },
      {
        name: "Filtering after a jump resets window and scroll together",
        script: `await click('Jump to end'); await input('[aria-label="Query"]','Event 999'); equal(find('[aria-label="Feed"]').scrollTop,0); equal(text('[data-row]'),'Event 999'); await input('[aria-label="Query"]',''); equal(text('[data-row]'),'Event 1');`,
      },
    ],
  },
];
const registrationStages: Stage[] = [
  {
    title: "Validate local input",
    minutes: 10,
    constraints: [
      "Username accepts trimmed ASCII letters only, at least 3 characters; invalid submit shows Enter at least 3 letters in an alert.",
      "Register never submits invalid input. Keep the input editable. Use noValidate for exercise-owned feedback.",
    ],
    checks: [
      {
        name: "Invalid input cannot submit",
        script: `await input('[aria-label="Username"]','a1'); await click('Register'); equal(text('[role="alert"]'),'Enter at least 3 letters'); equal(text('[aria-label="Registrations"]'),'0');`,
      },
      {
        name: "Blank input keeps the draft and offers correction",
        script: `await input('[aria-label="Username"]','  '); await click('Register'); equal(value('[aria-label="Username"]'),'  '); equal(text('[aria-label="Registrations"]'),'0');`,
      },
    ],
  },
  {
    title: "Availability follows current intent",
    minutes: 15,
    constraints: [
      "Use the provided checkName fixture unchanged: ada is taken after 150ms; other valid names are available after 30ms.",
      "Availability status reads Checking, Taken, Available, or Unchecked. Old results cannot overwrite a new name. Do not check syntactically invalid names.",
    ],
    checks: [
      {
        name: "A slower taken result cannot replace a newer available result",
        script: `await input('[aria-label="Username"]','ada'); await input('[aria-label="Username"]','grace'); await wait(210); equal(text('[aria-label="Availability"]'),'Available');`,
      },
      {
        name: "Invalidating input clears previous availability",
        script: `await input('[aria-label="Username"]','grace'); await wait(80); equal(text('[aria-label="Availability"]'),'Available'); await input('[aria-label="Username"]','g'); await wait(60); equal(text('[aria-label="Availability"]'),'Unchecked');`,
      },
    ],
  },
  {
    title: "Submit exactly the validated version",
    minutes: 15,
    constraints: [
      "For syntactically valid input, enable Register only when the current normalized name was checked Available and no save is pending. Invalid submission remains available to explain errors. Guard duplicate submissions synchronously.",
      "saveName acknowledges after 100ms. output Registrations counts writes. On success announce Registered <submitted name> only if that name is still current.",
      "Editing while a save is pending preserves the new draft and never labels it registered from an older acknowledgement. No actual network.",
    ],
    checks: [
      {
        name: "Taken names are blocked; one available submission writes once",
        script: `await input('[aria-label="Username"]','ada'); await wait(190); assert(Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Register').disabled,'Block taken name'); await input('[aria-label="Username"]','grace'); await wait(80); await click('Register'); await click('Register'); await wait(140); equal(text('[aria-label="Registrations"]'),'1'); equal(text('[aria-label="Submission"]'),'Registered grace');`,
      },
      {
        name: "An old acknowledgement cannot mark a newer draft registered",
        script: `await input('[aria-label="Username"]','grace'); await wait(80); await click('Register'); await input('[aria-label="Username"]','linus'); await wait(150); equal(value('[aria-label="Username"]'),'linus'); assert(!text('[aria-label="Submission"]').includes('Registered'),'Do not claim the new draft was saved');`,
      },
    ],
  },
];
const registrationFixture = `function checkName(name: string) { return new Promise<boolean>(resolve => setTimeout(() => resolve(name!=='ada'),name==='ada'?150:30)); }
function saveName(name: string) { return new Promise<string>(resolve => setTimeout(() => resolve(name),100)); }
const valid = (name: string) => /^[a-zA-Z]{3,}$/.test(name);`;
const optimisticStages: Stage[] = [
  {
    title: "Immediate independent intent",
    minutes: 10,
    constraints: [
      "Ada and Grace start unstarred. Star Ada and Star Grace use aria-pressed for the optimistic state.",
      "Use the provided fixture unchanged. Each pending person disables only their own star button. Other people remain interactive.",
    ],
    checks: [
      {
        name: "Optimistic state is immediate and unrelated items stay interactive",
        script: `await click('Star Ada'); const ada=find('[aria-label="Star Ada"]'), grace=find('[aria-label="Star Grace"]'); equal(ada.getAttribute('aria-pressed'),'true'); assert(ada.disabled,'Guard pending item'); assert(!grace.disabled,'Do not block other items'); await click('Star Grace'); equal(grace.getAttribute('aria-pressed'),'true');`,
      },
    ],
  },
  {
    title: "Reconcile by operation owner",
    minutes: 15,
    constraints: [
      "Ada's first write rejects after 150ms; Grace's writes succeed after 30ms. Roll back only Ada, leaving Grace's successful intent intact.",
      "Show Could not save Ada in an alert. Confirmed stars reports acknowledged stars, not optimistic ones. Ignore duplicate clicks for a pending item.",
    ],
    checks: [
      {
        name: "A failed write cannot roll back another person's acknowledgement",
        script: `await click('Star Ada'); await click('Star Grace'); await wait(210); equal(find('[aria-label="Star Ada"]').getAttribute('aria-pressed'),'false'); equal(find('[aria-label="Star Grace"]').getAttribute('aria-pressed'),'true'); equal(text('[role="alert"]'),'Could not save Ada'); equal(text('[aria-label="Confirmed stars"]'),'1');`,
      },
    ],
  },
  {
    title: "Recover across hidden views",
    minutes: 15,
    constraints: [
      "Retry Ada resends the rejected intent and clears Ada's error after success; it must not undo Grace.",
      "Query filters names case-insensitively without deleting hidden pending state or errors. Clearing Query restores those rows.",
      "Keep transport attempts and per-person guards outside rendered row lifetimes. Request count counts writes. No global snapshot rollback.",
    ],
    checks: [
      {
        name: "Retry reconciles the failed item independently",
        script: `await click('Star Ada'); await click('Star Grace'); await wait(210); await click('Retry Ada'); await wait(210); equal(find('[aria-label="Star Ada"]').getAttribute('aria-pressed'),'true'); equal(text('[aria-label="Confirmed stars"]'),'2'); assert(!document.querySelector('[role="alert"]'),'Clear recovered error'); equal(text('[aria-label="Request count"]'),'3');`,
      },
      {
        name: "Filtering cannot discard in-flight ownership",
        script: `await click('Star Ada'); await input('[aria-label="Query"]','Grace'); await click('Star Grace'); await wait(210); await input('[aria-label="Query"]',''); equal(find('[aria-label="Star Ada"]').getAttribute('aria-pressed'),'false'); equal(find('[aria-label="Star Grace"]').getAttribute('aria-pressed'),'true'); equal(text('[aria-label="Confirmed stars"]'),'1');`,
      },
    ],
  },
];
const documentStages: Stage[] = [
  {
    title: "Draft and saved baseline",
    minutes: 10,
    constraints: [
      "Document starts as Server draft at revision 1. Status is Saved only when draft equals the acknowledged baseline.",
      "Save document submits a captured draft to the provided in-memory server. Save count counts transport calls. Use the fixture unchanged.",
    ],
    checks: [
      {
        name: "Editing becomes dirty and successful acknowledgement updates baseline",
        script: `equal(text('[aria-label="Document status"]'),'Saved'); await input('[aria-label="Document"]','First edit'); equal(text('[aria-label="Document status"]'),'Unsaved'); await click('Save document'); await wait(140); equal(text('[aria-label="Document status"]'),'Saved'); equal(text('[aria-label="Revision"]'),'2');`,
      },
    ],
  },
  {
    title: "Edits outlive their requests",
    minutes: 15,
    constraints: [
      "One save at a time; disable Save document while pending and guard duplicate calls.",
      "Edits during a save remain editable. Acknowledgement updates the saved snapshot, never overwrites newer local text. That newer draft stays Unsaved.",
    ],
    checks: [
      {
        name: "An acknowledgement cannot erase edits made while pending",
        script: `await input('[aria-label="Document"]','Version A'); await click('Save document'); await input('[aria-label="Document"]','Version B'); await click('Save document'); await wait(140); equal(value('[aria-label="Document"]'),'Version B'); equal(text('[aria-label="Document status"]'),'Unsaved'); equal(text('[aria-label="Save count"]'),'1'); await click('Save document'); await wait(140); equal(text('[aria-label="Document status"]'),'Saved');`,
      },
    ],
  },
  {
    title: "Resolve a revision conflict deliberately",
    minutes: 15,
    constraints: [
      "Remote edit changes the server text to Remote revision and increments its revision. A save with an obsolete expected revision rejects with a conflict and the latest server snapshot.",
      "Show Revision conflict in an alert; preserve local text. Use server adopts the server snapshot. Keep mine adopts its revision as the new baseline but keeps the local draft Unsaved; a later save is explicit.",
      "No silent last-write-wins or automatic destructive retry. Remote edit remains available while requests are pending.",
    ],
    checks: [
      {
        name: "Conflict preserves local draft and Keep mine rebases without writing",
        script: `await input('[aria-label="Document"]','My draft'); await click('Remote edit'); await click('Save document'); await wait(140); equal(text('[role="alert"]'),'Revision conflict'); equal(value('[aria-label="Document"]'),'My draft'); await click('Keep mine'); equal(text('[aria-label="Revision"]'),'2'); equal(text('[aria-label="Save count"]'),'1'); equal(text('[aria-label="Document status"]'),'Unsaved'); await click('Save document'); await wait(140); equal(text('[aria-label="Revision"]'),'3'); equal(text('[aria-label="Document status"]'),'Saved');`,
      },
      {
        name: "Use server explicitly replaces the conflicted local draft",
        script: `await input('[aria-label="Document"]','Local'); await click('Remote edit'); await click('Save document'); await wait(140); await click('Use server'); equal(value('[aria-label="Document"]'),'Remote revision'); equal(text('[aria-label="Document status"]'),'Saved'); assert(!document.querySelector('[role="alert"]'),'Dismiss resolved conflict');`,
      },
    ],
  },
];
const documentFixture = `type Snapshot = { text: string; revision: number };
  const server = useRef({text:'Server draft',revision:1});
  function saveRemote(text: string, expected: number) {return new Promise<Snapshot>((resolve,reject) => setTimeout(() => {
    if(expected!==server.current.revision) reject({...server.current});
    else {server.current={text,revision:expected+1}; resolve({...server.current});}
  },90));}
  function remoteEdit() {server.current={text:'Remote revision',revision:server.current.revision+1};}`;

const optimisticFixture = `const attempts=useRef<Record<string, number>>({Ada:0,Grace:0});
  function write(name: string,value: boolean) {const attempt=++attempts.current[name]; setCount(n=>n+1); return new Promise<boolean>((resolve,reject)=>setTimeout(()=>name==='Ada'&&attempt===1?reject(new Error('Rejected')):resolve(value),name==='Ada'?150:30));}`;

export const advancedBuilds: Challenge[] = [
  {
    id: "build-virtual-feed",
    track: "build",
    title: "Build a bounded activity feed",
    level: "Very hard",
    minutes: 40,
    summary: "Filter 1,000 records, then virtualize without breaking navigation.",
    tags: ["Virtualization", "Performance", "Scrolling"],
    brief:
      "Build a read-only activity feed in three rounds. Begin with correct filtering, then prove the DOM stays bounded while scroll geometry remains accurate. Finish with navigation and query changes at the far end of the collection. Discuss accessibility and variable-height tradeoffs rather than claiming this small virtualizer solves them.",
    requirements: [
      "Complete three cumulative stages in 40 minutes.",
      "Use only React and browser APIs; no virtualization packages or network.",
      "Keep fixed 32px rows and a 160px viewport. Checks validate behavior and DOM bounds, not frame-rate performance.",
    ],
    starter: `import { useState } from "react";
const events=Array.from({length:1000},(_,i)=>({id:i+1,name:'Event '+(i+1)}));
export default function App() {const [query,setQuery]=useState(''); return <section><input aria-label="Query" value={query} onChange={e=>setQuery(e.target.value)} /><output aria-label="Result count">{events.length}</output><div aria-label="Feed">{events.map(e=><div data-row={e.id} key={e.id}>{e.name}</div>)}</div></section>;}`,
    solution: `import { useRef, useState } from "react";
const events=Array.from({length:1000},(_,i)=>({id:i+1,name:'Event '+(i+1)}));
export default function App() {
  const [query,setQuery]=useState(''), [top,setTop]=useState(0), feed=useRef<HTMLDivElement>(null);
  const results=events.filter(e=>e.name.toLowerCase().includes(query.trim().toLowerCase()));
  const start=Math.max(0,Math.floor(top/32)-2), end=Math.min(results.length,Math.ceil((top+160)/32)+2);
  function jump() {const next=Math.max(0,results.length*32-160); if (feed.current) feed.current.scrollTop=next; setTop(next);}
  return <section><input aria-label="Query" value={query} onChange={e=>{setQuery(e.target.value); setTop(0); if (feed.current) feed.current.scrollTop=0;}} /><output aria-label="Result count">{results.length}</output><button onClick={jump}>Jump to end</button>{!results.length && <p role="status">No events</p>}<div ref={feed} role="region" aria-label="Feed" tabIndex={0} onScroll={e=>setTop(e.currentTarget.scrollTop)} style={{height:160,overflow:'auto',position:'relative'}}><div style={{height:results.length*32,position:'relative'}}>{results.slice(start,end).map((e,index)=><div data-row={e.id} key={e.id} style={{height:32,position:'absolute',top:(start+index)*32,left:0,right:0}}>{e.name}</div>)}</div></div></section>;
}`,
    stages: feedStages,
    checks: feedStages.flatMap((s) => s.checks),
    hints: [
      "Separate the filtered collection from the mounted window.",
      "Calculate the window from scrollTop and row height; keep a full-height spacer.",
      "Reset scrollTop and window state together on query changes; add a small bounded overscan.",
    ],
    explanation:
      "Virtualization bounds rendered work rather than data size. Correct scroll extent and absolute row offsets preserve spatial continuity. Filtering resets an otherwise invalid offset. Fixed heights make this exercise tractable; variable measurements, resize, keyboard focus, find-in-page, and screen-reader access require more design and testing. A DOM bound is measurable but does not by itself prove responsiveness.",
    rubric: [
      "Derive and defend window/overscan bounds.",
      "Explain offset correctness at first, middle, and final rows.",
      "Discuss when pagination or a proven virtualizer is preferable.",
    ],
    followUp:
      "How would variable row heights, sticky group headers, keyboard-focused rows, and new events inserted above the viewport change measurement and scroll anchoring?",
    resource: "https://react.dev/reference/react/useRef",
  },
  {
    id: "build-async-registration",
    track: "build",
    title: "Build a version-aware registration form",
    level: "Very hard",
    minutes: 40,
    summary: "Local validation becomes async validation, then a submission race.",
    tags: ["Forms", "Async validation", "Race conditions"],
    brief:
      "Start with username validation. Add a deliberately out-of-order availability service. Finally submit only the current checked name while the user may continue editing. Keep validation identity, draft identity, and submission acknowledgement distinct.",
    requirements: [
      "Complete three cumulative stages in 40 minutes.",
      "Preserve the checkName/saveName fixtures and their delays; use no network or extra packages.",
      "Explain how the server must atomically enforce uniqueness; an availability check is advisory.",
    ],
    starter: `import { useState } from "react";
${registrationFixture}
export default function App() {const [name,setName]=useState(''); return <form noValidate onSubmit={e=>e.preventDefault()}><input aria-label="Username" value={name} onChange={e=>setName(e.target.value)} /><button>Register</button><output aria-label="Registrations">0</output></form>;}`,
    solution: `import { useEffect, useRef, useState } from "react";
${registrationFixture}
export default function App() {
  const [name,setName]=useState(''), [availability,setAvailability]=useState({name:'',status:'Unchecked'}), [error,setError]=useState(''), [pending,setPending]=useState(false), [count,setCount]=useState(0), [registered,setRegistered]=useState<string | null>(null);
  const saving=useRef(false), current=useRef(''), normalized=name.trim().toLowerCase();
  useEffect(()=>{let active=true;
    if(!valid(normalized)){setAvailability({name:normalized,status:'Unchecked'}); return;}
    setAvailability({name:normalized,status:'Checking'});
    checkName(normalized).then(free=>{if(active) setAvailability({name:normalized,status:free?'Available':'Taken'});});
    return ()=>{active=false;};
  },[normalized]);
  const status=availability.name===normalized ? availability.status : valid(normalized)?'Checking':'Unchecked';
  async function submit(e: React.FormEvent<HTMLFormElement>) {e.preventDefault(); if(!valid(normalized)){setError('Enter at least 3 letters'); return;}
    if(status!=='Available'||saving.current) return; saving.current=true; setPending(true); setError(''); setCount(n=>n+1);
    const submitted=normalized; await saveName(submitted); if(current.current===submitted) setRegistered(submitted); saving.current=false; setPending(false);
  }
  return <form noValidate onSubmit={submit}><input aria-label="Username" value={name} onChange={e=>{setName(e.target.value); current.current=e.target.value.trim().toLowerCase(); setRegistered(null); setError('');}} />{error && <p role="alert">{error}</p>}<p role="status" aria-label="Availability">{status}</p><button disabled={pending || (valid(normalized) && status!=='Available')} >Register</button><output aria-label="Registrations">{count}</output><p role="status" aria-label="Submission">{registered===normalized ? 'Registered '+registered : pending?'Saving':'Not registered'}</p></form>;
}`,
    stages: registrationStages,
    checks: registrationStages.flatMap((s) => s.checks),
    hints: [
      "Availability belongs to a normalized value, not a global boolean.",
      "Invalidate older effect results and compare the checked name with the current name before submitting.",
      "Capture the submitted value; an acknowledgement may update only the matching draft's success state.",
    ],
    explanation:
      "Validity, availability, and persistence are separate authorities. A checked-name record prevents a previous Available result from authorizing another draft. Effect cleanup invalidates stale checks. A synchronous submission guard prevents duplicate local starts, while a captured submission identity prevents old success from labelling new text. Real uniqueness must still be enforced atomically by the server; transport failure and idempotency need additional policies.",
    rubric: [
      "Describe all three identities and their lifecycle.",
      "Prove a stale availability result cannot authorize submission.",
      "Explain why advisory availability cannot enforce uniqueness.",
    ],
    followUp:
      "How would you model a server-side uniqueness conflict after Available, transport timeouts with unknown write outcome, and retry using an idempotency key?",
    resource: "https://react.dev/learn/synchronizing-with-effects",
  },
  {
    id: "build-concurrent-stars",
    track: "build",
    title: "Build independent optimistic mutations",
    level: "Very hard",
    minutes: 40,
    summary: "Overlapping writes, targeted rollback, retry, and hidden pending rows.",
    tags: ["Optimistic UI", "Concurrency", "Reconciliation"],
    brief:
      "Star two people while independent simulated writes overlap. One fails after the other succeeds. Build operation ownership so rollback cannot undo unrelated acknowledged state, then add retry and filtering while requests are pending.",
    requirements: [
      "Complete three cumulative stages in 40 minutes.",
      "Preserve the per-person transport fixture and delays; requests are local promises.",
      "Use per-item reconciliation. Explain when pessimistic UI would be simpler and safer.",
    ],
    starter: `import { useRef, useState } from "react";
export default function App() {const [count,setCount]=useState(0);
  ${optimisticFixture}
  const [stars,setStars]=useState<Record<string, boolean>>({Ada:false,Grace:false}); return <section>{['Ada','Grace'].map(name=><button key={name} aria-label={'Star '+name} aria-pressed={stars[name]} onClick={()=>setStars({...stars,[name]:!stars[name]})}>Star {name}</button>)}<output aria-label="Confirmed stars">0</output><output aria-label="Request count">{count}</output></section>;}`,
    solution: `import { useRef, useState } from "react";
export default function App() {
  const [rows,setRows]=useState<Record<string, {value: boolean; confirmed: boolean; pending: boolean; error: boolean}>>({Ada:{value:false,confirmed:false,pending:false,error:false},Grace:{value:false,confirmed:false,pending:false,error:false}}), [query,setQuery]=useState(''), [count,setCount]=useState(0);
  ${optimisticFixture}
  const busy=useRef(new Set<string>());
  async function mutate(name: string,value: boolean) {if(busy.current.has(name)) return; busy.current.add(name);
    setRows(current=>({...current,[name]:{...current[name],value,pending:true,error:false}}));
    try {await write(name,value); setRows(current=>({...current,[name]:{value,confirmed:value,pending:false,error:false}}));}
    catch {setRows(current=>({...current,[name]:{...current[name],value:current[name].confirmed,pending:false,error:true}}));}
    finally {busy.current.delete(name);}
  }
  return <section><input aria-label="Query" value={query} onChange={e=>setQuery(e.target.value)} />{Object.entries(rows).filter(([name])=>name.toLowerCase().includes(query.toLowerCase())).map(([name,row])=><div key={name}><button aria-label={'Star '+name} aria-pressed={row.value} disabled={row.pending} onClick={()=>mutate(name,!row.value)}>Star {name}</button>{row.error && <><p role="alert">Could not save {name}</p><button onClick={()=>mutate(name,!row.confirmed)}>Retry {name}</button></>}</div>)}<output aria-label="Confirmed stars">{Object.values(rows).filter(row=>row.confirmed).length}</output><output aria-label="Request count">{count}</output></section>;
}`,
    stages: optimisticStages,
    checks: optimisticStages.flatMap((s) => s.checks),
    hints: [
      "A rollback should own one operation's state, not a captured copy of the whole collection.",
      "Store confirmed, optimistic, pending, and error state per person.",
      "Keep rows in the parent when filtering; retry the rejected intent without restoring a global snapshot.",
    ],
    explanation:
      "Serializing each person's writes limits ordering complexity while preserving concurrency across people. Functional updates reconcile against current peers, so Ada's rollback cannot erase Grace's acknowledgement. Filtering changes a view, not mutation ownership. This fixture has definite success or rejection; real unknown outcomes need idempotency, server versions, and reconciliation before retry.",
    rubric: [
      "Define mutation ownership and per-item ordering.",
      "Explain why a whole-list rollback is unsafe.",
      "Distinguish optimistic display from confirmed authority.",
    ],
    followUp:
      "How would repeated toggles on the same item, a timeout with unknown outcome, server-pushed changes, and cross-tab edits change this per-item serialization policy?",
    resource: "https://react.dev/learn/updating-objects-in-state",
  },
  {
    id: "build-conflict-editor",
    track: "build",
    title: "Build an editor that survives conflicts",
    level: "Very hard",
    minutes: 40,
    summary: "Save snapshots, preserve newer edits, then resolve server revisions.",
    tags: ["Concurrency", "Drafts", "Conflict resolution"],
    brief:
      "Build a document editor against an in-memory versioned server. Saving must not erase edits made during the request. Introduce another writer through Remote edit, reject obsolete revisions, and let the user explicitly adopt the server version or rebase their draft.",
    requirements: [
      "Complete three cumulative stages in 40 minutes.",
      "Use the provided revision check and 90ms acknowledgement fixture unchanged.",
      "No merge library, storage, or network. Discuss merge/unknown-outcome policies instead of silently overwriting.",
    ],
    starter: `import { useRef, useState } from "react";
export default function App() {
  ${documentFixture}
  const [draft,setDraft]=useState('Server draft');
  return <section><textarea aria-label="Document" value={draft} onChange={e=>setDraft(e.target.value)} /><button>Save document</button><button onClick={remoteEdit}>Remote edit</button><output aria-label="Document status">Saved</output><output aria-label="Revision">1</output><output aria-label="Save count">0</output></section>;
}`,
    solution: `import { useRef, useState } from "react";
export default function App() {
  ${documentFixture}
  const [draft,setDraft]=useState('Server draft'), [baseline,setBaseline]=useState({text:'Server draft',revision:1}), [pending,setPending]=useState(false), [conflict,setConflict]=useState<Snapshot | null>(null), [count,setCount]=useState(0), busy=useRef(false);
  async function save() {if(busy.current||conflict||draft===baseline.text) return; busy.current=true; setPending(true); setCount(n=>n+1); const submitted=draft;
    try {const acknowledged=await saveRemote(submitted,baseline.revision); setBaseline(acknowledged);}
    catch(latest) {setConflict(latest as Snapshot);}
    finally {busy.current=false; setPending(false);}
  }
  function resolve(adopt: boolean) {if (!conflict) return; setBaseline(conflict); if(adopt) setDraft(conflict.text); setConflict(null);}
  return <section><textarea aria-label="Document" value={draft} onChange={e=>setDraft(e.target.value)} /><button disabled={pending||!!conflict||draft===baseline.text} onClick={save}>Save document</button><button onClick={remoteEdit}>Remote edit</button>{conflict && <><p role="alert">Revision conflict</p><button onClick={()=>resolve(true)}>Use server</button><button onClick={()=>resolve(false)}>Keep mine</button></>}<output aria-label="Document status">{pending?'Saving':draft===baseline.text?'Saved':'Unsaved'}</output><output aria-label="Revision">{baseline.revision}</output><output aria-label="Save count">{count}</output></section>;
}`,
    stages: documentStages,
    checks: documentStages.flatMap((s) => s.checks),
    hints: [
      "Draft text and acknowledged baseline are independent; dirty state is derived from their comparison.",
      "Capture the submitted text and expected revision. Update the baseline, not the live draft, on success.",
      "A conflict carries a new baseline. Keep mine rebases intent without sending another write automatically.",
    ],
    explanation:
      "The editor owns a mutable draft while the server owns acknowledged text and revision. Saving captures a snapshot, so its acknowledgement can update the baseline without replacing subsequent typing. Expected-revision checks expose competing writers. Conflict choices have different consequences and remain explicit. This is optimistic concurrency control, not collaborative merging or offline synchronization.",
    rubric: [
      "Separate draft, request snapshot, and server baseline.",
      "Explain compare-and-swap revision semantics.",
      "Describe conflict choices and their data-loss implications.",
    ],
    followUp:
      "How would three-way merging, autosave, reconnect after an unknown write outcome, and a remote edit arriving during conflict resolution alter this contract?",
    resource: "https://react.dev/learn/choosing-the-state-structure",
  },
];
