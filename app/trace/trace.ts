// Runner → detector contract (ADR 0004). JavaScript values, adapted from the spec's Python-first draft.

export type HeapId = string;

export type Trace = {
  language: "javascript";
  source: string;
  steps: Step[];
  truncated?: "steps" | "time" | "memory";
};

export type StepTag = "compare" | "assign" | "append" | "pop" | "branch" | "index";

export type Step = {
  /** 1-based source line the step ran. */
  line: number;
  event: "line" | "call" | "return" | "exception";
  tags: StepTag[];
  /** Innermost frame last. */
  stack: Frame[];
  heap: Record<HeapId, HeapObj>;
  exception?: { type: string; message: string };
};

export type Frame = { fn: string; line: number; locals: Record<string, Value> };

export type Value =
  | { kind: "prim"; type: "number" | "string" | "boolean" | "null" | "undefined"; v: unknown }
  | { kind: "ref"; id: HeapId };

export type HeapObj =
  | { kind: "array"; items: Value[]; len: number; window?: [number, number] }
  | { kind: "object"; cls: string; fields: Record<string, Value> };

export const num = (v: number): Value => ({ kind: "prim", type: "number", v });
export const ref = (id: HeapId): Value => ({ kind: "ref", id });
