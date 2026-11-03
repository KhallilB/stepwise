import type { Challenge } from "./types";

const suggestFixture = `function suggest(query:string){return new Promise<string[]>(resolve=>setTimeout(()=>resolve(['Ada','Grace','Linus'].filter(name=>name.toLowerCase().includes(query.toLowerCase()))),query==='a'?160:30));}`;
const saveFixture = `function saveName(name:string){return new Promise<string>((resolve,reject)=>setTimeout(()=>name==='fail'?reject(new Error('Save rejected')):resolve(name),100));}`;
const abortFixture = `let cancelled=0;
function lookup(query:string,signal:AbortSignal){return new Promise<string>((resolve,reject)=>{let settled=false;const timer=setTimeout(()=>{settled=true;resolve(query);},query==='Ada'?160:30);signal.addEventListener('abort',()=>{if(settled)return;settled=true;clearTimeout(timer);cancelled++;reject(new DOMException('Cancelled','AbortError'));},{once:true});});}`;

type Exercise = Omit<Challenge, "track" | "level" | "minutes">;

const exercises: Exercise[] = [
  {
    id: "async-combobox",
    title: "Suggestions follow typing and keyboard intent",
    summary: "Slow suggestions reopen a dismissed picker or replace newer results.",
    tags: ["Combobox", "ARIA", "Async", "Keyboard", "Race conditions"],
    brief:
      "Build a bounded editable name combobox around the provided suggest fixture. Input keeps DOM focus while arrows explore suggestions; Enter commits. Ignore stale results and keep Escape dismissal authoritative over pending work.",
    requirements: [
      "Input is a labelled combobox with aria-expanded, aria-controls, and active-descendant while exploring. A labelled listbox contains options with stable ids.",
      "Query a resolves slowly; gr resolves quickly. New results win, empty input clears results, and an unmatched query announces No matches.",
      "ArrowDown/Up wrap, Enter commits the active name, and Escape dismisses without a pending result reopening. Preserve suggest unchanged.",
    ],
    starter: `import {useEffect,useState} from 'react';${suggestFixture}
export default function App(){const [query,setQuery]=useState(''),[names,setNames]=useState<string[]>([]);useEffect(()=>{suggest(query).then(setNames);},[query]);return <section><label>Name<input value={query} onChange={e=>setQuery(e.target.value)}/></label><ul>{names.map(name=><li key={name}>{name}</li>)}</ul></section>;}`,
    solution: `import {useEffect,useRef,useState} from 'react';${suggestFixture}
export default function App(){
 const [value,setValue]=useState(''),[term,setTerm]=useState(''),[names,setNames]=useState<string[]>([]),[open,setOpen]=useState(false),[active,setActive]=useState(-1),[status,setStatus]=useState('Type a name');const version=useRef(0);
 useEffect(()=>{const id=++version.current;setActive(-1);setOpen(false);setNames([]);if(!term){setStatus('Type a name');return;}setStatus('Loading');suggest(term).then(results=>{if(version.current!==id)return;setNames(results);setOpen(results.length>0);setStatus(results.length?results.length+' suggestions':'No matches');});return()=>{version.current++;};},[term]);
 function commit(name:string){version.current++;setValue(name);setTerm('');setOpen(false);setActive(-1);}
 return <section><label>Name<input role="combobox" aria-label="Name" aria-autocomplete="list" aria-expanded={open} aria-controls="suggestions" aria-activedescendant={open&&active>=0?'option-'+active:undefined} value={value} onChange={e=>{setValue(e.target.value);setTerm(e.target.value);}} onKeyDown={e=>{if(e.key==='Escape'){version.current++;setOpen(false);setActive(-1);setStatus('Dismissed');}if(open&&names.length&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();setActive(index=>e.key==='ArrowDown'?(index+1)%names.length:(index<=0?names.length:index)-1);}if(e.key==='Enter'&&open&&active>=0){e.preventDefault();commit(names[active]);}}}/></label><ul id="suggestions" role="listbox" aria-label="Name suggestions" hidden={!open}>{names.map((name,index)=><li key={name} role="option" id={'option-'+index} aria-selected={active===index} onMouseDown={e=>e.preventDefault()} onClick={()=>commit(name)}>{name}</li>)}</ul><p role="status">{status}</p></section>;
}`,
    checks: [
      {
        name: "Slow suggestions cannot replace the current query",
        script: `await input('input','a');await input('input','gr');await wait(220);equal(text('[role="option"]'),'Grace');equal(document.querySelectorAll('[role="option"]').length,1);equal(find('input').getAttribute('aria-expanded'),'true');equal(find('input').getAttribute('aria-controls'),find('[role="listbox"]').id);`,
      },
      {
        name: "Keyboard exploration and commit retain input focus",
        script: `const field=find('input');field.focus();await input('input','a');await wait(210);field.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true}));await wait();equal(text('#'+field.getAttribute('aria-activedescendant')),'Grace');equal(document.activeElement,field);field.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));await wait();equal(text('#'+field.getAttribute('aria-activedescendant')),'Ada');field.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));await wait(200);equal(value('input'),'Ada');equal(field.getAttribute('aria-expanded'),'false');equal(document.activeElement,field);`,
      },
      {
        name: "Escape and empty input invalidate pending suggestions",
        script: `await input('input','a');find('input').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await wait(210);equal(find('input').getAttribute('aria-expanded'),'false');await input('input','missing');await wait(80);equal(text('[role="status"]'),'No matches');await input('input','');await wait();equal(find('input').getAttribute('aria-expanded'),'false');`,
      },
    ],
    hints: [
      "Typing, active option, committed value, and popup visibility are related but distinct.",
      "Keep focus on the input and identify the active option with aria-activedescendant.",
      "Version pending work; dismissing or committing must invalidate its ability to reopen the popup.",
    ],
    explanation:
      "A combobox combines a text-editing surface, a composite popup, and asynchronous ownership. An active descendant describes exploration while the input retains focus. Dismissal is user intent and must outlive older pending work. This bounded fixture omits IME composition, disabled options, and real assistive-technology compatibility.",
    rubric: [
      "Separate typed value, exploration, and commit.",
      "Explain stale work after Escape or selection.",
      "Name manual keyboard, IME, and screen-reader checks.",
    ],
    followUp:
      "How would IME composition, server errors, result virtualization, and multiple combobox instances change this contract?",
    resource: "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/",
  },
  {
    id: "inline-editing",
    title: "A saved name is not always the current draft",
    summary: "An acknowledgement erases text entered while Save was pending.",
    tags: ["Forms", "Async", "Drafts", "Recovery", "Focus"],
    brief:
      "An inline name editor starts at Ada. Edit, Save, and Cancel must preserve distinct draft and confirmed values. The fixture rejects fail after 100ms. Keep typing possible during Save; acknowledge only the submitted snapshot.",
    requirements: [
      "Edit name opens Name input with focus. Cancel restores the confirmed name and returns focus to Edit name.",
      "Save uses the trimmed submitted snapshot; block overlapping saves. Failure preserves the draft with Save rejected.",
      "If the draft changes while saving, update Saved name to the acknowledged snapshot while keeping the newer draft open. If unchanged, close and return focus. Keep saveName unchanged.",
    ],
    starter: `import {useRef,useState} from 'react';${saveFixture}
export default function App(){const [saved,setSaved]=useState('Ada'),[draft,setDraft]=useState('Ada'),[editing,setEditing]=useState(false);return <section><output aria-label="Saved name">{saved}</output><button onClick={()=>setEditing(true)}>Edit name</button>{editing&&<><input aria-label="Name" value={draft} onChange={e=>setDraft(e.target.value)}/><button onClick={()=>saveName(draft).then(name=>{setSaved(name);setDraft(name);setEditing(false);}).catch(()=>{})}>Save</button><button onClick={()=>setEditing(false)}>Cancel</button></>}</section>;}`,
    solution: `import {useEffect,useRef,useState} from 'react';${saveFixture}
export default function App(){const [saved,setSaved]=useState('Ada'),[draft,setDraft]=useState('Ada'),[editing,setEditing]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState('');const field=useRef<HTMLInputElement>(null),trigger=useRef<HTMLButtonElement>(null),version=useRef(0),busy=useRef(false);useEffect(()=>{if(editing)field.current?.focus();},[editing]);function close(){setEditing(false);trigger.current?.focus();}async function save(){if(busy.current||!draft.trim())return;busy.current=true;setPending(true);setError('');const id=version.current,name=draft.trim();try{const confirmed=await saveName(name);setSaved(confirmed);if(id===version.current){setDraft(confirmed);close();}}catch{setError('Save rejected');}finally{busy.current=false;setPending(false);}}return <section><output aria-label="Saved name">{saved}</output><button ref={trigger} onClick={()=>{if(editing)return;setDraft(saved);setError('');setEditing(true);}}>Edit name</button>{editing&&<><label>Name<input ref={field} aria-label="Name" value={draft} onChange={e=>{version.current++;setDraft(e.target.value);}}/></label><button disabled={pending||!draft.trim()} onClick={save}>Save</button><button disabled={pending} onClick={()=>{setDraft(saved);setError('');close();}}>Cancel</button>{error&&<p role="alert">{error}</p>}</>}</section>;}`,
    checks: [
      {
        name: "Cancel discards draft and returns focus",
        script: `await click('Edit name');equal(document.activeElement,find('input'));await input('input','Grace');await click('Cancel');equal(text('output'),'Ada');equal(document.activeElement,find('button'));await click('Edit name');equal(value('input'),'Ada');`,
      },
      {
        name: "An acknowledgement preserves a newer draft",
        script: `await click('Edit name');await input('input',' Grace ');await click('Save');const save=Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Save');assert(save.disabled,'Block overlap');await input('input','Linus');await wait(150);equal(text('output'),'Grace');equal(value('input'),'Linus');await click('Save');await wait(150);equal(text('output'),'Linus');assert(!document.querySelector('input'),'Close acknowledged draft');equal(document.activeElement,find('button'));`,
      },
      {
        name: "Rejected edits retain a retryable draft",
        script: `await click('Edit name');await input('input','fail');await click('Save');await wait(150);equal(text('[role="alert"]'),'Save rejected');equal(value('input'),'fail');equal(text('output'),'Ada');await input('input','Grace');await click('Save');await wait(150);equal(text('output'),'Grace');`,
      },
    ],
    hints: [
      "Keep draft and confirmed baseline separate.",
      "Capture the submitted value and a draft version before awaiting.",
      "Only close when that version is still current; an acknowledgement must not replace newer typing.",
    ],
    explanation:
      "A save response confirms one submitted snapshot. A later local draft is a different version and remains owned by the user. Synchronous pending guards prevent overlap before a rerender, and focus returns to the persistent trigger when editing ends. Server revision conflicts remain a separate exercise.",
    rubric: [
      "Identify submitted, confirmed, and current values.",
      "Explain acknowledgement ownership.",
      "Preserve recovery and focus through failure and cancellation.",
    ],
    followUp:
      "How would remote revisions or navigating away during Save change the meaning of Cancel and the lifetime of the request?",
    resource: "https://react.dev/learn/referencing-values-with-refs",
  },
  {
    id: "abortable-search",
    title: "Cancel work and ignore obsolete results",
    summary: "A cleared query keeps consuming work and later reports a result.",
    tags: ["AbortController", "Async", "Cleanup", "Cancellation"],
    brief:
      "Use the supplied abort-aware local lookup to separate cancellation from stale-result protection. Search Ada is slow; Search Grace is fast. Clear invalidates pending work and returns status Idle. AbortError is expected cancellation, not a user-visible failure.",
    requirements: [
      "Starting Grace while Ada is pending aborts Ada; Grace remains the visible result.",
      "Clear aborts pending work, leaves Idle, and shows no error after the old deadline.",
      "Output Cancelled reports fixture cancellations. Preserve lookup and cancelled unchanged; this is an AbortSignal fixture, not a real HTTP test.",
    ],
    starter: `import {useEffect,useState} from 'react';${abortFixture}
export default function App(){const [query,setQuery]=useState(''),[status,setStatus]=useState('Idle');useEffect(()=>{if(!query){setStatus('Idle');return;}setStatus('Loading');lookup(query,new AbortController().signal).then(setStatus);},[query]);return <section><button onClick={()=>setQuery('Ada')}>Search Ada</button><button onClick={()=>setQuery('Grace')}>Search Grace</button><button onClick={()=>setQuery('')}>Clear</button><p role="status">{status}</p><output aria-label="Cancelled">{cancelled}</output></section>;}`,
    solution: `import {useEffect,useState} from 'react';${abortFixture}
export default function App(){const [query,setQuery]=useState(''),[status,setStatus]=useState('Idle');useEffect(()=>{if(!query){setStatus('Idle');return;}const controller=new AbortController();let active=true;setStatus('Loading');lookup(query,controller.signal).then(value=>{if(active)setStatus(value);}).catch((error:unknown)=>{if(active&&!(error instanceof DOMException&&error.name==='AbortError'))setStatus('Search failed');});return()=>{active=false;controller.abort();};},[query]);return <section><button onClick={()=>setQuery('Ada')}>Search Ada</button><button onClick={()=>setQuery('Grace')}>Search Grace</button><button onClick={()=>setQuery('')}>Clear</button><p role="status">{status}</p><output aria-label="Cancelled">{cancelled}</output></section>;}`,
    checks: [
      {
        name: "Replacement cancels old work and keeps current intent",
        script: `await click('Search Ada');await click('Search Grace');await wait(220);equal(text('[role="status"]'),'Grace');assert(Number(text('output'))>=1,'Abort superseded work');assert(!document.querySelector('[role="alert"]'),'Cancellation is expected');`,
      },
      {
        name: "Clear cancels without late results or error feedback",
        script: `await click('Search Ada');await click('Clear');await wait(220);equal(text('[role="status"]'),'Idle');assert(Number(text('output'))>=1,'Abort cleared work');assert(!document.querySelector('#root').textContent.includes('Search failed'),'Do not report abort as failure');`,
      },
    ],
    hints: [
      "Cancellation stops supported work; ignoring obsolete results protects UI intent.",
      "Each effect invocation owns its AbortController and active flag.",
      "Invalidate before aborting in cleanup, and handle rejected cancellation promises.",
    ],
    explanation:
      "AbortSignal is a cooperative cancellation contract. This fixture clears its timer when aborted, while the active guard protects result commitment. Real fetch behavior, response parsing, HTTP errors, and server-side cancellation are outside these local checks.",
    rubric: [
      "Distinguish cancellation from result ordering.",
      "Own one controller per invocation.",
      "Handle expected abort rejection without hiding real errors.",
    ],
    followUp:
      "What happens if transport completes before cancellation but response parsing is still pending, or if the server already committed a mutation?",
    resource: "https://developer.mozilla.org/en-US/docs/Web/API/AbortController",
  },
  {
    id: "reorder-focus",
    title: "Move an item without losing your place",
    summary: "A reordered row sends keyboard focus to the wrong action.",
    tags: ["Accessibility", "Reordering", "Identity", "Focus management"],
    brief:
      "A playlist has Ada, Grace, and Linus with Move up actions. Provide a native-button alternative to dragging. After moving a row, focus stays on that record's enabled action; when it reaches the first position, focus its row heading instead of a disabled button.",
    requirements: [
      "Move Grace up changes order to Grace, Ada, Linus and announces Grace moved to position 1 of 3.",
      "The first row's Move up is disabled; all other rows can move. Preserve stable record identity.",
      "Moving Linus up once keeps focus on Move Linus up; moving it to first focuses its heading. Already-first actions cannot alter order.",
    ],
    starter: `import {useState} from 'react';export default function App(){const [names,setNames]=useState(['Ada','Grace','Linus']);function move(index:number){setNames(current=>{const next=[...current];[next[index-1],next[index]]=[next[index],next[index-1]];return next;});}return <section><ol>{names.map((name,index)=><li key={index}><h3>{name}</h3><button disabled={index===0} onClick={()=>move(index)}>Move {name} up</button></li>)}</ol><p role="status"/></section>;}`,
    solution: `import {useLayoutEffect,useRef,useState} from 'react';export default function App(){const [names,setNames]=useState(['Ada','Grace','Linus']),[message,setMessage]=useState(''),focus=useRef<string|null>(null),buttons=useRef<Record<string,HTMLButtonElement|null>>({}),headings=useRef<Record<string,HTMLHeadingElement|null>>({});useLayoutEffect(()=>{const name=focus.current;if(!name)return;if(names.indexOf(name)===0)headings.current[name]?.focus();else buttons.current[name]?.focus();focus.current=null;},[names]);function move(name:string){const index=names.indexOf(name);if(index<=0)return;const next=[...names];[next[index-1],next[index]]=[next[index],next[index-1]];focus.current=name;setNames(next);setMessage(name+' moved to position '+index+' of '+next.length);}return <section><ol>{names.map((name,index)=><li key={name}><h3 tabIndex={-1} ref={node=>{headings.current[name]=node;}}>{name}</h3><button ref={node=>{buttons.current[name]=node;}} disabled={index===0} onClick={()=>move(name)}>Move {name} up</button></li>)}</ol><p role="status">{message}</p></section>;}`,
    checks: [
      {
        name: "Reordering announces position and focuses the first-row heading",
        script: `await click('Move Grace up');equal(Array.from(document.querySelectorAll('h3')).map(n=>n.textContent).join(','),'Grace,Ada,Linus');equal(text('[role="status"]'),'Grace moved to position 1 of 3');equal(document.activeElement,find('h3'));assert(find('button').disabled,'Disable first-row action');await click('Move Grace up');equal(text('h3'),'Grace');`,
      },
      {
        name: "Focus and DOM identity follow the moved record",
        script: `const row=Array.from(document.querySelectorAll('li')).find(n=>n.textContent.includes('Linus'));await click('Move Linus up');equal(document.activeElement.textContent,'Move Linus up');equal(Array.from(document.querySelectorAll('li'))[1],row);await click('Move Linus up');equal(document.activeElement.textContent,'Linus');equal(text('[role="status"]'),'Linus moved to position 1 of 3');`,
      },
    ],
    hints: [
      "Data identity must survive moving between positions.",
      "Record which item needs focus after the DOM update.",
      "Use stable keys and refs; focus a row heading if its action becomes disabled.",
    ],
    explanation:
      "Reordering changes both document order and the user's place in the task. A stable key preserves identity, while explicit post-update focus follows the moved record. A live announcement communicates the result. This button interaction is a keyboard alternative; it does not implement pointer drag-and-drop.",
    rubric: [
      "Preserve record identity through reordering.",
      "Define focus when an action becomes disabled.",
      "Explain how announcements supplement visible order.",
    ],
    followUp:
      "How would filtering, remote ordering conflicts, and an optional drag interaction share the same reorder operation?",
    resource: "https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/",
  },
];

export const frontendHard: Challenge[] = exercises.map((exercise) => ({
  ...exercise,
  track: "production",
  level: "Hard",
  minutes: 40,
}));
