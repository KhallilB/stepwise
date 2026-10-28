// Detector → renderer contract (ADR 0004). Only the views built so far.

export type ViewSpec = {
  /** 0..1 */
  confidence: number;
  badge: string;
  /** At most three. */
  views: View[];
};

export type View = { type: "array"; bind: string; pointers: string[] };
