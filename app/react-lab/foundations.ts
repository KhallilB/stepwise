import type { Challenge } from "./types";

type Foundation = Omit<Challenge, "track" | "level" | "minutes">;

const exercises: Foundation[] = [
  {
    id: "semantic-action",
    title: "An action deserves a button",
    summary: "A clickable word leaves keyboard users behind.",
    tags: ["HTML", "Semantics", "Buttons", "Keyboard"],
    brief:
      "A notification action is a clickable div. Replace it with the native element for an action, preserving its label and state update. Browser keyboard activation should come from HTML.",
    requirements: [
      "Notify me is a native button with type=button.",
      "Activating it changes the status from Not subscribed to Subscribed.",
      "Keep the action reachable in the normal tab order without custom key handlers.",
    ],
    starter: `import {useState} from 'react';
export default function App(){const [subscribed,setSubscribed]=useState(false);return <section><div onClick={()=>setSubscribed(true)}>Notify me</div><p role="status">{subscribed?'Subscribed':'Not subscribed'}</p></section>;}`,
    solution: `import {useState} from 'react';
export default function App(){const [subscribed,setSubscribed]=useState(false);return <section><button type="button" onClick={()=>setSubscribed(true)}>Notify me</button><p role="status">{subscribed?'Subscribed':'Not subscribed'}</p></section>;}`,
    checks: [
      {
        name: "Action has native button semantics",
        script: `const button=find('button'); equal(button.textContent,'Notify me'); equal(button.type,'button'); equal(button.tabIndex,0);`,
      },
      {
        name: "Activation updates visible feedback",
        script: `equal(text('[role="status"]'),'Not subscribed'); await click('Notify me'); equal(text('[role="status"]'),'Subscribed');`,
      },
    ],
    hints: [
      "An action changes something on the current page.",
      "Native buttons already participate in keyboard navigation.",
      "Replace the div with button type=button and retain the click handler.",
    ],
    explanation:
      "Native buttons supply focusability, action semantics, and Enter/Space activation. A div with onClick supplies none of that automatically. These checks establish the native element and click behavior; try actual Tab, Enter, and Space in the preview too.",
    rubric: [
      "Explain why this is an action rather than navigation.",
      "Name the keyboard behavior supplied by HTML.",
      "Explain why explicit button types matter inside forms.",
    ],
    followUp:
      "When would this control become a link, and which browser behaviors would users expect from that change?",
    resource: "https://www.w3.org/WAI/ARIA/apg/patterns/button/",
  },
  {
    id: "field-labels",
    title: "A placeholder is not a label",
    summary: "A delivery field loses its instruction as soon as typing starts.",
    tags: ["HTML", "Forms", "Labels", "Accessibility"],
    brief:
      "Give the delivery-name field a visible label that remains available after typing. Use a native association instead of relying on placeholder text.",
    requirements: [
      "A visible label reads Delivery name and is associated with the input.",
      "Entering Ada preserves both the label and value.",
      "Use a stable association; a placeholder alone is insufficient.",
    ],
    starter: `export default function App(){return <input id="delivery" placeholder="Delivery name"/>;}`,
    solution: `export default function App(){return <label htmlFor="delivery">Delivery name<input id="delivery" placeholder="For example, Ada"/></label>;}`,
    checks: [
      {
        name: "Visible label belongs to the field",
        script: `const field=find('input'); assert(field.labels.length===1,'Associate a native label'); assert(field.labels[0].textContent.includes('Delivery name'),'Keep visible instruction');`,
      },
      {
        name: "Instruction survives typing",
        script: `await input('input','Ada'); equal(value('input'),'Ada'); assert(find('input').labels[0].getBoundingClientRect().height>0,'Keep label visible');`,
      },
    ],
    hints: [
      "Placeholders disappear when a value is entered.",
      "Use label with htmlFor/id or wrap the input.",
      "Keep Delivery name as visible text outside the input.",
    ],
    explanation:
      "A native label provides a persistent instruction and an accessible name. Association also makes the label a larger activation target. Automated association and geometry checks supplement a manual keyboard and assistive-technology check.",
    rubric: [
      "Distinguish label from example placeholder.",
      "Explain explicit and wrapping associations.",
      "Describe how multiple instances avoid duplicate ids.",
    ],
    followUp:
      "How would you add help text and validation errors without replacing the field's accessible name?",
    resource: "https://www.w3.org/WAI/tutorials/forms/labels/",
  },
  {
    id: "image-alt",
    title: "Describe the image's purpose",
    summary: "A product image is silent while a decorative flourish is announced.",
    tags: ["HTML", "Images", "Alternative text", "Accessibility"],
    brief:
      "The product image identifies a blue travel mug; a nearby divider adds no information. Correct their alternatives according to purpose. Inline image data keeps this exercise offline.",
    requirements: [
      "The product image alternative is Blue travel mug.",
      "The decorative image has an explicitly empty alternative.",
      "Keep both images rendered; do not hide the informative image.",
    ],
    starter: `const pixel='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20"%3E%3Crect width="20" height="20" fill="blue"/%3E%3C/svg%3E';
export default function App(){return <section><img data-product src={pixel} alt=""/><img data-decoration src={pixel} alt="Decorative divider"/></section>;}`,
    solution: `const pixel='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20"%3E%3Crect width="20" height="20" fill="blue"/%3E%3C/svg%3E';
export default function App(){return <section><img data-product src={pixel} alt="Blue travel mug"/><img data-decoration src={pixel} alt=""/></section>;}`,
    checks: [
      {
        name: "Product keeps meaningful alternative text",
        script: `equal(find('[data-product]').getAttribute('alt'),'Blue travel mug'); assert(find('[data-product]').getBoundingClientRect().width>0,'Keep product rendered');`,
      },
      {
        name: "Decoration stays silent",
        script: `equal(find('[data-decoration]').getAttribute('alt'),''); equal(document.querySelectorAll('img').length,2);`,
      },
    ],
    hints: [
      "Ask what information would be lost if the image disappeared.",
      "An empty alt differs from a missing alt.",
      'Describe the product; give the decorative image alt="".',
    ],
    explanation:
      "Alternative text depends on an image's purpose in context. This fixture supplies an exact short description so the checks have a clear contract; real content needs editorial judgment rather than a universal string-matching rule.",
    rubric: [
      "Explain informative versus decorative purpose.",
      "Distinguish empty from missing alternative text.",
      "Describe when a caption already supplies the information.",
    ],
    followUp:
      "How would the alternative change if the same image were the only content inside an Add to cart button?",
    resource: "https://www.w3.org/WAI/tutorials/images/decision-tree/",
  },
  {
    id: "preference-checkbox",
    title: "A checkbox owns a boolean",
    summary: "Email preferences never reflect the user's choice.",
    tags: ["HTML", "Checkbox", "Controlled input", "State"],
    brief:
      "Connect the Email updates checkbox to its summary. Use checked rather than treating a checkbox's value string as its selected state.",
    requirements: [
      "Email updates starts unchecked and summary reads Off.",
      "Checking reads On; unchecking returns Off.",
      "Keep a visible native label and one source of truth.",
    ],
    starter: `import {useState} from 'react';
export default function App(){const [enabled]=useState(false);return <section><label><input type="checkbox" aria-label="Email updates"/>Email updates</label><output>{enabled?'On':'Off'}</output></section>;}`,
    solution: `import {useState} from 'react';
export default function App(){const [enabled,setEnabled]=useState(false);return <section><label><input type="checkbox" aria-label="Email updates" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/>Email updates</label><output>{enabled?'On':'Off'}</output></section>;}`,
    checks: [
      {
        name: "Initial preference is off",
        script: `equal(find('input').checked,false); equal(text('output'),'Off'); assert(find('input').labels.length===1,'Keep visible label');`,
      },
      {
        name: "Both transitions update the summary",
        script: `find('input').click(); await wait(); equal(text('output'),'On'); find('input').click(); await wait(); equal(text('output'),'Off');`,
      },
    ],
    hints: [
      "A checkbox exposes checked as a boolean.",
      "Store the choice and derive the summary.",
      "Bind checked to enabled and read e.target.checked in onChange.",
    ],
    explanation:
      "A controlled checkbox connects its checked property to one boolean state value. The summary derives from that value, avoiding two independent versions of the same preference.",
    rubric: [
      "Distinguish checked from value.",
      "Explain controlled input ownership.",
      "Keep the summary derived from the preference.",
    ],
    followUp: "How would you preserve unsaved preferences if a server rejects the Save action?",
    resource: "https://react.dev/reference/react-dom/components/input",
  },
  {
    id: "first-counter",
    title: "Keep a counter inside its bounds",
    summary: "A ticket picker accepts negative quantities.",
    tags: ["State", "Boundaries", "Events"],
    brief:
      "A quantity picker starts at zero and permits up to five tickets. Repair both ends and retain Reset. Enforce the bounds in state updates as well as the controls.",
    requirements: [
      "Quantity always stays between zero and five.",
      "Remove is disabled at zero; Add is disabled at five.",
      "Reset returns zero after any sequence.",
    ],
    starter: `import {useState} from 'react';
export default function App(){const [n,setN]=useState(0);return <section><output>{n}</output><button onClick={()=>setN(n-1)}>Remove</button><button onClick={()=>setN(n+1)}>Add</button><button onClick={()=>setN(0)}>Reset</button></section>;}`,
    solution: `import {useState} from 'react';
export default function App(){const [n,setN]=useState(0);return <section><output>{n}</output><button disabled={n===0} onClick={()=>setN(v=>Math.max(0,v-1))}>Remove</button><button disabled={n===5} onClick={()=>setN(v=>Math.min(5,v+1))}>Add</button><button onClick={()=>setN(0)}>Reset</button></section>;}`,
    checks: [
      {
        name: "Lower boundary cannot underflow",
        script: `await click('Remove'); equal(text('output'),'0'); assert(find('button').disabled,'Disable remove at zero');`,
      },
      {
        name: "Upper boundary and reset hold",
        script: `for(let i=0;i<7;i++) await click('Add'); equal(text('output'),'5'); assert(Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Add').disabled,'Disable add at five'); await click('Reset'); equal(text('output'),'0');`,
      },
    ],
    hints: [
      "Write down the smallest and largest valid values.",
      "Derive disabled state from the same quantity.",
      "Clamp functional updates and preserve the reset handler.",
    ],
    explanation:
      "Even a small control has an invariant. State transitions enforce the range while disabled controls communicate the boundary. Later reducer exercises move the same kind of rule into a shared transition function.",
    rubric: [
      "State the range invariant.",
      "Explain disabled feedback versus transition enforcement.",
      "Describe first, last, and reset cases.",
    ],
    followUp:
      "If stock drops from five to two while three are selected, which component or server owns reconciliation?",
    resource: "https://react.dev/learn/responding-to-events",
  },
  {
    id: "character-count",
    title: "Count the text actually entered",
    summary: "A message's remaining count drifts after edits.",
    tags: ["Forms", "Derived state", "Strings", "Unicode"],
    brief:
      "A short message allows 20 Unicode code points. Derive Remaining from the current text; negative values explain excess instead of silently truncating. Code points are the exercise policy, not a claim about user-perceived graphemes.",
    requirements: [
      "Empty text reports 20; Ada reports 17.",
      "A single emoji such as 😀 consumes one code point.",
      "Over-limit input stays editable and reports a negative remainder.",
    ],
    starter: `import {useState} from 'react';
export default function App(){const [message,setMessage]=useState('');return <section><label>Message<input value={message} onChange={e=>setMessage(e.target.value)}/></label><output aria-label="Remaining">20</output></section>;}`,
    solution: `import {useState} from 'react';
export default function App(){const [message,setMessage]=useState('');return <section><label>Message<input value={message} onChange={e=>setMessage(e.target.value)}/></label><output aria-label="Remaining">{20-Array.from(message).length}</output></section>;}`,
    checks: [
      {
        name: "Count follows edits and clearing",
        script: `equal(text('output'),'20'); await input('input','Ada'); equal(text('output'),'17'); await input('input',''); equal(text('output'),'20');`,
      },
      {
        name: "Code-point policy and overflow stay explicit",
        script: `await input('input','😀'); equal(text('output'),'19'); await input('input','a'.repeat(21)); equal(text('output'),'-1'); equal(value('input').length,21);`,
      },
    ],
    hints: [
      "Remaining is derived from the current draft.",
      "JavaScript string length counts UTF-16 code units.",
      "Array.from(message).length counts code points for this contract.",
    ],
    explanation:
      "Derived feedback cannot drift when calculated from the draft. The length policy must be explicit: code units, code points, graphemes, and encoded bytes answer different questions. This exercise deliberately checks code points only.",
    rubric: [
      "Keep one source of truth.",
      "Explain the chosen length unit.",
      "Retain user input when it exceeds a limit.",
    ],
    followUp:
      "How would you count user-perceived characters containing combining marks or emoji sequences, and align that with a server byte limit?",
    resource:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String",
  },
  {
    id: "native-select",
    title: "Make the delivery choice visible",
    summary: "A dropdown changes but its order summary stays behind.",
    tags: ["HTML", "Select", "Controlled input"],
    brief:
      "Connect a native delivery select to its summary. Preserve native keyboard interaction and a visible label rather than building a custom menu.",
    requirements: [
      "Delivery starts Standard with a matching summary.",
      "Express selection updates both the control and summary; switching back restores Standard.",
      "The select has a visible native label.",
    ],
    starter: `export default function App(){return <section><label>Delivery<select defaultValue="standard"><option value="standard">Standard</option><option value="express">Express</option></select></label><output>Standard</output></section>;}`,
    solution: `import {useState} from 'react';
export default function App(){const [delivery,setDelivery]=useState('standard');return <section><label>Delivery<select value={delivery} onChange={e=>setDelivery(e.target.value)}><option value="standard">Standard</option><option value="express">Express</option></select></label><output>{delivery==='express'?'Express':'Standard'}</output></section>;}`,
    checks: [
      {
        name: "Default and visible label agree",
        script: `equal(find('select').value,'standard'); equal(text('output'),'Standard'); assert(find('select').labels[0].textContent.includes('Delivery'),'Associate visible label');`,
      },
      {
        name: "Changing either way updates the summary",
        script: `const select=find('select'); select.value='express'; select.dispatchEvent(new Event('change',{bubbles:true})); await wait(); equal(text('output'),'Express'); select.value='standard'; select.dispatchEvent(new Event('change',{bubbles:true})); await wait(); equal(text('output'),'Standard');`,
      },
    ],
    hints: [
      "The dropdown and summary describe one choice.",
      "Store the selected option value.",
      "Bind value and onChange; derive the display label from the value.",
    ],
    explanation:
      "Native selects supply a complete platform interaction for a small fixed choice. React owns the selected value when it must drive another part of the screen. Actual keyboard behavior should also be tried in the browser.",
    rubric: [
      "Explain value versus defaultValue.",
      "Keep one authoritative selection.",
      "Describe when a native select meets the product need.",
    ],
    followUp:
      "What new requirements would justify a searchable combobox, and what accessibility work would that introduce?",
    resource: "https://react.dev/reference/react-dom/components/select",
  },
  {
    id: "page-landmarks",
    title: "Give the page a readable outline",
    summary: "Visual blocks provide no useful page navigation.",
    tags: ["HTML", "Landmarks", "Headings", "Accessibility"],
    brief:
      "A workshop page uses divs for every region. Mark up the supplied content with a named navigation region, main content, one page heading, and a section heading.",
    requirements: [
      "One main contains h1 Workshops and h2 Upcoming sessions.",
      "A navigation region named Primary contains the Workshops link to #sessions.",
      "The Upcoming sessions section has id=sessions; keep heading order meaningful.",
    ],
    starter: `export default function App(){return <div><div><a href="#sessions">Workshops</a></div><div><div>Workshops</div><div id="sessions"><div>Upcoming sessions</div><p>React foundations</p></div></div></div>;}`,
    solution: `export default function App(){return <><nav aria-label="Primary"><a href="#sessions">Workshops</a></nav><main><h1>Workshops</h1><section id="sessions"><h2>Upcoming sessions</h2><p>React foundations</p></section></main></>;}`,
    checks: [
      {
        name: "Main contains a coherent heading hierarchy",
        script: `equal(document.querySelectorAll('main').length,1); equal(text('main h1'),'Workshops'); equal(text('main h2'),'Upcoming sessions');`,
      },
      {
        name: "Navigation identifies a real destination",
        script: `equal(find('nav').getAttribute('aria-label'),'Primary'); equal(find('nav a').getAttribute('href'),'#sessions'); assert(find('#sessions').contains(find('h2')),'Keep destination around its heading');`,
      },
    ],
    hints: [
      "HTML regions communicate purpose beyond appearance.",
      "Use nav for major navigation and main for primary content.",
      "Use h1 for the page and h2 for the upcoming section.",
    ],
    explanation:
      "Landmarks and headings provide two complementary navigation structures. Semantic markup expresses relationships that visual size alone cannot. A correct outline still needs sensible content and manual assistive-technology evaluation.",
    rubric: [
      "Distinguish landmarks from headings.",
      "Explain the main region's purpose.",
      "Keep navigation destinations meaningful.",
    ],
    followUp:
      "How would a second navigation region and a repeated sidebar change naming and heading decisions?",
    resource: "https://www.w3.org/WAI/tutorials/page-structure/",
  },
];

export const foundations: Challenge[] = exercises.map((exercise) => ({
  ...exercise,
  track: "web-foundations",
  level: "Very easy",
  minutes: 10,
}));
