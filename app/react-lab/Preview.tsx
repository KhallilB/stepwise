import { Callout, Text } from "@kb.ui/react";
import { useEffect, useRef, useState } from "react";
import type { ConsoleEntry } from "./ConsolePanel";
import { type CheckResult, previewDocument, readResults } from "./sandbox";
import type { Challenge } from "./types";

export type Submission = {
  code: string;
  runId: string;
  stage: number;
  mode?: "preview" | "checks";
};
export type Report = { code: string; results: CheckResult[] } | { code: string; error: string };
let runtime: Promise<string> | undefined;

function loadRuntime(): Promise<string> {
  runtime ??= fetch("/react-lab-runtime.js")
    .then((response) => {
      if (!response.ok) throw new Error("Preview runtime could not load. Retry Run checks.");
      return response.text();
    })
    .catch((error) => {
      runtime = undefined;
      throw error;
    });
  return runtime;
}

export function Preview({
  submission,
  challenge,
  onReport,
  onConsole,
  onConsoleReset,
}: {
  submission: Submission | null;
  challenge: Challenge;
  onReport: (report: Report) => void;
  onConsole: (entry: ConsoleEntry) => void;
  onConsoleReset: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const onReportRef = useRef(onReport);
  onReportRef.current = onReport;
  const [documentSource, setDocumentSource] = useState("");
  const consoleCallbacks = useRef({ onConsole, onConsoleReset });
  consoleCallbacks.current = { onConsole, onConsoleReset };
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!submission) {
      setDocumentSource("");
      setLoading(false);
      return;
    }
    consoleCallbacks.current.onConsoleReset();
    const checks = submission.mode === "preview" ? [] : challenge.checks;
    let active = true;
    let settled = false;
    setLoading(true);
    setDocumentSource("");
    const fail = (message: string) => {
      if (!active || settled) return;
      settled = true;
      setLoading(false);
      onReportRef.current({ code: submission.code, error: message });
    };
    const timeout = setTimeout(() => {
      fail("Preview did not finish within 15 seconds. Check for a loop, then run again.");
      setDocumentSource("");
    }, 15000);
    const receive = (event: MessageEvent<unknown>) => {
      if (
        !active ||
        event.source !== frame.current?.contentWindow ||
        !event.data ||
        typeof event.data !== "object"
      )
        return;
      const message = event.data as Record<string, unknown>;
      if (message.channel !== "stepwise-react-lab" || message.runId !== submission.runId) return;
      if (
        message.type === "console" &&
        ["log", "info", "warn", "error", "debug"].includes(String(message.level)) &&
        typeof message.text === "string"
      ) {
        consoleCallbacks.current.onConsole({
          id: crypto.randomUUID(),
          level: String(message.level),
          text: message.text.slice(0, 4000),
        });
        return;
      }
      if (message.type === "error" && typeof message.message === "string") {
        consoleCallbacks.current.onConsole({
          id: crypto.randomUUID(),
          level: "error",
          text: message.message.slice(0, 4000),
        });
      }
      const results = readResults(message, submission.runId, checks);
      if (results && !settled) {
        settled = true;
        clearTimeout(timeout);
        setLoading(false);
        onReportRef.current({ code: submission.code, results });
      } else if (message.type === "error" && typeof message.message === "string") {
        clearTimeout(timeout);
        settled = true;
        setLoading(false);
        onReportRef.current({ code: submission.code, error: message.message.slice(0, 1000) });
      }
    };
    window.addEventListener("message", receive);
    void loadRuntime()
      .then((source) => {
        if (active && !settled)
          setDocumentSource(previewDocument(source, submission.code, checks, submission.runId));
      })
      .catch((error) => {
        clearTimeout(timeout);
        fail(error instanceof Error ? error.message : "Preview unavailable");
      });
    return () => {
      active = false;
      clearTimeout(timeout);
      window.removeEventListener("message", receive);
    };
  }, [submission, challenge]);

  return (
    <div className="lab-preview-area" aria-busy={loading}>
      <div className="lab-preview-content">
        {loading && (
          <Text className="lab-preview-loading" role="status">
            {submission?.mode === "preview"
              ? "Refreshing React preview…"
              : "Compiling React and checking behavior…"}
          </Text>
        )}
        {documentSource ? (
          <iframe
            ref={frame}
            title="React preview"
            sandbox="allow-scripts allow-forms"
            srcDoc={documentSource}
            referrerPolicy="no-referrer"
          />
        ) : (
          !loading && (
            <div className="lab-preview-empty">
              <span aria-hidden="true">⌘</span>
              <Text>
                Make a prediction.
                <br />
                Build, then run checks.
              </Text>
              <Text size="sm" tone="muted">
                An interactive React preview appears here.
              </Text>
            </div>
          )
        )}
        {!submission && (
          <Callout className="lab-local-note" tone="neutral">
            React and local JS/TS modules only. Use local fixtures for network data.
          </Callout>
        )}
      </div>
    </div>
  );
}
