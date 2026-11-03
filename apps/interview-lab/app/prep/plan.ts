export type PrepItem = {
  id: string;
  title: string;
  minutes: number;
  detail: string;
  question: string;
  exercise?: string;
  resources: { label: string; href: string }[];
};
export const progressKey = "interview.prep.senior-2026-11-04.v1";
export type PrepProgress = { version: 1; completed: string[] };
const resource = (label: string, href: string) => ({ label, href });
export const sections: { id: string; title: string; items: PrepItem[] }[] = [
  {
    id: "coding",
    title: "Build and explain",
    items: [
      {
        id: "semantic-action",
        title: "Notification signup",
        minutes: 10,
        exercise: "semantic-action",
        detail: "Warm up with semantic HTML, pointer and keyboard activation.",
        question: "Why choose a native button? Check Enter, Space and visible focus.",
        resources: [resource("Accessible forms", "https://www.w3.org/WAI/tutorials/forms/")],
      },
      {
        id: "snapshot",
        title: "Seat reservation counter",
        minutes: 20,
        exercise: "snapshot",
        detail: "Trace captured state, batching and functional updates.",
        question: "Why do three replacement updates differ from three functional updates?",
        resources: [resource("State as a snapshot", "https://react.dev/learn/state-as-a-snapshot")],
      },
      {
        id: "derived",
        title: "Ticket cart totals",
        minutes: 20,
        exercise: "derived",
        detail: "Calculate totals from source data and keep state ownership clear.",
        question: "Which values need state, and which can be calculated during rendering?",
        resources: [
          resource("When effects help", "https://react.dev/learn/you-might-not-need-an-effect"),
        ],
      },
      {
        id: "race",
        title: "People search results",
        minutes: 35,
        exercise: "race",
        detail: "Handle loading, errors and responses that arrive out of order.",
        question: "How does a response lose ownership when the user changes their query?",
        resources: [
          resource("Effect lifecycle", "https://react.dev/learn/lifecycle-of-reactive-effects"),
        ],
      },
      {
        id: "responsive-grid",
        title: "Responsive product shelf",
        minutes: 20,
        exercise: "responsive-grid",
        detail: "Check narrow screens, long content and layout constraints.",
        question: "Why Grid or Flexbox here? What prevents overflow?",
        resources: [
          resource("CSS Grid", "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout"),
        ],
      },
      {
        id: "accessible",
        title: "Workshop signup form",
        minutes: 35,
        exercise: "accessible",
        detail: "Make validation, labels and recovery work with a keyboard.",
        question: "How does a person find and recover from a rejected submission?",
        resources: [
          resource("Form feedback", "https://www.w3.org/WAI/tutorials/forms/notifications/"),
        ],
      },
      {
        id: "directory",
        title: "Build a resilient directory",
        minutes: 40,
        exercise: "build-directory",
        detail:
          "Use 35 minutes to build and five to explain. Combine filters, asynchronous loading and recovery.",
        question:
          "Explain components, state ownership, stale results and the next test you would add.",
        resources: [
          resource(
            "Choosing state structure",
            "https://react.dev/learn/choosing-the-state-structure",
          ),
        ],
      },
    ],
  },
  {
    id: "tooling",
    title: "Diagnose with tools",
    items: [
      {
        id: "devtools",
        title: "Browser DevTools",
        minutes: 20,
        exercise: "race",
        detail:
          "Inspect a real page asset request and record a UI interaction. Lab searches use promise fixtures, not HTTP.",
        question:
          "Is the delay network, JavaScript, layout or rendering? What evidence supports that?",
        resources: [
          resource("Network panel", "https://developer.chrome.com/docs/devtools/network"),
          resource("Performance panel", "https://developer.chrome.com/docs/devtools/performance"),
        ],
      },
      {
        id: "profiler",
        title: "React DevTools",
        minutes: 10,
        exercise: "memo",
        detail:
          "Inspect the lab dashboard's component tree and rendering costs in your regular browser with React DevTools.",
        question: "What would you measure before adding memoization?",
        resources: [resource("React DevTools", "https://react.dev/learn/react-developer-tools")],
      },
      {
        id: "types-build",
        title: "Types, lint and builds",
        minutes: 15,
        exercise: "payload-validation",
        detail:
          "Explain typechecking, runtime validation, formatting and production builds. Read the scripts in a project you know.",
        question: "Which step catches type errors? What validates JSON received at runtime?",
        resources: [
          resource("TypeScript strict mode", "https://www.typescriptlang.org/tsconfig/strict.html"),
          resource("Vite TypeScript", "https://vite.dev/guide/features.html#typescript"),
          resource("Biome", "https://biomejs.dev/installation/quick-start/"),
        ],
      },
      {
        id: "testing",
        title: "Test debugging",
        minutes: 15,
        exercise: "race",
        detail:
          "Read one behavior test. Explain its assertions, controlled responses and how you would investigate a failing trace.",
        question: "How do you distinguish a product defect from a timing-dependent test?",
        resources: [
          resource("Playwright practices", "https://playwright.dev/docs/best-practices"),
          resource("Trace Viewer", "https://playwright.dev/docs/trace-viewer"),
          resource("Testing Library", "https://testing-library.com/docs/guiding-principles/"),
          resource("Vitest", "https://vitest.dev/guide/"),
        ],
      },
      {
        id: "delivery",
        title: "CI and release safety",
        minutes: 10,
        detail:
          "Walk through locked installs, runtime versions, cache keys, checks, release artifacts and rollback.",
        question: "What evidence would make you comfortable shipping this change?",
        resources: [
          resource(
            "GitHub Actions",
            "https://docs.github.com/en/actions/get-started/understand-github-actions",
          ),
          resource("Clean installs", "https://docs.npmjs.com/cli/v11/commands/npm-ci/"),
        ],
      },
      {
        id: "a11y-tools",
        title: "Accessibility inspection",
        minutes: 5,
        exercise: "accessible",
        detail: "Inspect accessible names and roles, then complete the form with a keyboard.",
        question: "What needs keyboard or screen-reader testing beyond automated checks?",
        resources: [
          resource(
            "Accessibility tools",
            "https://developer.chrome.com/docs/devtools/accessibility/reference",
          ),
        ],
      },
    ],
  },
  {
    id: "discussion",
    title: "Rehearse senior-level decisions",
    items: [
      {
        id: "architecture",
        title: "Design beyond the fixture",
        minutes: 15,
        exercise: "build-directory",
        detail:
          "Discuss server and UI state, caching, SSR/hydration, authorization boundaries, performance and observability. These need discussion beyond the lab fixtures.",
        question:
          "Clarify constraints, compare options, choose a tradeoff, then explain verification and rollout.",
        resources: [resource("Web Vitals", "https://web.dev/articles/vitals")],
      },
      {
        id: "delivery-story",
        title: "Rehearse a delivery story",
        minutes: 15,
        detail:
          "Choose work you know well. Describe your contribution, constraints, collaboration, outcome and what you would change.",
        question: "How did you reduce scope or negotiate a technical tradeoff with other people?",
        resources: [resource("Component documentation", "https://storybook.js.org/docs")],
      },
      {
        id: "debugging-story",
        title: "Rehearse a debugging story",
        minutes: 15,
        detail:
          "Describe impact, hypotheses, evidence, recovery and prevention. Finish by checking your interview setup and taking a break.",
        question: "What changed your mind, and how did you prove the fix worked?",
        resources: [
          resource(
            "JavaScript execution",
            "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model",
          ),
        ],
      },
    ],
  },
];
const knownIds = new Set(sections.flatMap((section) => section.items.map((item) => item.id)));
export function parseProgress(raw: string | null): PrepProgress | null {
  try {
    if (!raw || raw.length > 4096) return null;
    const value = JSON.parse(raw);
    if (
      value?.version !== 1 ||
      !Array.isArray(value.completed) ||
      !value.completed.every((id: unknown) => typeof id === "string")
    )
      return null;
    return {
      version: 1,
      completed: [...new Set<string>(value.completed)].filter((id) => knownIds.has(id)),
    };
  } catch {
    return null;
  }
}
