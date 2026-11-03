export const dimensions = [
  { id: "correctness", label: "Technical correctness" },
  { id: "reasoning", label: "Reasoning & diagnosis" },
  { id: "tradeoffs", label: "Tradeoffs & depth" },
] as const;
export type Dimension = (typeof dimensions)[number]["id"];
export type Assessment = { score: number; evidence: string; improve: string };
export type Review = Record<Dimension, Assessment> & {
  communication?: Assessment;
  summary: string;
  strengths: string[];
  nextSteps: string[];
  followUp: string;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function validText(value: unknown, max = 2000): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}
export function parseReview(value: unknown): Review | null {
  if (!isRecord(value) || !validText(value.summary) || !validText(value.followUp)) return null;
  const ids = [
    ...dimensions.map(({ id }) => id),
    ...(value.communication === undefined ? [] : ["communication"]),
  ];
  for (const id of ids) {
    const item = value[id];
    if (
      !isRecord(item) ||
      !Number.isInteger(item.score) ||
      Number(item.score) < 0 ||
      Number(item.score) > 5 ||
      !validText(item.evidence) ||
      !validText(item.improve)
    )
      return null;
  }
  for (const key of ["strengths", "nextSteps"]) {
    const items = value[key];
    if (
      !Array.isArray(items) ||
      items.length < 1 ||
      items.length > 5 ||
      !items.every((item) => validText(item, 1000))
    )
      return null;
  }
  // Fail closed on answer-shaped code; conceptual advice still needs critical reading.
  if (/```|export\s+default|function\s+App\s*\(|return\s*\(?\s*</i.test(JSON.stringify(value)))
    return null;
  return value as Review;
}
export function reviewScore(review: Review): number {
  return Math.round(
    (dimensions.reduce((total, { id }) => total + review[id].score, 0) / (dimensions.length * 5)) *
      100,
  );
}
const assessmentSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    score: { type: "integer", minimum: 0, maximum: 5 },
    evidence: { type: "string" },
    improve: { type: "string" },
  },
  required: ["score", "evidence", "improve"],
};
export const reviewSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    ...Object.fromEntries(dimensions.map(({ id }) => [id, assessmentSchema])),
    strengths: { type: "array", items: { type: "string" } },
    nextSteps: { type: "array", items: { type: "string" } },
    followUp: { type: "string" },
  },
  required: ["summary", ...dimensions.map(({ id }) => id), "strengths", "nextSteps", "followUp"],
};
export const communicationReviewSchema = {
  ...reviewSchema,
  properties: { ...reviewSchema.properties, communication: assessmentSchema },
  required: [...reviewSchema.required, "communication"],
};

export type ReviewAttempt = {
  stage?: number;
  resetToken?: string;
  code: string;
  explanation: string;
  model: string;
  createdAt: string;
  review: Review;
};
export const reviewStorageKey = (id: string): string => `stepwise.react-reviews.v1.${id}`;
export function parseAttempts(raw: string | null): ReviewAttempt[] {
  if (!raw || raw.length > 500000) return [];
  try {
    const values: unknown = JSON.parse(raw);
    if (!Array.isArray(values)) return [];
    return values.slice(0, 3).flatMap((value) => {
      if (
        !isRecord(value) ||
        typeof value.code !== "string" ||
        value.code.length > 30000 ||
        typeof value.explanation !== "string" ||
        value.explanation.length > 12000 ||
        typeof value.model !== "string" ||
        value.model.length > 100 ||
        typeof value.createdAt !== "string" ||
        !Number.isFinite(Date.parse(value.createdAt))
      )
        return [];
      if (
        value.stage !== undefined &&
        (!Number.isInteger(value.stage) || Number(value.stage) < 0 || Number(value.stage) > 2)
      )
        return [];
      if (
        value.resetToken !== undefined &&
        (typeof value.resetToken !== "string" ||
          !value.resetToken.length ||
          value.resetToken.length > 80)
      )
        return [];
      const review = parseReview(value.review);
      return review
        ? [
            {
              ...(value.stage === undefined ? {} : { stage: Number(value.stage) }),
              ...(typeof value.resetToken === "string" && value.resetToken.length <= 80
                ? { resetToken: value.resetToken }
                : {}),
              code: value.code,
              explanation: value.explanation,
              model: value.model,
              createdAt: value.createdAt,
              review,
            },
          ]
        : [];
    });
  } catch {
    return [];
  }
}
