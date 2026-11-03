import type { Challenge } from "./types";

type Exercise = Omit<Challenge, "track" | "level" | "minutes">;

const exercises: Exercise[] = [
  {
    id: "responsive-navigation",
    title: "Navigation that survives a narrow container",
    summary: "A desktop link row has no coherent compact state.",
    tags: ["CSS", "Responsive design", "Navigation", "Disclosure"],
    brief:
      "A reusable navigation lives in a named CSS container. Above 480px show links directly. At 300px show a Menu disclosure with collapsed links. Preserve the same destinations in both presentations.",
    requirements: [
      "At 800px links are visible and Menu is hidden.",
      "At 300px Menu starts collapsed; toggling shows and hides links with matching aria-expanded.",
      "Menu controls the links element; navigation is labelled Primary. Do not duplicate destinations.",
    ],
    starter: `export default function App(){return <div data-shell><nav aria-label="Primary"><button>Menu</button><div id="nav-links"><a href="#overview">Overview</a><a href="#billing">Billing</a></div></nav></div>;}`,
    solution: `import {useState} from 'react';export default function App(){const [open,setOpen]=useState(false);return <div data-shell style={{containerType:'inline-size',containerName:'navigation'}}><style>{'[data-nav-toggle]{display:none}[data-links]{display:flex;gap:16px}@container navigation (max-width:480px){[data-nav-toggle]{display:block}[data-links]{display:none}[data-links][data-open="true"]{display:flex;flex-direction:column}}'}</style><nav aria-label="Primary"><button data-nav-toggle aria-controls="nav-links" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>Menu</button><div id="nav-links" data-links data-open={open}><a href="#overview">Overview</a><a href="#billing">Billing</a></div></nav></div>;}`,
    checks: [
      {
        name: "Wide navigation exposes links directly",
        script: `find('[data-shell]').style.width='800px';await wait();equal(find('nav').getAttribute('aria-label'),'Primary');equal(find('button').getBoundingClientRect().height,0);assert(find('a').getBoundingClientRect().height>0,'Show links');equal(document.querySelectorAll('a').length,2);`,
      },
      {
        name: "Compact disclosure state matches visible links",
        script: `find('[data-shell]').style.width='300px';await wait();const toggle=find('button');assert(toggle.getBoundingClientRect().height>0,'Show menu');equal(toggle.getAttribute('aria-expanded'),'false');equal(find('a').getBoundingClientRect().height,0);equal(toggle.getAttribute('aria-controls'),find('#nav-links').id);await click('Menu');equal(toggle.getAttribute('aria-expanded'),'true');assert(find('a').getBoundingClientRect().height>0,'Show compact links');await click('Menu');equal(find('a').getBoundingClientRect().height,0);`,
      },
    ],
    hints: [
      "The containing surface can be narrower than the browser.",
      "Use a disclosure state plus a container-responsive presentation.",
      "Hide the toggle on wide layouts; reveal links in compact mode only when open.",
    ],
    explanation:
      "Navigation destinations remain one semantic structure while layout responds to available space. A disclosure is sufficient for this bounded inline menu; an overlay drawer would add focus, dismissal, and background-interaction requirements.",
    rubric: [
      "Separate disclosure state from responsive presentation.",
      "Preserve destinations and reading order.",
      "Name keyboard and resizing cases needing manual checks.",
    ],
    followUp:
      "What should happen to focus if a resize hides the currently focused Menu button, or if navigation opens in an overlay?",
    resource: "https://web.dev/learn/css/container-queries",
  },
  {
    id: "container-card",
    title: "A card belongs to its container",
    summary: "A viewport breakpoint chooses the wrong layout in a sidebar.",
    tags: ["CSS", "Container queries", "Responsive design", "Composition"],
    brief:
      "A summary card appears in both sidebars and main panels. Stack its 80px thumbnail above copy at 240px available width; place them side by side at 500px. Respond to the card's parent container.",
    requirements: [
      "At 240px thumbnail is above copy, with 12px spacing.",
      "At 500px thumbnail and copy share a row with 12px spacing.",
      "Keep both contents visible without overflow; the browser viewport stays unchanged.",
    ],
    starter: `export default function App(){return <div data-host><article data-card style={{display:'flex',gap:12}}><div data-image style={{width:80,height:80,flexShrink:0,background:'teal'}}/><p style={{margin:0}}>Workshop summary</p></article></div>;}`,
    solution: `export default function App(){return <div data-host style={{containerType:'inline-size',containerName:'summary'}}><style>{'[data-card]{display:flex;flex-direction:column;gap:12px}@container summary (min-width:400px){[data-card]{flex-direction:row}}'}</style><article data-card><div data-image style={{width:80,height:80,flexShrink:0,background:'teal'}}/><p style={{margin:0}}>Workshop summary</p></article></div>;}`,
    checks: [
      {
        name: "Sidebar card stacks inside its own available width",
        script: `const host=find('[data-host]');host.style.width='240px';await wait();const a=find('[data-image]').getBoundingClientRect(),b=find('p').getBoundingClientRect();assert(Math.abs(b.top-a.bottom-12)<1,'Stack with 12px gap');assert(host.scrollWidth<=host.clientWidth+1,'Fit sidebar');`,
      },
      {
        name: "Wide card arranges content side by side",
        script: `find('[data-host]').style.width='500px';await wait();const a=find('[data-image]').getBoundingClientRect(),b=find('p').getBoundingClientRect();assert(Math.abs(b.top-a.top)<1,'Align row');assert(Math.abs(b.left-a.right-12)<1,'Keep row gap');equal(text('p'),'Workshop summary');`,
      },
    ],
    hints: [
      "Viewport queries cannot see a sidebar's actual available width.",
      "An ancestor establishes the query container.",
      "Change the child card's layout at a container width of 400px.",
    ],
    explanation:
      "Container-aware layout makes a component useful in contrasting surfaces. The query container and the element being restyled are distinct. The tests change parent width without changing the iframe viewport.",
    rubric: [
      "Explain viewport versus container queries.",
      "Identify the query container and styled descendant.",
      "Keep content meaningful in either arrangement.",
    ],
    followUp:
      "How would the card adapt when the thumbnail is absent or the summary expands to four translated lines?",
    resource: "https://web.dev/learn/css/container-queries",
  },
  {
    id: "rtl-layout",
    title: "Start and end are not always left and right",
    summary: "A reading-direction switch leaves the accent and spacing on the wrong side.",
    tags: ["CSS", "Logical properties", "Internationalization", "RTL"],
    brief:
      "A notice uses 24px padding and a 4px accent at inline start, and 8px padding at inline end. Toggle between LTR and RTL without duplicating markup or changing text content.",
    requirements: [
      "LTR uses left padding 24px, right padding 8px, and left border 4px.",
      "RTL reverses those physical sides and sets dir=rtl.",
      "Switching back restores LTR; preserve Notice text.",
    ],
    starter: `import {useState} from 'react';export default function App(){const [rtl,setRtl]=useState(false);return <section><button onClick={()=>setRtl(v=>!v)}>Toggle direction</button><p data-notice dir={rtl?'rtl':'ltr'} style={{paddingLeft:24,paddingRight:8,borderLeft:'4px solid teal'}}>Notice</p></section>;}`,
    solution: `import {useState} from 'react';export default function App(){const [rtl,setRtl]=useState(false);return <section><button onClick={()=>setRtl(v=>!v)}>Toggle direction</button><p data-notice dir={rtl?'rtl':'ltr'} style={{paddingInlineStart:24,paddingInlineEnd:8,borderInlineStart:'4px solid teal'}}>Notice</p></section>;}`,
    checks: [
      {
        name: "LTR follows the supplied start/end spacing",
        script: `const style=getComputedStyle(find('[data-notice]'));equal(style.paddingLeft,'24px');equal(style.paddingRight,'8px');equal(style.borderLeftWidth,'4px');`,
      },
      {
        name: "RTL mirrors logical spacing and accent",
        script: `await click('Toggle direction');const node=find('[data-notice]'),style=getComputedStyle(node);equal(node.dir,'rtl');equal(style.paddingRight,'24px');equal(style.paddingLeft,'8px');equal(style.borderRightWidth,'4px');equal(style.borderLeftWidth,'0px');equal(node.textContent,'Notice');await click('Toggle direction');equal(node.dir,'ltr');`,
      },
    ],
    hints: [
      "The visual start of a line depends on direction.",
      "Physical left/right properties remain fixed.",
      "Use padding-inline-start/end and border-inline-start.",
    ],
    explanation:
      "Logical properties express layout intent in terms of writing direction. Mirroring this notice establishes a narrow layout contract; complete localization also includes translated content, mixed-direction text, icons, numbers, and user testing.",
    rubric: [
      "Explain physical versus logical sides.",
      "Keep direction separate from translation.",
      "Identify elements that should not mirror automatically.",
    ],
    followUp:
      "How would a mixed Arabic/English filename and a directional back arrow affect your localization review?",
    resource: "https://web.dev/learn/css/logical-properties",
  },
  {
    id: "theme-tokens",
    title: "Every surface must consume the theme",
    summary: "One card changes theme while another keeps hard-coded colors.",
    tags: ["CSS", "Design tokens", "Themes", "Visual states"],
    brief:
      "Two cards consume local semantic surface and text tokens. Light mode is white with #111111 text; Dark mode is #111111 with white text. Apply each mode coherently without remounting the cards.",
    requirements: [
      "Both cards use the specified light colors initially.",
      "Toggle theme applies the specified dark colors to both cards; toggling again restores light.",
      "Retain card content and DOM identity. These checks do not establish complete contrast or accessibility compliance.",
    ],
    starter: `import {useState} from 'react';export default function App(){const [dark,setDark]=useState(false);return <section style={{'--surface':dark?'#111111':'#ffffff','--ink':dark?'#ffffff':'#111111'} as React.CSSProperties}><button onClick={()=>setDark(v=>!v)}>Toggle theme</button><article style={{background:'var(--surface)',color:'var(--ink)'}}>Orders</article><article style={{background:'#ffffff',color:'#111111'}}>Returns</article></section>;}`,
    solution: `import {useState} from 'react';export default function App(){const [dark,setDark]=useState(false);return <section style={{'--surface':dark?'#111111':'#ffffff','--ink':dark?'#ffffff':'#111111'} as React.CSSProperties}><button onClick={()=>setDark(v=>!v)}>Toggle theme</button>{['Orders','Returns'].map(name=><article key={name} style={{background:'var(--surface)',color:'var(--ink)'}}>{name}</article>)}</section>;}`,
    checks: [
      {
        name: "Every card consumes light mode",
        script: `for(const card of document.querySelectorAll('article')){equal(getComputedStyle(card).backgroundColor,'rgb(255, 255, 255)');equal(getComputedStyle(card).color,'rgb(17, 17, 17)');}`,
      },
      {
        name: "Dark and restored light modes preserve both cards",
        script: `const cards=Array.from(document.querySelectorAll('article'));await click('Toggle theme');for(const card of cards){assert(card.isConnected,'Do not remount theme consumers');equal(getComputedStyle(card).backgroundColor,'rgb(17, 17, 17)');equal(getComputedStyle(card).color,'rgb(255, 255, 255)');}await click('Toggle theme');equal(getComputedStyle(cards[1]).backgroundColor,'rgb(255, 255, 255)');equal(cards[1].textContent,'Returns');`,
      },
    ],
    hints: [
      "One hard-coded consumer breaks a shared theme.",
      "Both foreground and background need semantic values.",
      "Connect both articles to the same inherited CSS custom properties.",
    ],
    explanation:
      "Semantic tokens connect visual intent to all consumers. Theme switching changes values rather than content identity. Complete theme validation also covers controls, focus, selected states, forced colors, contrast, and system preference.",
    rubric: [
      "Separate semantic tokens from raw palette values.",
      "Preserve consumer identity through theme changes.",
      "Name theme states beyond the default surface.",
    ],
    followUp:
      "How would you combine a saved preference with system color scheme and forced-colors support without a first-paint flash?",
    resource: "https://web.dev/learn/css/custom-properties",
  },
  {
    id: "bulk-selection",
    title: "Select the view without losing hidden choices",
    summary: "Select all cannot explain partial selection or filtered records.",
    tags: ["Forms", "Selection", "Indeterminate", "Derived state"],
    brief:
      "Tea, Coffee, and Cocoa have independent selection. The Select visible checkbox affects only current query matches. Its checked and indeterminate properties derive from visible selections; hidden selections survive filtering.",
    requirements: [
      "Select visible selects all matching records; activating again clears only those records.",
      "Selecting some visible records makes the header indeterminate.",
      "Query is case-insensitive. Hidden selections survive; output Selected reports the total selected count.",
    ],
    starter: `import {useState} from 'react';const names=['Tea','Coffee','Cocoa'];export default function App(){const [q,setQ]=useState('');return <section><input aria-label="Query" value={q} onChange={e=>setQ(e.target.value)}/><label><input type="checkbox" aria-label="Select visible"/>Select visible</label>{names.filter(n=>n.toLowerCase().includes(q.toLowerCase())).map(n=><label key={n}><input type="checkbox" aria-label={n}/>{n}</label>)}<output aria-label="Selected">0</output></section>;}`,
    solution: `import {useEffect,useRef,useState} from 'react';const names=['Tea','Coffee','Cocoa'];export default function App(){const [q,setQ]=useState(''),[selected,setSelected]=useState<string[]>([]),header=useRef<HTMLInputElement>(null);const visible=names.filter(n=>n.toLowerCase().includes(q.toLowerCase())),count=visible.filter(n=>selected.includes(n)).length,all=visible.length>0&&count===visible.length;useEffect(()=>{if(header.current)header.current.indeterminate=count>0&&!all;},[count,all]);return <section><input aria-label="Query" value={q} onChange={e=>setQ(e.target.value)}/><label><input ref={header} type="checkbox" aria-label="Select visible" checked={all} disabled={!visible.length} onChange={()=>setSelected(current=>all?current.filter(n=>!visible.includes(n)):Array.from(new Set([...current,...visible])))}/>Select visible</label>{visible.map(n=><label key={n}><input type="checkbox" aria-label={n} checked={selected.includes(n)} onChange={()=>setSelected(current=>current.includes(n)?current.filter(x=>x!==n):[...current,n])}/>{n}</label>)}<output aria-label="Selected">{selected.length}</output></section>;}`,
    checks: [
      {
        name: "Partial and full visible selection agree",
        script: `find('[aria-label="Tea"]').click();await wait();assert(find('[aria-label="Select visible"]').indeterminate,'Explain partial selection');find('[aria-label="Select visible"]').click();await wait();equal(text('output'),'3');equal(find('[aria-label="Select visible"]').checked,true);equal(find('[aria-label="Select visible"]').indeterminate,false);`,
      },
      {
        name: "Filtering and clearing visible preserve hidden selection",
        script: `find('[aria-label="Tea"]').click();await input('[aria-label="Query"]','CO');find('[aria-label="Select visible"]').click();await wait();equal(text('output'),'3');find('[aria-label="Select visible"]').click();await wait();equal(text('output'),'1');await input('[aria-label="Query"]','');equal(find('[aria-label="Tea"]').checked,true);await input('[aria-label="Query"]','missing');equal(find('[aria-label="Select visible"]').disabled,true);`,
      },
    ],
    hints: [
      "Selection belongs to record identity, not the filtered view.",
      "Derive the header's state from visible records only.",
      "Set the DOM indeterminate property through a ref; union or subtract visible identities.",
    ],
    explanation:
      "Bulk selection requires an explicit scope. This contract acts on visible local records while retaining hidden choices. A server-paginated 'select all matching' operation needs a different representation and confirmation policy.",
    rubric: [
      "Define visible versus total selection.",
      "Explain checked and indeterminate separately.",
      "Preserve identity as filtering changes.",
    ],
    followUp:
      "What would Select all mean across 100,000 remote results with exclusions and records the user cannot access?",
    resource: "https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/",
  },
  {
    id: "dependent-selects",
    title: "A city belongs to its country",
    summary: "Changing country submits a city that no longer exists in the options.",
    tags: ["Forms", "Dependent fields", "State modeling", "Invariants"],
    brief:
      "A shipping form starts France/Paris. France offers Paris and Lyon; Japan offers Tokyo and Osaka. On country change reset City to the first valid option in the same event, keeping the summary coherent.",
    requirements: [
      "Initial summary is France / Paris.",
      "Changing to Japan selects Tokyo; choosing Osaka updates the summary.",
      "Changing back selects Paris rather than retaining an invalid Japanese city.",
    ],
    starter: `import {useState} from 'react';const cities:Record<string,string[]>={France:['Paris','Lyon'],Japan:['Tokyo','Osaka']};export default function App(){const [country,setCountry]=useState('France'),[city,setCity]=useState('Paris');return <section><label>Country<select aria-label="Country" value={country} onChange={e=>setCountry(e.target.value)}>{Object.keys(cities).map(n=><option key={n}>{n}</option>)}</select></label><label>City<select aria-label="City" value={city} onChange={e=>setCity(e.target.value)}>{cities[country].map(n=><option key={n}>{n}</option>)}</select></label><output>{country} / {city}</output></section>;}`,
    solution: `import {useState} from 'react';const cities:Record<string,string[]>={France:['Paris','Lyon'],Japan:['Tokyo','Osaka']};export default function App(){const [country,setCountry]=useState('France'),[city,setCity]=useState('Paris');return <section><label>Country<select aria-label="Country" value={country} onChange={e=>{setCountry(e.target.value);setCity(cities[e.target.value][0]);}}>{Object.keys(cities).map(n=><option key={n}>{n}</option>)}</select></label><label>City<select aria-label="City" value={city} onChange={e=>setCity(e.target.value)}>{cities[country].map(n=><option key={n}>{n}</option>)}</select></label><output>{country} / {city}</output></section>;}`,
    checks: [
      {
        name: "Parent change resets the dependent value",
        script: `equal(text('output'),'France / Paris');const country=find('[aria-label="Country"]');country.value='Japan';country.dispatchEvent(new Event('change',{bubbles:true}));await wait();equal(find('[aria-label="City"]').value,'Tokyo');equal(text('output'),'Japan / Tokyo');`,
      },
      {
        name: "Child edits and reverse changes remain valid",
        script: `const country=find('[aria-label="Country"]'),city=find('[aria-label="City"]');country.value='Japan';country.dispatchEvent(new Event('change',{bubbles:true}));await wait();city.value='Osaka';city.dispatchEvent(new Event('change',{bubbles:true}));await wait();equal(text('output'),'Japan / Osaka');country.value='France';country.dispatchEvent(new Event('change',{bubbles:true}));await wait();equal(text('output'),'France / Paris');`,
      },
    ],
    hints: [
      "Country and city have a relationship, not arbitrary independent values.",
      "Changing the parent invalidates the old child choice.",
      "Update both values together in the country change handler.",
    ],
    explanation:
      "Related values need a defined transition policy. Resetting the child in the event that changes the parent avoids an intermediate invalid combination. Asynchronous options would add pending, failure, and stale-result ownership.",
    rubric: [
      "State the country/city invariant.",
      "Explain the reset policy.",
      "Separate local options from asynchronous lookup concerns.",
    ],
    followUp:
      "How would you preserve a still-valid city when options refresh and explain a removed choice without silently changing a submitted address?",
    resource: "https://react.dev/learn/choosing-the-state-structure",
  },
  {
    id: "dialog-focus",
    title: "A dialog returns you to your task",
    summary: "A settings overlay opens without focus or a reliable way back.",
    tags: ["HTML", "Dialog", "Focus management", "Accessibility"],
    brief:
      "Replace the ad-hoc settings region with a native modal dialog named Settings. Open it with Edit settings, focus Display name, and support Cancel and Escape with focus returning to the trigger. Keep the entered draft when reopening.",
    requirements: [
      "Edit settings opens a labelled native modal dialog and focuses Display name.",
      "Cancel closes it and returns focus; reopening preserves typed content.",
      "Escape follows native dialog cancellation and returns focus to Edit settings.",
    ],
    starter: `import {useState} from 'react';export default function App(){const [open,setOpen]=useState(false);return <section><button onClick={()=>setOpen(true)}>Edit settings</button>{open&&<div role="dialog"><h2>Settings</h2><input aria-label="Display name"/><button onClick={()=>setOpen(false)}>Cancel</button></div>}</section>;}`,
    solution: `import {useRef} from 'react';export default function App(){const dialog=useRef<HTMLDialogElement>(null),field=useRef<HTMLInputElement>(null),trigger=useRef<HTMLButtonElement>(null);return <section><button ref={trigger} onClick={()=>{dialog.current?.showModal();field.current?.focus();}}>Edit settings</button><dialog ref={dialog} aria-labelledby="settings-title" onClose={()=>trigger.current?.focus()}><h2 id="settings-title">Settings</h2><label>Display name<input ref={field} aria-label="Display name"/></label><button onClick={()=>dialog.current?.close()}>Cancel</button></dialog></section>;}`,
    checks: [
      {
        name: "Opening creates a named modal and focuses the field",
        script: `await click('Edit settings');const dialog=find('dialog');assert(dialog.open && dialog.matches(':modal'),'Use native modal behavior');equal(text('#'+dialog.getAttribute('aria-labelledby')),'Settings');equal(document.activeElement,find('input'));`,
      },
      {
        name: "Cancel restores focus and preserves the draft",
        script: `find('button').focus();await click('Edit settings');await input('input','Ada');await click('Cancel');equal(find('dialog').open,false);equal(document.activeElement,find('button'));await click('Edit settings');equal(value('input'),'Ada');`,
      },
    ],
    hints: [
      "A role alone does not implement modal focus behavior.",
      "Native dialog offers showModal, close, and cancel behavior.",
      "Keep the dialog mounted for its draft; restore focus from onClose.",
    ],
    explanation:
      "Native dialog supplies top-layer modality and browser cancellation. The authored checks establish opening, focus, and Cancel; the browser suite also presses real Escape. Manual screen-reader and cross-browser checks remain necessary before a production abstraction.",
    rubric: [
      "Explain modal versus nonmodal behavior.",
      "Define initial focus and focus return.",
      "Preserve draft state across dismissal.",
    ],
    followUp:
      "Where should focus return if the opening row is removed while the dialog is active, and when should dismissal discard changes?",
    resource: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
  },
  {
    id: "tab-contract",
    title: "Tabs connect focus to the right panel",
    summary: "Tab styling changes while semantics and arrow navigation disagree.",
    tags: ["ARIA", "Tabs", "Keyboard", "Focus management"],
    brief:
      "Build two automatically activated tabs, Overview and Activity. ArrowLeft/Right wrap, Home/End select the ends, and only the active tab is tabbable. Expose one matching named panel.",
    requirements: [
      "Overview starts selected; tabs use tablist, tab, aria-selected, and aria-controls.",
      "Arrow keys and Home/End move actual focus and activate the matching tab.",
      "Each tab controls a tabpanel labelled by that tab; inactive panels are hidden.",
    ],
    starter: `import {useState} from 'react';export default function App(){const [active,setActive]=useState(0);return <section><div>{['Overview','Activity'].map((name,index)=><button key={name} onClick={()=>setActive(index)}>{name}</button>)}</div><p>{active===0?'Project summary':'Recent changes'}</p></section>;}`,
    solution: `import {useRef,useState} from 'react';const names=['Overview','Activity'];export default function App(){const [active,setActive]=useState(0),refs=useRef<Array<HTMLButtonElement|null>>([]);function select(index:number){setActive(index);refs.current[index]?.focus();}return <section><div role="tablist" aria-label="Project">{names.map((name,index)=><button key={name} id={'tab-'+index} ref={node=>{refs.current[index]=node;}} role="tab" aria-selected={active===index} aria-controls={'panel-'+index} tabIndex={active===index?0:-1} onClick={()=>select(index)} onKeyDown={e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();select(e.key==='Home'?0:e.key==='End'?1:(index+1)%2);}}}>{name}</button>)}</div>{['Project summary','Recent changes'].map((copy,index)=><div key={copy} role="tabpanel" id={'panel-'+index} aria-labelledby={'tab-'+index} hidden={active!==index}>{copy}</div>)}</section>;}`,
    checks: [
      {
        name: "Tabs identify one active panel and tab stop",
        script: `const tabs=document.querySelectorAll('[role="tab"]');equal(tabs.length,2);equal(tabs[0].getAttribute('aria-selected'),'true');equal(document.querySelectorAll('[role="tab"][tabindex="0"]').length,1);const panel=find('#'+tabs[0].getAttribute('aria-controls'));equal(panel.getAttribute('role'),'tabpanel');equal(panel.getAttribute('aria-labelledby'),tabs[0].id);equal(panel.hidden,false);`,
      },
      {
        name: "Arrow and boundary navigation activate matching panels",
        script: `const tabs=document.querySelectorAll('[role="tab"]');tabs[0].focus();tabs[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));await wait();equal(document.activeElement,tabs[1]);equal(tabs[1].getAttribute('aria-selected'),'true');equal(find('#'+tabs[0].getAttribute('aria-controls')).hidden,true);tabs[1].dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true}));await wait();equal(document.activeElement,tabs[0]);tabs[0].dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true}));await wait();equal(document.activeElement,tabs[1]);tabs[1].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));await wait();equal(document.activeElement,tabs[0]);`,
      },
    ],
    hints: [
      "Tabs are a composite control with one external tab stop.",
      "Connect each tab and panel through stable ids.",
      "Use refs for actual focus and one active index for semantics and visibility.",
    ],
    explanation:
      "Automatic activation is appropriate when switching panels is immediate. The same active index drives selection, focus entry, and visible panel. Slow remote content can justify a manual activation model with separate focus and selection.",
    rubric: [
      "Explain automatic versus manual activation.",
      "Connect control and panel relationships.",
      "Maintain one tab stop while moving actual focus.",
    ],
    followUp:
      "What changes when tabs can close, content loads remotely, or multiple tab groups appear on one page?",
    resource: "https://www.w3.org/WAI/ARIA/apg/patterns/tabs/",
  },
  {
    id: "payload-validation",
    title: "A type assertion cannot validate a response",
    summary: "Malformed records leak into a typed UI.",
    tags: ["TypeScript", "Unknown", "Validation", "API contracts"],
    brief:
      "A local payload fixture supplies unknown data for a profile. Accept only nonnull objects with a nonempty string name and a finite nonnegative numeric score. Reject numeric strings, Infinity, and null with Invalid profile. These are local fixtures, not HTTP tests.",
    requirements: [
      "Load valid displays Ada / 3.",
      "Wrong type, null, infinite score, blank name, and negative score display Invalid profile in an alert.",
      "A later valid payload clears the error and recovers without crashing.",
    ],
    starter: `import {useState} from 'react';type Profile={name:string;score:number};export default function App(){const [data,setData]=useState<Profile|null>(null);function load(value:unknown){setData(value as Profile);}return <section><button onClick={()=>load({name:'Ada',score:3})}>Load valid</button><button onClick={()=>load({name:'Ada',score:'3'})}>Load wrong type</button><button onClick={()=>load(null)}>Load null</button><button onClick={()=>load({name:' ',score:3})}>Load blank</button><button onClick={()=>load({name:'Ada',score:-1})}>Load negative</button><button onClick={()=>load({name:'Ada',score:Infinity})}>Load infinite</button><output>{data?data.name+' / '+data.score:'No profile'}</output></section>;}`,
    solution: `import {useState} from 'react';type Profile={name:string;score:number};function isProfile(value:unknown):value is Profile{if(!value||typeof value!=='object')return false;const data=value as Record<string,unknown>;return typeof data.name==='string'&&data.name.trim().length>0&&typeof data.score==='number'&&Number.isFinite(data.score)&&data.score>=0;}export default function App(){const [data,setData]=useState<Profile|null>(null),[error,setError]=useState('');function load(value:unknown){if(!isProfile(value)){setData(null);setError('Invalid profile');return;}setData(value);setError('');}return <section><button onClick={()=>load({name:'Ada',score:3})}>Load valid</button><button onClick={()=>load({name:'Ada',score:'3'})}>Load wrong type</button><button onClick={()=>load(null)}>Load null</button><button onClick={()=>load({name:' ',score:3})}>Load blank</button><button onClick={()=>load({name:'Ada',score:-1})}>Load negative</button><button onClick={()=>load({name:'Ada',score:Infinity})}>Load infinite</button><output>{data?data.name+' / '+data.score:'No profile'}</output>{error&&<p role="alert">{error}</p>}</section>;}`,
    checks: [
      {
        name: "Valid data renders without a validation error",
        script: `await click('Load valid');equal(text('output'),'Ada / 3');assert(!document.querySelector('[role="alert"]'),'No error for valid data');`,
      },
      {
        name: "Malformed payloads reject and valid data recovers",
        script: `for(const name of ['Load wrong type','Load null','Load infinite','Load blank','Load negative']){await click(name);equal(text('[role="alert"]'),'Invalid profile');equal(text('output'),'No profile');}await click('Load valid');equal(text('output'),'Ada / 3');assert(!document.querySelector('[role="alert"]'),'Clear obsolete error');`,
      },
    ],
    hints: [
      "Type assertions are erased at runtime.",
      "Validate unknown data before treating it as a Profile.",
      "Check null, object shape, field types, nonempty name, and finite nonnegative score.",
    ],
    explanation:
      "A runtime boundary needs runtime validation. TypeScript can narrow validated data but cannot make an assertion true. This small schema is explicit; production clients may use shared schemas while still distinguishing transport and domain errors.",
    rubric: [
      "Distinguish assertion from validation.",
      "Explain narrowing from unknown.",
      "Preserve a recovery path after malformed data.",
    ],
    followUp:
      "How would you version this contract, preserve useful error context, and distinguish a malformed success payload from a transport failure?",
    resource: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof",
  },
  {
    id: "hook-isolation",
    title: "Shared hook logic is not shared state",
    summary: "Editing one card changes every card's draft.",
    tags: ["React", "Custom hooks", "State ownership", "Isolation"],
    brief:
      "Two note cards use the same useDraft hook. Each caller needs its own state and Reset action. Correct the accidental shared state without duplicating the hook implementation.",
    requirements: [
      "Ada and Grace start with independent empty drafts.",
      "Typing either draft updates only that card.",
      "Reset Ada clears only Ada; Reset Grace clears only Grace.",
    ],
    starter: `import {useState} from 'react';function useDraft(){const [draft,setDraft]=useState('');return {draft,setDraft,reset:()=>setDraft('')};}export default function App(){const shared=useDraft();return <section>{['Ada','Grace'].map(name=><label key={name}>{name}<input aria-label={name} value={shared.draft} onChange={e=>shared.setDraft(e.target.value)}/><button onClick={shared.reset}>Reset {name}</button></label>)}</section>;}`,
    solution: `import {useState} from 'react';function useDraft(){const [draft,setDraft]=useState('');return {draft,setDraft,reset:()=>setDraft('')};}function Note({name}:{name:string}){const {draft,setDraft,reset}=useDraft();return <label>{name}<input aria-label={name} value={draft} onChange={e=>setDraft(e.target.value)}/><button onClick={reset}>Reset {name}</button></label>;}export default function App(){return <section><Note name="Ada"/><Note name="Grace"/></section>;}`,
    checks: [
      {
        name: "Hook callers own independent drafts",
        script: `await input('[aria-label="Ada"]','A');equal(value('[aria-label="Grace"]'),'');await input('[aria-label="Grace"]','G');equal(value('[aria-label="Ada"]'),'A');`,
      },
      {
        name: "Reset affects only its owning card",
        script: `await input('[aria-label="Ada"]','A');await input('[aria-label="Grace"]','G');await click('Reset Ada');equal(value('[aria-label="Ada"]'),'');equal(value('[aria-label="Grace"]'),'G');await click('Reset Grace');equal(value('[aria-label="Grace"]'),'');`,
      },
    ],
    hints: [
      "Calling the hook once creates one state owner.",
      "Each independent card needs its own hook invocation.",
      "Extract a Note component that calls useDraft at its top level.",
    ],
    explanation:
      "Custom hooks share logic while each invocation owns its own React state. Calling one hook above a mapped list deliberately shares its returned state. Independent callers belong inside independent component instances, with hooks at their top level.",
    rubric: [
      "Locate the state owner.",
      "Distinguish shared logic from shared state.",
      "Respect hook call ordering during extraction.",
    ],
    followUp:
      "When would shared drafts actually be appropriate, and how would you make that ownership visible to consumers?",
    resource: "https://react.dev/learn/reusing-logic-with-custom-hooks",
  },
];

export const frontendPractice: Challenge[] = exercises.map((exercise) => ({
  ...exercise,
  track: "architecture",
  level: "Medium",
  minutes: 30,
}));
