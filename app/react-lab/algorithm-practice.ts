import type { Challenge, Check } from "./types";

const productsFixture = `type Product={id:string;name:string;cents:number};
const products:Product[]=[{id:'tea',name:'Tea',cents:1250},{id:'coffee',name:'Coffee',cents:300}];`;
const projectionView = `export default function App(){const [empty,setEmpty]=useState(false);const cards=projectProducts(empty?[]:products);return <section><h2>Price cards</h2><button onClick={()=>setEmpty(v=>!v)}>Toggle empty</button><ul aria-label="Products">{cards.map(card=><li key={card.id} data-id={card.id}>{card.label}</li>)}</ul><p>Count</p><output aria-label="Count">{cards.length}</output></section>;}`;
const stockFixture = `type Stock={id:string;stock:number};const stock:Stock[]=[{id:'tea',stock:2},{id:'coffee',stock:0}];`;
const stockView = `export default function App(){const [empty,setEmpty]=useState(false),summary=stockSummary(empty?[]:stock);return <section><h2>Stock availability</h2><button onClick={()=>setEmpty(v=>!v)}>Toggle empty</button><p>Available</p><output aria-label="Available">{summary.available.join(',')||'None'}</output><p>Any available</p><output aria-label="Any available">{String(summary.any)}</output><p>All available</p><output aria-label="All available">{String(summary.all)}</output><p>Empty collections contain no unavailable records; All available is a logical summary, not permission to place an empty order.</p></section>;}`;
const lookupView = `export default function App(){const [id,setId]=useState('tea');const product=lookupProduct(products,id);return <section><h2>Cart inspector</h2><label>Product id<input aria-label="Product id" value={id} onChange={e=>setId(e.target.value)}/></label><output aria-label="Product">{product?product.name:'Product not found'}</output></section>;}`;
const salesFixture = `type Sale={category:string;quantity:number;cents:number};const sales:Sale[]=[{category:'Books',quantity:2,cents:1250},{category:'Tools',quantity:1,cents:300},{category:'Books',quantity:1,cents:500}];`;
const salesView = `export default function App(){const [empty,setEmpty]=useState(false),summary=summarizeSales(empty?[]:sales);return <section><h2>Sales dashboard</h2><button onClick={()=>setEmpty(v=>!v)}>Toggle empty</button><p>Units</p><output aria-label="Units">{summary.units}</output><p>Revenue</p><output aria-label="Revenue">{(summary.cents/100).toFixed(2)}</output><ul aria-label="Categories">{Object.entries(summary.byCategory).map(([name,count])=><li key={name}>{name}: {count}</li>)}</ul></section>;}`;
const mergeFixture = `type Item={id:string;name:string};const first:Item[]=[{id:'a',name:'Old'},{id:'b',name:'B'}],second:Item[]=[{id:'a',name:'New'},{id:'c',name:'C'}];`;
const mergeView = `export default function App(){const [items,setItems]=useState(first);return <section><h2>Activity pages</h2><button onClick={()=>setItems(current=>mergePages(current,second))}>Load next page</button><button onClick={()=>setItems(first)}>Reset feed</button><ul aria-label="Feed">{items.map(item=><li key={item.id} data-id={item.id}>{item.name}</li>)}</ul><p>Count</p><output aria-label="Count">{items.length}</output></section>;}`;
const rankFixture = `type Ranked={id:string;cents:number};const ranked:Ranked[]=[{id:'z',cents:1200},{id:'b',cents:300},{id:'a',cents:300}];`;
const rankView = `export default function App(){const [descending,setDescending]=useState(false),items=rankProducts(ranked,descending);return <section><h2>Price comparison</h2><button aria-pressed={descending} onClick={()=>setDescending(v=>!v)}>Descending</button><ol aria-label="Ranked products">{items.map(item=><li key={item.id} data-id={item.id}>{item.id}: {(item.cents/100).toFixed(2)}</li>)}</ol><p>Source order</p><output aria-label="Source order">{ranked.map(item=>item.id).join(',')}</output></section>;}`;
const tagFixture = `type Tagged={tags:readonly string[]};const tagged:Tagged[]=[{tags:['react','react','css']},{tags:['css']},{tags:[]}];`;
const tagView = `export default function App(){const [reactOnly,setReactOnly]=useState(false),[empty,setEmpty]=useState(false),items=empty?[]:tagged.filter(item=>!reactOnly||item.tags.includes('react')),counts=tagCounts(items);return <section><h2>Product facets</h2><button aria-pressed={reactOnly} onClick={()=>setReactOnly(v=>!v)}>React only</button><button onClick={()=>setEmpty(v=>!v)}>Toggle empty</button><ul aria-label="Tag counts">{counts.map(item=><li key={item.tag} data-tag={item.tag}>{item.tag}: {item.count}</li>)}</ul><p>Products</p><output aria-label="Products">{items.length}</output></section>;}`;
const windowView = `const times=[0,2,5,5,9];export default function App(){const [span,setSpan]=useState(5),counts=windowCounts(times,span);return <section><h2>Traffic history</h2><button onClick={()=>setSpan(5)}>Window 5</button><button onClick={()=>setSpan(3)}>Window 3</button><p>Count observed events in (time − window, time], including the current event.</p><ol aria-label="Traffic counts">{counts.map((count,index)=><li key={index} data-count={count}>At {times[index]}s: {count}</li>)}</ol><p>Peak</p><output aria-label="Peak">{Math.max(0,...counts)}</output></section>;}`;
const seekView = `const times=[0,5,5,9];export default function App(){const [query,setQuery]=useState('5'),time=Number(query),valid=query.trim()!==''&&Number.isFinite(time),index=valid?lowerBound(times,time):-1;return <section><h2>Transcript seeker</h2><label>Playhead<input aria-label="Playhead" inputMode="decimal" value={query} onChange={e=>setQuery(e.target.value)}/></label><p>Cue</p><output aria-label="Cue">{!valid?'Enter a finite time':index===times.length?'No later cue':'Cue '+index+' at '+times[index]+'s'}</output></section>;}`;
const commentsFixture = `type Comment={id:string;parentId:string|null;title:string};const comments:Comment[]=[{id:'intro',parentId:null,title:'Intro'},{id:'reply',parentId:'intro',title:'Reply'},{id:'detail',parentId:'reply',title:'Detail'},{id:'orphan',parentId:'missing',title:'Orphan'}];`;
const commentsView = `export default function App(){const [expanded,setExpanded]=useState<Set<string>>(new Set()),rows=visibleComments(comments,expanded),branches=new Set(comments.map(comment=>comment.parentId));return <section><h2>Comment outline</h2><p>Reply depth is stated in text as well as indentation. This is an outline, not an ARIA tree widget.</p><ol aria-label="Comments">{rows.map(row=><li key={row.id} data-id={row.id} data-depth={row.depth} style={{marginInlineStart:row.depth*16}}><span>{row.title} — reply depth {row.depth}</span>{branches.has(row.id)&&<button aria-expanded={expanded.has(row.id)} onClick={()=>setExpanded(current=>{const next=new Set(current);if(next.has(row.id))next.delete(row.id);else next.add(row.id);return next;})}>Toggle {row.id}</button>}</li>)}</ol><p>Visible comments</p><output aria-label="Visible comments">{rows.length}</output></section>;}`;
const navigationTypes = `type NavState={back:readonly string[];current:string;forward:readonly string[]};type NavAction={type:'visit';page:string}|{type:'back'|'forward'};`;
const navigationView = `export default function App(){const [state,setState]=useState<NavState>({back:[],current:'Home',forward:[]});return <section><h2>Prototype navigation</h2><p>This local page model does not change browser history or URLs.</p><nav aria-label="Prototype pages">{['Guide','API','Examples'].map(page=><button key={page} onClick={()=>setState(current=>navigate(current,{type:'visit',page}))}>{page}</button>)}</nav><button disabled={!state.back.length} onClick={()=>setState(current=>navigate(current,{type:'back'}))}>Back</button><button disabled={!state.forward.length} onClick={()=>setState(current=>navigate(current,{type:'forward'}))}>Forward</button><p>Page</p><output aria-label="Page">{state.current}</output><p>Back depth</p><output aria-label="Back depth">{state.back.length}</output><p>Forward depth</p><output aria-label="Forward depth">{state.forward.length}</output></section>;}`;
const navigationTail = `if(action.type==='back'&&state.back.length)return {back:state.back.slice(0,-1),current:state.back[state.back.length-1],forward:[...state.forward,state.current]};if(action.type==='forward'&&state.forward.length)return {back:[...state.back,state.current],current:state.forward[state.forward.length-1],forward:state.forward.slice(0,-1)};return state;`;
const releaseFixture = `type Task={id:string;dependsOn:readonly string[]};const base:Task[]=[{id:'tokens',dependsOn:[]},{id:'button',dependsOn:['tokens']},{id:'form',dependsOn:['button']},{id:'docs',dependsOn:['tokens']}];`;
const releaseView = `export default function App(){const [scenario,setScenario]=useState('valid');const tasks=scenario==='cycle'?base.map(task=>task.id==='button'?{...task,dependsOn:['form']}:task):scenario==='missing'?[...base,{id:'deploy',dependsOn:['unknown']},{id:'notify',dependsOn:['deploy']}]:base;const plan=planRelease(tasks);return <section><h2>Release planner</h2><button onClick={()=>setScenario('valid')}>Valid dependencies</button><button onClick={()=>setScenario('cycle')}>Introduce cycle</button><button onClick={()=>setScenario('missing')}>Missing dependency</button><ol aria-label="Release order">{plan.order.map(id=><li key={id}>{id}</li>)}</ol><p>Blocked</p><output aria-label="Blocked">{plan.blocked.join(',')||'None'}</output><p role="status">{plan.blocked.length?'Some tasks have unresolved dependencies':'Ready to release'}</p></section>;}`;

const exercises: Omit<Challenge, "track">[] = [
  {
    id: "product-projection",
    title: "Turn records into useful price cards",
    summary: "Build readable price cards from product records, including an empty collection.",
    level: "Very easy",
    minutes: 12,
    tags: ["DSA", "Arrays", "map", "Transformation"],
    brief:
      "A catalog stores integer cents but its cards show whole currency units. Implement projectProducts as a pure one-to-one transformation returning id and label. The supplied two-decimal formatting is an exercise contract, not locale-aware pricing.",
    requirements: [
      "Tea at 1250 cents becomes Tea — 12.50; Coffee at 300 becomes Coffee — 3.00.",
      "Keep record ids and source order. Empty input returns an empty array and zero cards.",
      "Do not mutate product objects. Explain why map fits a transformation while forEach returns no result array.",
    ],
    starter: `import {useState} from 'react';\n${productsFixture}
export function projectProducts(items:readonly Product[]){return items.map(item=>({id:item.id,label:item.name+' — '+item.cents.toFixed(2)}));}
${projectionView}`,
    solution: `import {useState} from 'react';\n${productsFixture}
export function projectProducts(items:readonly Product[]){
 return items.map(item=>({id:item.id,label:item.name+' — '+(item.cents/100).toFixed(2)}));
}
${projectionView}`,
    checks: [
      {
        name: "Cards transform amounts while preserving identities",
        script: `equal(text('[data-id="tea"]'),'Tea — 12.50');equal(text('[data-id="coffee"]'),'Coffee — 3.00');equal(text('output'),'2');`,
      },
      {
        name: "Empty results and restoration keep the original source",
        script: `await click('Toggle empty');equal(find('ul').children.length,0);equal(text('output'),'0');await click('Toggle empty');equal(text('[data-id="tea"]'),'Tea — 12.50');`,
      },
    ],
    hints: [
      "Identify the stored unit before formatting.",
      "Each product becomes one card record; preserve its id.",
      "Map to a new object and divide cents by 100 before formatting.",
    ],
    explanation:
      "map expresses one output value for each source element. The transformation is linear in product count and allocates a new result array. Rendering uses stable record ids. Mutation, formatting, and currency conversion are different concerns.",
    rubric: [
      "Choose map for its output contract.",
      "Keep identity and source data intact.",
      "Explain linear traversal and allocation.",
    ],
    followUp:
      "How would missing prices, multiple currencies, and localized formatting change the data contract without introducing mutation?",
    resource:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map",
  },
  {
    id: "stock-availability",
    title: "Any stock is not the same as all stock",
    summary:
      "Build a stock panel showing available products, any availability, and all availability.",
    level: "Easy",
    minutes: 20,
    tags: ["DSA", "Arrays", "filter", "some", "every"],
    brief:
      "A stock panel needs three different answers: ids of available products, whether any are available, and whether every product is available. A record is available when stock > 0. Make the empty collection semantics explicit.",
    requirements: [
      "stockSummary returns {available:string[], any:boolean, all:boolean} without mutation.",
      "The mixed Tea/Coffee fixture reports tea, true, false.",
      "Empty input reports [], false, true. Keep the visible explanation that this logical all-result does not authorize an empty order.",
    ],
    starter: `import {useState} from 'react';\n${stockFixture}
export function stockSummary(items:readonly Stock[]){const available=items.filter(item=>item.stock>0).map(item=>item.id);return {available,any:available.length>0,all:available.length>0};}
${stockView}`,
    solution: `import {useState} from 'react';\n${stockFixture}
export function stockSummary(items:readonly Stock[]){return {
 available:items.filter(item=>item.stock>0).map(item=>item.id),
 any:items.some(item=>item.stock>0),all:items.every(item=>item.stock>0)
};}
${stockView}`,
    checks: [
      {
        name: "Mixed stock distinguishes all from any",
        script: `equal(text('[aria-label="Available"]'),'tea');equal(text('[aria-label="Any available"]'),'true');equal(text('[aria-label="All available"]'),'false');`,
      },
      {
        name: "Empty collection has explicit quantifier semantics",
        script: `await click('Toggle empty');equal(text('[aria-label="Available"]'),'None');equal(text('[aria-label="Any available"]'),'false');equal(text('[aria-label="All available"]'),'true');await click('Toggle empty');equal(text('[aria-label="All available"]'),'false');`,
      },
    ],
    hints: [
      "A list of matches and a yes/no answer have different shapes.",
      "some and every can stop once the answer is known.",
      "An empty array has no matching item and no counterexample to every.",
    ],
    explanation:
      "filter returns matching records; some asks whether a witness exists; every asks whether a counterexample exists. Empty every is true. A product-level Can order rule may additionally require a nonempty cart. Several linear passes remain linear; choose clearer code before speculative fusion.",
    rubric: [
      "Choose methods by their return contracts.",
      "Explain empty some and every.",
      "Separate logical summaries from business authorization.",
    ],
    followUp:
      "How would you model unknown stock and server reservations so a boolean summary does not claim more certainty than the data supports?",
    resource:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every",
  },
  {
    id: "cart-lookup",
    title: "Find one product and handle its absence",
    summary: "Build an editable product lookup with clear matching and missing results.",
    level: "Easy",
    minutes: 20,
    tags: ["DSA", "Arrays", "find", "Lookup"],
    brief:
      "An inspector looks up a product by exact id. Return the first matching record or null; never substitute the first product when a lookup misses. Keep the current query editable so missing data can recover.",
    requirements: [
      "lookupProduct returns one record by exact id, or null for no match and empty input.",
      "Tea initially appears. Query coffee shows Coffee; query missing shows Product not found.",
      "Do not modify or clone the matching record; explain when repeated searches justify a keyed index.",
    ],
    starter: `import {useState} from 'react';\n${productsFixture}
export function lookupProduct(items:readonly Product[],id:string){return items.find(item=>item.id===id)??items[0]??null;}
${lookupView}`,
    solution: `import {useState} from 'react';\n${productsFixture}
export function lookupProduct(items:readonly Product[],id:string){return items.find(item=>item.id===id)??null;}
${lookupView}`,
    checks: [
      {
        name: "Existing ids return the intended product",
        script: `equal(text('output'),'Tea');await input('input','coffee');equal(text('output'),'Coffee');`,
      },
      {
        name: "Missing and cleared queries never substitute unrelated data",
        script: `await input('input','missing');equal(text('output'),'Product not found');await input('input','');equal(text('output'),'Product not found');await input('input','tea');equal(text('output'),'Tea');`,
      },
    ],
    hints: [
      "Absence needs a different result from a successful lookup.",
      "find returns the first matching record, not an array.",
      "Normalize undefined to null rather than falling back to items[0].",
    ],
    explanation:
      "find fits a single lookup and stops at the first match. Its worst-case traversal is linear. Building a Map has its own cost and lifecycle; it becomes useful when many lookups share a stable collection. Missing data must remain explicit in the UI.",
    rubric: [
      "Distinguish find from filter.",
      "Handle missing and empty collections.",
      "Compare one-off traversal with a maintained index.",
    ],
    followUp:
      "How would duplicate ids, deleted cart items, and a refreshed server catalog affect index ownership and missing-product recovery?",
    resource:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find",
  },
  {
    id: "sales-summary",
    title: "Aggregate a sales dashboard from its records",
    summary: "Build a sales summary with units, revenue, and totals by category.",
    level: "Easy",
    minutes: 25,
    tags: ["DSA", "Arrays", "reduce", "Aggregation", "Grouping"],
    brief:
      "A sales dashboard needs total units, total revenue in cents, and units by category. Derive all three from the source sale records. Each sale's cents is its per-unit price; repeated categories must accumulate.",
    requirements: [
      "summarizeSales returns {units,cents,byCategory}; fixture totals are 4 units and 3300 cents, Books 3 and Tools 1.",
      "Empty input returns zero totals and an empty category dictionary.",
      "Do not mutate sale records. Category names are arbitrary strings, including __proto__; use a safe dictionary or keyed collection.",
    ],
    starter: `import {useState} from 'react';\n${salesFixture}
export function summarizeSales(items:readonly Sale[]){return items.reduce((summary,item)=>({units:summary.units+item.quantity,cents:summary.cents+item.cents,byCategory:{...summary.byCategory,[item.category]:item.quantity}}),{units:0,cents:0,byCategory:{} as Record<string,number>});}
${salesView}`,
    solution: `import {useState} from 'react';\n${salesFixture}
export function summarizeSales(items:readonly Sale[]){
 return items.reduce((summary,item)=>{
  summary.units+=item.quantity;summary.cents+=item.cents*item.quantity;
  summary.byCategory[item.category]=(summary.byCategory[item.category]??0)+item.quantity;
  return summary;
 },{units:0,cents:0,byCategory:Object.create(null) as Record<string,number>});
}
${salesView}`,
    checks: [
      {
        name: "Totals weight quantity and accumulate repeated categories",
        script: `equal(text('[aria-label="Units"]'),'4');equal(text('[aria-label="Revenue"]'),'33.00');equal(text('ul'),'Books: 3Tools: 1');`,
      },
      {
        name: "Empty input has a valid identity and can recover",
        script: `await click('Toggle empty');equal(text('[aria-label="Units"]'),'0');equal(text('[aria-label="Revenue"]'),'0.00');equal(find('ul').children.length,0);await click('Toggle empty');equal(text('[aria-label="Revenue"]'),'33.00');`,
      },
    ],
    hints: [
      "Each line contributes quantity multiplied by unit price.",
      "A category may have appeared in an earlier line.",
      "Initialize an empty accumulator, then add rather than replace each category's quantity.",
    ],
    explanation:
      "reduce folds a collection into a different result shape. A fresh local accumulator can be mutated without changing inputs or shared state; repeatedly spreading an ever-growing dictionary can add avoidable copying. Integer minor units keep this exercise's arithmetic explicit. Arbitrary keys require a dictionary without inherited entries.",
    rubric: [
      "Define the accumulator and its empty identity.",
      "Distinguish local accumulator mutation from source mutation.",
      "Explain grouping costs and arbitrary category keys.",
    ],
    followUp:
      "What changes when refunds, mixed currencies, large datasets, and rounding policies enter the dashboard?",
    resource:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce",
  },
  {
    id: "merge-feed-pages",
    title: "Merge pages without repeating records",
    summary: "Build a feed that combines overlapping pages and refreshes existing records.",
    level: "Medium",
    minutes: 30,
    tags: ["DSA", "Map", "Deduplication", "Pagination", "Identity"],
    brief:
      "An activity feed receives overlapping local pages. mergePages must keep first-seen identity order while using the latest payload for each id. Loading the same page twice is idempotent. These fixtures model data reconciliation, not network transport.",
    requirements: [
      "Merging a:Old,b:B with a:New,c:C produces a:New,b:B,c:C.",
      "The latest duplicate payload wins, including duplicates inside one page. Repeated page loads do not duplicate rows.",
      "Do not mutate either input array. Explain an indexed linear-pass approach versus repeated find searches.",
    ],
    starter: `import {useState} from 'react';\n${mergeFixture}
export function mergePages(previous:readonly Item[],incoming:readonly Item[]){return [...previous,...incoming];}
${mergeView}`,
    solution: `import {useState} from 'react';\n${mergeFixture}
export function mergePages(previous:readonly Item[],incoming:readonly Item[]){
 const byId=new Map<string,Item>();
 for(const item of [...previous,...incoming])byId.set(item.id,item);
 return Array.from(byId.values());
}
${mergeView}`,
    checks: [
      {
        name: "Overlap updates payload while retaining first-seen order",
        script: `await click('Load next page');equal(Array.from(document.querySelectorAll('[data-id]')).map(n=>n.getAttribute('data-id')).join(','),'a,b,c');equal(text('[data-id="a"]'),'New');equal(text('output'),'3');`,
      },
      {
        name: "Repeated pages are idempotent and reset retains original data",
        script: `await click('Load next page');await click('Load next page');equal(find('ul').children.length,3);await click('Reset feed');equal(text('[data-id="a"]'),'Old');equal(text('output'),'2');`,
      },
    ],
    hints: [
      "Payload ownership belongs to id, not its position in a page.",
      "Map replacement preserves a key's first insertion order.",
      "Insert previous then incoming records into a Map keyed by id and return its values.",
    ],
    explanation:
      "An identity index separates record order from payload freshness. Updating an existing Map key changes its value without reinserting the key. A single indexed pass avoids searching all prior records for every incoming record. Map lookup complexity is implementation-dependent; the language requires average sublinear access, not a universal constant-time guarantee.",
    rubric: [
      "Define order and duplicate-winner policy.",
      "Explain why repeated page delivery is idempotent.",
      "Compare indexed merging with nested linear searches.",
    ],
    followUp:
      "How would a server revision or tombstone stop a later-arriving stale page from overwriting newer edits or resurrecting a deleted record?",
    resource:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map",
  },
  {
    id: "rank-products",
    title: "Sort the view without sorting the source",
    summary: "Build a price comparison with predictable ranking and unchanged source records.",
    level: "Medium",
    minutes: 30,
    tags: ["DSA", "Arrays", "sort", "toSorted", "Comparator", "Immutability"],
    brief:
      "A comparison view ranks prices numerically. Ascending and descending order both break equal-price ties by ASCII id ascending. Keep the supplied shared catalog in its original z,b,a order.",
    requirements: [
      "Ascending order is a,b,z; descending is z,a,b.",
      "Source order remains z,b,a through repeated direction changes. Empty input is valid.",
      "Return a new array; use toSorted or copy before sort. Explain why the default text comparison is unsuitable.",
    ],
    starter: `import {useState} from 'react';\n${rankFixture}
export function rankProducts(items:readonly Ranked[],descending:boolean){return [...items].sort((a,b)=>String(descending?b.cents:a.cents).localeCompare(String(descending?a.cents:b.cents)));}
${rankView}`,
    solution: `import {useState} from 'react';\n${rankFixture}
export function rankProducts(items:readonly Ranked[],descending:boolean){
 return items.toSorted((a,b)=>(descending?b.cents-a.cents:a.cents-b.cents)||(a.id<b.id?-1:a.id>b.id?1:0));
}
${rankView}`,
    checks: [
      {
        name: "Ascending numeric ranking has deterministic ties",
        script: `equal(Array.from(document.querySelectorAll('li')).map(n=>n.getAttribute('data-id')).join(','),'a,b,z');equal(text('output'),'z,b,a');`,
      },
      {
        name: "Descending changes only the projection",
        script: `await click('Descending');equal(Array.from(document.querySelectorAll('li')).map(n=>n.getAttribute('data-id')).join(','),'z,a,b');equal(text('output'),'z,b,a');await click('Descending');equal(text('output'),'z,b,a');equal(find('li').getAttribute('data-id'),'a');`,
      },
    ],
    hints: [
      "Numeric values need a numeric comparator.",
      "Tie direction is independent of the primary price direction.",
      "Copying sort methods preserve the source; compare prices first, ids second.",
    ],
    explanation:
      "A comparator defines an ordering contract, including ties. toSorted returns a new array; sort mutates its receiver. Reversing an ascending result would also reverse equal-price ids and break this policy. The JavaScript specification does not prescribe one sorting algorithm or time/space bound for every engine.",
    rubric: [
      "Define numeric and tie ordering separately.",
      "Distinguish source data from sorted views.",
      "Avoid unsupported engine-specific complexity claims.",
    ],
    followUp:
      "How would missing prices, locale-aware names, and server pagination affect deterministic ordering across pages?",
    resource:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted",
  },
  {
    id: "tag-facets",
    title: "Count products per tag, not repeated labels",
    summary: "Build tag facets whose counts represent matching products, including repeated tags.",
    level: "Medium",
    minutes: 30,
    tags: ["DSA", "flatMap", "Set", "Map", "Facets", "Frequency maps"],
    brief:
      "Product filters show how many current products carry each tag. A tag repeated inside one product counts once, while the same tag on different products counts independently. Recompute facets from the current filtered collection.",
    requirements: [
      "tagCounts returns alphabetically ordered {tag,count} records. Fixture is css:2, react:1.",
      "React only narrows products and both tag counts become 1. Removing it restores css:2.",
      "Empty products produce no tags. Do not modify product tag arrays; explain per-product versus global deduplication.",
    ],
    starter: `import {useState} from 'react';\n${tagFixture}
export function tagCounts(items:readonly Tagged[]){const counts=new Map<string,number>();for(const tag of items.flatMap(item=>[...item.tags]))counts.set(tag,(counts.get(tag)??0)+1);return Array.from(counts,([tag,count])=>({tag,count})).sort((a,b)=>a.tag.localeCompare(b.tag));}
${tagView}`,
    solution: `import {useState} from 'react';\n${tagFixture}
export function tagCounts(items:readonly Tagged[]){
 const counts=new Map<string,number>();
 for(const tag of items.flatMap(item=>Array.from(new Set(item.tags))))counts.set(tag,(counts.get(tag)??0)+1);
 return Array.from(counts,([tag,count])=>({tag,count})).sort((a,b)=>a.tag<b.tag?-1:a.tag>b.tag?1:0);
}
${tagView}`,
    checks: [
      {
        name: "Repeated tags count once per product",
        script: `equal(text('[data-tag="css"]'),'css: 2');equal(text('[data-tag="react"]'),'react: 1');equal(text('output'),'3');`,
      },
      {
        name: "Facets follow filters and empty collections",
        script: `await click('React only');equal(text('[data-tag="css"]'),'css: 1');equal(text('[data-tag="react"]'),'react: 1');await click('React only');equal(text('[data-tag="css"]'),'css: 2');await click('Toggle empty');equal(find('ul').children.length,0);equal(text('output'),'0');`,
      },
    ],
    hints: [
      "The count's unit is products, not label occurrences.",
      "Deduplicate each product's tags before flattening.",
      "Combine per-product Set, flatMap, and a frequency Map; then order the result.",
    ],
    explanation:
      "Deduplication scope determines meaning. A global Set loses product frequencies; counting the raw flattened list overcounts duplicate tags within one product. Separate collection, per-record uniqueness, aggregation, and ordering. Traversal scales with tag occurrences; ordering adds work based on unique tag count.",
    rubric: [
      "Define what one count represents.",
      "Place deduplication at the correct scope.",
      "Explain traversal, unique-key storage, and ordering costs.",
    ],
    followUp:
      "Should a selected tag's own facet count ignore that tag's filter? Define the product semantics before changing the aggregation pipeline.",
    resource:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap",
  },
  {
    id: "activity-window",
    title: "Count recent activity with a sliding window",
    summary: "Build an activity chart showing event counts within a selectable trailing interval.",
    level: "Hard",
    minutes: 40,
    tags: ["DSA", "Sliding window", "Two pointers", "Analytics", "Complexity"],
    brief:
      "A traffic history chart needs a trailing count for every event in a sorted timestamp stream. windowCounts computes counts for a positive span: include observed events with timestamp > current − span and <= current. Equal timestamps are counted only as their events are observed.",
    requirements: [
      "For [0,2,5,5,9] and span 5 return [1,2,2,3,3]; span 3 returns [1,2,1,2,1]. Empty input returns [].",
      "Keep source order and timestamps unchanged. Input timestamps are finite and nondecreasing; span is positive.",
      "Advance a left boundary instead of rescanning every prefix. Checks bound timestamp reads on 5,000 events; this operation-count check is not a frame-rate benchmark.",
    ],
    starter: `import {useState} from 'react';
export function windowCounts(times:readonly number[],span:number){return times.map((_,index)=>index+1);}
${windowView}`,
    solution: `import {useState} from 'react';
export function windowCounts(times:readonly number[],span:number){
 const counts:number[]=[];let left=0;
 for(let right=0;right<times.length;right++){
  const time=times[right];
  while(left<right&&times[left]<=time-span)left++;
  counts.push(right-left+1);
 }
 return counts;
}
${windowView}`,
    checks: [
      {
        name: "Trailing counts exclude the left boundary and include observed duplicates",
        script: `equal(Array.from(document.querySelectorAll('[data-count]')).map(n=>n.getAttribute('data-count')).join(','),'1,2,2,3,3');equal(text('output'),'3');`,
      },
      {
        name: "Changing the window recomputes the chart without changing events",
        script: `await click('Window 3');equal(Array.from(document.querySelectorAll('[data-count]')).map(n=>n.getAttribute('data-count')).join(','),'1,2,1,2,1');equal(text('output'),'2');await click('Window 5');equal(text('output'),'3');`,
      },
    ],
    hints: [
      "Sorted time lets the left edge move in only one direction.",
      "At the exact cutoff, an event leaves this open-left interval.",
      "Move left while times[left] <= time − span; each event enters and leaves once.",
    ],
    explanation:
      "Two monotonic pointers process a sorted stream with a linear number of timestamp visits, plus a result array. Rescanning every prefix can become quadratic. Input ordering and interval inclusivity are preconditions, not details to guess. Browser chart rendering and real streaming retention are separate costs.",
    rubric: [
      "State the interval and sorted-input precondition.",
      "Explain why each pointer advances at most n times.",
      "Separate algorithm reads, retained memory, and rendering performance.",
    ],
    followUp:
      "How would late-arriving events, a bounded live buffer, and a changeable time window affect ordering, eviction, and whether incremental results remain valid?",
    resource: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections",
  },
  {
    id: "timeline-seek",
    title: "Seek the next transcript cue with binary search",
    summary: "Build a timeline control that finds the next cue at or after a chosen time.",
    level: "Hard",
    minutes: 35,
    tags: ["DSA", "Binary search", "Lower bound", "Media", "Boundaries"],
    brief:
      "A transcript navigator needs the first cue at or after its playhead. Implement lowerBound on sorted timestamps: return an insertion index in [0,length]. Duplicate cue times must resolve to the first duplicate. The small UI reports absence or invalid input explicitly.",
    requirements: [
      "For [0,5,5,9], targets 5, 6, and 10 return indexes 1, 3, and 4; before-start targets return 0.",
      "Empty input returns 0. Preserve timestamps; use a shrinking half-open search interval.",
      "Checks allow at most 18 indexed timestamp reads over 65,536 cues. Explain why this bounds search work without measuring wall-clock speed.",
    ],
    starter: `import {useState} from 'react';
export function lowerBound(times:readonly number[],target:number){const index=times.indexOf(target);return index<0?times.length:index;}
${seekView}`,
    solution: `import {useState} from 'react';
export function lowerBound(times:readonly number[],target:number){
 let lo=0,hi=times.length;
 while(lo<hi){const mid=lo+Math.floor((hi-lo)/2);if(times[mid]<target)lo=mid+1;else hi=mid;}
 return lo;
}
${seekView}`,
    checks: [
      {
        name: "Exact duplicates and between-cue seeks choose the first eligible cue",
        script: `equal(text('output'),'Cue 1 at 5s');await input('input','6');equal(text('output'),'Cue 3 at 9s');await input('input','-1');equal(text('output'),'Cue 0 at 0s');`,
      },
      {
        name: "Past-end and invalid queries have recoverable feedback",
        script: `await input('input','10');equal(text('output'),'No later cue');await input('input','');equal(text('output'),'Enter a finite time');await input('input','5');equal(text('output'),'Cue 1 at 5s');`,
      },
    ],
    hints: [
      "Finding any equal value is weaker than finding the first eligible value.",
      "Keep the answer inside a half-open interval with hi initially equal to length.",
      "If mid is below target move lo past it; otherwise retain mid as a candidate by moving hi.",
    ],
    explanation:
      "Lower bound finds the boundary between timestamps below target and timestamps at least target. Halving the candidate interval bounds indexed reads logarithmically. The insertion index can equal length and must not be dereferenced as an existing cue. Sorted data is required; sorting on every seek would add a separate cost.",
    rubric: [
      "State the loop invariant and half-open bounds.",
      "Handle duplicates, empty input, and insertion at end.",
      "Explain logarithmic reads and the sorted-data prerequisite.",
    ],
    followUp:
      "How would you preserve the active cue when new timestamps arrive, and when would a maintained ordered index justify its update cost?",
    resource: "https://courses.cis.cornell.edu/courses/cs2110/2026fa/lectures/lec05/",
  },
  {
    id: "comment-tree",
    title: "Turn flat replies into an expandable comment outline",
    summary: "Build a threaded comment view with nested replies and collapsible branches.",
    level: "Hard",
    minutes: 40,
    tags: ["DSA", "Trees", "DFS", "Map", "Hierarchy"],
    brief:
      "Comment records arrive as a flat list with parent ids. Build an adjacency index, then walk expanded branches depth-first. The fixture has unique ids and no cycles; records with missing parents become roots. Render reply depth in text and indentation without pretending this outline is a complete ARIA tree widget.",
    requirements: [
      "visibleComments returns {id,title,depth} in pre-order, preserving source order among siblings and roots.",
      "Closed parents hide every descendant. Opening intro then reply reveals Intro, Reply, Detail, Orphan at depths 0,1,2,0.",
      "Orphans remain visible roots; empty input returns []. Preserve records and expansion state without repeatedly searching the whole collection for each node.",
    ],
    starter: `import {useState} from 'react';\n${commentsFixture}
export function visibleComments(items:readonly Comment[],expanded:ReadonlySet<string>){return items.map(item=>({id:item.id,title:item.title,depth:0}));}
${commentsView}`,
    solution: `import {useState} from 'react';\n${commentsFixture}
export function visibleComments(items:readonly Comment[],expanded:ReadonlySet<string>){
 const ids=new Set(items.map(item=>item.id)),children=new Map<string,Comment[]>(),roots:Comment[]=[];
 for(const item of items){if(item.parentId===null||!ids.has(item.parentId))roots.push(item);else {const siblings=children.get(item.parentId)??[];siblings.push(item);children.set(item.parentId,siblings);}}
 const rows:Array<{id:string;title:string;depth:number}>=[],stack=roots.toReversed().map(item=>({item,depth:0}));
 while(stack.length){const entry=stack.pop();if(!entry)break;const {item,depth}=entry;rows.push({id:item.id,title:item.title,depth});if(expanded.has(item.id)){const replies=children.get(item.id)??[];for(let i=replies.length-1;i>=0;i--)stack.push({item:replies[i],depth:depth+1});}}
 return rows;
}
${commentsView}`,
    checks: [
      {
        name: "Closed branches hide descendants but keep orphan roots",
        script: `equal(Array.from(document.querySelectorAll('[data-id]')).map(n=>n.getAttribute('data-id')).join(','),'intro,orphan');equal(text('output'),'2');`,
      },
      {
        name: "Depth-first expansion and ancestor collapse preserve the tree",
        script: `await click('Toggle intro');await click('Toggle reply');equal(Array.from(document.querySelectorAll('[data-id]')).map(n=>n.getAttribute('data-id')).join(','),'intro,reply,detail,orphan');equal(find('[data-id="detail"]').getAttribute('data-depth'),'2');await click('Toggle intro');equal(text('output'),'2');await click('Toggle intro');equal(text('output'),'4');`,
      },
    ],
    hints: [
      "Build parent-to-children relationships once before walking.",
      "Only visit descendants when their parent is expanded.",
      "An explicit stack gives pre-order traversal; push siblings in reverse to preserve source order.",
    ],
    explanation:
      "A flat API shape and a hierarchical UI need a translation. An adjacency index avoids rescanning all records at every node, while iterative DFS avoids depending on the JavaScript recursion stack. The fixture contract excludes cycles and duplicate ids; production data needs an explicit validation policy. The visible outline is not a full tree-view accessibility abstraction.",
    rubric: [
      "Separate adjacency construction from traversal.",
      "Explain depth-first order and ancestor visibility.",
      "State orphan, cycle, and identity assumptions.",
    ],
    followUp:
      "How would lazy replies, deleted parents, cycles, and keyboard tree navigation change validation, loading, and focus ownership?",
    resource:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map",
  },
  {
    id: "command-history",
    title: "Prototype Back and Forward with two stacks",
    summary: "Build page navigation with Back, Forward, and predictable history branching.",
    level: "Hard",
    minutes: 35,
    tags: ["DSA", "Stacks", "History", "slice", "State transitions"],
    brief:
      "A local prototype models page navigation with a back stack, current page, and forward stack. Implement navigate as a pure transition. Visiting after Back abandons the forward branch; visiting the current page creates no new entry. This exercise does not implement actual browser history.",
    requirements: [
      "Back and Forward move between Home, Guide, API, and Examples; unavailable directions are disabled and no-ops.",
      "A visit pushes the previous page onto Back and clears Forward. Repeating the current page is a no-op.",
      "Do not mutate state or its arrays. Explain LIFO ordering and the cost of immutable array copies.",
    ],
    starter: `import {useState} from 'react';\n${navigationTypes}
export function navigate(state:NavState,action:NavAction):NavState{if(action.type==='visit'){if(action.page===state.current)return state;return {back:[...state.back,state.current],current:action.page,forward:state.forward};}${navigationTail}}
${navigationView}`,
    solution: `import {useState} from 'react';\n${navigationTypes}
export function navigate(state:NavState,action:NavAction):NavState{
 if(action.type==='visit'){if(action.page===state.current)return state;return {back:[...state.back,state.current],current:action.page,forward:[]};}
 ${navigationTail}
}
${navigationView}`,
    checks: [
      {
        name: "Back and Forward use the most recently left page",
        script: `assert(Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Back').disabled,'No initial past');await click('Guide');await click('API');await click('Back');equal(text('[aria-label="Page"]'),'Guide');await click('Back');equal(text('[aria-label="Page"]'),'Home');await click('Forward');equal(text('[aria-label="Page"]'),'Guide');`,
      },
      {
        name: "New visits discard forward branches without duplicate current entries",
        script: `await click('Guide');await click('API');await click('Back');await click('Examples');equal(text('[aria-label="Forward depth"]'),'0');await click('Forward');equal(text('[aria-label="Page"]'),'Examples');const depth=text('[aria-label="Back depth"]');await click('Examples');equal(text('[aria-label="Back depth"]'),depth);`,
      },
    ],
    hints: [
      "Each stack's last item is the next one to restore.",
      "Moving backward pushes the current page onto the forward stack.",
      "A fresh visit creates a new branch, so its forward stack must be empty.",
    ],
    explanation:
      "Two stacks model navigation around a current entry. Branching invalidates the abandoned future. slice copies a range while splice edits its receiver. Immutable state makes transitions testable and preserves React ownership, but copying arrays costs work proportional to retained history; do not claim constant-time transitions from the abstract stack operations alone.",
    rubric: [
      "Explain both stacks' top and direction.",
      "Define new-visit and repeated-visit policies.",
      "Separate abstract stack costs from immutable representation costs.",
    ],
    followUp:
      "How would bounded history, per-page scroll restoration, and real URL navigation change this model and its ownership?",
    resource:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice",
  },
  {
    id: "dependency-planner",
    title: "Plan a release without violating dependencies",
    summary: "Build a release planner that respects prerequisites and identifies blocked work.",
    level: "Very hard",
    minutes: 50,
    tags: ["DSA", "Graphs", "Topological sort", "Queue", "Dependencies"],
    brief:
      "A release planner orders design-system tasks by prerequisites. Implement planRelease with indegrees and a ready queue. Duplicate dependency names count once. Return independent schedulable work even when another branch is cyclic or names a missing prerequisite.",
    requirements: [
      "Return {order:string[],blocked:string[]}. Initially ready tasks enter a FIFO queue in input order; newly ready dependents enter in input order.",
      "The valid fixture schedules tokens,button,docs,form. Introduce cycle schedules tokens,docs and blocks button,form. Missing dependency blocks deploy and notify while retaining the valid base plan.",
      "Blocked means unresolved, including cycle descendants and missing prerequisites; it does not identify exact cycle membership. Preserve inputs. Task ids are unique; empty input is valid.",
    ],
    starter: `import {useState} from 'react';\n${releaseFixture}
export function planRelease(tasks:readonly Task[]){return {order:tasks.map(task=>task.id),blocked:[] as string[]};}
${releaseView}`,
    solution: `import {useState} from 'react';\n${releaseFixture}
export function planRelease(tasks:readonly Task[]){
 const indegree=new Map(tasks.map(task=>[task.id,new Set(task.dependsOn).size])),dependents=new Map<string,string[]>();
 for(const task of tasks)for(const parent of new Set(task.dependsOn)){const children=dependents.get(parent)??[];children.push(task.id);dependents.set(parent,children);}
 const queue=tasks.filter(task=>indegree.get(task.id)===0).map(task=>task.id),order:string[]=[];
 for(let head=0;head<queue.length;head++){const id=queue[head];order.push(id);for(const child of dependents.get(id)??[]){const next=(indegree.get(child)??0)-1;indegree.set(child,next);if(next===0)queue.push(child);}}
 return {order,blocked:tasks.filter(task=>(indegree.get(task.id)??0)>0).map(task=>task.id)};
}
${releaseView}`,
    checks: [
      {
        name: "Valid dependencies produce a deterministic topological order",
        script: `equal(text('ol'),'tokensbuttondocsform');equal(text('output'),'None');equal(text('[role="status"]'),'Ready to release');`,
      },
      {
        name: "Cycles retain independent work and report unresolved tasks",
        script: `await click('Introduce cycle');equal(text('ol'),'tokensdocs');equal(text('output'),'button,form');equal(text('[role="status"]'),'Some tasks have unresolved dependencies');await click('Valid dependencies');equal(text('output'),'None');`,
      },
      {
        name: "Missing prerequisites also block their descendants",
        script: `await click('Missing dependency');equal(text('ol'),'tokensbuttondocsform');equal(text('output'),'deploy,notify');`,
      },
    ],
    hints: [
      "A task becomes ready when every distinct prerequisite has completed.",
      "Count outstanding prerequisites and index their dependents.",
      "Use a FIFO queue with a moving head; leftover positive indegrees identify unresolved work, not necessarily only cycle members.",
    ],
    explanation:
      "Kahn-style topological scheduling visits tasks and dependency edges using indexed adjacency and an indegree count. A queue head avoids repeatedly shifting an array. Let D count supplied dependency entries, including duplicates, and E count distinct edges. Under the usual indexed-access model preprocessing costs O(V+D), traversal costs O(V+E), and storage is O(V+E). Missing prerequisites never complete, so their dependents remain blocked. Exact cycle diagnosis requires additional graph analysis.",
    rubric: [
      "Explain indegrees, adjacency, and ready-queue policy.",
      "Distinguish unresolved tasks from exact cycle membership.",
      "Account for supplied entries, distinct edges, queue operations, and input immutability.",
    ],
    followUp:
      "How would task durations, bounded parallelism, incremental dependency edits, and a concrete cycle path change the scheduling and diagnostic algorithms?",
    resource:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map",
  },
];

const functionChecks: Record<string, Check> = {
  "product-projection": {
    name: "Transformation also handles independent frozen input",
    script: `const item=Object.freeze({id:'x',name:'Cup',cents:105});const result=exercise.projectProducts(Object.freeze([item]));equal(result[0].id,'x');equal(result[0].label,'Cup — 1.05');equal(item.cents,105);equal(exercise.projectProducts([]).length,0);`,
  },
  "stock-availability": {
    name: "Quantifiers handle all, none, and empty collections",
    script: `const empty=exercise.stockSummary([]);equal(empty.available.length,0);equal(empty.any,false);equal(empty.all,true);const all=exercise.stockSummary([{id:'x',stock:1}]);equal(all.any,true);equal(all.all,true);const none=exercise.stockSummary([{id:'x',stock:0}]);equal(none.any,false);equal(none.all,false);`,
  },
  "cart-lookup": {
    name: "Lookup returns the first matching object or explicit absence",
    script: `const first=Object.freeze({id:'x',name:'First',cents:1}),second=Object.freeze({id:'x',name:'Second',cents:2});equal(exercise.lookupProduct(Object.freeze([first,second]),'x'),first);equal(exercise.lookupProduct([first],'missing'),null);equal(exercise.lookupProduct([],'x'),null);`,
  },
  "sales-summary": {
    name: "Independent categories and empty input aggregate safely",
    script: `const item=Object.freeze({category:'__proto__',quantity:2,cents:100});const result=exercise.summarizeSales(Object.freeze([item]));equal(result.units,2);equal(result.cents,200);equal(result.byCategory['__proto__'],2);const empty=exercise.summarizeSales([]);equal(empty.units,0);equal(empty.cents,0);equal(Object.keys(empty.byCategory).length,0);`,
  },
  "merge-feed-pages": {
    name: "Merge preserves frozen inputs and latest payload within one page",
    script: `const first=Object.freeze({id:'a',name:'A'}),latest=Object.freeze({id:'a',name:'Latest'});const previous=Object.freeze([first]);const result=exercise.mergePages(previous,Object.freeze([latest,latest]));equal(result.length,1);equal(result[0].name,'Latest');equal(previous[0],first);equal(first.name,'A');equal(exercise.mergePages([],[]).length,0);`,
  },
  "rank-products": {
    name: "Independent frozen data keeps numeric ties and source order",
    script: `const items=Object.freeze([Object.freeze({id:'c',cents:20}),Object.freeze({id:'b',cents:3}),Object.freeze({id:'a',cents:3})]);equal(exercise.rankProducts(items,false).map(x=>x.id).join(','),'a,b,c');equal(exercise.rankProducts(items,true).map(x=>x.id).join(','),'c,a,b');equal(items.map(x=>x.id).join(','),'c,b,a');equal(exercise.rankProducts([],false).length,0);`,
  },
  "tag-facets": {
    name: "Independent tag arrays deduplicate at the product boundary",
    script: `const tags=Object.freeze(['x','x']),items=Object.freeze([Object.freeze({tags}),Object.freeze({tags:['x','y']})]);equal(exercise.tagCounts(items).map(x=>x.tag+':'+x.count).join(','),'x:2,y:1');equal(tags.length,2);equal(exercise.tagCounts([]).length,0);`,
  },
  "activity-window": {
    name: "Large streams stay within a linear timestamp-read budget",
    script: `let reads=0;const times=new Proxy(Object.freeze(Array.from({length:5000},(_,i)=>i)),{get(target,key,receiver){if(typeof key==='string'&&Number.isInteger(Number(key))){reads++;if(reads>25000)throw new Error('Timestamp-read budget exceeded');}return Reflect.get(target,key,receiver);}});const counts=exercise.windowCounts(times,100);equal(counts.length,5000);equal(counts[4999],100);assert(reads<=25000,'Process the sorted stream in a linear number of timestamp reads');equal(exercise.windowCounts([],5).length,0);`,
  },
  "timeline-seek": {
    name: "Large timelines stay within a logarithmic timestamp-read budget",
    script: `let reads=0;const times=new Proxy(Object.freeze(Array.from({length:65536},(_,i)=>i*2)),{get(target,key,receiver){if(typeof key==='string'&&Number.isInteger(Number(key))){reads++;if(reads>18)throw new Error('Timestamp-read budget exceeded');}return Reflect.get(target,key,receiver);}});equal(exercise.lowerBound(times,99999),50000);assert(reads<=18,'Use a logarithmically bounded search, not a full scan');equal(exercise.lowerBound([],5),0);equal(exercise.lowerBound([0,5,5,9],5),1);`,
  },
  "comment-tree": {
    name: "Independent tree keeps orphan roots and ancestor visibility",
    script: `const items=Object.freeze([{id:'a',title:'A',parentId:null},{id:'b',title:'B',parentId:'a'},{id:'c',title:'C',parentId:'b'},{id:'d',title:'D',parentId:'missing'}].map(item=>Object.freeze(item)));equal(exercise.visibleComments(items,new Set()).map(x=>x.id).join(','),'a,d');equal(exercise.visibleComments(items,new Set(['a','b'])).map(x=>x.id+':'+x.depth).join(','),'a:0,b:1,c:2,d:0');equal(exercise.visibleComments([],new Set()).length,0);`,
  },
  "command-history": {
    name: "History transitions preserve immutable inputs and abandon future branches",
    script: `const state=Object.freeze({back:Object.freeze(['Home']),current:'Guide',forward:Object.freeze(['API'])});const next=exercise.navigate(state,{type:'visit',page:'Examples'});equal(next.current,'Examples');equal(next.back.join(','),'Home,Guide');equal(next.forward.length,0);equal(state.forward.join(','),'API');const empty={back:[],current:'Home',forward:[]};equal(exercise.navigate(empty,{type:'back'}).current,'Home');`,
  },
  "dependency-planner": {
    name: "Graph diagnostics distinguish unresolved descendants from independent work",
    script: `const tasks=Object.freeze([{id:'a',dependsOn:['b']},{id:'b',dependsOn:['a']},{id:'c',dependsOn:['b']},{id:'docs',dependsOn:[]}].map(item=>Object.freeze({...item,dependsOn:Object.freeze(item.dependsOn)})));const cycle=exercise.planRelease(tasks);equal(cycle.order.join(','),'docs');equal(cycle.blocked.join(','),'a,b,c');const missing=exercise.planRelease([{id:'deploy',dependsOn:['unknown']},{id:'notify',dependsOn:['deploy']}]);equal(missing.blocked.join(','),'deploy,notify');equal(exercise.planRelease([]).order.length,0);`,
  },
};

export const algorithmPractice: Challenge[] = exercises.map((exercise) => {
  const check = functionChecks[exercise.id];
  if (!check) throw new Error(`Missing algorithm check: ${exercise.id}`);
  return {
    ...exercise,
    track: "algorithms",
    requirements: [
      ...exercise.requirements,
      "Keep the named algorithm exported from App.tsx; re-export it if moved. Checks call it with independent inputs and test the UI.",
    ],
    checks: [...exercise.checks, check],
  };
});

export const algorithmBuildFixtures: Record<string, string> = {
  "product-projection": `${productsFixture}\nexport type { Product }; export { products };`,
  "stock-availability": `${stockFixture}\nexport type { Stock }; export { stock };`,
  "cart-lookup": `${productsFixture}\nexport type { Product }; export { products };`,
  "sales-summary": `${salesFixture}\nexport type { Sale }; export { sales };`,
  "merge-feed-pages": `${mergeFixture}\nexport type { Item }; export { first, second };`,
  "rank-products": `${rankFixture}\nexport type { Ranked }; export { ranked };`,
  "tag-facets": `${tagFixture}\nexport type { Tagged }; export { tagged };`,
  "activity-window": "export const times = [0, 2, 5, 5, 9];",
  "timeline-seek": "export const times = [0, 5, 5, 9];",
  "comment-tree": `${commentsFixture}\nexport type { Comment }; export { comments };`,
  "command-history": `${navigationTypes}\nexport type { NavState, NavAction };`,
  "dependency-planner": `${releaseFixture}\nexport type { Task }; export { base };`,
};
