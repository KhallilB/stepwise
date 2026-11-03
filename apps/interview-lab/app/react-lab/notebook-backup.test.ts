import { expect, it } from "vitest";
import { parseNotebookBackup } from "./notebook-backup";

it("restores existing notebook exports and rejects invalid backups without replacement", () => {
  const entries = {
    snapshot: { code: "export default function App() {}", notes: "reasoning", completed: false },
  };
  expect(parseNotebookBackup(JSON.stringify({ version: 1, entries })).notebook.entries).toEqual(
    entries,
  );
  for (const value of [
    { version: 2, entries },
    { version: 1, entries: { snapshot: { code: 1 } } },
    { version: 1, entries: { unknown: entries.snapshot } },
    { version: 1, entries, coaching: { snapshot: [{ review: "bad" }] } },
  ]) {
    expect(() => parseNotebookBackup(JSON.stringify(value))).toThrow();
  }
});
