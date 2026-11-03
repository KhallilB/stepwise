import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useRef,
  useState,
} from "react";
import type { Entry, Notebook } from "./progress";

type Pending = { entry?: Entry; reset?: string; failed?: boolean };

type Session = {
  notebook: Notebook;
  setNotebook: Dispatch<SetStateAction<Notebook>>;
  disk: { current: Notebook };
  hydrated: { current: boolean };
  pending: { current: Map<string, Pending> };
  storageError: boolean;
  setStorageError: Dispatch<SetStateAction<boolean>>;
};
const Context = createContext<Session | null>(null);
export function NotebookSessionProvider({ children }: { children: ReactNode }) {
  const [notebook, setNotebook] = useState<Notebook>({ version: 1, entries: {} });
  const [storageError, setStorageError] = useState(false);
  const disk = useRef<Notebook>({ version: 1, entries: {} });
  const hydrated = useRef(false);
  const pending = useRef(new Map<string, Pending>());
  return (
    <Context.Provider
      value={{ notebook, setNotebook, disk, hydrated, pending, storageError, setStorageError }}
    >
      {children}
    </Context.Provider>
  );
}
export function useNotebookSession() {
  const session = useContext(Context);
  if (!session) throw new Error("Notebook session provider missing.");
  return session;
}
