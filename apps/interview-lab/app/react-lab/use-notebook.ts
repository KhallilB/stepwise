import { useCallback, useEffect, useState } from "react";
import { parseAttempts, reviewStorageKey } from "./coach";
import { challenges, findChallenge } from "./curriculum";
import { parseNotebookBackup } from "./notebook-backup";
import { useNotebookSession } from "./notebook-session";
import {
  type Entry,
  type Notebook,
  notebookKey,
  parseNotebook,
  recordAttempt,
  resetNotebook,
} from "./progress";

const sameEntry = (a: Entry | undefined, b: Entry | undefined): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

export function useNotebook(activeId?: string) {
  const { notebook, setNotebook, disk, hydrated, pending, storageError, setStorageError } =
    useNotebookSession();
  const [ready, setReady] = useState(false);
  const [resetWarning, setResetWarning] = useState("");
  const [conflict, setConflict] = useState(false);
  const retainPending = useCallback(
    (next: Notebook, current: Notebook): Notebook => {
      const entries = { ...next.entries },
        resets = { ...next.resets };
      for (const id of pending.current.keys()) {
        if (current.entries[id]) entries[id] = current.entries[id];
        if (current.resets?.[id]) resets[id] = current.resets[id];
        else delete resets[id];
      }
      return { ...next, entries, resets };
    },
    [pending],
  );
  useEffect(() => {
    if (hydrated.current) {
      setReady(true);
      return;
    }
    hydrated.current = true;
    try {
      const initial = parseNotebook(localStorage.getItem(notebookKey));
      disk.current = initial;
      setNotebook(initial);
    } catch {
      setStorageError(true);
    }
    setReady(true);
  }, [disk, hydrated, setNotebook, setStorageError]);
  useEffect(() => {
    const baseline = activeId ? pending.current.get(activeId) : undefined;
    setConflict(
      !!activeId &&
        !!baseline &&
        (!sameEntry(baseline.entry, disk.current.entries[activeId]) ||
          baseline.reset !== disk.current.resets?.[activeId]),
    );
    function changed(event: StorageEvent) {
      if (event.key !== notebookKey) return;
      const external = parseNotebook(event.newValue);
      const baseline = activeId ? pending.current.get(activeId) : undefined;
      const activeChanged =
        !!activeId &&
        (!sameEntry(
          baseline ? baseline.entry : disk.current.entries[activeId],
          external.entries[activeId],
        ) ||
          (baseline ? baseline.reset : disk.current.resets?.[activeId]) !==
            external.resets?.[activeId]);
      if (activeId && activeChanged && !pending.current.has(activeId))
        pending.current.set(activeId, {
          entry: disk.current.entries[activeId],
          reset: disk.current.resets?.[activeId],
        });
      for (const [id, saved] of pending.current)
        if (id !== activeId && saved.reset !== external.resets?.[id]) pending.current.delete(id);
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
        return retainPending({ ...external, entries, resets }, current);
      });
      if (activeChanged) setConflict(true);
    }
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, [activeId, disk, pending, retainPending, setNotebook]);

  function persist(next: Notebook) {
    localStorage.setItem(notebookKey, JSON.stringify(next));
    disk.current = next;
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
    if (!pending.current.has(id))
      pending.current.set(id, {
        entry: disk.current.entries[id],
        reset: disk.current.resets?.[id],
      });
    setNotebook(local);
    try {
      const latest = parseNotebook(localStorage.getItem(notebookKey));
      const baseline = pending.current.get(id);
      if (
        conflict ||
        !sameEntry(baseline?.entry, latest.entries[id]) ||
        baseline?.reset !== latest.resets?.[id]
      ) {
        setConflict(true);
        return;
      }
      const next: Notebook = {
        ...latest,
        entries: { ...latest.entries, [id]: local.entries[id] ?? entry },
      };
      persist(next);
      pending.current.delete(id);
      setNotebook(retainPending(next, local));
      setStorageError([...pending.current.values()].some((value) => value.failed));
    } catch {
      const baseline = pending.current.get(id);
      if (baseline) baseline.failed = true;
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
        pending.current.delete(activeId);
        setNotebook(retainPending(next, notebook));
      } else {
        disk.current = latest;
        pending.current.delete(activeId);
        setNotebook(retainPending(latest, notebook));
      }
      setStorageError([...pending.current.values()].some((value) => value.failed));
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
      if (id) pending.current.delete(id);
      else pending.current.clear();
      setNotebook(retainPending(next, notebook));
      setStorageError([...pending.current.values()].some((value) => value.failed));
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
  function restore(raw: string): string | null {
    try {
      const backup = parseNotebookBackup(raw);
      persist(backup.notebook);
      pending.current.clear();
      setStorageError(false);
      setNotebook(backup.notebook);
      setConflict(false);
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "Notebook could not be restored. Saved work unchanged.";
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
    restore,
    reset,
    resetWarning,
  };
}
