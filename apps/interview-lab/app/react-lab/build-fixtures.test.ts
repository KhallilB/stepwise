import ts from "typescript";
import { afterEach, expect, it, vi } from "vitest";
import { findChallenge } from "./curriculum";
import { readProject } from "./project";

type Snapshot = { text: string; revision: number };
type Fixture = {
  loadPeople: (query: string) => Promise<{ name: string }[]>;
  placeOrder: () => Promise<{ id: string }>;
  checkName: (name: string) => Promise<boolean>;
  saveName: (name: string) => Promise<string>;
  createStarService: () => {
    calls: number;
    write: (name: string, value: boolean) => Promise<boolean>;
  };
  createDocumentService: () => {
    calls: number;
    read: () => Snapshot;
    saveRemote: (text: string, revision: number) => Promise<Snapshot>;
    remoteEdit: () => void;
  };
};

function fixture(id: string): Fixture {
  const challenge = findChallenge(id);
  if (!challenge) throw new Error(`Missing ${id}`);
  const source = readProject(challenge.starter)["fixtures.ts"];
  if (!source) throw new Error(`Missing fixture for ${id}`);
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  // Authored local fixtures only; learner drafts never execute here.
  new Function("exports", compiled)(exports);
  return exports as Fixture;
}

afterEach(() => vi.useRealTimers());

it("directory fixtures preserve independent request delays, filtering and rejection", async () => {
  vi.useFakeTimers();
  const { loadPeople } = fixture("build-directory");
  const ada = loadPeople("ADA"),
    grace = loadPeople("Grace");
  await vi.advanceTimersByTimeAsync(20);
  await expect(grace).resolves.toEqual([{ id: "grace", name: "Grace", role: "Platform" }]);
  await vi.advanceTimersByTimeAsync(140);
  await expect(ada).resolves.toEqual([{ id: "ada", name: "Ada", role: "Frontend" }]);
  const failed = expect(loadPeople("error")).rejects.toThrow("Search unavailable");
  await vi.advanceTimersByTimeAsync(20);
  await failed;
});

it("checkout rejects once and allows an explicit retry", async () => {
  vi.useFakeTimers();
  const { placeOrder } = fixture("build-checkout");
  const failed = expect(placeOrder()).rejects.toThrow("Checkout failed");
  await vi.advanceTimersByTimeAsync(120);
  await failed;
  const retry = placeOrder();
  await vi.advanceTimersByTimeAsync(120);
  await expect(retry).resolves.toEqual({ id: "order-1" });
});

it("registration exposes transport without implementing learner validation", async () => {
  vi.useFakeTimers();
  const services = fixture("build-async-registration");
  expect(Object.keys(services).sort()).toEqual(["checkName", "saveName"]);
  const taken = services.checkName("ada"),
    available = services.checkName("grace"),
    saved = services.saveName("grace");
  await vi.advanceTimersByTimeAsync(30);
  await expect(available).resolves.toBe(true);
  await vi.advanceTimersByTimeAsync(70);
  await expect(saved).resolves.toBe("grace");
  await vi.advanceTimersByTimeAsync(50);
  await expect(taken).resolves.toBe(false);
});

it("star service owns only transport attempts and keeps instances independent", async () => {
  vi.useFakeTimers();
  const { createStarService } = fixture("build-concurrent-stars");
  const service = createStarService();
  const failed = expect(service.write("Ada", true)).rejects.toThrow("Rejected");
  const grace = service.write("Grace", true);
  expect(service.calls).toBe(2);
  await vi.advanceTimersByTimeAsync(30);
  await expect(grace).resolves.toBe(true);
  await vi.advanceTimersByTimeAsync(120);
  await failed;
  const retry = service.write("Ada", true);
  await vi.advanceTimersByTimeAsync(150);
  await expect(retry).resolves.toBe(true);
  expect(createStarService().calls).toBe(0);
});

it("document service copies snapshots and rejects obsolete revisions without overwriting them", async () => {
  vi.useFakeTimers();
  const { createDocumentService } = fixture("build-conflict-editor");
  const service = createDocumentService();
  const snapshot = service.read();
  snapshot.text = "Mutated outside";
  expect(service.read()).toEqual({ text: "Server draft", revision: 1 });
  const saved = service.saveRemote("Mine", 1);
  await vi.advanceTimersByTimeAsync(90);
  await expect(saved).resolves.toEqual({ text: "Mine", revision: 2 });
  service.remoteEdit();
  const conflict = expect(service.saveRemote("Stale", 2)).rejects.toEqual({
    text: "Remote revision",
    revision: 3,
  });
  await vi.advanceTimersByTimeAsync(90);
  await conflict;
  expect(service.read()).toEqual({ text: "Remote revision", revision: 3 });
  expect(service.calls).toBe(2);
  expect(createDocumentService().read()).toEqual({ text: "Server draft", revision: 1 });
});
