// Detector → renderer contract (ADR 0004). Only the views built so far.

export type ViewSpec = {
  /** 0..1 */
  confidence: number;
  badge: string;
  /** At most three. */
  views: View[];
};

export type View =
  | { type: "array"; bind: string; pointers: string[] }
  // Spec draft has one `cursor`; BFS needs scan, current and neighbor cells at once.
  | { type: "grid"; bind: string; cursors: [string, string][]; overlays?: Overlay[] };

/** `set` names a grid of booleans the same shape as the view's grid. */
export type Overlay = { set: string; style: "visited" };
