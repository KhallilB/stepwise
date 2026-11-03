import { isRecord, parseAttempts, type ReviewAttempt } from "./coach";
import { type Notebook, parseNotebook } from "./progress";

export function parseNotebookBackup(raw: string): {
  notebook: Notebook;
  coaching: Record<string, ReviewAttempt[]>;
} {
  const fail = () => {
    throw new Error("Choose a valid version 1 notebook backup. Saved work unchanged.");
  };
  if (raw.length > 10000000) return fail();
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return fail();
  }
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.entries)) return fail();
  const notebook = parseNotebook(raw);
  for (const [id, entry] of Object.entries(value.entries)) {
    const accepted = notebook.entries[id];
    if (
      !accepted ||
      !isRecord(entry) ||
      (entry.stage !== undefined && entry.stage !== accepted.stage)
    )
      return fail();
  }
  const coaching: Record<string, ReviewAttempt[]> = {};
  if (value.coaching !== undefined) {
    if (!isRecord(value.coaching)) return fail();
    for (const [id, attempts] of Object.entries(value.coaching)) {
      if (!Array.isArray(attempts) || attempts.length > 3) return fail();
      const parsed = parseAttempts(JSON.stringify(attempts));
      if (parsed.length !== attempts.length) return fail();
      coaching[id] = parsed.filter((attempt) => attempt.resetToken === notebook.resets?.[id]);
    }
  }
  return { notebook, coaching };
}
