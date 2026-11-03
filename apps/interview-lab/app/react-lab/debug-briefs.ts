import type { BuildExample, Challenge, PracticeBrief } from "./types";

type DebugDefinition = PracticeBrief & {
  title: string;
  goal: string;
  requirements: string[];
};

function example(title: string, input: string, action: string, expected: string): BuildExample {
  return { title, input, action, expected };
}

const seats: DebugDefinition = {
  title: "Seat reservation counter",
  goal: "Make a seat reservation counter meet its interaction contract across repeated bookings and resets.",
  inputs:
    "Each Reserve 3 activation books three seats. Reset clears all reservations; there is no capacity limit in this exercise.",
  initialUi: "Reserved seats reads 0. Reserve 3 and Reset are available beneath Seat reservations.",
  requirements: [
    "Reserve 3 adds exactly three seats, including on repeated clicks.",
    "Reset returns the counter to zero.",
    "Booking after a reset follows the same three-seat rule.",
  ],
  examples: [
    example(
      "Reserve once",
      "Reserved seats is 0.",
      "Activate Reserve 3 once.",
      "Reserved seats reads 3.",
    ),
    example(
      "Reserve repeatedly",
      "A fresh counter starts at 0.",
      "Activate Reserve 3 twice.",
      "Reserved seats reads 6.",
    ),
    example(
      "Reset and book again",
      "Reserved seats is 6.",
      "Activate Reset, then Reserve 3.",
      "Reset shows 0; the next booking shows 3.",
    ),
  ],
};

export const debugBriefs: Record<string, DebugDefinition> = {
  "semantic-action": {
    title: "Notification signup",
    goal: "Make notification signup usable with both pointer and keyboard, with clear subscription feedback.",
    inputs:
      "The action is Notify me. Subscription has two visible values: Not subscribed and Subscribed.",
    initialUi:
      "Notify me is available and the status reads Not subscribed. The action participates in normal keyboard navigation.",
    requirements: [
      "Notify me exposes native button semantics and does not submit a surrounding form.",
      "Activating it changes the status from Not subscribed to Subscribed.",
      "Tab reaches the action; Enter and Space activate it with visible focus.",
    ],
    examples: [
      example(
        "Subscribe with a pointer",
        "Subscription is Not subscribed.",
        "Click Notify me.",
        "The status reads Subscribed.",
      ),
      example(
        "Subscribe with a keyboard",
        "Start a fresh preview without a subscription.",
        "Tab to Notify me and press Enter; repeat with Space in a fresh preview.",
        "Notify me receives focus and either activation announces Subscribed.",
      ),
      example(
        "Repeat the action",
        "The status already reads Subscribed.",
        "Activate Notify me again.",
        "Subscription remains Subscribed without navigation or form submission.",
      ),
    ],
  },
  "field-labels": {
    title: "Delivery name entry",
    goal: "Keep the delivery name field understandable before, during, and after text entry.",
    inputs:
      "Delivery name accepts free text, such as Ada. Its visible instruction is Delivery name.",
    initialUi:
      "An empty delivery field has a visible Delivery name instruction and the same accessible name.",
    requirements: [
      "Delivery name is a visible, programmatically associated field label.",
      "Typing preserves both the instruction and entered value.",
      "Activating the visible label focuses its field.",
    ],
    examples: [
      example(
        "Find the field",
        "The delivery name is empty.",
        "Inspect the form and navigate to its field.",
        "Delivery name is visible and identifies the input to assistive technology.",
      ),
      example(
        "Enter a name",
        "The delivery field is empty.",
        "Type Ada into Delivery name.",
        "Ada remains entered and Delivery name stays visible.",
      ),
      example(
        "Clear and focus again",
        "Delivery name contains Ada.",
        "Clear the text, then activate its visible label.",
        "The empty input receives focus and its instruction remains visible.",
      ),
    ],
  },
  "image-alt": {
    title: "Product image descriptions",
    goal: "Communicate the purpose of product imagery while keeping decorative content unobtrusive.",
    inputs:
      "Two inline image fixtures represent a blue travel mug and a decorative divider. No network request is needed.",
    initialUi:
      "Both images are rendered. The product is described as Blue travel mug; the divider contributes no spoken information.",
    requirements: [
      "The informative image has the accessible description Blue travel mug.",
      "The divider remains decorative and is skipped in the accessible reading sequence.",
      "Both supplied images remain rendered; retain their fixture sources.",
    ],
    examples: [
      example(
        "Read the product",
        "The first image represents the mug.",
        "Inspect its accessible image description.",
        "The product is identified as Blue travel mug.",
      ),
      example(
        "Read past decoration",
        "The second image is a divider with no additional information.",
        "Inspect the accessible reading sequence.",
        "No Decorative divider announcement interrupts the product content.",
      ),
      example(
        "Retain visual content",
        "Both inline image fixtures are supplied.",
        "Open the completed preview with networking unavailable.",
        "Both images remain rendered; the informative image is not hidden.",
      ),
    ],
  },
  "preference-checkbox": {
    title: "Email update preference",
    goal: "Keep an email preference and its visible summary consistent through both selection directions.",
    inputs: "Email updates is a boolean preference. The summary uses On and Off.",
    initialUi:
      "Email updates is unchecked and its summary reads Off. The checkbox has a visible associated label.",
    requirements: [
      "Email updates starts unchecked and summary reads Off.",
      "Checking reads On; unchecking returns Off.",
      "Both checkbox and visible label support native pointer and keyboard interaction.",
    ],
    examples: [
      example(
        "Enable updates",
        "Email updates is unchecked.",
        "Select Email updates.",
        "The checkbox is checked and the summary reads On.",
      ),
      example(
        "Disable updates",
        "Email updates is checked and On.",
        "Select Email updates again.",
        "The checkbox is unchecked and the summary reads Off.",
      ),
      example(
        "Use the keyboard",
        "Email updates starts unchecked.",
        "Focus the checkbox and press Space twice.",
        "The summary changes to On, then Off, matching the checkbox each time.",
      ),
    ],
  },
  "first-counter": {
    title: "Ticket quantity picker",
    goal: "Keep a ticket quantity within its allowed range while preserving predictable Add, Remove, and Reset actions.",
    inputs:
      "Quantity starts at 0. The allowed range is 0 through 5 tickets, inclusive; each Add or Remove changes it by one.",
    initialUi: "Quantity reads 0. Remove is disabled, Add is available, and Reset is present.",
    requirements: [
      "Quantity always stays between zero and five.",
      "Remove is disabled at zero; Add is disabled at five.",
      "Reset returns zero after any sequence, including repeated boundary actions.",
    ],
    examples: [
      example(
        "Reach the upper limit",
        "Quantity starts at 0.",
        "Attempt Add seven times.",
        "Quantity stops at 5 and Add is disabled.",
      ),
      example(
        "Respect the lower limit",
        "Quantity starts at 0.",
        "Attempt Remove, then Add once and Remove twice.",
        "Quantity never becomes negative and Remove is disabled at 0.",
      ),
      example(
        "Reset the picker",
        "Quantity has reached 5.",
        "Activate Reset, then Add.",
        "Reset shows 0; Add shows 1 and both boundary controls reflect that value.",
      ),
    ],
  },
  "character-count": {
    title: "Message length indicator",
    goal: "Show how much of a short message allowance remains while keeping all entered text editable.",
    inputs:
      "The allowance is 20 Unicode code points. Ada uses 3; 😀 uses 1. Code points are the exercise policy, not grapheme clusters.",
    initialUi:
      "Message is empty and Remaining reads 20. Over-limit text is allowed to remain in the field.",
    requirements: [
      "Remaining equals 20 minus the current code-point count.",
      "Clearing the field restores Remaining to 20.",
      "Excess input remains editable and produces a negative remainder.",
    ],
    examples: [
      example(
        "Count a short name",
        "Message is empty.",
        "Enter Ada into Message.",
        "The field shows Ada and Remaining reads 17.",
      ),
      example(
        "Count an emoji",
        "Message is empty.",
        "Enter the single emoji 😀.",
        "Remaining reads 19.",
      ),
      example(
        "Exceed and clear",
        "Message is empty.",
        "Enter 21 lowercase a characters, then clear the field.",
        "All 21 characters remain with Remaining -1; clearing restores 20.",
      ),
    ],
  },
  "native-select": {
    title: "Delivery selection",
    goal: "Keep the delivery choice and order summary aligned using the supplied delivery options.",
    inputs:
      "Delivery offers Standard (value standard) and Express (value express). Standard is the initial choice.",
    initialUi: "The labelled Delivery select shows Standard and the summary also reads Standard.",
    requirements: [
      "Delivery starts Standard with a matching summary.",
      "Either selection updates both the control and summary.",
      "Retain a visible associated label and native select keyboard behavior.",
    ],
    examples: [
      example(
        "Choose Express",
        "Delivery is Standard.",
        "Choose Express in Delivery.",
        "The control and summary both read Express.",
      ),
      example(
        "Return to Standard",
        "Delivery is Express.",
        "Choose Standard in Delivery.",
        "The control and summary both return to Standard.",
      ),
      example(
        "Choose with a keyboard",
        "Delivery is Standard.",
        "Focus the select and choose Express using the browser's native keyboard controls.",
        "The summary reads Express without a separate confirmation action.",
      ),
    ],
  },
  "page-landmarks": {
    title: "Workshop page navigation",
    goal: "Make a workshop page understandable through its content outline and page navigation.",
    inputs:
      "Supplied content includes Workshops, Upcoming sessions, React foundations, and a Workshops link targeting #sessions.",
    initialUi:
      "Primary navigation and one main region are available. Workshops is the page heading and Upcoming sessions is its section heading.",
    requirements: [
      "One main region contains the level-one Workshops heading and level-two Upcoming sessions heading.",
      "Navigation named Primary contains the Workshops link to #sessions.",
      "The sessions destination contains Upcoming sessions and the supplied session content.",
    ],
    examples: [
      example(
        "Browse the outline",
        "The supplied workshop page is open.",
        "Inspect its heading hierarchy.",
        "Workshops precedes Upcoming sessions at heading levels one and two.",
      ),
      example(
        "Find page regions",
        "Navigation and workshop content are supplied.",
        "Inspect the page landmarks.",
        "Primary navigation and exactly one main region identify the page areas.",
      ),
      example(
        "Follow the destination",
        "Primary contains a Workshops link.",
        "Activate Workshops.",
        "The link targets #sessions, which contains Upcoming sessions and React foundations.",
      ),
    ],
  },
  snapshot: seats,
  "modular-snapshot": { ...seats, title: "Seat reservations across files" },
  identity: {
    title: "Reviewer drafts",
    goal: "Keep each reviewer's private note with that person when the review queue changes order.",
    inputs:
      "The queue contains Ada (id ada) and Grace (id grace), each with an editable note. Reverse order changes their displayed order.",
    initialUi: "Ada appears before Grace, both notes are empty, and Reverse order is available.",
    requirements: [
      "Each person keeps their draft after Reverse order.",
      "Repeated reorders preserve both edits and their record associations.",
      "Editing one note does not change the other person's note.",
    ],
    examples: [
      example(
        "Reverse one edited row",
        "Ada note contains Ship it; Grace note is empty.",
        "Activate Reverse order.",
        "Grace appears first; Ada note still contains Ship it and Grace note is empty.",
      ),
      example(
        "Preserve both drafts",
        "Ada note is A and Grace note is G.",
        "Activate Reverse order twice.",
        "Original row order returns with Ada note A and Grace note G.",
      ),
      example(
        "Edit after reordering",
        "The order is Grace, Ada, with both notes empty.",
        "Enter Review in Grace note.",
        "Grace note shows Review while Ada note remains empty.",
      ),
    ],
  },
  derived: {
    title: "Ticket cart totals",
    goal: "Keep workshop ticket quantities and displayed prices consistent through additions and resets.",
    inputs:
      "Each ticket costs $12. The cart begins with quantity 1 and total $12; Add ticket adds one and Reset cart empties it.",
    initialUi:
      "Workshop tickets shows Quantity 1 and Total $12, with Add ticket and Reset cart actions.",
    requirements: [
      "The total always equals quantity × 12.",
      "Reset cart clears quantity and total.",
      "Adding before or after a reset obeys the same unit price.",
    ],
    examples: [
      example(
        "Add a ticket",
        "Quantity is 1 and total is $12.",
        "Activate Add ticket.",
        "Quantity becomes 2 and total becomes $24.",
      ),
      example(
        "Empty the cart",
        "Quantity is 2 and total is $24.",
        "Activate Reset cart.",
        "Quantity reads 0 and total reads $0.",
      ),
      example(
        "Start a new cart",
        "The cart was reset to zero.",
        "Activate Add ticket once.",
        "Quantity reads 1 and total reads $12.",
      ),
    ],
  },
  disclosure: {
    title: "Shipping details disclosure",
    goal: "Let people reveal and hide shipping information with matching visible and accessible feedback.",
    inputs:
      "Shipping details controls the shipping element containing Arrives in 3 days. Details start collapsed.",
    initialUi:
      "Shipping details is available, the content is hidden, and assistive technology reports the control as collapsed.",
    requirements: [
      "Shipping details toggles between collapsed and expanded content.",
      "The control exposes its expanded state and relationship to the retained shipping element.",
      "Pointer and keyboard activation preserve focus on the control.",
    ],
    examples: [
      example(
        "Reveal the delivery estimate",
        "Shipping details is collapsed.",
        "Activate Shipping details.",
        "Arrives in 3 days becomes visible and the control reports expanded.",
      ),
      example(
        "Collapse again",
        "The shipping estimate is visible.",
        "Activate Shipping details again.",
        "The estimate is hidden and the control reports collapsed.",
      ),
      example(
        "Use keyboard activation",
        "The disclosure is collapsed.",
        "Focus Shipping details and activate it with the keyboard.",
        "The estimate appears and focus remains on Shipping details.",
      ),
    ],
  },
  "password-toggle": {
    title: "Password visibility control",
    goal: "Let people inspect an entered password while keeping visibility changes separate from signing in.",
    inputs:
      "Password accepts text such as secret. Show password toggles visibility; Sign in submits this local form.",
    initialUi:
      "Password is masked, Show password is unpressed, and the status reads Not submitted.",
    requirements: [
      "Show password toggles masked/plain text without erasing the value or submitting.",
      "Its label stays Show password and its pressed state matches visibility.",
      "Sign in announces Submitted through the native form submission flow.",
    ],
    examples: [
      example(
        "Reveal a password",
        "Password contains secret and is masked.",
        "Activate Show password.",
        "The same secret is readable, the toggle is pressed, and status stays Not submitted.",
      ),
      example(
        "Mask it again",
        "Password is visible after one toggle.",
        "Activate Show password again.",
        "The unchanged password is masked and the toggle is unpressed.",
      ),
      example(
        "Submit deliberately",
        "Password has been entered.",
        "Activate Sign in.",
        "The status reads Submitted; visibility actions alone never produce that status.",
      ),
    ],
  },
  "immutable-cart": {
    title: "Cart item quantities",
    goal: "Update individual cart quantities and their total correctly through interleaved item actions.",
    inputs:
      "The cart has Tea (id tea, quantity 1) and Coffee (id coffee, quantity 2). Each named Add action adds one of that item.",
    initialUi:
      "Tea reads 1, Coffee reads 2, and Total items reads 3. Both item actions are available.",
    requirements: [
      "Add Tea increments only Tea; Add Coffee increments only Coffee.",
      "Total items equals the sum of visible item quantities.",
      "Repeated and interleaved edits preserve each item's id and quantity association.",
    ],
    examples: [
      example(
        "Add Tea",
        "Tea is 1 and Coffee is 2.",
        "Activate Add Tea once.",
        "Tea reads 2, Coffee remains 2, and Total items is 4.",
      ),
      example(
        "Interleave item actions",
        "A fresh cart has Tea 1 and Coffee 2.",
        "Activate Add Coffee, Add Tea, then Add Coffee.",
        "Tea reads 2, Coffee reads 4, and Total items is 6.",
      ),
      example(
        "Repeat one item action",
        "A fresh cart has Tea 1 and Coffee 2.",
        "Activate Add Tea twice.",
        "Tea reads 3, Coffee remains 2, and Total items is 5.",
      ),
    ],
  },
  "search-empty": {
    title: "People finder",
    goal: "Support repeatable people searches with clear empty results and a reliable return to the full list.",
    inputs:
      "People are Ada, Grace, and Linus in that order. Search ignores letter case and surrounding whitespace.",
    initialUi: "Search is empty, Matches shows all three names, and Clear is available.",
    requirements: [
      "Search matches the complete supplied collection, case-insensitively, with surrounding whitespace ignored.",
      "A missing query shows No matches in a status region.",
      "Clear restores all three names and empties Search; whitespace-only input also shows all names.",
    ],
    examples: [
      example(
        "Normalize a query",
        "Search contains two spaces, ADA, then two spaces.",
        "Enter that text in Search.",
        "Matches contains only Ada.",
      ),
      example(
        "Change the search",
        "Matches currently contains only Ada.",
        "Change Search to grace.",
        "Matches contains only Grace.",
      ),
      example(
        "Recover from no matches",
        "Search contains nobody.",
        "Observe the result, then activate Clear.",
        "No matches is announced first; Clear empties Search and restores Ada, Grace, Linus.",
      ),
    ],
  },
  "responsive-grid": {
    title: "Responsive product shelf",
    goal: "Make the supplied product shelf fit wide and narrow spaces while preserving every card and its reading order.",
    inputs:
      "Cards are Tea, Coffee, and Cocoa. Test the shelf itself at widths 660px and 220px; spacing is 12px.",
    initialUi:
      "At 660px, all three cards share one row with equal widths and 12px gaps, in Tea, Coffee, Cocoa order.",
    requirements: [
      "At 660px, three equal cards share one row with 12px gaps.",
      "At 220px, all three cards stack without horizontal overflow.",
      "Retain every card and source order at both widths; the shelf may be narrower than the viewport.",
    ],
    examples: [
      example(
        "Inspect the wide shelf",
        "The shelf has 660px available width.",
        "Render the three supplied products.",
        "Three equal-width cards occupy one row separated by 12px.",
      ),
      example(
        "Inspect the narrow shelf",
        "The same shelf has 220px available width.",
        "Resize the shelf without changing its products.",
        "Tea, Coffee, Cocoa stack in order with gaps and no horizontal overflow.",
      ),
      example(
        "Restore the wide layout",
        "The shelf currently has width 220px.",
        "Return its width to 660px.",
        "All three cards return to one equal-width row; no card content disappears.",
      ),
    ],
  },
  "long-content": {
    title: "Record row with long content",
    goal: "Keep a complete record name readable alongside its action in a narrow row.",
    inputs:
      "The row is 240px wide with an 8px gap. Its name is ReleaseCandidate repeated eight times without spaces; the action is Open.",
    initialUi:
      "The full record name wraps inside the row and Open remains fully visible beside it.",
    requirements: [
      "The row remains 240px wide with no horizontal overflow.",
      "Retain the entire name through wrapping rather than clipping or truncation.",
      "Open remains inside the row with a usable width of at least 40px.",
    ],
    examples: [
      example(
        "Render the long name",
        "The supplied unbroken name occupies a 240px row.",
        "Open the preview.",
        "The name wraps across multiple lines inside the row.",
      ),
      example(
        "Reach the action",
        "The long record name and Open share the row.",
        "Inspect and keyboard-focus Open.",
        "The complete action remains visible inside the row and can receive focus.",
      ),
      example(
        "Read the full content",
        "ReleaseCandidate occurs eight times.",
        "Inspect the rendered name and row bounds.",
        "Every occurrence is retained; text is neither clipped nor horizontally overflowing.",
      ),
    ],
  },
  "toolbar-wrap": {
    title: "Report action toolbar",
    goal: "Keep all report actions readable and reachable as their toolbar changes width.",
    inputs:
      "Actions are Export report, Share report, Archive report in that order. Each is at least 120px wide; spacing is 8px.",
    initialUi: "At 420px available width, all three complete action labels appear on one line.",
    requirements: [
      "At 420px, all actions fit on one line.",
      "At 180px, actions occupy successive rows with 8px spacing and widths of at least 120px.",
      "Preserve action order and complete labels with no horizontal overflow.",
    ],
    examples: [
      example(
        "Use a wide toolbar",
        "Toolbar width is 420px.",
        "Render the supplied actions.",
        "Export report, Share report, Archive report share one row in that order.",
      ),
      example(
        "Use a narrow toolbar",
        "Toolbar width changes to 180px.",
        "Inspect all actions.",
        "Actions appear on successive rows with 8px gaps, complete labels, and no horizontal overflow.",
      ),
      example(
        "Return to wide",
        "The toolbar is currently 180px wide.",
        "Restore width to 420px.",
        "The same three actions return to one row without reordering or losing content.",
      ),
    ],
  },
  "fluid-image": {
    title: "Responsive illustration card",
    goal: "Fit an illustration to its card without cropping, distortion, or overflow.",
    inputs:
      "The inline Teal illustration is intrinsically 400px × 200px, a 2:1 ratio. Test card widths 200px and 320px.",
    initialUi:
      "The illustration fills its card width, retains its 2:1 ratio, and is identified as Teal illustration.",
    requirements: [
      "At either specified card width, image height is half its width.",
      "Retain intrinsic width 400, height 200, and the Teal illustration alternative.",
      "Keep the entire illustration visible with no cropping or horizontal overflow.",
    ],
    examples: [
      example(
        "Fit the narrow card",
        "The card is 200px wide.",
        "Render the supplied illustration.",
        "Its displayed size is 200px × 100px without overflow.",
      ),
      example(
        "Fit the wider card",
        "The card is 320px wide.",
        "Render the same illustration.",
        "Its displayed size is 320px × 160px, retaining the complete image.",
      ),
      example(
        "Describe the same image",
        "The card changes between the two widths.",
        "Inspect image dimensions and accessible description.",
        "Intrinsic dimensions remain 400 × 200 and its description remains Teal illustration.",
      ),
    ],
  },
  "spacing-tokens": {
    title: "Summary card spacing",
    goal: "Keep related summary cards consistent when their supplied spacing scale changes.",
    inputs:
      "Orders and Returns each contain Review recent activity. Local tokens --space-card and --space-content begin at 16px and 8px.",
    initialUi: "Both cards have 16px padding and an 8px gap between their heading and body.",
    requirements: [
      "Both cards match the supplied local padding and content-gap values.",
      "Changing the tokens to 24px and 12px updates both cards.",
      "Retain headings, paragraphs, and their source order.",
    ],
    examples: [
      example(
        "Inspect the initial scale",
        "Card spacing is 16px and content spacing is 8px.",
        "Inspect Orders and Returns.",
        "Both have 16px padding and an 8px heading-to-body gap.",
      ),
      example(
        "Change the scale",
        "The supplied tokens change to 24px and 12px.",
        "Update the local token values in the preview or source.",
        "Both cards now have 24px padding and 12px content gaps.",
      ),
      example(
        "Restore the scale",
        "Both cards use the larger spacing.",
        "Restore tokens to 16px and 8px.",
        "Original spacing returns consistently, with both headings and bodies still visible.",
      ),
    ],
  },
  "readable-type": {
    title: "Reading panel typography",
    goal: "Meet the supplied reading specification at both wide and narrow container widths.",
    inputs:
      "Use the supplied paragraph beginning A useful interface helps people read, decide, and recover. Test widths 1000px and 220px.",
    initialUi:
      "Reading text is 16px with line height at least 24px and a maximum measure of approximately 60ch.",
    requirements: [
      "Reading copy uses 16px text and line height of at least 24px.",
      "At 1000px available width, its measure remains at most approximately 60ch.",
      "At 220px, complete text wraps inside the container without horizontal scrolling.",
    ],
    examples: [
      example(
        "Read in a wide panel",
        "The container is 1000px wide.",
        "Inspect the supplied paragraph.",
        "Text is 16px, line height is at least 24px, and line measure stays within about 60ch.",
      ),
      example(
        "Read in a narrow panel",
        "The container is 220px wide.",
        "Inspect the same paragraph.",
        "All text wraps inside the panel, which may grow vertically without horizontal overflow.",
      ),
      example(
        "Retain the complete copy",
        "The supplied paragraph repeats Thoughtful spacing keeps the next step clear.",
        "Resize between wide and narrow layouts.",
        "Every sentence remains present; sizing changes do not truncate the copy.",
      ),
    ],
  },
  "empty-recovery": {
    title: "Resource search recovery",
    goal: "Give people a clear next step when a resource search returns no matches.",
    inputs:
      "Resources are React, CSS, Accessibility. Query matches case-insensitively; missing has no matches.",
    initialUi:
      "Query is empty and all three resources are visible. Search feedback explains an empty result when one occurs.",
    requirements: [
      "Query filters React, CSS, and Accessibility case-insensitively.",
      "No match shows No resources found in a status and a Clear search action.",
      "Clear search restores all resources, empties Query, and focuses it.",
    ],
    examples: [
      example(
        "Find a resource",
        "All three resources are visible.",
        "Enter cSs in Query.",
        "Only CSS remains visible.",
      ),
      example(
        "Explain no results",
        "Query is missing.",
        "Inspect the results and feedback.",
        "No resources are listed; No resources found and Clear search are available.",
      ),
      example(
        "Recover and continue",
        "No resources were found.",
        "Activate Clear search.",
        "Query is empty and focused, and React, CSS, Accessibility return.",
      ),
    ],
  },
  "locale-price": {
    title: "Localized price display",
    goal: "Present the same euro amount in English and German formats without changing its value.",
    inputs: "Amount is 1234.5 and currency is EUR. English selects en-US; German selects de-DE.",
    initialUi:
      "English presentation reads €1,234.50 and the underlying displayed amount remains 1234.5.",
    requirements: [
      "Initial en-US presentation is €1,234.50.",
      "German presentation is 1.234,50 € with de-DE language; English restores en-US presentation.",
      "The numeric amount remains 1234.5 and currency stays EUR throughout.",
    ],
    examples: [
      example(
        "Inspect English pricing",
        "Amount is 1234.5 EUR in en-US.",
        "Open the price preview.",
        "Price reads €1,234.50 and the amount remains 1234.5.",
      ),
      example(
        "Choose German",
        "The English price is visible.",
        "Activate German.",
        "Price reads 1.234,50 € and its language is de-DE; amount remains 1234.5.",
      ),
      example(
        "Return to English",
        "The German price is visible.",
        "Activate English.",
        "Price returns to €1,234.50 with en-US language and the same amount.",
      ),
    ],
  },
  "fieldset-group": {
    title: "Delivery method choices",
    goal: "Present delivery options as one named, mutually exclusive choice with clear individual labels.",
    inputs:
      "Delivery method offers Standard and Express. Standard is selected initially; the form group name is delivery.",
    initialUi:
      "Delivery method names the native radio group; Standard is checked and Express is unchecked.",
    requirements: [
      "A native fieldset and legend identify Delivery method and contain both labelled radios.",
      "Both radios belong to the delivery group, with Standard initially selected.",
      "Selecting either option leaves exactly one option selected.",
    ],
    examples: [
      example(
        "Understand the question",
        "Standard and Express are supplied choices.",
        "Inspect the group and individual labels.",
        "Delivery method names the group, and each option retains its own visible label.",
      ),
      example(
        "Choose Express",
        "Standard starts selected.",
        "Select Express.",
        "Express becomes selected and Standard becomes unselected.",
      ),
      example(
        "Change the choice back",
        "Express is selected.",
        "Select Standard with pointer or native keyboard controls.",
        "Standard is the sole selected delivery method.",
      ),
    ],
  },
  "component-callback": {
    title: "Plan selection controls",
    goal: "Keep two reusable plan controls and their shared selection summary consistent.",
    inputs:
      "Plans are Basic and Pro. PlanButton accepts name, selected, and onSelect props; Basic is selected initially.",
    initialUi: "Summary reads Basic, Basic is pressed, and Pro is unpressed.",
    requirements: [
      "Retain the PlanButton component's supplied name, selected, and onSelect public contract.",
      "Choosing either plan updates the summary and both buttons' pressed states.",
      "Exactly one plan is selected, including after repeated or reversed choices.",
    ],
    examples: [
      example(
        "Choose Pro",
        "Basic is initially selected.",
        "Activate Pro.",
        "Summary reads Pro; only Pro is pressed.",
      ),
      example(
        "Choose Basic again",
        "Pro is selected.",
        "Activate Basic.",
        "Summary reads Basic; only Basic is pressed.",
      ),
      example(
        "Repeat the selection",
        "Pro is selected.",
        "Activate Pro again.",
        "Pro remains the sole pressed plan and the summary stays Pro.",
      ),
    ],
  },
  race: {
    title: "People search results",
    goal: "Keep people search feedback aligned with the most recent search choice, regardless of completion order.",
    inputs:
      "Search Ada resolves after 160ms; Search Grace resolves after 20ms. These are local asynchronous fixtures.",
    initialUi:
      "People search has Search Ada and Search Grace actions. The status starts No results.",
    requirements: [
      "The latest selected query determines the displayed result regardless of completion order.",
      "During a search the status identifies the selected query as Loading Ada or Loading Grace.",
      "A single search resolves normally; earlier work never takes over a newer choice.",
    ],
    examples: [
      example(
        "Search once",
        "Status starts No results.",
        "Activate Search Ada and wait at least 160ms.",
        "Status first shows Loading Ada, then Ada.",
      ),
      example(
        "Choose another person quickly",
        "No search has completed yet.",
        "Activate Search Ada, then Search Grace before Ada resolves; wait 220ms.",
        "Grace remains the result after both requests finish.",
      ),
      example(
        "Choose Ada last",
        "A fresh preview has no results.",
        "Activate Search Grace, then Search Ada before Grace resolves; wait 220ms.",
        "Ada is the final result because Ada was the latest choice.",
      ),
    ],
  },
  cleanup: {
    title: "Room message delivery",
    goal: "Show messages from the joined room and count each accepted delivery exactly once.",
    inputs:
      "Rooms are lobby and studio. Send lobby and Send studio emit Message from lobby and Message from studio; Join studio changes rooms.",
    initialUi: "The joined room is lobby, message reads Quiet, and Deliveries reads 0.",
    requirements: [
      "After joining studio, lobby messages have no effect on either output.",
      "Each current-room message updates its text and increases Deliveries once.",
      "Repeated sends and joining the same room again preserve the same delivery contract.",
    ],
    examples: [
      example(
        "Receive a lobby message",
        "A fresh preview is in lobby with 0 deliveries.",
        "Activate Send lobby.",
        "Message reads Message from lobby and Deliveries becomes 1.",
      ),
      example(
        "Use the joined room",
        "A fresh preview has no deliveries.",
        "Activate Join studio, Send lobby, then Send studio.",
        "Lobby leaves Quiet and 0 unchanged; studio shows Message from studio and 1.",
      ),
      example(
        "Count repeated deliveries",
        "Studio is joined and Deliveries is 1.",
        "Activate Send studio twice, then Send lobby.",
        "Deliveries reaches 3; the lobby send changes neither the count nor studio message.",
      ),
    ],
  },
  stale: {
    title: "Event pulse counter",
    goal: "Accumulate one count for every pulse received by the event counter.",
    inputs:
      "Send pulse emits one browser pulse event. Each event contributes one, with no maximum count in this exercise.",
    initialUi: "Event counter reads 0 and Send pulse is available.",
    requirements: [
      "Each pulse increases the currently displayed count by one.",
      "Repeated events accumulate without dropping or duplicating increments.",
      "Mounted previews respond to their events and stop receiving events when removed.",
    ],
    examples: [
      example(
        "Receive one pulse",
        "Count starts at 0.",
        "Activate Send pulse once.",
        "The counter reads 1.",
      ),
      example(
        "Receive two pulses",
        "A fresh count starts at 0.",
        "Activate Send pulse twice.",
        "The counter reads 2.",
      ),
      example(
        "Continue receiving events",
        "A fresh count starts at 0.",
        "Activate Send pulse five times.",
        "The counter reads 5 with one increment for each event.",
      ),
    ],
  },
  reducer: {
    title: "Cart quantity transitions",
    goal: "Keep cart quantity nonnegative across additions, removals, and resets.",
    inputs:
      "Add increases quantity by one, Remove decreases it by one when possible, and Reset empties the cart. Initial quantity is 0.",
    initialUi: "Cart transitions displays quantity 0 with Add, Remove, and Reset actions.",
    requirements: [
      "Quantity never falls below zero, even after repeated Remove actions.",
      "Reset always returns zero.",
      "Multiple increments and decrements produce the expected quantity.",
    ],
    examples: [
      example(
        "Remove from an empty cart",
        "Quantity starts at 0.",
        "Attempt Remove twice.",
        "Quantity stays at 0.",
      ),
      example(
        "Combine ordinary actions",
        "Quantity starts at 0.",
        "Activate Add twice, then Remove once.",
        "Quantity reads 1.",
      ),
      example(
        "Reset and continue",
        "Quantity is 2 after two Add actions.",
        "Activate Reset, then Add.",
        "Reset shows 0 and the next Add shows 1.",
      ),
    ],
  },
  accessible: {
    title: "Workshop signup form",
    goal: "Support understandable workshop registration, including invalid input recovery and keyboard submission.",
    inputs:
      "Email starts empty. Its exercise rule requires non-space text, @, non-space text, a dot, then non-space text; ada@example.com qualifies.",
    initialUi:
      "Workshop signup has a visibly labelled Email field and Register submit action; no confirmation or error is shown yet.",
    requirements: [
      "Email has a visible, programmatically associated label.",
      "Invalid submission announces Enter a valid email and focuses Email.",
      "A valid native form submission announces You're registered and clears the error.",
    ],
    examples: [
      example(
        "Reject empty registration",
        "Email is empty.",
        "Activate Register.",
        "Enter a valid email is announced and Email receives focus.",
      ),
      example(
        "Register an address",
        "Email contains ada@example.com.",
        "Submit with Register or Enter from the field.",
        "A status announces You're registered.",
      ),
      example(
        "Recover after rejection",
        "An invalid registration has shown an error.",
        "Enter ada@example.com and submit again.",
        "Confirmation replaces the obsolete error and the entered email is retained.",
      ),
    ],
  },
  recovery: {
    title: "Report retry flow",
    goal: "Keep the analytics workspace usable when its report is unavailable and provide a deliberate retry.",
    inputs:
      "The report fixture begins unavailable. A successful retry presents Report ready; the surrounding workspace remains available.",
    initialUi:
      "Analytics workspace stays visible alongside a Report unavailable alert and keyboard-operable Retry action.",
    requirements: [
      "The workspace heading survives the report error.",
      "The unavailable report offers Retry through pointer and keyboard interaction.",
      "Retry replaces the unavailable feedback with Report ready and clears the alert.",
    ],
    examples: [
      example(
        "Inspect an unavailable report",
        "The report fixture begins unavailable.",
        "Open the preview.",
        "Analytics workspace and Report unavailable are both visible.",
      ),
      example(
        "Recover with a pointer",
        "The report is unavailable.",
        "Activate Retry.",
        "Report ready appears, the alert disappears, and the workspace heading remains.",
      ),
      example(
        "Recover with a keyboard",
        "A fresh preview shows Report unavailable.",
        "Tab to Retry and activate it with Enter or Space.",
        "Report ready appears without losing the surrounding workspace.",
      ),
    ],
  },
  memo: {
    title: "Catalog search and theme",
    goal: "Keep catalog results correct while limiting the demonstrated filtering work to changes that affect those results.",
    inputs:
      "Products are React patterns, TypeScript systems, React testing. Query ignores case. A visible calculation counter instruments filtering.",
    initialUi:
      "Query is empty, all three products are visible, and the theme is light. The calculation count provides a comparison baseline.",
    requirements: [
      "A theme-only change does not increase the displayed filtering calculation count.",
      "A changed Query recalculates matching results correctly.",
      "Theme changes and repeated searches preserve all matching product content.",
    ],
    examples: [
      example(
        "Change only appearance",
        "Query is empty; note the calculation count.",
        "Activate Toggle theme.",
        "The theme changes while product results and calculation count stay unchanged.",
      ),
      example(
        "Search the catalog",
        "All three products are visible.",
        "Enter typescript into Query.",
        "Only TypeScript systems is listed and the filtering count increases.",
      ),
      example(
        "Keep a filtered view",
        "Query is typescript; note its calculation count.",
        "Toggle theme twice.",
        "TypeScript systems remains the sole result and the count does not increase.",
      ),
    ],
  },
  optimistic: {
    title: "Bookmark save feedback",
    goal: "Provide immediate bookmark feedback and a recoverable outcome when the local save service rejects an attempt.",
    inputs:
      "Bookmark begins off. The unchanged local save fixture rejects every request after 120ms with Could not save.",
    initialUi: "Bookmark is unpressed and available; status reads Not saved with no error.",
    requirements: [
      "Bookmark becomes pressed immediately while status reads Saving.",
      "While saving, repeated activation cannot create overlapping saves.",
      "Rejection leaves Bookmark unpressed, announces Could not save, and permits another attempt.",
    ],
    examples: [
      example(
        "Begin saving",
        "Bookmark starts off.",
        "Activate Bookmark and inspect immediately.",
        "Bookmark is pressed and disabled while status reads Saving.",
      ),
      example(
        "Observe rejection",
        "A bookmark request is pending.",
        "Wait at least 120ms.",
        "Bookmark is unpressed and available again; Could not save is announced.",
      ),
      example(
        "Try again",
        "The first attempt has failed.",
        "Activate Bookmark again and wait for its result.",
        "Immediate Saving feedback returns; the fixture rejects again and leaves a retryable unbookmarked state.",
      ),
    ],
  },
  "external-store": {
    title: "External counter display",
    goal: "Keep a counter display aligned with changes made through the supplied external counter service.",
    inputs:
      "The supplied store begins at 0. External increment writes one additional count to that store on each activation.",
    initialUi: "External counter reads 0 and External increment is available.",
    requirements: [
      "The rendered count follows every external increment.",
      "Repeated external updates remain visible without duplicate increments.",
      "Preserve the supplied store operations; removing a preview must stop its update delivery.",
    ],
    examples: [
      example(
        "Observe one external write",
        "The store and display begin at 0.",
        "Activate External increment once.",
        "The displayed counter reads 1.",
      ),
      example(
        "Observe repeated writes",
        "A fresh preview starts at 0.",
        "Activate External increment three times.",
        "The display progresses through 1 and 2 to 3.",
      ),
      example(
        "Continue after updates",
        "The displayed count is 3.",
        "Activate External increment once more.",
        "The display reads 4 without a manual refresh.",
      ),
    ],
  },
  "form-errors": {
    title: "Contact form feedback",
    goal: "Help people submit a contact, understand field errors, and recover without losing their drafts.",
    inputs:
      "Name and Email are required after trimming. Email must have non-space text, @, non-space text, a dot, then non-space text; ada@example.test qualifies.",
    initialUi:
      "Name and Email are empty, Save contact is available, and the status reads Not saved. Validation occurs on submission.",
    requirements: [
      "Submit-time validation explains Enter a name and Enter a valid email as appropriate.",
      "Invalid fields expose aria-invalid and reference their error descriptions, named name-error and email-error; focus the first invalid field, Name before Email.",
      "Keep drafts after rejection. Valid submission announces Saved and removes obsolete errors; retain the supplied noValidate form policy.",
    ],
    examples: [
      example(
        "Submit empty fields",
        "Both fields are empty.",
        "Activate Save contact.",
        "Both errors appear, invalid fields reference their messages, and Name receives focus.",
      ),
      example(
        "Preserve partial work",
        "Name is Ada and Email is bad.",
        "Activate Save contact.",
        "Email receives focus and its error; Name remains Ada.",
      ),
      example(
        "Recover a contact",
        "Name remains Ada after a rejection.",
        "Set Email to ada@example.test and submit again.",
        "Status reads Saved, obsolete errors disappear, and fields no longer report invalid.",
      ),
    ],
  },
  pagination: {
    title: "Product result pages",
    goal: "Keep paginated search results and navigation valid as people browse or change the query.",
    inputs:
      "Names are Apple, Apricot, Banana, Berry, Cherry, Date in that order. Show two per page; Query matches case-insensitively.",
    initialUi:
      "Results shows Apple and Apricot; Page reads Page 1 of 3. Previous is disabled and Next is available.",
    requirements: [
      "Results shows at most two names per page in source order; navigation stays within first and last pages.",
      "Any Query change starts at page 1 of the new matches.",
      "No matches reads Page 1 of 1 with both navigation buttons disabled.",
    ],
    examples: [
      example(
        "Browse the final page",
        "Query is empty on page 1.",
        "Activate Next twice, then attempt another Next.",
        "Page reads Page 3 of 3 with Cherry and Date; Next is disabled.",
      ),
      example(
        "Filter while on a later page",
        "The current page is 3 of 3.",
        "Enter ap into Query.",
        "Apple and Apricot appear with Page 1 of 1.",
      ),
      example(
        "Handle no matches",
        "Query changes to missing.",
        "Inspect results and navigation.",
        "The list is empty, Page reads Page 1 of 1, and Previous and Next are disabled.",
      ),
    ],
  },
  "sort-table": {
    title: "Sortable score table",
    goal: "Present predictable numeric score ordering with clear sort feedback and an alphabetical tie-breaker.",
    inputs:
      "Records are Linus 12, Grace 3, Ada 3. Sort score toggles direction; equal scores always use ascending name order.",
    initialUi: "Rows are Ada 3, Grace 3, Linus 12. The score header reports ascending sort.",
    requirements: [
      "Initial score order is ascending with name as the tie-breaker.",
      "Sort score alternates descending and ascending while ties remain alphabetical.",
      "Retain table/header semantics, source records, and aria-sort matching visible order.",
    ],
    examples: [
      example(
        "Read ascending scores",
        "Scores are Ada 3, Grace 3, Linus 12.",
        "Open the table preview.",
        "Ada precedes Grace, then Linus; score sort is announced as ascending.",
      ),
      example(
        "Reverse score direction",
        "Ascending order is visible.",
        "Activate Sort score.",
        "Rows become Linus 12, Ada 3, Grace 3 and the header reports descending.",
      ),
      example(
        "Restore ascending",
        "Descending order is visible.",
        "Activate Sort score again.",
        "Rows return to Ada 3, Grace 3, Linus 12 with ascending feedback.",
      ),
    ],
  },
  "debounced-preview": {
    title: "Search preview timing",
    goal: "Keep typing responsive while publishing a search preview only after a short pause.",
    inputs:
      "Query is the editable text. Committed query publishes the latest text after 120ms without another edit. Clear acts immediately.",
    initialUi: "Query and Committed query are both empty; Clear is available.",
    requirements: [
      "Query reflects each keystroke immediately.",
      "Committed query changes after a 120ms pause and publishes only the latest draft.",
      "Clear immediately empties both values and they remain empty after outstanding deadlines; removed previews publish no later work.",
    ],
    examples: [
      example(
        "Type without waiting",
        "Both values start empty.",
        "Enter Ada and inspect before 120ms, then after a 120ms pause.",
        "Query immediately shows Ada; Committed query stays empty until the pause, then shows Ada.",
      ),
      example(
        "Change text quickly",
        "Both values start empty.",
        "Enter Ada, then Grace before 120ms has passed; wait for a pause.",
        "Committed query shows Grace, the latest text.",
      ),
      example(
        "Clear pending text",
        "Linus was just entered and is not yet committed.",
        "Activate Clear and wait beyond 120ms.",
        "Query and Committed query stay empty; Linus does not reappear.",
      ),
    ],
  },
  "retry-request": {
    title: "Service request retry",
    goal: "Provide deliberate loading, failure, and retry feedback without creating extra service requests.",
    inputs:
      "The local read fixture takes 90ms. Its first attempt rejects with Service unavailable; the next resolves Ready. Request count counts calls.",
    initialUi: "Status is Idle, Request count is 0, and Load is available.",
    requirements: [
      "Load starts one request, announces Loading, and is unavailable while pending.",
      "Failure announces Service unavailable and offers Retry without automatic attempts.",
      "Retry can reach Ready, remove the error, and report two calls after one failure and one success.",
    ],
    examples: [
      example(
        "Start one load",
        "Status is Idle with 0 requests.",
        "Activate Load and attempt another activation while pending.",
        "Status is Loading, Load is disabled, and Request count remains 1.",
      ),
      example(
        "Wait after failure",
        "The first request is pending.",
        "Wait beyond 90ms without taking another action.",
        "Service unavailable is announced with Retry available; Request count remains 1.",
      ),
      example(
        "Retry explicitly",
        "The first attempt failed.",
        "Activate Retry and wait beyond 90ms.",
        "Status reads Ready, the alert is gone, and Request count reads 2.",
      ),
    ],
  },
  "responsive-navigation": {
    title: "Responsive primary navigation",
    goal: "Keep primary destinations reachable in wide and compact navigation presentations.",
    inputs:
      "Primary navigation contains Overview (#overview) and Billing (#billing). Test shell widths 800px and 300px; wide mode begins above 480px.",
    initialUi:
      "At 800px, both links are visible directly and Menu is hidden. At 300px, Menu is visible and links start collapsed.",
    requirements: [
      "Wide navigation exposes the two links without a Menu control.",
      "Compact Menu toggles both links with matching expanded state and a relationship to nav-links.",
      "Retain Primary navigation, destinations, and one copy of each link in either layout.",
    ],
    examples: [
      example(
        "Inspect wide navigation",
        "The navigation shell is 800px wide.",
        "Inspect its controls and links.",
        "Overview and Billing are visible; Menu is hidden.",
      ),
      example(
        "Open compact navigation",
        "The shell is 300px wide and links are collapsed.",
        "Activate Menu.",
        "Both destinations appear and Menu reports expanded.",
      ),
      example(
        "Close compact navigation",
        "Compact links are expanded.",
        "Activate Menu again.",
        "Links are hidden, Menu reports collapsed, and destinations remain unchanged.",
      ),
    ],
  },
  "container-card": {
    title: "Workshop summary card",
    goal: "Make a workshop summary fit its host in both sidebar and main-panel placements.",
    inputs:
      "The card contains an 80px square teal thumbnail and Workshop summary text. Host widths are 240px and 500px; spacing is 12px.",
    initialUi:
      "In a 240px host, the thumbnail is above the copy with 12px spacing and no horizontal overflow.",
    requirements: [
      "At 240px host width, thumbnail and copy stack with a 12px gap.",
      "At 500px host width, thumbnail and copy share a row with a 12px gap and aligned top edges.",
      "Both contents remain visible; behavior follows host width while browser viewport stays unchanged.",
    ],
    examples: [
      example(
        "Place in a sidebar",
        "The host is 240px wide.",
        "Inspect the summary card.",
        "The 80px thumbnail sits above Workshop summary with a 12px gap.",
      ),
      example(
        "Place in a main panel",
        "The host becomes 500px wide at the same viewport size.",
        "Inspect the same card.",
        "Thumbnail and copy sit side by side, top-aligned with a 12px gap.",
      ),
      example(
        "Return to the sidebar",
        "The card is in a 500px host.",
        "Reduce only the host to 240px.",
        "The card stacks again and retains all content without overflow.",
      ),
    ],
  },
  "rtl-layout": {
    title: "Bidirectional notice layout",
    goal: "Keep a notice's accent and spacing consistent with its selected reading direction.",
    inputs:
      "Notice text stays Notice. Inline-start padding is 24px with a 4px teal accent; inline-end padding is 8px. Toggle direction switches LTR and RTL.",
    initialUi: "Notice is LTR with 24px left padding, 8px right padding, and a 4px left accent.",
    requirements: [
      "LTR uses the specified left-start spacing and accent.",
      "RTL sets reading direction to rtl, with 24px right padding, 8px left padding, and a 4px right accent only.",
      "Toggling back restores LTR while retaining the same Notice text and markup.",
    ],
    examples: [
      example(
        "Inspect LTR",
        "Direction starts LTR.",
        "Inspect Notice spacing and accent.",
        "Left padding is 24px, right padding 8px, and the 4px accent is on the left.",
      ),
      example(
        "Choose RTL",
        "Notice is currently LTR.",
        "Activate Toggle direction.",
        "Direction becomes RTL; padding and accent mirror to the specified sides.",
      ),
      example(
        "Restore LTR",
        "Notice is currently RTL.",
        "Activate Toggle direction again.",
        "Original spacing and left accent return while text remains Notice.",
      ),
    ],
  },
  "theme-tokens": {
    title: "Summary card themes",
    goal: "Apply the supplied color themes consistently to related cards without disturbing their content.",
    inputs:
      "Cards are Orders and Returns. Light surface/text are #ffffff/#111111; dark surface/text are #111111/#ffffff through local semantic tokens.",
    initialUi: "Both cards use white surfaces with #111111 text. Toggle theme is available.",
    requirements: [
      "Both cards use the specified light colors initially.",
      "Toggle theme applies the specified dark colors to both; toggling again restores light.",
      "Retain content and DOM identity. These color checks do not establish complete accessibility compliance.",
    ],
    examples: [
      example(
        "Inspect light mode",
        "The theme starts light.",
        "Inspect Orders and Returns.",
        "Both surfaces are #ffffff and both text colors are #111111.",
      ),
      example(
        "Choose dark mode",
        "Both cards are light.",
        "Activate Toggle theme.",
        "Both surfaces become #111111 with #ffffff text.",
      ),
      example(
        "Restore light mode",
        "Both cards are dark.",
        "Activate Toggle theme again.",
        "Both cards return to light colors with unchanged content and retained DOM elements.",
      ),
    ],
  },
  "bulk-selection": {
    title: "Filtered product selection",
    goal: "Support individual and bulk product selection while preserving choices outside the current search view.",
    inputs:
      "Products are Tea, Coffee, Cocoa. Query is case-insensitive; Select visible acts on current matches. Selected reports the total across all products.",
    initialUi:
      "Query is empty; all products are visible and unchecked. Select visible is unchecked and Selected reads 0.",
    requirements: [
      "Select visible selects all matches or clears only those matches when all are selected.",
      "A partial visible selection is exposed as indeterminate; no matches disables Select visible.",
      "Hidden choices survive filtering and contribute to Selected.",
    ],
    examples: [
      example(
        "Select part of the view",
        "All three products are visible and unselected.",
        "Select Tea.",
        "Selected reads 1 and Select visible is indeterminate.",
      ),
      example(
        "Select the full view",
        "Only Tea is selected, with all products visible.",
        "Activate Select visible.",
        "All three products are checked; Selected is 3 and Select visible is checked without an indeterminate state.",
      ),
      example(
        "Preserve hidden choices",
        "Tea is selected and the other two are not.",
        "Enter CO in Query, activate Select visible twice, then clear Query.",
        "Coffee and Cocoa become selected then cleared; Tea stays selected and total returns to 1.",
      ),
    ],
  },
  "dependent-selects": {
    title: "Shipping destination selection",
    goal: "Keep country, city options, and the shipping summary valid through destination changes.",
    inputs:
      "France offers Paris and Lyon. Japan offers Tokyo and Osaka. A country change selects its first city.",
    initialUi: "Country is France, City is Paris, and summary reads France / Paris.",
    requirements: [
      "The summary and selected options always name a valid country/city pair.",
      "Changing to Japan selects Tokyo; a subsequent city choice can select Osaka.",
      "Changing back to France selects Paris rather than retaining a city from Japan.",
    ],
    examples: [
      example(
        "Change country",
        "France / Paris is selected.",
        "Choose Japan in Country.",
        "City becomes Tokyo and summary reads Japan / Tokyo.",
      ),
      example(
        "Choose another city",
        "Country is Japan and City is Tokyo.",
        "Choose Osaka in City.",
        "Summary reads Japan / Osaka.",
      ),
      example(
        "Return to France",
        "Japan / Osaka is selected.",
        "Choose France in Country.",
        "City becomes Paris; options are Paris and Lyon; summary reads France / Paris.",
      ),
    ],
  },
  "dialog-focus": {
    title: "Settings dialog interaction",
    goal: "Support a focused settings task with predictable dismissal and draft preservation.",
    inputs:
      "Edit settings opens Settings. Display name accepts text such as Ada. Cancel and Escape dismiss the dialog.",
    initialUi:
      "Edit settings is available and the settings dialog is closed; Display name begins empty.",
    requirements: [
      "Edit settings opens a labelled native modal named Settings and focuses Display name.",
      "Cancel closes the dialog and returns focus to Edit settings; reopening retains typed content.",
      "Escape closes through the modal's native cancellation behavior and restores trigger focus.",
    ],
    examples: [
      example(
        "Open settings",
        "The settings dialog is closed.",
        "Activate Edit settings.",
        "Settings opens modally and Display name receives focus.",
      ),
      example(
        "Cancel and reopen",
        "Settings is open with Display name Ada.",
        "Activate Cancel, then Edit settings.",
        "Cancel returns focus to the trigger; reopening shows Ada and focuses the field.",
      ),
      example(
        "Dismiss with Escape",
        "Settings is open and the field has focus.",
        "Press Escape.",
        "The dialog closes and focus returns to Edit settings.",
      ),
    ],
  },
  "tab-contract": {
    title: "Project information tabs",
    goal: "Keep project tabs, keyboard focus, and visible content aligned through automatic tab activation.",
    inputs:
      "Overview contains Project summary; Activity contains Recent changes. Left/Right wrap, Home chooses the first tab, and End the last.",
    initialUi:
      "Overview is selected and is the only tab stop. Its named panel shows Project summary; Activity's panel is hidden.",
    requirements: [
      "Expose a tablist, two named tabs, and matching labelled tabpanels with one selected tab and one tab stop.",
      "ArrowLeft/Right and Home/End move actual focus and activate the corresponding panel.",
      "Each tab identifies its panel through aria-controls; inactive panels are hidden.",
    ],
    examples: [
      example(
        "Move to Activity",
        "Overview has focus and is selected.",
        "Press ArrowRight.",
        "Activity receives focus and selection; Recent changes is visible and Project summary is hidden.",
      ),
      example(
        "Move to the ends",
        "Activity has focus.",
        "Press Home, then End.",
        "Home focuses and selects Overview; End focuses and selects Activity.",
      ),
      example(
        "Wrap around",
        "Activity has focus and is selected.",
        "Press ArrowRight.",
        "Overview receives focus and selection; exactly one matching panel remains visible.",
      ),
    ],
  },
  "payload-validation": {
    title: "Profile data acceptance",
    goal: "Display valid profile data and give a recoverable error for values outside the supplied data contract.",
    inputs:
      "Valid profile: name Ada, numeric score 3. Invalid fixtures: numeric-string score, null, blank name, negative score, or Infinity. Fixtures are local, not HTTP responses.",
    initialUi:
      "Output reads No profile. The fixture-loading actions are available, and no validation alert is present.",
    requirements: [
      "Accept nonnull profile objects with a nonempty string name and a finite, nonnegative numeric score.",
      "Invalid fixtures announce Invalid profile and show No profile without crashing.",
      "Loading a valid profile later clears the error and displays Ada / 3.",
    ],
    examples: [
      example(
        "Load a valid profile",
        "The supplied valid fixture has name Ada and score 3.",
        "Activate Load valid.",
        "Output reads Ada / 3 with no validation alert.",
      ),
      example(
        "Reject malformed data",
        "The invalid fixture choices are available.",
        "Try Load wrong type, Load null, Load infinite, Load blank, and Load negative.",
        "Each shows Invalid profile in an alert and No profile in the output.",
      ),
      example(
        "Recover after rejection",
        "An invalid fixture has produced an alert.",
        "Activate Load valid.",
        "Ada / 3 replaces No profile and the obsolete alert disappears.",
      ),
    ],
  },
  "hook-isolation": {
    title: "Independent note cards",
    goal: "Keep each person's note editing and reset actions independent within the supplied reusable note feature.",
    inputs:
      "Cards are Ada and Grace. Each has an editable draft and a named Reset action. Retain the shared draft-hook API.",
    initialUi:
      "Ada and Grace both have empty drafts and their own Reset Ada and Reset Grace actions.",
    requirements: [
      "Typing either draft updates only that person's card.",
      "Reset Ada clears only Ada; Reset Grace clears only Grace.",
      "Retain the reusable hook interface without duplicating its implementation.",
    ],
    examples: [
      example(
        "Edit Ada",
        "Both drafts are empty.",
        "Enter A into Ada.",
        "Ada reads A and Grace remains empty.",
      ),
      example(
        "Edit both cards",
        "Ada contains A and Grace is empty.",
        "Enter G into Grace.",
        "Grace reads G and Ada still reads A.",
      ),
      example(
        "Reset independently",
        "Ada is A and Grace is G.",
        "Activate Reset Ada, then Reset Grace.",
        "Ada clears first while Grace stays G; Reset Grace then clears only Grace.",
      ),
    ],
  },
  "keyboard-listbox": {
    title: "Keyboard theme picker",
    goal: "Let people explore theme choices with the keyboard and deliberately commit their selection.",
    inputs:
      "Theme choices are Calm, Contrast, Paper. Arrows wrap; Home/End explore the ends. Enter or Space commits; clicking commits directly.",
    initialUi:
      "Theme is a labelled single-select listbox. Calm is selected and its only option tab stop; Selected theme reads Calm.",
    requirements: [
      "Arrow and Home/End navigation changes focus without changing selection.",
      "Enter or Space selects the focused option; a click focuses and selects its option.",
      "Exactly one option is selected and one is tabbable; Selected theme reports the committed choice. Use supplied button options for this bounded exercise.",
    ],
    examples: [
      example(
        "Explore without committing",
        "Calm is selected and focused.",
        "Press ArrowDown once.",
        "Contrast receives focus while Selected theme remains Calm.",
      ),
      example(
        "Commit a choice",
        "Contrast has focus while Calm remains selected.",
        "Press Enter.",
        "Contrast becomes the sole selected option and Selected theme reads Contrast.",
      ),
      example(
        "Wrap and select the end",
        "Calm has focus in a fresh picker.",
        "Press ArrowUp to Paper, then Space; click Contrast afterward.",
        "Paper is selected first; clicking Contrast focuses and selects it with one option tab stop.",
      ),
    ],
  },
  "undo-history": {
    title: "Draft editing history",
    goal: "Support bounded Undo and Redo through draft edits, including edits made after navigating backward.",
    inputs:
      "Draft starts empty. Each distinct input change is one checkpoint; retain at most five past checkpoints. Unchanged values add no checkpoint.",
    initialUi: "Draft is empty, Past count is 0, and Undo and Redo are disabled.",
    requirements: [
      "Undo restores the preceding draft and Redo reapplies the next; disable actions at their boundaries.",
      "Editing after Undo makes the new text the current branch and leaves no Redo action for abandoned edits.",
      "Past count reports at most five retained entries; unchanged values do not extend history.",
    ],
    examples: [
      example(
        "Move backward and forward",
        "A fresh draft is empty.",
        "Change Draft to A, then B; activate Undo, then Redo.",
        "Undo shows A and Redo shows B.",
      ),
      example(
        "Edit after Undo",
        "Draft changes were A, then B.",
        "Activate Undo, change Draft to C, then attempt Redo.",
        "Draft stays C and Redo is disabled.",
      ),
      example(
        "Reach the history bound",
        "Start from an empty draft.",
        "Set Draft successively to 0 through 8; attempt Undo six times.",
        "Past count peaks at 5; only five undos are possible and the oldest retained draft is 3.",
      ),
    ],
  },
  "request-cache": {
    title: "Profile picker requests",
    goal: "Keep profile selection responsive while avoiding repeat service work for pending or previously loaded profiles.",
    inputs:
      "The local load fixture resolves Ada in 150ms and Grace in 30ms. Request count counts calls, not selections; fresh mounts begin independently.",
    initialUi:
      "Profile reads Choose a profile, Request count is 0, and Ada and Grace actions are available.",
    requirements: [
      "Selecting an unloaded profile shows Loading, then only the currently selected profile's name.",
      "Revisiting a successfully loaded profile displays it immediately without an additional request.",
      "Repeated selection of the same pending profile makes one request. Preserve the local load fixture and per-mount isolation.",
    ],
    examples: [
      example(
        "Choose a faster profile last",
        "Neither profile has loaded.",
        "Activate Ada, then Grace; wait 200ms.",
        "Profile reads Grace after both finish and Request count is 2.",
      ),
      example(
        "Revisit a loaded profile",
        "Both profiles have loaded and Grace is selected.",
        "Activate Ada.",
        "Ada appears immediately and Request count stays 2.",
      ),
      example(
        "Repeat a pending selection",
        "A fresh preview has 0 requests.",
        "Activate Ada twice before its 150ms response.",
        "Request count is 1; after completion Profile reads Ada.",
      ),
    ],
  },
  "async-combobox": {
    title: "Asynchronous name suggestions",
    goal: "Provide a keyboard-friendly name picker whose suggestions follow the current query and dismissal choices.",
    inputs:
      "The unchanged suggest fixture searches Ada, Grace, Linus case-insensitively. Query a resolves in 160ms; other queries, including gr, in 30ms.",
    initialUi:
      "Name is empty, the labelled combobox is collapsed, and there are no suggestions. Input retains focus during keyboard exploration.",
    requirements: [
      "Expose named combobox/listbox relationships, expanded state, stable option ids, and active-descendant feedback during exploration.",
      "Results match the latest query; unmatched text announces No matches and empty input clears suggestions.",
      "Arrows wrap through options; Enter commits; Escape dismisses until another edit without pending work reopening the popup. Preserve suggest.",
    ],
    examples: [
      example(
        "Change the query quickly",
        "Name is empty.",
        "Enter a, then gr before the first response; wait 220ms.",
        "Only Grace is offered and the combobox is expanded.",
      ),
      example(
        "Explore and commit",
        "Enter a and wait for Ada and Grace suggestions.",
        "Press ArrowUp, ArrowDown, then Enter.",
        "Exploration highlights Grace then Ada while input keeps focus; Enter sets Name to Ada and collapses suggestions.",
      ),
      example(
        "Dismiss pending suggestions",
        "Query a was just entered.",
        "Press Escape and wait 210ms; then enter missing and finally clear Name.",
        "Escape keeps suggestions closed; missing announces No matches; clearing leaves the combobox collapsed.",
      ),
    ],
  },
  "inline-editing": {
    title: "Editable profile name",
    goal: "Let people edit, cancel, and save a profile name without losing newer work during a pending save.",
    inputs:
      "Saved name begins Ada. The unchanged saveName fixture responds after 100ms, rejects fail with Save rejected, and otherwise acknowledges the submitted text.",
    initialUi: "Saved name reads Ada, Edit name is available, and the editor is closed.",
    requirements: [
      "Edit name opens and focuses Name. Cancel restores the confirmed value and returns focus to Edit name.",
      "Save submits trimmed text, prevents overlapping saves, and preserves a rejected draft with Save rejected feedback.",
      "An acknowledgement updates Saved name to submitted text. Keep newer typing open; otherwise close and restore trigger focus. Preserve saveName.",
    ],
    examples: [
      example(
        "Cancel an edit",
        "Saved name is Ada.",
        "Open Edit name, type Grace, activate Cancel, then reopen.",
        "Saved name remains Ada; focus returns to Edit name on cancel; reopened Name contains Ada.",
      ),
      example(
        "Type while saving",
        "Edit name is open.",
        "Enter Grace with surrounding spaces, Save, then type Linus before 100ms elapses.",
        "Save is unavailable while pending; Saved name becomes Grace while the newer Linus draft remains editable.",
      ),
      example(
        "Recover a rejected name",
        "Saved name is Ada and editing is open.",
        "Save fail and wait; then change Name to Grace and save again.",
        "First save announces Save rejected and retains fail; the next confirms Grace, closes editing, and returns focus to Edit name.",
      ),
    ],
  },
  "abortable-search": {
    title: "Search cancellation feedback",
    goal: "Keep search results and cancellation feedback aligned with replacements and Clear actions.",
    inputs:
      "The supplied local lookup takes 160ms for Ada and 30ms for Grace. Cancelled counts unfinished requests stopped through its supplied cancellation contract; this is not HTTP.",
    initialUi:
      "Status is Idle and Cancelled is 0. Search Ada, Search Grace, and Clear are available.",
    requirements: [
      "Selecting Grace while Ada is pending stops the earlier work and keeps Grace as the visible result.",
      "Clear stops pending work, leaves Idle, and produces no error or late result after the old deadline.",
      "Cancelled reflects fixture cancellations; expected cancellation does not announce Search failed. Preserve lookup and cancelled.",
    ],
    examples: [
      example(
        "Complete one search",
        "Status starts Idle.",
        "Activate Search Grace and wait beyond 30ms.",
        "Status changes from Loading to Grace.",
      ),
      example(
        "Replace pending work",
        "No search has completed yet.",
        "Activate Search Ada, then Search Grace while Ada is pending; wait 220ms.",
        "Grace remains visible and Cancelled is at least 1, with no cancellation alert.",
      ),
      example(
        "Clear pending work",
        "A fresh Ada search is pending.",
        "Activate Clear and wait 220ms.",
        "Status stays Idle, Cancelled is at least 1, and no late Ada result or Search failed message appears.",
      ),
    ],
  },
  "reorder-focus": {
    title: "Playlist ordering controls",
    goal: "Let keyboard and pointer users reorder a playlist while retaining their place and hearing position feedback.",
    inputs:
      "The initial playlist is Ada, Grace, Linus. Each Move <name> up action moves that record one position earlier.",
    initialUi:
      "Ada is first with a disabled Move Ada up; Grace and Linus have enabled actions. A status region is initially empty.",
    requirements: [
      "Moving an item updates its position and announces <name> moved to position <position> of 3.",
      "The first row's action is disabled and cannot change order; retain each record's DOM identity.",
      "Focus stays on the moved record's enabled action, or its heading when moving to first place disables that action.",
    ],
    examples: [
      example(
        "Move Grace to first",
        "Order is Ada, Grace, Linus.",
        "Activate Move Grace up.",
        "Order becomes Grace, Ada, Linus; status announces Grace moved to position 1 of 3; Grace's heading receives focus.",
      ),
      example(
        "Move Linus twice",
        "A fresh order is Ada, Grace, Linus.",
        "Activate Move Linus up twice.",
        "First move retains focus on Move Linus up at position 2; second focuses Linus's heading at position 1, with matching announcements.",
      ),
      example(
        "Respect the first position",
        "Ada is first in a fresh playlist.",
        "Attempt Move Ada up.",
        "The action is disabled and order stays Ada, Grace, Linus.",
      ),
    ],
  },
};

const debugTags: Record<string, string[]> = {
  "web-foundations": ["HTML", "Browser interaction"],
  "interface-design": ["CSS", "Design"],
  "mental-model": ["React", "Interaction"],
  async: ["Async", "UI feedback"],
  architecture: ["Components", "Interaction"],
  production: ["Reliability", "UI feedback"],
};

export function configureDebugBrief(challenge: Challenge): Challenge {
  if (challenge.kind !== "debug") return challenge;
  const definition = debugBriefs[challenge.id];
  if (!definition) throw new Error(`Missing debugging brief: ${challenge.id}`);
  const { title, goal, requirements, ...debugBrief } = definition;
  return {
    ...challenge,
    title,
    summary: goal,
    brief: goal,
    requirements,
    tags: debugTags[challenge.track] ?? challenge.tags,
    debugBrief,
  };
}
