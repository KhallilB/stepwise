import type { BuildBrief } from "./types";

type BuildDefinition = BuildBrief & { goal: string; constraints: string[] };

export const buildBriefs: Record<string, BuildDefinition> = {
  "product-projection": {
    goal: "Build a catalog that turns product records into readable price cards. Prices arrive as integer cents; people should see whole currency amounts with two decimals and be able to inspect an empty collection.",
    inputs:
      "fixtures.ts supplies products: tea / Tea / 1250 cents and coffee / Coffee / 300 cents. Each record has id, name, and cents.",
    initialUi:
      "Show Tea and Coffee cards in fixture order, an output with count 2, and a Toggle empty button. This is the UI to build; the editor starts empty.",
    constraints: [
      "Return one id/label record per product, preserving ids and order. Do not change input records. Empty input returns no cards. Two decimal places are the exercise contract, not locale-aware pricing.",
    ],
    examples: [
      {
        title: "Display the supplied catalog",
        input: "Tea costs 1250 cents; Coffee costs 300 cents.",
        action: "Open the completed catalog with the supplied records.",
        expected: "Cards read Tea — 12.50 and Coffee — 3.00, in that order. The count is 2.",
      },
      {
        title: "Show an empty collection",
        input: "The two supplied products are currently visible.",
        action: "Activate Toggle empty once.",
        expected: "The product list has no cards and the count reads 0.",
      },
      {
        title: "Restore the original cards",
        input: "The collection is empty after toggling it.",
        action: "Activate Toggle empty again.",
        expected:
          "Tea — 12.50 and Coffee — 3.00 return in their original order, with count 2 and unchanged source records.",
      },
    ],
  },
  "stock-availability": {
    goal: "Build a stock panel that distinguishes products available now, whether any product is available, and whether all products are available. Make the empty-collection result understandable.",
    inputs:
      "fixtures.ts supplies stock records tea with stock 2 and coffee with stock 0. A record is available only when stock is greater than zero.",
    initialUi:
      "Outputs named Available, Any available, and All available show tea, true, and false. A Toggle empty button clears or restores the supplied collection.",
    constraints: [
      "Return available ids in source order without changing records. For an empty collection return no ids, any=false, and all=true. Explain visibly that this logical all-result does not authorize an empty order.",
    ],
    examples: [
      {
        title: "Distinguish mixed availability",
        input: "Tea has stock 2 and Coffee has stock 0.",
        action: "Open the panel with the supplied records.",
        expected: "Available reads tea; Any available reads true; All available reads false.",
      },
      {
        title: "Explain an empty collection",
        input: "The supplied stock collection is visible.",
        action: "Activate Toggle empty.",
        expected:
          "Available reads None; Any available is false; All available is true, with the empty-order explanation still visible.",
      },
      {
        title: "Recover the stock summary",
        input: "The current collection is empty.",
        action: "Activate Toggle empty again.",
        expected:
          "The original tea / true / false summary returns without altering either stock record.",
      },
    ],
  },
  "cart-lookup": {
    goal: "Build a product inspector whose editable id query shows a matching product or an explicit missing result. A failed lookup must never show an unrelated product.",
    inputs:
      "fixtures.ts supplies Tea with id tea and Coffee with id coffee. Product id is the query field; its initial text is tea.",
    initialUi:
      "Show the labelled Product id input and one output containing Tea. Changes to the query update that output immediately.",
    constraints: [
      "Match ids exactly. Return the first matching original record, or null for missing/empty input. Do not change or clone the matching record.",
    ],
    examples: [
      {
        title: "Inspect an existing product",
        input: "Product id is coffee.",
        action: "Type coffee into Product id.",
        expected: "The output reads Coffee and the query remains editable.",
      },
      {
        title: "Report a missing product",
        input: "Product id is missing.",
        action: "Type missing into Product id.",
        expected: "The output reads Product not found; Tea is not substituted.",
      },
      {
        title: "Clear and recover the query",
        input: "The previous query did not match a product.",
        action: "Clear Product id, then type tea.",
        expected: "The blank query shows Product not found. Entering tea restores Tea.",
      },
    ],
  },
  "sales-summary": {
    goal: "Build a sales dashboard that reports units sold, revenue, and units by category from sale records. Keep empty results useful and amounts consistent.",
    inputs:
      "fixtures.ts supplies Books: quantity 2 at 1250 cents each; Tools: quantity 1 at 300 cents; Books: quantity 1 at 500 cents. Each cents value is a per-unit price.",
    initialUi:
      "Outputs named Units and Revenue read 4 and 33.00. A category list reads Books: 3 then Tools: 1. Include Toggle empty.",
    constraints: [
      "Revenue is returned in integer cents and displayed in whole currency units with two decimals. Repeated categories accumulate quantities. Preserve records, support arbitrary category names including __proto__, and return zero totals plus no categories for empty input.",
    ],
    examples: [
      {
        title: "Summarize the supplied sales",
        input: "The three supplied records contain four units in Books and Tools.",
        action: "Open the dashboard with those records.",
        expected:
          "Units is 4; Revenue is 33.00; categories are Books: 3 and Tools: 1 in first-seen order.",
      },
      {
        title: "Show zero sales",
        input: "The dashboard currently shows the supplied sales.",
        action: "Activate Toggle empty.",
        expected: "Units is 0, Revenue is 0.00, and the category list is empty.",
      },
      {
        title: "Restore the sales totals",
        input: "The current sales collection is empty.",
        action: "Activate Toggle empty again.",
        expected:
          "The original 4 units, 33.00 revenue, and category totals return without changing the source records.",
      },
    ],
  },
  "merge-feed-pages": {
    goal: "Build an activity feed that accepts overlapping pages without duplicate rows. Newer information should update an existing item while its first-seen position remains stable.",
    inputs:
      "fixtures.ts exports first: a named Old, b named B; and second: a named New, c named C. Records have id and name.",
    initialUi:
      "Show the first page as Old then B, with count 2. Include Load next page and Reset feed controls.",
    constraints: [
      "Use the latest payload for an id, including repeats within a page. Preserve first-seen id order and both input arrays. Repeated loads are idempotent; empty pages are valid.",
    ],
    examples: [
      {
        title: "Show the first page",
        input: "The first page contains a:Old and b:B.",
        action: "Open the completed feed.",
        expected: "Rows have ids a,b and display Old,B. The count is 2.",
      },
      {
        title: "Reconcile an overlapping page",
        input: "The visible page is a:Old,b:B; the next page is a:New,c:C.",
        action: "Activate Load next page.",
        expected: "Rows are a:New,b:B,c:C, in that order. The count is 3 and a appears once.",
      },
      {
        title: "Repeat a load and reset",
        input: "The merged feed already has three records.",
        action: "Load the same next page twice more, then activate Reset feed.",
        expected: "Repeated loads keep three rows. Reset restores a:Old,b:B and count 2.",
      },
    ],
  },
  "rank-products": {
    goal: "Build a price comparison view with reversible numeric ordering. Equal-price records need a predictable order, and sorting the view must leave the shared catalog unchanged.",
    inputs:
      "fixtures.ts exports ranked in source order z at 1200 cents, b at 300 cents, and a at 300 cents. Equal-price ties use ASCII id order ascending in either direction.",
    initialUi:
      "Show ascending results a,b,z, a Descending toggle, and an output with the unchanged source order z,b,a.",
    constraints: [
      "Return a new ordered array without changing input records or source order. Compare numeric prices; preserve the same ascending id tie-break in both directions. Empty input is valid.",
    ],
    examples: [
      {
        title: "Start with ascending prices",
        input: "Source ids are z,b,a with prices 1200,300,300 cents.",
        action: "Open the comparison view.",
        expected: "Displayed ids are a,b,z. The separate source-order output still reads z,b,a.",
      },
      {
        title: "Reverse price direction",
        input: "The ascending view is visible.",
        action: "Activate Descending.",
        expected: "Displayed ids become z,a,b: the tied low-price records still put a before b.",
      },
      {
        title: "Restore direction without source mutation",
        input: "The view is descending.",
        action: "Activate Descending again, repeating the toggle if useful.",
        expected:
          "Ascending order a,b,z returns. The source output remains z,b,a through every change.",
      },
    ],
  },
  "tag-facets": {
    goal: "Build product tag counts that stay correct when the visible product collection changes. Count products carrying a tag, rather than counting repeated spellings inside one product.",
    inputs:
      "fixtures.ts exports three tagged products: tags react,react,css; tags css; and no tags. A repeated tag within one product contributes only once.",
    initialUi:
      "Show css: 2 then react: 1, a product count of 3, and React only plus Toggle empty controls.",
    constraints: [
      "Return tag/count records in alphabetical tag order. Do not change tag arrays. Counts reflect the current product collection; empty input has no tags.",
    ],
    examples: [
      {
        title: "Count products per tag",
        input: "The supplied three products include a repeated react tag.",
        action: "Open the facet view.",
        expected: "css: 2 and react: 1 appear in alphabetical order; product count is 3.",
      },
      {
        title: "Narrow the visible products",
        input: "All three supplied products are visible.",
        action: "Activate React only.",
        expected:
          "One product remains; css: 1 and react: 1 are shown. Turning the filter off restores css: 2.",
      },
      {
        title: "Empty and restore the filtered view",
        input: "React only is enabled and one product is visible.",
        action: "Activate Toggle empty, then activate it again.",
        expected:
          "The empty view has no tags and count 0. Restoration keeps React only enabled and returns count 1 with both tag counts at 1.",
      },
    ],
  },
  "activity-window": {
    goal: "Build a traffic-history view that reports how many observed events belong to the selected trailing time window, including clear treatment of repeated timestamps.",
    inputs:
      "fixtures.ts supplies event times 0,2,5,5,9 seconds in observed order. Window choices are 5 seconds initially and 3 seconds.",
    initialUi:
      "Show one count per event, peak count 3, and Window 3 and Window 5 controls. Each event row exposes its count through data-count.",
    constraints: [
      "For an event at t, count observed timestamps greater than t minus span and at most t. Do not include later events, even with equal timestamps. Inputs are finite, nondecreasing, and unchanged; span is positive; empty input returns no counts. The 5,000-event check allows at most 25,000 indexed reads.",
    ],
    examples: [
      {
        title: "Inspect the five-second window",
        input: "Times are 0,2,5,5,9 and span is 5 seconds.",
        action: "Open the traffic view.",
        expected: "Event counts are 1,2,2,3,3 and peak is 3.",
      },
      {
        title: "Choose a shorter window",
        input: "The same event times remain selected.",
        action: "Activate Window 3.",
        expected:
          "Counts become 1,2,1,2,1 and peak becomes 2. Window 5 restores the original counts.",
      },
      {
        title: "Distinguish equal-time observations",
        input: "The third and fourth observed events both occur at 5 seconds, with span 5.",
        action: "Inspect those consecutive event rows.",
        expected:
          "Their counts are 2 then 3. The earlier row does not count the later event merely because their timestamps match.",
      },
    ],
  },
  "timeline-seek": {
    goal: "Build a transcript navigator that finds the first cue at or after an editable playhead. Make missing cues and invalid text explicit instead of pointing at an unrelated cue.",
    inputs:
      "fixtures.ts supplies cue times 0,5,5,9 seconds. Playhead starts at 5. The lookup returns an insertion index from 0 through the collection length.",
    initialUi:
      "Show a labelled Playhead input containing 5 and one output reading Cue 1 at 5s. Duplicate times choose the first duplicate.",
    constraints: [
      "Return the first index whose timestamp is at least the target, or length if no cue qualifies. Empty input returns 0. Preserve timestamps. The 65,536-cue check allows at most 18 indexed reads.",
    ],
    examples: [
      {
        title: "Choose the first duplicate cue",
        input: "Cue times are 0,5,5,9 and Playhead is 5.",
        action: "Open the navigator.",
        expected: "The output reads Cue 1 at 5s, using the first of the two cues at 5 seconds.",
      },
      {
        title: "Seek between cue times",
        input: "The supplied cue times remain unchanged.",
        action: "Enter 6, then -1, in Playhead.",
        expected: "6 shows Cue 3 at 9s. -1 shows Cue 0 at 0s.",
      },
      {
        title: "Recover from missing or invalid input",
        input: "The navigator is showing a valid cue.",
        action: "Enter 10, clear Playhead, then enter 5 again.",
        expected:
          "10 shows No later cue; blank text shows Enter a finite time; 5 restores Cue 1 at 5s.",
      },
    ],
  },
  "comment-tree": {
    goal: "Build a collapsible comment outline from flat comment records. Readers should see only replies whose ancestors are expanded, with reply depth communicated in text as well as spacing.",
    inputs:
      "fixtures.ts supplies intro as a root, reply under intro, detail under reply, and orphan whose parent id is missing. Ids are unique and the input has no cycles.",
    initialUi:
      "Start with no branches expanded. Show intro and orphan at depth 0, with visible count 2. Branch controls read Toggle <id> and expose their expanded state.",
    constraints: [
      "Missing-parent comments appear as roots. Preserve source sibling order and inputs. Each visible row exposes data-id and data-depth. Expanding/collapsing an ancestor retains descendant expansion choices. This is an outline, not a complete ARIA tree widget.",
    ],
    examples: [
      {
        title: "Show roots and an orphan",
        input: "The supplied outline has four records and no expanded branches.",
        action: "Open the outline.",
        expected: "Visible ids are intro,orphan, both at depth 0. Visible count is 2.",
      },
      {
        title: "Reveal nested replies",
        input: "Only intro and orphan are currently visible.",
        action: "Activate Toggle intro, then Toggle reply.",
        expected:
          "Visible ids are intro,reply,detail,orphan. detail has depth 2 and the count is 4.",
      },
      {
        title: "Collapse without forgetting expansion",
        input: "intro and reply are both expanded.",
        action: "Collapse intro, then expand intro again.",
        expected:
          "Collapse shows only intro,orphan and count 2. Reopening restores all four rows, including detail.",
      },
    ],
  },
  "command-history": {
    goal: "Build navigation inside a local prototype with Back and Forward controls. New visits after going back should abandon the old forward branch without changing the browser URL.",
    inputs:
      "fixtures.ts supplies NavState and NavAction contract types. Available pages are Home, Guide, API, and Examples; visits are offered for Guide, API, and Examples.",
    initialUi:
      "Page reads Home; Back depth and Forward depth both read 0; Back and Forward are disabled. Show the three visit controls.",
    constraints: [
      "Return a new navigation state without changing the previous one. Visiting the current page adds no history entry. Back/Forward at an empty boundary leave the page unchanged. This is a local page model, not real browser routing.",
    ],
    examples: [
      {
        title: "Visit pages and go back",
        input: "The prototype starts on Home with no history.",
        action: "Visit Guide, visit API, then activate Back.",
        expected: "Page is Guide, Back depth is 1, and Forward depth is 1.",
      },
      {
        title: "Restore a forward visit",
        input: "Page is Guide, with Home behind it and API ahead.",
        action: "Activate Forward.",
        expected: "Page is API, Back depth is 2, and Forward depth is 0.",
      },
      {
        title: "Replace the abandoned future",
        input: "Go back from API to Guide.",
        action: "Visit Examples, then activate Examples once more.",
        expected:
          "Page is Examples and Forward depth is 0. Repeating the current visit does not increase Back depth.",
      },
    ],
  },
  "dependency-planner": {
    goal: "Build a release planner that schedules tasks after their prerequisites. Independent work should remain visible when other tasks have cyclic or missing dependencies.",
    inputs:
      "fixtures.ts supplies tokens with no prerequisites; button after tokens; form after button; and docs after tokens, in that input order.",
    initialUi:
      "Show ordered ids tokens,button,docs,form, a blocked output reading None, status Ready to release, and Valid dependencies, Introduce cycle, and Missing dependency controls.",
    constraints: [
      "Return ordered and unresolved ids without changing tasks. Duplicate prerequisite names count once; ids are unique; empty input is valid. Order tasks by when they become eligible, using input order for simultaneous eligibility. Blocked includes unresolved descendants and does not claim exact cycle membership.",
    ],
    examples: [
      {
        title: "Schedule the valid release",
        input: "The supplied four tasks have their original prerequisites.",
        action: "Activate Valid dependencies.",
        expected:
          "The list is tokens,button,docs,form; blocked reads None; status is Ready to release.",
      },
      {
        title: "Keep independent work during a cycle",
        input: "button now depends on form while form still depends on button.",
        action: "Activate Introduce cycle.",
        expected:
          "The list is tokens,docs; blocked reads button,form; status says Some tasks have unresolved dependencies.",
      },
      {
        title: "Report missing prerequisites",
        input: "Add deploy after unknown and notify after deploy to the original valid tasks.",
        action: "Activate Missing dependency.",
        expected:
          "The original valid task order remains. Blocked reads deploy,notify and status reports unresolved dependencies.",
      },
    ],
  },
  "build-directory": {
    goal: "Build a people directory that supports useful search, combined filters, and reliable recovery when local asynchronous lookups arrive out of order. Each stage retains earlier behavior.",
    inputs:
      "fixtures.ts supplies Ada / Frontend, Grace / Platform, and Linus / Systems, plus the local loadPeople(query) service. No real network is used.",
    initialUi:
      "Show an empty Query input, a Results list containing all three people in source order, and Clear. The first stage is the search baseline.",
    constraints: [
      "Complete three cumulative stages in 35 minutes. People retain their ids and source data. Each unlocked stage adds observable behavior; earlier checks remain required.",
    ],
    examples: [
      {
        title: "Search and clear",
        stage: 0,
        input: "Query values ADA, nobody, then an empty query.",
        action: "Type ADA, then nobody, then activate Clear.",
        expected:
          "ADA shows Ada only. nobody shows No people found and no rows. Clear restores all three people and an empty query.",
      },
      {
        title: "Combine role and query",
        stage: 1,
        input: "The full collection is visible with an empty query.",
        action: "Enable Frontend only, search Grace, then disable Frontend only.",
        expected:
          "The filter initially shows Ada. With Grace plus Frontend only there are no matches. Disabling the role filter reveals Grace without losing the query.",
      },
      {
        title: "Recover after a failed search",
        stage: 2,
        input:
          "Ada lookups take 160ms, Grace lookups 20ms, and error rejects with Search unavailable.",
        action:
          "Search Ada then Grace quickly. After settling, search error and then activate Clear.",
        expected:
          "Grace remains the result despite the older Ada response. error shows an alert; Clear removes it and restores all people. Pending work shows Loading.",
      },
    ],
  },
  "build-board": {
    goal: "Build a compact task board with reliable task creation, a completion filter, reversible deletion, and a five-task capacity. Hidden tasks must keep their identity and work.",
    inputs:
      "There are no starter task records. Users supply task titles through New task. Examples use Alpha and Beta; capacity includes completed and hidden tasks.",
    initialUi:
      "Show an empty New task input, Add task, and an empty Tasks list. The learner creates every task interaction and all application state.",
    constraints: [
      "Complete three cumulative stages in 40 minutes. Keep task identity stable through every operation. Tasks cannot exceed five even through repeated actions.",
    ],
    examples: [
      {
        title: "Capture meaningful tasks",
        stage: 0,
        input: "Task titles are three spaces, then Alpha surrounded by spaces.",
        action: "Attempt to add the blank title, then add the padded Alpha title.",
        expected:
          "The blank title creates nothing. One task named Alpha is added with surrounding spaces removed.",
      },
      {
        title: "Filter without deleting tasks",
        stage: 1,
        input: "Tasks Alpha and Beta exist and are incomplete.",
        action: "Complete Alpha, enable Active only, then disable Active only.",
        expected:
          "Only Beta is visible while filtering. Turning filtering off restores both tasks and Alpha remains completed.",
      },
      {
        title: "Undo deletion within capacity",
        stage: 2,
        input: "Tasks Alpha and Beta exist in that order.",
        action:
          "Delete Alpha and use Undo last delete. Then reach five tasks and attempt another add.",
        expected:
          "Undo restores Alpha before Beta with its original identity. At five tasks Add task is disabled and a sixth task is never created.",
      },
    ],
  },
  "build-checkout": {
    goal: "Build a ticket checkout with bounded quantity, a recoverable discount flow, and deliberate retry after a local order failure. The exercise does not perform real payments.",
    inputs:
      "Tickets cost 12 whole currency units each. Quantity starts at 1 and is bounded to 1–5. fixtures.ts provides the local placeOrder() service.",
    initialUi:
      "Show Quantity 1, Total 12.00, and Add ticket / Remove ticket controls. Total always has exactly two decimal places.",
    constraints: [
      "Complete three cumulative stages in 40 minutes. Preserve quantity bounds, coherent displayed prices, and one order at a time. Use no external packages or network.",
    ],
    examples: [
      {
        title: "Keep quantity and price aligned",
        stage: 0,
        input: "Quantity is initially 1 and each ticket costs 12.",
        action: "Activate Remove ticket at the lower bound, then Add ticket.",
        expected:
          "The lower-bound action keeps Quantity 1. Adding changes Quantity to 2 and Total to 24.00.",
      },
      {
        title: "Apply and clear a discount",
        stage: 1,
        input: "Quantity is 1; Promo code accepts padded, case-insensitive SAVE10.",
        action: "Apply save10 with surrounding spaces, add a ticket, then apply bad.",
        expected:
          "Totals are 10.80, then 21.60. The invalid code clears the discount, shows Invalid promo, and returns Total to 24.00.",
      },
      {
        title: "Retry a rejected order",
        stage: 2,
        input: "The first placeOrder call rejects after 120ms; the second succeeds.",
        action: "Activate Place order; after the failure, activate Place order again.",
        expected:
          "Pending status is Placing order and price edits are disabled. The first attempt shows Checkout failed; the second reaches Order confirmed without overlapping writes.",
      },
    ],
  },
  "build-virtual-feed": {
    goal: "Build a searchable activity feed that remains navigable across 1,000 records while keeping rendered work bounded. Scroll positions and query changes must correspond to the actual matching records.",
    inputs:
      "fixtures.ts supplies events with ids 1–1000 and names Event 1 through Event 1000. The later fixed-height viewport is 160px high with 32px rows.",
    initialUi:
      "Show Query, an output named Result count reading 1000, and a Feed region beginning with Event 1. Each rendered row exposes its id through data-row.",
    constraints: [
      "Complete three cumulative stages in 40 minutes using React and browser APIs only. Fixed-height geometry and DOM limits are checked; these checks are not frame-rate or full accessibility benchmarks.",
    ],
    examples: [
      {
        title: "Filter and recover an empty feed",
        stage: 0,
        input: "Query values are Event 999, missing, then empty.",
        action: "Enter those queries in sequence.",
        expected:
          "Event 999 shows one matching row and count 1. missing shows No events and count 0. Clearing Query restores count 1000 and Event 1 first.",
      },
      {
        title: "Scroll a bounded set of rows",
        stage: 1,
        input: "All 1,000 records match; Feed is 160px high and rows are 32px.",
        action: "Scroll Feed to offset 16000px.",
        expected:
          "Event 501 is at the top of the viewport, at most 10 data-row elements are mounted, and the full scroll extent still represents at least 32000px.",
      },
      {
        title: "Jump and then change the query",
        stage: 2,
        input: "All records match and Feed can receive keyboard focus.",
        action: "Activate Jump to end, enter Event 999, then clear Query.",
        expected:
          "The jump reveals Event 1000. The new query resets scroll position to 0 and shows Event 999 alone; clearing returns to Event 1 at the start.",
      },
    ],
  },
  "build-async-registration": {
    goal: "Build a registration form that explains invalid usernames, keeps availability aligned with current input, and never labels a newer draft registered by an older response.",
    inputs:
      "Username starts blank and accepts trimmed ASCII letters with at least three characters. fixtures.ts provides checkName(name) and saveName(name); all requests are local.",
    initialUi:
      "Show Username and Register, with Registrations reading 0. Invalid submission should explain the problem without deleting the typed draft.",
    constraints: [
      "Complete three cumulative stages in 40 minutes. Preserve the service behavior and keep the input editable during asynchronous work. Only valid, currently available names may be submitted once that stage unlocks.",
    ],
    examples: [
      {
        title: "Explain invalid input",
        stage: 0,
        input: "Username is a1, then two spaces.",
        action: "Attempt Register for each invalid value.",
        expected:
          "An alert reads Enter at least 3 letters; Registrations stays 0 and the typed draft is preserved.",
      },
      {
        title: "Keep availability current",
        stage: 1,
        input: "ada is taken after 150ms; grace is available after 30ms.",
        action: "Enter ada and immediately replace it with grace.",
        expected:
          "Availability settles on Available for grace and is not replaced by the older Taken result. Invalidating the text resets availability to Unchecked.",
      },
      {
        title: "Preserve edits during registration",
        stage: 2,
        input: "grace has been checked Available; saving takes 100ms.",
        action: "Activate Register twice, then type linus while the request is pending.",
        expected:
          "Only one registration is sent. Username remains linus, Registrations becomes 1, and Submission does not claim that the current linus draft was registered.",
      },
    ],
  },
  "build-concurrent-stars": {
    goal: "Build independent star controls for people whose local saves may overlap. A failure for one person must not erase another person's successful action, including while rows are filtered out.",
    inputs:
      "Ada and Grace initially have no stars. fixtures.ts provides createStarService(), whose write(name, value) promises and calls counter model local transport only.",
    initialUi:
      "Show Star Ada and Star Grace with aria-pressed=false. Confirmed stars and Request count start at 0. Starting one person's request leaves the other interactive.",
    constraints: [
      "Complete three cumulative stages in 40 minutes. Preserve local service behavior. Each person's pending work and acknowledgement remain valid when the visible query changes.",
    ],
    examples: [
      {
        title: "Show immediate independent intent",
        stage: 0,
        input: "Ada and Grace both start unstarred.",
        action: "Activate Star Ada and inspect both controls immediately.",
        expected:
          "Ada is pressed and temporarily disabled. Grace remains enabled and may be starred independently.",
      },
      {
        title: "Keep another person's acknowledgement",
        stage: 1,
        input: "Ada's first write fails after 150ms; Grace succeeds after 30ms.",
        action: "Activate Star Ada, then Star Grace, and wait for both responses.",
        expected:
          "Ada becomes unstarred with Could not save Ada in an alert. Grace stays starred and Confirmed stars reads 1.",
      },
      {
        title: "Recover a hidden failed action",
        stage: 2,
        input: "Begin from unstarred people with no prior requests.",
        action:
          "Star Ada, filter Query to Grace, star Grace, clear Query after responses, then activate Retry Ada.",
        expected:
          "The hidden Ada failure returns when Query clears. Retrying clears that error, both people become confirmed, and Request count reads 3.",
      },
    ],
  },
  "build-conflict-editor": {
    goal: "Build a document editor that distinguishes local edits from acknowledged server text. Preserve edits made while saving, and let the user choose how to resolve a version conflict.",
    inputs:
      "The local server starts with text Server draft at revision 1. fixtures.ts provides createDocumentService() and Snapshot; server snapshots have text and revision.",
    initialUi:
      "Show a Document textarea containing Server draft, Document status Saved, Revision 1, Save count 0, and Save document. The server is local and has no real network or storage.",
    constraints: [
      "Complete three cumulative stages in 40 minutes. Preserve the 90ms service acknowledgement and version checks. Do not silently overwrite a local draft or retry a conflicting write destructively.",
    ],
    examples: [
      {
        title: "Save a changed document",
        stage: 0,
        input: "Server draft is saved at revision 1.",
        action: "Replace Document with First edit and activate Save document.",
        expected:
          "Status changes from Unsaved to Saving, then Saved. Text remains First edit and Revision becomes 2.",
      },
      {
        title: "Keep edits made while saving",
        stage: 1,
        input: "A fresh server is at revision 1.",
        action:
          "Save Version A, then type Version B before acknowledgement and attempt a duplicate save.",
        expected:
          "Only one request is sent. Version B stays in the textarea and remains Unsaved after Version A is acknowledged. A later explicit save can acknowledge Version B.",
      },
      {
        title: "Choose a conflict resolution",
        stage: 2,
        input: "The editor knows revision 1 and has local text My version.",
        action:
          "Activate Remote edit, then Save document. Choose Use server or Keep mine after the conflict.",
        expected:
          "Revision conflict appears without erasing My version. Use server adopts Remote revision at revision 2 as Saved; Keep mine preserves My version as Unsaved against revision 2 until another explicit save.",
      },
    ],
  },
};
