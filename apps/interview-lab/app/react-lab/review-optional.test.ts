import { expect, it } from "vitest";
import { handleCoachRequest, readCoachConfig } from "../../workers/react-lab-ai";
import { parseAttempts, parseReview, reviewSchema, reviewScore } from "./coach";

const assessment = {
  score: 5,
  evidence: "Handles repeated actions.",
  improve: "Try an edge case.",
};
const review = {
  summary: "The implementation meets the stated behavior.",
  correctness: assessment,
  reasoning: assessment,
  tradeoffs: assessment,
  strengths: ["Keeps state updates consistent."],
  nextSteps: ["Test repeated actions after resetting."],
  followUp: "What changes when updates are queued together?",
};

it("accepts implementation feedback without a communication assessment", () => {
  expect(parseReview(review)).toEqual(review);
  expect(reviewSchema.required).not.toContain("communication");
  expect(reviewSchema.properties).not.toHaveProperty("communication");
});

it("communication never changes the implementation score", () => {
  for (const score of [0, 5]) {
    const parsed = parseReview({ ...review, communication: { ...assessment, score } });
    expect(parsed).not.toBeNull();
    if (!parsed) throw new Error("Expected valid legacy or optional feedback");
    expect(reviewScore(parsed)).toBe(100);
  }
});

it("keeps legacy saved feedback and rejects malformed optional feedback", () => {
  const attempt = {
    code: "export default function App() {}",
    explanation: "An earlier explanation.",
    model: "local-model",
    createdAt: "2026-11-03T12:00:00Z",
    review: { ...review, communication: assessment },
  };
  expect(parseAttempts(JSON.stringify([attempt]))[0]?.review.communication).toEqual(assessment);
  expect(parseReview({ ...review, communication: { ...assessment, score: 9 } })).toBeNull();
});

it("code-only requests use the implementation schema and accept three dimensions", async () => {
  const config = readCoachConfig(
    { REACT_LAB_REVIEW_PROVIDER: "ollama", OLLAMA_URL: "http://127.0.0.1:11434" },
    true,
  );
  let schema: { required: string[] } | undefined;
  const response = await handleCoachRequest(
    new Request("http://localhost:5173/api/react-lab/review", {
      method: "POST",
      headers: { origin: "http://localhost:5173", "content-type": "application/json" },
      body: JSON.stringify({
        challengeId: "snapshot",
        code: "export default function App() { return null; }",
        explanation: "",
      }),
    }),
    config,
    async (_url, init) => {
      schema = JSON.parse(String(init?.body)).format;
      return new Response(
        JSON.stringify({ done: true, message: { content: JSON.stringify(review) } }),
      );
    },
  );
  expect(response.status).toBe(200);
  expect(schema?.required).toEqual([
    "summary",
    "correctness",
    "reasoning",
    "tradeoffs",
    "strengths",
    "nextSteps",
    "followUp",
  ]);
});

for (const reviewProvider of ["ollama", "openai"] as const) {
  it(`${reviewProvider} requests separate communication feedback only for nonempty explanation`, async () => {
    const config = readCoachConfig(
      { REACT_LAB_REVIEW_PROVIDER: reviewProvider, OPENAI_API_KEY: "test-key" },
      true,
    );
    for (const explanation of ["   ", "I chose functional updates."]) {
      let sent:
        | {
            format: { required: string[] };
            text: { format: { schema: { required: string[] } } };
            messages: { content: string }[];
            instructions: string;
            input: string;
          }
        | undefined;
      const assessment = explanation.trim()
        ? {
            ...review,
            communication: {
              score: 1,
              evidence: "Names the choice.",
              improve: "Explain the invariant.",
            },
          }
        : review;
      const response = await handleCoachRequest(
        new Request("http://localhost:5173/api/react-lab/review", {
          method: "POST",
          headers: { origin: "http://localhost:5173", "content-type": "application/json" },
          body: JSON.stringify({
            challengeId: "snapshot",
            code: "export default function App(){return null;}",
            explanation,
          }),
        }),
        config,
        async (_url, init) => {
          sent = JSON.parse(String(init.body));
          return new Response(
            JSON.stringify(
              reviewProvider === "ollama"
                ? { done: true, message: { content: JSON.stringify(assessment) } }
                : {
                    status: "completed",
                    output: [
                      {
                        type: "message",
                        content: [{ type: "output_text", text: JSON.stringify(assessment) }],
                      },
                    ],
                  },
            ),
          );
        },
      );
      expect(response.status).toBe(200);
      const schema = reviewProvider === "ollama" ? sent?.format : sent?.text.format.schema;
      expect(schema?.required.includes("communication")).toBe(!!explanation.trim());
      const instructions =
        reviewProvider === "ollama" ? sent?.messages[0]?.content : sent?.instructions;
      expect(instructions?.includes("requested separate communication feedback")).toBe(
        !!explanation.trim(),
      );
      expect(instructions).toContain("Do not penalize missing explanation");
      const input = JSON.parse(
        reviewProvider === "ollama" ? String(sent?.messages[1]?.content) : String(sent?.input),
      );
      expect(input.challenge).not.toHaveProperty("rubric");
      expect(reviewScore(((await response.json()) as { review: typeof review }).review)).toBe(100);
    }
  });
}
