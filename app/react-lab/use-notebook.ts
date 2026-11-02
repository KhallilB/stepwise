import { useEffect, useRef, useState } from "react";
import { parseAttempts, reviewStorageKey } from "./coach";
import { challenges, findChallenge } from "./curriculum";
import {
  type Entry,
  emptyNotebook,
  type Notebook,
  notebookKey,
  parseNotebook,
  recordAttempt,
  resetNotebook,
} from "./progress";

const sameEntry = (a: Entry | undefined, b: Entry | undefined): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

export function useNotebook(activeId?: string) {
  const [notebook, setNotebook] = useState<Notebook>(emptyNotebook);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [resetWarning, setResetWarning] = useState("");
  const [conflict, setConflict] = useState(false);
  const disk = useRef<Notebook>(emptyNotebook());
  useEffect(() => {
    setConflict(false);
    try {
      const initial = parseNotebook(localStorage.getItem(notebookKey));
      disk.current = initial;
      setNotebook(initial);
    } catch {
      setStorageError(true);
    }
    setReady(true);
    function changed(event: StorageEvent) {
      if (event.key !== notebookKey) return;
      const external = parseNotebook(event.newValue);
      const activeChanged =
        !!activeId &&
        (!sameEntry(disk.current.entries[activeId], external.entries[activeId]) ||
          disk.current.resets?.[activeId] !== external.resets?.[activeId]);
      disk.current = external;
      setNotebook((current) => {
        const entries = { ...external.entries };
        if (activeId) {
          const local = current.entries[activeId];
          if (local) entries[activeId] = local;
          else delete entries[activeId];
        }
        const resets = { ...external.resets };
        if (activeId && activeChanged) {
          const token = current.resets?.[activeId];
          if (token) resets[activeId] = token;
          else delete resets[activeId];
        }
        return { ...external, entries, resets };
      });
      if (activeChanged) setConflict(true);
    }
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, [activeId]);

  function persist(next: Notebook) {
    localStorage.setItem(notebookKey, JSON.stringify(next));
    disk.current = next;
    setStorageError(false);
  }
  function save(id: string, entry: Entry) {
    const local = recordAttempt(
      notebook,
      id,
      entry.code,
      entry.notes,
      entry.completed,
      entry.stage,
      entry.answerRevealed,
    );
    setNotebook(local);
    try {
      const latest = parseNotebook(localStorage.getItem(notebookKey));
      if (
        conflict ||
        !sameEntry(disk.current.entries[id], latest.entries[id]) ||
        disk.current.resets?.[id] !== latest.resets?.[id]
      ) {
        setConflict(true);
        return;
      }
      const next: Notebook = {
        ...latest,
        entries: { ...latest.entries, [id]: local.entries[id] ?? entry },
      };
      persist(next);
      setNotebook(next);
    } catch {
      setStorageError(true);
    }
  }
  function resolveConflict(keepLocal: boolean) {
    if (!activeId) return;
    try {
      const latest = parseNotebook(localStorage.getItem(notebookKey));
      if (keepLocal) {
        const entry = notebook.entries[activeId] ?? {
          code: findChallenge(activeId)?.starter ?? "",
          notes: "",
          completed: false,
        };
        const restored = latest.entries[activeId]?.answerRevealed
          ? { ...entry, answerRevealed: true, completed: false }
          : entry;
        const next: Notebook = { ...latest, entries: { ...latest.entries, [activeId]: restored } };
        persist(next);
        setNotebook(next);
      } else {
        disk.current = latest;
        setNotebook(latest);
      }
      setConflict(false);
    } catch {
      setStorageError(true);
    }
  }
  function reset(id?: string): boolean {
    setResetWarning("");
    try {
      const latest = parseNotebook(localStorage.getItem(notebookKey));
      const next = resetNotebook(latest, crypto.randomUUID(), id);
      persist(next);
      setNotebook(next);
      setConflict(false);
      for (const challenge of challenges)
        if (!id || challenge.id === id) {
          try {
            localStorage.removeItem(reviewStorageKey(challenge.id));
          } catch {
            setResetWarning(
              "Progress was reset. Some older coaching files could not be deleted from device storage; they are excluded from new attempts and exports.",
            );
          }
        }
      return true;
    } catch {
      setStorageError(true);
      return false;
    }
  }
  function download() {
    let generations = notebook.resets;
    try {
      generations = parseNotebook(localStorage.getItem(notebookKey)).resets;
    } catch {
      /* In-memory export stays available. */
    }
    const coaching = Object.fromEntries(
      challenges.map((challenge) => {
        try {
          return [
            challenge.id,
            parseAttempts(localStorage.getItem(reviewStorageKey(challenge.id))).filter(
              (attempt) => attempt.resetToken === generations?.[challenge.id],
            ),
          ];
        } catch {
          return [challenge.id, []];
        }
      }),
    );
    const blob = new Blob(
      [JSON.stringify({ ...notebook, resets: generations, coaching }, null, 2)],
      {
        type: "application/json",
      },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "stepwise-react-notebook.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return {
    notebook,
    ready,
    storageError,
    conflict,
    resolveConflict,
    save,
    download,
    reset,
    resetWarning,
  };
}
