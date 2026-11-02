import {
  Badge,
  Button,
  Callout,
  Grid,
  Heading,
  Inline,
  Panel,
  Progress,
  Status,
  Text,
} from "@kb.ui/react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import {
  dimensions,
  isRecord,
  parseAttempts,
  parseReview,
  type ReviewAttempt,
  reviewScore,
  reviewStorageKey,
} from "./coach";
import { notebookKey, parseNotebook } from "./progress";
import { VoiceCapture } from "./VoiceCapture";

type Connection = "checking" | "ready" | "setup" | "error";
export function Coach({
  challengeId,
  stage,
  resetToken,
  code,
  explanation,
  onTranscript,
  children,
}: {
  children: ReactNode;
  challengeId: string;
  stage?: number;
  resetToken?: string;
  code: string;
  explanation: string;
  onTranscript: (text: string) => boolean;
}) {
  const [connection, setConnection] = useState<Connection>("checking");
  const [services, setServices] = useState({
    review: { ready: false, provider: "ollama", model: "" },
    speech: { ready: false, provider: "local", model: "" },
  });
  const [attempts, setAttempts] = useState<ReviewAttempt[]>([]);
  const [error, setError] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [invalidated, setInvalidated] = useState(false);
  const [historyWarning, setHistoryWarning] = useState(false);
  const requests = useRef<AbortController | null>(null);
  const statusRequest = useRef<AbortController | null>(null);
  const active = useRef(false);
  const connect = useCallback(async () => {
    statusRequest.current?.abort();
    const controller = new AbortController();
    statusRequest.current = controller;
    setConnection("checking");
    try {
      const response = await fetch("/api/react-lab/status", { signal: controller.signal });
      const status: unknown = await response.json();
      if (
        active.current &&
        !controller.signal.aborted &&
        response.ok &&
        isRecord(status) &&
        isRecord(status.review) &&
        isRecord(status.speech) &&
        typeof status.review.ready === "boolean" &&
        typeof status.speech.ready === "boolean" &&
        ["ollama", "openai"].includes(String(status.review.provider)) &&
        ["local", "openai"].includes(String(status.speech.provider)) &&
        typeof status.review.model === "string" &&
        typeof status.speech.model === "string"
      ) {
        setServices({
          review: {
            ready: status.review.ready,
            provider: String(status.review.provider),
            model: status.review.model,
          },
          speech: {
            ready: status.speech.ready,
            provider: String(status.speech.provider),
            model: status.speech.model,
          },
        });
        setConnection(status.review.ready ? "ready" : "setup");
      } else if (active.current && !controller.signal.aborted) {
        setServices((current) => ({
          review: { ...current.review, ready: false },
          speech: { ...current.speech, ready: false },
        }));
        setConnection("error");
      }
    } catch {
      if (active.current && !controller.signal.aborted) setConnection("error");
    }
  }, []);
  useEffect(() => {
    active.current = true;
    try {
      setAttempts(
        parseAttempts(localStorage.getItem(reviewStorageKey(challengeId))).filter(
          (attempt) => attempt.resetToken === resetToken,
        ),
      );
    } catch {
      setHistoryWarning(true);
    }
    void connect();
    function resetElsewhere(event: StorageEvent) {
      if (
        event.key === notebookKey &&
        parseNotebook(event.newValue).resets?.[challengeId] !== resetToken
      ) {
        requests.current?.abort();
        setAttempts([]);
        setInvalidated(true);
      }
    }
    window.addEventListener("storage", resetElsewhere);
    return () => {
      window.removeEventListener("storage", resetElsewhere);
      active.current = false;
      requests.current?.abort();
      statusRequest.current?.abort();
    };
    // Challenge identity is fixed by Workspace's key.
  }, [challengeId, connect, resetToken]);

  async function review() {
    const snapshot = { code, explanation, stage, resetToken };
    setReviewing(true);
    setError("");
    const controller = new AbortController();
    requests.current = controller;
    try {
      const response = await fetch("/api/react-lab/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId, ...snapshot }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(185000)]),
      });
      const output: unknown = await response.json();
      const assessment = isRecord(output) ? parseReview(output.review) : null;
      if (!response.ok || !assessment || !isRecord(output) || typeof output.model !== "string")
        throw new Error(
          isRecord(output) && typeof output.error === "string"
            ? output.error
            : "AI returned no valid assessment. Retry; no score recorded.",
        );
      if (!active.current) return;
      try {
        if (parseNotebook(localStorage.getItem(notebookKey)).resets?.[challengeId] !== resetToken) {
          setInvalidated(true);
          return;
        }
      } catch {
        setHistoryWarning(true);
      }
      const attempt: ReviewAttempt = {
        ...snapshot,
        review: assessment,
        model: output.model,
        createdAt: new Date().toISOString(),
      };
      const next = [attempt, ...attempts].slice(0, 3);
      setAttempts(next);
      try {
        localStorage.setItem(reviewStorageKey(challengeId), JSON.stringify(next));
        setHistoryWarning(false);
      } catch {
        setHistoryWarning(true);
      }
    } catch (failure) {
      if (active.current)
        setError(
          failure instanceof Error
            ? failure.message
            : "Review unavailable. Your explanation is safe.",
        );
    } finally {
      if (active.current) setReviewing(false);
    }
  }
  const latest = attempts[0];
  const stale =
    !!latest &&
    (latest.code !== code || latest.explanation !== explanation || latest.stage !== stage);
  return (
    <Panel aria-labelledby="lab-coach-title" className="lab-flat-panel lab-coach">
      <Panel.Header>
        <Heading level={2} size="sm" id="lab-coach-title">
          Review your implementation
        </Heading>
        <Status live tone={connection === "ready" ? "success" : "neutral"}>
          {connection === "ready"
            ? services.review.provider === "ollama"
              ? "Local coach ready"
              : "OpenAI configured"
            : connection === "checking"
              ? "Checking connection"
              : "Setup needed"}
        </Status>
      </Panel.Header>
      <Panel.Body>
        <Text tone="muted">
          Review the implementation you built. The coach points to evidence, asks questions, and
          suggests small experiments for your next attempt. Add your reasoning if you want feedback
          on it.
        </Text>
        <Inline gap="md" align="center">
          <Button disabled={connection !== "ready" || invalidated || reviewing} onClick={review}>
            {reviewing ? "Reviewing your implementation…" : "Review my implementation"}
          </Button>
          {reviewing && (
            <Button variant="ghost" size="sm" onClick={() => requests.current?.abort()}>
              Cancel review
            </Button>
          )}
        </Inline>
        <Text size="sm" tone="muted">
          {services.review.provider === "ollama"
            ? "Review runs through your local Ollama server. No automatic cloud fallback."
            : "Review sends current code and explanation to OpenAI."}{" "}
          AI can make technical mistakes; compare feedback with behavior checks and official docs.
          Scores are coaching estimates. Equal weighting: correctness, reasoning, communication, and
          tradeoffs.
        </Text>
        {children}
        <Inline gap="sm" justify="between" className="lab-provider-summary">
          <Text as="span" size="sm">
            {services.review.provider === "ollama"
              ? "On-device review · Ollama"
              : "Cloud review · OpenAI"}
            {services.review.model ? ` · ${services.review.model}` : ""}
          </Text>
          <Button variant="ghost" size="sm" disabled={connection === "checking"} onClick={connect}>
            Check connection
          </Button>
        </Inline>
        {(connection === "setup" || connection === "error") && (
          <Callout tone="info" title="Coach needs setup">
            {services.review.provider === "ollama"
              ? "Start Ollama with the selected model. Set OLLAMA_REVIEW_MODEL in .dev.vars if needed, then restart the dev server."
              : "Set OPENAI_API_KEY in .dev.vars, then restart the dev server."}{" "}
            Typed practice and behavior checks stay available.
          </Callout>
        )}
        {!services.speech.ready && (
          <Text size="sm" tone="muted">
            {services.speech.provider === "local"
              ? "Local voice server unavailable. Connect a Whisper-compatible server using LOCAL_TRANSCRIBE_URL and LOCAL_TRANSCRIBE_MODEL in .dev.vars."
              : "Cloud transcription needs OPENAI_API_KEY in .dev.vars."}{" "}
            You can type your explanation.
          </Text>
        )}
        <VoiceCapture
          key={String(invalidated)}
          enabled={services.speech.ready && !invalidated}
          local={services.speech.provider === "local"}
          onTranscript={onTranscript}
        />
        {invalidated && (
          <Callout tone="warning">
            Progress was reset in another tab. Load that tab’s state before requesting another
            review.
          </Callout>
        )}
        {error && (
          <Callout role="alert" tone="warning">
            {error}
          </Callout>
        )}
        {historyWarning && (
          <Callout tone="warning">
            Review history could not be saved. Keep this page open or copy useful feedback before
            leaving.
          </Callout>
        )}
        {latest && (
          <section className="lab-assessment" aria-labelledby="lab-assessment-title">
            <Inline justify="between" align="center">
              <Heading level={3} size="sm" id="lab-assessment-title">
                AI coaching score
              </Heading>
              <Text className="lab-score">{reviewScore(latest.review)} / 100</Text>
            </Inline>
            {stale && (
              <Callout tone="info">
                Feedback describes an earlier draft. Review again after your changes.
              </Callout>
            )}
            <Text>{latest.review.summary}</Text>
            <Grid layout="stack">
              {dimensions.map(({ id, label }) => (
                <div key={id} className="lab-score-dimension">
                  <Progress
                    label={label}
                    value={latest.review[id].score}
                    max={5}
                    valueText={`${latest.review[id].score} / 5`}
                  />
                  <Text size="sm">
                    <strong>Evidence:</strong> {latest.review[id].evidence}
                  </Text>
                  <Text size="sm">
                    <strong>Improve:</strong> {latest.review[id].improve}
                  </Text>
                </div>
              ))}
            </Grid>
            <Heading level={4} size="sm">
              Keep doing
            </Heading>
            <ul>
              {latest.review.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Heading level={4} size="sm">
              Your next practice target
            </Heading>
            <ol>
              {latest.review.nextSteps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <Callout tone="info" title="Interviewer follow-up">
              {latest.review.followUp}
            </Callout>
            <Inline gap="sm">
              <Badge appearance="plain">{latest.model}</Badge>
              <Text as="span" size="sm" tone="muted">
                Latest {new Date(latest.createdAt).toLocaleDateString()} · {attempts.length} saved{" "}
                {attempts.length === 1 ? "review" : "reviews"}
              </Text>
            </Inline>
            {attempts.length > 1 && (
              <Text size="sm" tone="muted">
                Earlier scores:{" "}
                {attempts
                  .slice(1)
                  .map((attempt) => `${reviewScore(attempt.review)}/100`)
                  .join(", ")}
                . Compare feedback as well as numbers; AI scores can vary; scores across different
                build stages are not directly comparable.
              </Text>
            )}
          </section>
        )}
      </Panel.Body>
    </Panel>
  );
}
