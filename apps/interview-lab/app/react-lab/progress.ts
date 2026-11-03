import { challenges, findChallenge } from "./curriculum";

export type Entry = {
  code: string;
  notes: string;
  completed: boolean;
  stage?: number;
  answerRevealed?: boolean;
};
export type Notebook = {
  version: 1;
  entries: Record<string, Entry>;
  resets?: Record<string, string>;
};
export const notebookKey = "stepwise.react-lab.v1";
export const maxCodeLength = 30000;
export const maxNotesLength = 12000;
export const emptyNotebook = (): Notebook => ({ version: 1, entries: {} });

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Storage is untrusted; unsupported entries never become runnable drafts.
export function parseNotebook(raw: string | null): Notebook {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (!isRecord(value) || value.version !== 1 || !isRecord(value.entries)) return emptyNotebook();
    const entries: Record<string, Entry> = {};
    for (const [id, entry] of Object.entries(value.entries)) {
      if (!findChallenge(id) || !isRecord(entry)) continue;
      if (
        typeof entry.code !== "string" ||
        entry.code.length > maxCodeLength ||
        typeof entry.notes !== "string" ||
        entry.notes.length > maxNotesLength ||
        typeof entry.completed !== "boolean"
      )
        continue;
      const challenge = findChallenge(id);
      entries[id] = { code: entry.code, notes: entry.notes, completed: entry.completed };
      if (entry.answerRevealed === true) {
        entries[id].answerRevealed = true;
        entries[id].completed = false;
      }
      if (
        Number.isInteger(entry.stage) &&
        Number(entry.stage) >= 0 &&
        Number(entry.stage) < (challenge?.stages?.length ?? 0)
      )
        entries[id].stage = Number(entry.stage);
    }
    const resets: Record<string, string> = {};
    if (isRecord(value.resets))
      for (const [id, token] of Object.entries(value.resets)) {
        if (
          findChallenge(id) &&
          typeof token === "string" &&
          token.length > 0 &&
          token.length <= 80
        )
          resets[id] = token;
      }
    return { version: 1, entries, ...(Object.keys(resets).length ? { resets } : {}) };
  } catch {
    return emptyNotebook();
  }
}

export function recordAttempt(
  notebook: Notebook,
  id: string,
  code: string,
  notes: string,
  passed: boolean,
  stage?: number,
  answerRevealed = false,
): Notebook {
  if (!findChallenge(id) || notebook.entries[id]?.answerRevealed) return notebook;
  return {
    ...notebook,
    entries: {
      ...notebook.entries,
      [id]: {
        ...notebook.entries[id],
        ...(stage === undefined ? {} : { stage }),
        code,
        notes,
        completed: !answerRevealed && passed && notes.trim().length > 0,
        ...(answerRevealed ? { answerRevealed: true } : {}),
      },
    },
  };
}

// Reset tokens invalidate stale model responses and distinguish deletion from an untouched draft.
export function resetNotebook(notebook: Notebook, token: string, id?: string): Notebook {
  const ids = id ? [id] : challenges.map((challenge) => challenge.id);
  const entries = { ...notebook.entries },
    resets = { ...notebook.resets };
  for (const challengeId of ids) {
    if (!findChallenge(challengeId)) continue;
    delete entries[challengeId];
    resets[challengeId] = token;
  }
  return { version: 1, entries, resets };
}
