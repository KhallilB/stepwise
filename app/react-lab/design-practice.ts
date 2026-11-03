import type { Challenge } from "./types";

type Exercise = Omit<Challenge, "track" | "level" | "minutes">;

const exercises: Exercise[] = [
  {
    id: "responsive-grid",
    title: "A grid that fits its space",
    summary: "Three rigid columns squeeze a narrow product shelf.",
    tags: ["CSS", "Grid", "Responsive design", "Layout"],
    brief:
      "A product shelf should have three equal columns at 660px and one at 220px. Keep 12px gaps and source order. Adapt to the shelf's available width rather than assuming a full browser viewport.",
    requirements: [
      "At 660px, three equal cards share one row with 12px gaps.",
      "At 220px, all three cards stack without horizontal overflow.",
      "Keep card order Tea, Coffee, Cocoa; do not hide content to make it fit.",
    ],
    starter: `export default function App(){return <div data-shelf style={{display:'grid',gridTemplateColumns:'repeat(3,220px)',gap:12}}>{['Tea','Coffee','Cocoa'].map(name=><article key={name}>{name}</article>)}</div>;}`,
    solution: `export default function App(){return <div data-shelf style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,200px),1fr))',gap:12}}>{['Tea','Coffee','Cocoa'].map(name=><article key={name}>{name}</article>)}</div>;}`,
    checks: [
      {
        name: "Wide shelf has equal columns and gaps",
        script: `const shelf=find('[data-shelf]'); shelf.style.width='660px'; await wait(); const cards=Array.from(shelf.children).map(c=>c.getBoundingClientRect()); equal(cards.length,3); assert(cards.every(c=>Math.abs(c.top-cards[0].top)<1),'One wide row'); assert(Math.abs(cards[1].left-cards[0].right-12)<1,'12px gap'); assert(Math.abs(cards[0].width-cards[2].width)<1,'Equal columns');`,
      },
      {
        name: "Narrow shelf stacks all content without overflow",
        script: `const shelf=find('[data-shelf]'); shelf.style.width='220px'; await wait(); const cards=Array.from(shelf.children).map(c=>c.getBoundingClientRect()); assert(cards[1].top>cards[0].bottom,'Stack with a gap'); assert(cards[2].top>cards[1].bottom,'Keep third card'); assert(shelf.scrollWidth<=shelf.clientWidth+1,'Avoid overflow'); equal(shelf.textContent,'TeaCoffeeCocoa');`,
      },
    ],
    hints: [
      "The component may live in a sidebar or a full page.",
      "Let columns repeat according to available space.",
      "Grid auto-fit with a bounded minmax can satisfy both sizes.",
    ],
    explanation:
      "Responsive components must fit their available space and preserve content order. These checks inspect geometry instead of mandating grid or flex. They establish two specified widths; intermediate sizes and real content still deserve inspection.",
    rubric: [
      "Explain available space versus viewport width.",
      "Preserve reading order as layout changes.",
      "Describe minimum useful card width and overflow behavior.",
    ],
    followUp:
      "How would two-line translated names, images, and an additional purchase action change your minimum width decision?",
    resource: "https://web.dev/learn/css/grid",
  },
  {
    id: "long-content",
    title: "Long names should not break the row",
    summary: "An unbroken record name pushes its action outside the card.",
    tags: ["CSS", "Flexbox", "Content resilience", "Overflow"],
    brief:
      "Keep a 240px record row readable when its name is a long unbroken string. The Open button must remain fully inside the row; show the entire name through wrapping rather than clipping.",
    requirements: [
      "Row is 240px wide and contains the whole name.",
      "Text wraps instead of overflowing or being hidden.",
      "Open stays visible beside the text and does not shrink out of reach.",
    ],
    starter: `export default function App(){return <div data-row style={{display:'flex',width:240,gap:8}}><span data-name>{'ReleaseCandidate'.repeat(8)}</span><button>Open</button></div>;}`,
    solution: `export default function App(){return <div data-row style={{display:'flex',width:240,gap:8,alignItems:'start'}}><span data-name style={{minWidth:0,overflowWrap:'anywhere'}}>{'ReleaseCandidate'.repeat(8)}</span><button style={{flexShrink:0}}>Open</button></div>;}`,
    checks: [
      {
        name: "Record and action stay within bounds",
        script: `const row=find('[data-row]'),button=find('button'); const a=row.getBoundingClientRect(),b=button.getBoundingClientRect(); assert(row.scrollWidth<=row.clientWidth+1,'No horizontal overflow'); assert(b.right<=a.right+1 && b.width>=40,'Keep action inside');`,
      },
      {
        name: "Full text wraps instead of disappearing",
        script: `const name=find('[data-name]'),style=getComputedStyle(name); equal(name.textContent,'ReleaseCandidate'.repeat(8)); assert(name.getBoundingClientRect().height>40,'Wrap multiple lines'); assert(!['hidden','clip'].includes(style.overflowX),'Do not clip text'); assert(name.scrollWidth<=name.clientWidth+1,'Contain text');`,
      },
    ],
    hints: [
      "Flex children have an automatic minimum size.",
      "The text needs permission to shrink and break long words.",
      "Try min-width:0, overflow-wrap:anywhere, and a nonshrinking action.",
    ],
    explanation:
      "Content resilience is part of layout correctness. Unbroken strings expose intrinsic sizing assumptions hidden by short fixture text. Wrapping preserves information; truncation would require a different product contract.",
    rubric: [
      "Explain intrinsic minimum size.",
      "Choose wrapping versus truncation deliberately.",
      "Preserve access to the row action.",
    ],
    followUp:
      "If product wants a two-line preview instead, how would users discover and access the full name?",
    resource: "https://web.dev/learn/css/flexbox",
  },
  {
    id: "toolbar-wrap",
    title: "Let the toolbar take another line",
    summary: "A compact action row overflows on phones.",
    tags: ["CSS", "Flexbox", "Responsive design", "Controls"],
    brief:
      "Three 120px actions fit on a wide toolbar but need separate rows in 180px. Preserve their order, complete labels, and 8px spacing rather than shrinking the text.",
    requirements: [
      "At 420px, all actions fit on one line.",
      "At 180px, actions wrap and remain at least 120px wide.",
      "Keep Export report, Share report, Archive report in that order with no horizontal overflow.",
    ],
    starter: `export default function App(){return <div data-toolbar style={{display:'flex',gap:8}}>{['Export report','Share report','Archive report'].map(name=><button style={{width:120,flexShrink:0}} key={name}>{name}</button>)}</div>;}`,
    solution: `export default function App(){return <div data-toolbar style={{display:'flex',flexWrap:'wrap',gap:8}}>{['Export report','Share report','Archive report'].map(name=><button style={{width:120,flexShrink:0,margin:0}} key={name}>{name}</button>)}</div>;}`,
    checks: [
      {
        name: "Wide toolbar retains one row",
        script: `const bar=find('[data-toolbar]');bar.style.width='420px'; await wait(); const boxes=Array.from(bar.children).map(c=>c.getBoundingClientRect());assert(boxes.every(b=>b.top===boxes[0].top),'One row');`,
      },
      {
        name: "Narrow toolbar wraps without losing controls",
        script: `const bar=find('[data-toolbar]');bar.style.width='180px';await wait();const boxes=Array.from(bar.children).map(c=>c.getBoundingClientRect());equal(boxes.length,3);assert(boxes[1].top>=boxes[0].bottom+7,'Keep row gap');assert(boxes.every(b=>b.width>=120),'Keep usable controls');assert(bar.scrollWidth<=bar.clientWidth+1,'No overflow');equal(bar.textContent,'Export reportShare reportArchive report');`,
      },
    ],
    hints: [
      "Flexible layout does not wrap by default.",
      "Account for the preview's baseline button margins.",
      "Enable flex-wrap and use one gap system rather than additional margins.",
    ],
    explanation:
      "Wrapping preserves labels and targets when a toolbar loses space. The exercise defines minimum control widths to avoid solving overflow by making actions unusably small. It tests two widths, not every platform's touch-target behavior.",
    rubric: [
      "Preserve source and reading order.",
      "Explain wrapping and shrinking separately.",
      "Use one consistent spacing mechanism.",
    ],
    followUp:
      "At what point would a secondary-action menu improve this toolbar, and which actions must remain immediately discoverable?",
    resource: "https://web.dev/learn/css/flexbox",
  },
  {
    id: "fluid-image",
    title: "Fit the image without stretching it",
    summary: "A landscape image overflows one card and distorts in another.",
    tags: ["CSS", "Images", "Aspect ratio", "Responsive design"],
    brief:
      "A 400×200 illustration should fill its card's width while preserving its 2:1 ratio. Keep intrinsic dimensions in HTML to describe the image before decoding. Use the inline fixture, which needs no network.",
    requirements: [
      "At 200px and 320px card widths, image width matches the card and height is half its width.",
      "Image has width=400, height=200, and alt=Teal illustration.",
      "Do not crop or overflow the image.",
    ],
    starter: `const image='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect width="400" height="200" fill="teal"/%3E%3C/svg%3E';
export default function App(){return <div data-card><img src={image} alt="Teal illustration" style={{width:400,height:100}}/></div>;}`,
    solution: `const image='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect width="400" height="200" fill="teal"/%3E%3C/svg%3E';
export default function App(){return <div data-card><img src={image} alt="Teal illustration" width={400} height={200} style={{display:'block',width:'100%',height:'auto'}}/></div>;}`,
    checks: [
      {
        name: "Narrow and wide cards preserve aspect ratio",
        script: `const card=find('[data-card]'),image=find('img');await image.decode();for(const width of [200,320]){card.style.width=width+'px';await wait();const box=image.getBoundingClientRect();assert(Math.abs(box.width-width)<1,'Fit card');assert(Math.abs(box.height-width/2)<1,'Preserve ratio');assert(card.scrollWidth<=card.clientWidth+1,'Avoid overflow');}`,
      },
      {
        name: "Intrinsic dimensions and purpose are retained",
        script: `const image=find('img');equal(image.getAttribute('width'),'400');equal(image.getAttribute('height'),'200');equal(image.alt,'Teal illustration');`,
      },
    ],
    hints: [
      "CSS width and height can override intrinsic dimensions.",
      "Preserve the intrinsic ratio while allowing width to shrink.",
      "Use width:100% and height:auto; retain HTML width and height.",
    ],
    explanation:
      "Intrinsic dimensions describe aspect ratio while CSS controls displayed size. Geometry checks establish fit and proportions. They do not measure cumulative layout shift; a loading-performance exercise needs browser trace evidence.",
    rubric: [
      "Separate intrinsic from displayed dimensions.",
      "Explain preserving ratio versus cropping.",
      "Avoid claiming a performance score from geometry alone.",
    ],
    followUp:
      "How would srcset, sizes, object-fit, and an editorial crop change the image contract?",
    resource: "https://web.dev/learn/design/responsive-images",
  },
  {
    id: "spacing-tokens",
    title: "Make spacing follow one scale",
    summary: "Related cards drift because their spacing values disagree.",
    tags: ["CSS", "Design tokens", "Spacing", "Consistency"],
    brief:
      "Two summary cards share a supplied local spacing scale. Both need 16px padding and 8px between heading and body. Keep the values connected to --space-card and --space-content, including when those tokens change.",
    requirements: [
      "Both cards use 16px padding and an 8px content gap.",
      "Changing the local tokens to 24px and 12px updates both cards.",
      "Keep each heading and paragraph visible in source order.",
    ],
    starter: `export default function App(){return <div data-system style={{'--space-card':'16px','--space-content':'8px'} as React.CSSProperties}>{['Orders','Returns'].map(title=><article key={title} style={{padding:10}}><h3 style={{margin:0}}>{title}</h3><p style={{margin:0}}>Review recent activity</p></article>)}</div>;}`,
    solution: `export default function App(){return <div data-system style={{'--space-card':'16px','--space-content':'8px'} as React.CSSProperties}>{['Orders','Returns'].map(title=><article key={title} style={{padding:'var(--space-card)',display:'grid',gap:'var(--space-content)'}}><h3 style={{margin:0}}>{title}</h3><p style={{margin:0}}>Review recent activity</p></article>)}</div>;}`,
    checks: [
      {
        name: "Cards follow the supplied spacing scale",
        script: `for(const card of document.querySelectorAll('article')){const a=card.getBoundingClientRect(),h=card.querySelector('h3').getBoundingClientRect(),p=card.querySelector('p').getBoundingClientRect();equal(Math.round(h.left-a.left),16);equal(Math.round(p.top-h.bottom),8);}`,
      },
      {
        name: "Changing tokens updates every card",
        script: `const system=find('[data-system]');system.style.setProperty('--space-card','24px');system.style.setProperty('--space-content','12px');await wait();for(const card of document.querySelectorAll('article')){const a=card.getBoundingClientRect(),h=card.querySelector('h3').getBoundingClientRect(),p=card.querySelector('p').getBoundingClientRect();equal(Math.round(h.left-a.left),24);equal(Math.round(p.top-h.bottom),12);}`,
      },
    ],
    hints: [
      "Matching literals once does not establish a shared scale.",
      "Read the CSS custom properties from each card.",
      "Use var(--space-card) for padding and var(--space-content) for gap.",
    ],
    explanation:
      "A token is a shared decision with consumers, not merely a renamed number. Changing supplied tokens checks that both cards remain connected to the same spacing policy. The fixture uses local tokens; Stepwise's own interface continues to use kbui tokens.",
    rubric: [
      "Explain the purpose of semantic spacing tokens.",
      "Separate local component structure from shared values.",
      "Describe how a token change affects consumers.",
    ],
    followUp:
      "How would you evolve the spacing scale without silently changing every dense table and compact form?",
    resource: "https://web.dev/learn/css/custom-properties",
  },
  {
    id: "readable-type",
    title: "Give reading text room to breathe",
    summary: "A dense paragraph stretches across the entire screen.",
    tags: ["CSS", "Typography", "Readability", "Responsive design"],
    brief:
      "Implement a supplied reading specification: 16px text, line height at least 24px, and a maximum measure of 60ch. The paragraph must also fit a 220px container without horizontal scrolling. This is a measurable brief, not a universal typography prescription.",
    requirements: [
      "Reading copy uses 16px text and line height of at least 24px.",
      "At 1000px available width, its measure remains at most approximately 60ch.",
      "At 220px, the complete text wraps inside its container.",
    ],
    starter: `export default function App(){return <div data-container><p data-copy style={{fontSize:12,lineHeight:1}}>A useful interface helps people read, decide, and recover. ${"Thoughtful spacing keeps the next step clear. ".repeat(6)}</p></div>;}`,
    solution: `export default function App(){return <div data-container><p data-copy style={{fontSize:16,lineHeight:1.5,maxWidth:'60ch',overflowWrap:'anywhere'}}>A useful interface helps people read, decide, and recover. ${"Thoughtful spacing keeps the next step clear. ".repeat(6)}</p></div>;}`,
    checks: [
      {
        name: "Wide reading text follows the supplied brief",
        script: `find('[data-container]').style.width='1000px';await wait();const copy=find('[data-copy]'),style=getComputedStyle(copy);equal(parseFloat(style.fontSize),16);assert(parseFloat(style.lineHeight)>=24,'Readable leading');const probe=document.createElement('span');probe.style.font=style.font;probe.textContent='0'.repeat(60);probe.style.whiteSpace='pre';copy.after(probe);assert(copy.getBoundingClientRect().width<=probe.getBoundingClientRect().width+2,'Bound line measure');probe.remove();`,
      },
      {
        name: "Narrow copy retains its content without overflow",
        script: `const container=find('[data-container]');container.style.width='220px';await wait();const copy=find('[data-copy]');assert(copy.scrollWidth<=copy.clientWidth+1,'Wrap text');assert(copy.textContent.includes('next step clear'),'Retain complete text');assert(copy.getBoundingClientRect().height>100,'Allow vertical growth');`,
      },
    ],
    hints: [
      "Font size, line height, and measure solve different problems.",
      "A maximum width still allows narrow layouts to shrink.",
      "Use max-width:60ch and a unitless line-height such as 1.5.",
    ],
    explanation:
      "The checks operationalize a supplied design brief rather than scoring subjective beauty. Reading comfort also depends on font, language, content, zoom, and user preference. Manual review remains necessary.",
    rubric: [
      "Distinguish size, leading, and measure.",
      "Explain why a maximum differs from a fixed width.",
      "Identify what automated geometry cannot judge.",
    ],
    followUp:
      "How would a different font, larger user text setting, or a language with different writing conventions change this brief?",
    resource: "https://web.dev/learn/design/typography",
  },
  {
    id: "empty-recovery",
    title: "An empty result needs a next step",
    summary: "Filtering removes everything and leaves a silent blank panel.",
    tags: ["UX", "Empty states", "Content design", "Search"],
    brief:
      "A small resource list needs a recoverable empty state. Explain No resources found when search misses, offer Clear search, and return focus to the search field after clearing.",
    requirements: [
      "Query filters React, CSS, and Accessibility case-insensitively.",
      "No match shows No resources found in a status and a Clear search button.",
      "Clear search restores all resources, empties Query, and focuses it.",
    ],
    starter: `import {useState} from 'react';
const names=['React','CSS','Accessibility'];export default function App(){const [q,setQ]=useState('');return <section><input aria-label="Query" value={q} onChange={e=>setQ(e.target.value)}/><ul>{names.filter(n=>n.toLowerCase().includes(q.toLowerCase())).map(n=><li key={n}>{n}</li>)}</ul></section>;}`,
    solution: `import {useRef,useState} from 'react';
const names=['React','CSS','Accessibility'];export default function App(){const [q,setQ]=useState(''),field=useRef<HTMLInputElement>(null);const found=names.filter(n=>n.toLowerCase().includes(q.toLowerCase()));return <section><label>Query<input ref={field} aria-label="Query" value={q} onChange={e=>setQ(e.target.value)}/></label><ul>{found.map(n=><li key={n}>{n}</li>)}</ul>{!found.length&&<><p role="status">No resources found</p><button onClick={()=>{setQ('');field.current?.focus();}}>Clear search</button></>}</section>;}`,
    checks: [
      {
        name: "Empty state explains the missing results",
        script: `await input('input','missing');equal(document.querySelectorAll('li').length,0);equal(text('[role="status"]'),'No resources found');equal(text('button'),'Clear search');`,
      },
      {
        name: "Recovery restores content and focus",
        script: `await input('input','missing');await click('Clear search');equal(value('input'),'');equal(document.querySelectorAll('li').length,3);equal(document.activeElement,find('input'));await input('input','cSs');equal(text('li'),'CSS');`,
      },
    ],
    hints: [
      "Empty is a meaningful result state.",
      "Offer an action that reverses the current filter.",
      "Clear the query and focus the existing input through a ref.",
    ],
    explanation:
      "Empty-state design connects explanation with a useful recovery action. Restoring focus keeps the user's next step nearby. A first-use empty collection would need different content from a search with zero matches.",
    rubric: [
      "Distinguish first-use empty from no matches.",
      "Choose a recovery action tied to the cause.",
      "Explain focus after removing the recovery button.",
    ],
    followUp:
      "How would you distinguish loading, request failure, permission denial, and a genuinely empty collection in the same panel?",
    resource: "https://www.w3.org/WAI/ARIA/apg/patterns/alert/",
  },
  {
    id: "locale-price",
    title: "Format the amount, keep its value",
    summary: "A locale switch changes the amount instead of its presentation.",
    tags: ["Internationalization", "Intl", "Numbers", "State modeling"],
    brief:
      "A price is 1234.5 euros. Switch between en-US and de-DE presentation without changing the numeric amount or currency. Use the browser's locale formatter rather than replacing punctuation.",
    requirements: [
      "Initial locale en-US displays €1,234.50.",
      "German displays 1.234,50 €; English restores the original presentation.",
      "Numeric amount remains 1234.5 and currency stays EUR.",
    ],
    starter: `import {useState} from 'react';export default function App(){const [locale,setLocale]=useState('en-US');return <section><button onClick={()=>setLocale('de-DE')}>German</button><button onClick={()=>setLocale('en-US')}>English</button><output aria-label="Price" lang={locale}>€1,234.50</output><span data-amount>1234.5</span></section>;}`,
    solution: `import {useState} from 'react';export default function App(){const [locale,setLocale]=useState('en-US');const amount=1234.5;return <section><button onClick={()=>setLocale('de-DE')}>German</button><button onClick={()=>setLocale('en-US')}>English</button><output aria-label="Price" lang={locale}>{new Intl.NumberFormat(locale,{style:'currency',currency:'EUR'}).format(amount)}</output><span data-amount>{amount}</span></section>;}`,
    checks: [
      {
        name: "English uses the specified currency presentation",
        script: `equal(text('output'),'€1,234.50');equal(text('[data-amount]'),'1234.5');`,
      },
      {
        name: "Locale switches are reversible and preserve amount",
        script: `await click('German');equal(text('output').replace(/\\s/g,' '),'1.234,50 €');equal(find('output').lang,'de-DE');equal(text('[data-amount]'),'1234.5');await click('English');equal(text('output'),'€1,234.50');`,
      },
    ],
    hints: [
      "Presentation should derive from numeric data and locale.",
      "Separators and currency placement vary together.",
      "Use Intl.NumberFormat with style:currency and currency:EUR.",
    ],
    explanation:
      "Locale formatting is a view over a value, not a conversion of that value. The checks normalize whitespace because localized currency output may use nonbreaking spaces. Parsing localized user input is a separate problem.",
    rubric: [
      "Separate formatting from conversion.",
      "Keep numeric data independent of displayed text.",
      "Explain why punctuation replacement is fragile.",
    ],
    followUp:
      "How would you model minor units, rounding rules, and a user's editable localized amount without floating-point price drift?",
    resource:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat",
  },
  {
    id: "fieldset-group",
    title: "Name the choice and its group",
    summary: "Delivery options have individual labels but no shared question.",
    tags: ["HTML", "Forms", "Fieldset", "Radio group"],
    brief:
      "Group the Standard and Express radio choices under Delivery method. Native grouping should allow exactly one selection, starting with Standard.",
    requirements: [
      "A fieldset contains legend Delivery method and both labelled radios.",
      "Both radios share name=delivery; Standard starts checked.",
      "Selecting Express clears Standard and preserves individual labels.",
    ],
    starter: `export default function App(){return <div><p>Delivery method</p><label><input type="radio" name="standard" defaultChecked/>Standard</label><label><input type="radio" name="express"/>Express</label></div>;}`,
    solution: `export default function App(){return <fieldset><legend>Delivery method</legend><label><input type="radio" name="delivery" value="standard" defaultChecked/>Standard</label><label><input type="radio" name="delivery" value="express"/>Express</label></fieldset>;}`,
    checks: [
      {
        name: "Shared question and individual labels are native",
        script: `equal(text('fieldset legend'),'Delivery method');const fields=document.querySelectorAll('fieldset input[type="radio"]');equal(fields.length,2);for(const field of fields){equal(field.name,'delivery');assert(field.labels.length===1,'Label each option');}`,
      },
      {
        name: "Exactly one option remains selected",
        script: `const fields=document.querySelectorAll('input');equal(fields[0].checked,true);fields[1].click();await wait();equal(fields[1].checked,true);equal(fields[0].checked,false);`,
      },
    ],
    hints: [
      "The group needs a question separate from each answer.",
      "Native fieldset and legend express that relationship.",
      "Use a shared radio name so the browser enforces exclusivity.",
    ],
    explanation:
      "A label names a control; a legend names the group's shared question. A shared radio name provides native exclusivity. This is a good default for a small visible set of mutually exclusive choices.",
    rubric: [
      "Distinguish group name from option labels.",
      "Explain native radio exclusivity.",
      "Describe keyboard checks for the radio group.",
    ],
    followUp:
      "How would you add a group-level validation message when no default selection is appropriate?",
    resource: "https://www.w3.org/WAI/tutorials/forms/grouping/",
  },
  {
    id: "component-callback",
    title: "Let the parent own the selection",
    summary: "A reusable row edits private state while its parent summary stays stale.",
    tags: ["TypeScript", "Props", "Callbacks", "Component contracts"],
    brief:
      "PlanButton receives selected and onSelect. Make its pressed state follow the parent and notify that parent on activation. Selecting either plan must update both buttons and the summary.",
    requirements: [
      "PlanButton props are name:string, selected:boolean, and onSelect:()=>void.",
      "Basic starts selected; choosing Pro updates summary and pressed states.",
      "Choosing Basic again restores the parent-owned selection.",
    ],
    starter: `import {useState} from 'react';type Props={name:string;selected:boolean;onSelect:()=>void};function PlanButton({name,selected}:Props){const [local,setLocal]=useState(selected);return <button aria-pressed={local} onClick={()=>setLocal(true)}>{name}</button>;}export default function App(){const [plan,setPlan]=useState('Basic');return <section>{['Basic','Pro'].map(name=><PlanButton key={name} name={name} selected={plan===name} onSelect={()=>setPlan(name)}/>)}<output>{plan}</output></section>;}`,
    solution: `import {useState} from 'react';type Props={name:string;selected:boolean;onSelect:()=>void};function PlanButton({name,selected,onSelect}:Props){return <button aria-pressed={selected} onClick={onSelect}>{name}</button>;}export default function App(){const [plan,setPlan]=useState('Basic');return <section>{['Basic','Pro'].map(name=><PlanButton key={name} name={name} selected={plan===name} onSelect={()=>setPlan(name)}/>)}<output>{plan}</output></section>;}`,
    checks: [
      {
        name: "Child notifies the authoritative parent",
        script: `await click('Pro');equal(text('output'),'Pro');const buttons=Array.from(document.querySelectorAll('button'));equal(buttons[0].getAttribute('aria-pressed'),'false');equal(buttons[1].getAttribute('aria-pressed'),'true');`,
      },
      {
        name: "Selection is reversible without duplicate owners",
        script: `await click('Pro');await click('Basic');equal(text('output'),'Basic');equal(document.querySelectorAll('[aria-pressed="true"]').length,1);`,
      },
    ],
    hints: [
      "A prop describes the current parent-owned selection.",
      "Copying the prop to private state creates a second owner.",
      "Render selected directly and pass onSelect as the handler.",
    ],
    explanation:
      "Controlled components express intent through callbacks and render the state supplied by their owner. The TypeScript contract describes collaboration; behavior checks prove the parent and children actually stay coherent.",
    rubric: [
      "Identify the authoritative state owner.",
      "Explain callback intent versus local mutation.",
      "Describe why copying props into state drifts.",
    ],
    followUp:
      "When would an uncontrolled defaultSelected API be useful, and how would you prevent ambiguous mixing of controlled and uncontrolled props?",
    resource: "https://react.dev/learn/sharing-state-between-components",
  },
];

export const designPractice: Challenge[] = exercises.map((exercise) => ({
  ...exercise,
  track: "interface-design",
  level: "Easy",
  minutes: 20,
}));
