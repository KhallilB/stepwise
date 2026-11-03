import {
  Badge,
  Button,
  Callout,
  Checkbox,
  Grid,
  Heading,
  Inline,
  Panel,
  Status,
  Switch,
  Text,
  Textarea,
  Tooltip,
} from "@kb.ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { AnswerAttempt, ShowAnswer } from "./AnswerAttempt";
import { ChallengeBrief } from "./ChallengeBrief";
import { type CheckRunner, ChecksPanel } from "./ChecksPanel";
import { CodeEditor } from "./CodeEditor";
import { type ConsoleEntry, ConsolePanel } from "./ConsolePanel";
import { challenges } from "./curriculum";
import { FileTabs, FileTree } from "./FileNavigation";
import { Coach } from "./InterviewCoach";
import { InterviewTimer } from "./InterviewTimer";
import { Preview, type Report, type Submission } from "./Preview";
import { ProjectStart } from "./ProjectStart";
import { readPlaywrightResponse } from "./playwright-contract";
import { type Entry, maxCodeLength, maxNotesLength } from "./progress";
import { editableProject, updateProjectFile, writeProjectSnapshot } from "./project";
import { ResetProgress } from "./ResetProgress";
import { StageGuide } from "./StageGuide";
import type { Challenge } from "./types";

export function Workspace({
  challenge,
  entry,
  ready,
  onSave,
  onExport,
  onReset,
  resetToken,
}: {
  challenge: Challenge;
  entry: Entry | undefined;
  ready: boolean;
  onSave: (entry: Entry) => void;
  onExport: () => void;
  onReset: () => boolean;
  resetToken?: string;
}) {
  const [started, setStarted] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const stageIndex = entry?.stage ?? 0;
  const activeChallenge = useMemo(
    () =>
      challenge.stages
        ? {
            ...challenge,
            checks: challenge.stages.slice(0, stageIndex + 1).flatMap((stage) => stage.checks),
          }
        : challenge,
    [challenge, stageIndex],
  );
  const finalStage = !challenge.stages || stageIndex === challenge.stages.length - 1;
  const code = entry?.code ?? challenge.starter;
  const files = useMemo(() => {
    try {
      return editableProject(code);
    } catch {
      return { "App.tsx": code };
    }
  }, [code]);
  const [activeFile, setActiveFile] = useState("App.tsx");
  const filesToggle = useRef<HTMLButtonElement>(null);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const reviewAction = useRef<HTMLButtonElement>(null);
  const restoringContextFocus = useRef(false);
  const [openFiles, setOpenFiles] = useState(["App.tsx"]);

  const hasOpenFile = openFiles.includes(activeFile);
  function openFile(path: string) {
    if (!Object.hasOwn(files, path)) return;
    setOpenFiles((current) => (current.includes(path) ? current : [...current, path]));
    setActiveFile(path);
    setOutputExpanded(false);
    if (window.matchMedia("(max-width: 799px)").matches) {
      setView("code");
      setExplorerOpen(false);
      filesToggle.current?.focus();
    }
  }
  function closeFile(path: string) {
    const index = openFiles.indexOf(path);
    const next = openFiles.filter((file) => file !== path);
    setOpenFiles(next);
    if (!next.length) filesToggle.current?.focus();
    if (path === activeFile && next.length)
      setActiveFile(next[Math.min(index, next.length - 1)] ?? "App.tsx");
  }
  const fileCode = files[activeFile] ?? files["App.tsx"] ?? "";
  const notes = entry?.notes ?? "";
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [report, setReport] = useState<(Report & { stage: number; engine?: CheckRunner }) | null>(
    null,
  );
  const [runningRun, setRunning] = useState(false);
  const [remoteStage, setRemoteStage] = useState<number | null>(null);
  const previewRunning = runningRun && submission?.stage === stageIndex;
  const running = previewRunning || remoteStage === stageIndex;
  const [checkRunner, setCheckRunner] = useState<CheckRunner>("preview");
  const [playwrightReady, setPlaywrightReady] = useState(false);
  const verification = useRef<AbortController | null>(null);
  const navigation = useRef<HTMLDivElement>(null);
  const [outputExpanded, setOutputExpanded] = useState(false);
  const [toolOpen, setToolOpen] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [toolView, setToolView] = useState("console");
  const focusToolsLabel = toolsExpanded
    ? "Restore coding layout"
    : toolView === "console"
      ? "Focus console"
      : "Focus checks";
  const [mainSize, setMainSize] = useState(70);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const checksOpen = toolOpen && toolView === "checks";
  function setChecksOpen(open: boolean) {
    if (open && !toolOpen) setMainSize(60);
    setToolOpen(open);
    if (open) setToolView("checks");
  }
  const [focusedEditorSize, setFocusedEditorSize] = useState(62);
  const [sideSize, setSideSize] = useState(24);
  const [sideView, setSideView] = useState("brief");
  const [view, setView] = useState("code");
  const [reviewVisited, setReviewVisited] = useState(false);
  const [phase, setPhase] = useState<"build" | "review">("build");
  const [hoverTool, setHoverTool] = useState<string | null>(null);
  const hoverClose = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverOpen = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contextPane = useRef<HTMLDivElement>(null);
  const pinnedOpen = view !== "code" && view !== "output";
  const displaySide = hoverTool ?? sideView;
  const contextOpen = hoverTool !== null || pinnedOpen;
  const ended = !!entry?.answerRevealed;
  function cancelHoverClose() {
    if (hoverClose.current) clearTimeout(hoverClose.current);
    if (hoverOpen.current) clearTimeout(hoverOpen.current);
    hoverClose.current = null;
    hoverOpen.current = null;
  }
  function showHover(tool: string, keyboard = false) {
    if (
      restoringContextFocus.current ||
      phase === "review" ||
      pinnedOpen ||
      !window.matchMedia("(min-width: 800px)").matches ||
      (!keyboard && !window.matchMedia("(hover: hover) and (pointer: fine)").matches)
    )
      return;
    cancelHoverClose();
    if (keyboard) setHoverTool(tool);
    else hoverOpen.current = setTimeout(() => setHoverTool(tool), 240);
  }
  function pinContext(tool: string) {
    cancelHoverClose();
    setHoverTool(null);
    setPhase("build");
    setOutputExpanded(false);
    setSideView(tool);
    setView(tool);
  }
  function closeHoverSoon() {
    cancelHoverClose();
    hoverClose.current = setTimeout(() => {
      const focused = document.activeElement;
      if (contextPane.current?.contains(focused) || navigation.current?.contains(focused)) return;
      setHoverTool(null);
    }, 260);
  }
  function reviewImplementation() {
    run();
    cancelHoverClose();
    setHoverTool(null);
    setOutputExpanded(false);
    setPhase("review");
    setReviewVisited(true);
    onSave({ ...entry, code, notes, completed: !!entry?.completed });
    setSideSize(30);
    setSideView("coach");
    setView("coach");
  }
  useEffect(
    () => () => {
      if (hoverClose.current) clearTimeout(hoverClose.current);
      if (hoverOpen.current) clearTimeout(hoverOpen.current);
    },
    [],
  );
  const mobileView = outputExpanded ? "output" : contextOpen ? "context" : view;
  const [live, setLive] = useState(true);
  const [autoChecks, setAutoChecks] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [hints, setHints] = useState(0);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const index = challenges.findIndex((item) => item.id === challenge.id);

  const currentReport = report?.code === code && report.stage === stageIndex ? report : null;
  const results = currentReport && "results" in currentReport ? currentReport.results : null;
  const finalError = currentReport && "error" in currentReport ? currentReport.error : "";
  const passed = !!results?.length && results.every((result) => result.passed);
  const canComplete = passed && finalStage && !running;

  useEffect(() => {
    if (
      ended ||
      !started ||
      !ready ||
      (!live && !autoChecks) ||
      previewRunning ||
      (submission?.code === code &&
        submission.stage === stageIndex &&
        (!autoChecks || submission.mode !== "preview"))
    )
      return;
    const timer = setTimeout(
      () => {
        setPreviewError("");
        if (autoChecks) setRunning(true);
        setSubmission({
          code,
          stage: stageIndex,
          runId: crypto.randomUUID(),
          mode: autoChecks ? "checks" : "preview",
        });
      },
      autoChecks ? 1200 : 700,
    );
    return () => clearTimeout(timer);
  }, [code, stageIndex, ready, live, autoChecks, previewRunning, submission, started, ended]);

  useEffect(() => {
    if (!started) return;
    const controller = new AbortController();
    void fetch("/__react-lab/playwright", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((status: unknown) => {
        if (!controller.signal.aborted)
          setPlaywrightReady(
            !!status &&
              typeof status === "object" &&
              "available" in status &&
              status.available === true,
          );
      })
      .catch(() => {});
    return () => controller.abort();
  }, [started]);
  useEffect(
    () => () => {
      verification.current?.abort();
      verification.current = null;
    },
    [],
  );
  useEffect(() => {
    if (remoteStage === null || (!ended && remoteStage === stageIndex)) return;
    verification.current?.abort();
    verification.current = null;
    setRemoteStage(null);
  }, [remoteStage, stageIndex, ended]);

  useEffect(() => {
    if (started) title.current?.focus();
  }, [started]);

  function run() {
    if (!ready || running) return;
    if (window.matchMedia("(max-width: 799px)").matches) setView("code");
    setPreviewError("");
    setReport(null);
    setChecksOpen(true);
    if (checkRunner === "playwright") {
      const controller = new AbortController();
      verification.current = controller;
      setRemoteStage(stageIndex);
      const request = {
        challengeId: challenge.id,
        code,
        stage: stageIndex,
        runId: crypto.randomUUID(),
      };
      void fetch("/__react-lab/playwright", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: controller.signal,
      })
        .then(async (response) => {
          const value: unknown = await response.json();
          if (!response.ok)
            throw new Error(
              value &&
                typeof value === "object" &&
                "error" in value &&
                typeof value.error === "string"
                ? value.error
                : "Playwright is unavailable. Retry or use Preview browser.",
            );
          const result = readPlaywrightResponse(value, request, activeChallenge.checks);
          if (!result)
            throw new Error("Playwright returned an incomplete result. Run checks again.");
          if (!controller.signal.aborted && verification.current === controller)
            setReport({ ...result, code, stage: stageIndex, engine: "playwright" });
        })
        .catch((error) => {
          if (!controller.signal.aborted && verification.current === controller)
            setReport({
              code,
              stage: stageIndex,
              engine: "playwright",
              error: error instanceof Error ? error.message : "Playwright could not finish.",
            });
        })
        .finally(() => {
          if (verification.current === controller) {
            verification.current = null;
            setRemoteStage(null);
          }
        });
      return;
    }
    setRunning(true);
    setSubmission({ code, runId: crypto.randomUUID(), stage: stageIndex });
  }
  function collapseContext() {
    const returnTool = hoverTool ?? sideView;
    cancelHoverClose();
    setHoverTool(null);
    setView("code");
    if (phase === "review") {
      setPhase("build");
      setSideView("brief");
      reviewAction.current?.focus();
      return;
    }
    restoringContextFocus.current = true;
    if (window.matchMedia("(max-width: 799px)").matches)
      document.querySelector<HTMLElement>(".lab-mobile-nav button")?.focus();
    else navigation.current?.querySelector<HTMLElement>(`[data-tool="${returnTool}"]`)?.focus();
    restoringContextFocus.current = false;
  }
  function saveDraft(nextCode: string, nextNotes = notes) {
    if (nextCode.length > maxCodeLength) return false;
    onSave({
      ...entry,
      code: nextCode,
      notes: nextNotes,
      completed: nextCode === code && !!entry?.completed,
    });
  }

  if (ended) return <AnswerAttempt challenge={challenge} onReset={onReset} />;

  if (!started)
    return (
      <ProjectStart
        challenge={challenge}
        stage={stageIndex}
        resume={!!entry}
        ready={ready}
        onStart={() => setStarted(true)}
        onReset={onReset}
      />
    );

  return (
    <Grid
      layout="stack"
      className="lab-workspace"
      data-mobile-view={mobileView}
      data-context-open={contextOpen}
      data-side-view={displaySide}
      onKeyDown={(event) => {
        if (event.key === "Escape" && hoverTool) {
          collapseContext();
          event.preventDefault();
        }
      }}
      data-output-expanded={outputExpanded}
      data-tools-expanded={toolsExpanded}
    >
      <Inline justify="between" align="center" className="lab-workspace-bar">
        <Inline gap="sm" align="center">
          <Link to="/react-lab" className="lab-back" aria-label="All challenges">
            ← All challenges
          </Link>
          <Heading level={1} ref={title} tabIndex={-1}>
            {challenge.title}
          </Heading>
          <Badge appearance="plain">
            {challenge.stages
              ? `Stage ${stageIndex + 1} / ${challenge.stages.length}`
              : `${index + 1} / ${challenges.length}`}
          </Badge>
        </Inline>
        <Inline gap="sm" align="center">
          <InterviewTimer minutes={challenge.minutes} ready={ready} />
          <Button
            ref={reviewAction}
            variant="secondary"
            size="sm"
            aria-disabled={!ready || (phase === "build" && running)}
            onClick={() => {
              if (!ready || (phase === "build" && running)) return;
              phase === "build" ? reviewImplementation() : collapseContext();
            }}
          >
            {phase === "build" ? "Final run & review" : "Back to code"}
          </Button>
          <Button size="sm" disabled={!ready || running} onClick={run}>
            Run checks
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
            disabled={!ready}
            aria-label="Export notebook"
          >
            <span className="lab-desktop-export">Export notebook</span>
            <span className="lab-mobile-export" aria-hidden="true">
              ↥
            </span>
          </Button>
        </Inline>
      </Inline>
      <Inline className="lab-mobile-nav" role="navigation" aria-label="Workspace view">
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={mobileView === "code"}
          onClick={() => {
            setToolsExpanded(false);
            setOutputExpanded(false);
            setView("code");
          }}
        >
          Code
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={mobileView === "output"}
          onClick={() => {
            setToolsExpanded(false);
            setOutputExpanded(false);
            setView("output");
          }}
        >
          Preview
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={mobileView === "context"}
          onClick={() => {
            setToolsExpanded(false);
            setOutputExpanded(false);
            setView(sideView);
          }}
        >
          Tools
        </Button>
      </Inline>
      <Inline ref={navigation} as="nav" className="lab-project-tools" aria-label="Practice tools">
        {[
          { id: "brief", label: "Brief" },
          { id: "reference", label: "Reference" },
        ].map((tool) => (
          <Button
            key={tool.id}
            className="lab-project-tool"
            data-tool={tool.id}
            variant="ghost"
            size="sm"
            aria-label={tool.label}
            aria-pressed={pinnedOpen && sideView === tool.id}
            aria-expanded={contextOpen && displaySide === tool.id}
            aria-controls="lab-sidebar"
            onPointerEnter={() => showHover(tool.id)}
            onPointerLeave={closeHoverSoon}
            onFocus={() => showHover(tool.id, true)}
            onBlur={closeHoverSoon}
            onClick={() => {
              if (pinnedOpen && sideView === tool.id) collapseContext();
              else pinContext(tool.id);
            }}
          >
            {tool.label}
          </Button>
        ))}
        <Text as="span" size="sm" tone="muted" className="lab-phase-label">
          {phase === "build" ? "Build" : "Review"}
        </Text>
      </Inline>
      <Panel.Group className="lab-shell" direction="row">
        <div
          className="lab-context lab-sidebar-stack"
          ref={contextPane}
          id="lab-sidebar"
          data-pane="context"
          data-view={displaySide}
          hidden={!contextOpen}
          onPointerEnter={cancelHoverClose}
          onPointerLeave={closeHoverSoon}
          onFocusCapture={cancelHoverClose}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) closeHoverSoon();
          }}
        >
          <Inline justify="between" align="center" className="lab-context-tools">
            <Text as="span" size="sm">
              {displaySide === "coach"
                ? "Final review"
                : hoverTool
                  ? `${displaySide === "brief" ? "Brief" : "Reference"} preview`
                  : `${displaySide === "brief" ? "Brief" : "Reference"} pinned`}
            </Text>
            <Inline gap="sm" align="center">
              {hoverTool && (
                <Tooltip content={`Keep ${displaySide === "brief" ? "Brief" : "Reference"} open`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Keep ${displaySide === "brief" ? "Brief" : "Reference"} open`}
                    onClick={() => {
                      pinContext(displaySide);
                      restoringContextFocus.current = true;
                      navigation.current
                        ?.querySelector<HTMLElement>(`[data-tool="${displaySide}"]`)
                        ?.focus();
                      restoringContextFocus.current = false;
                    }}
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      aria-hidden="true"
                    >
                      <path d="M9 3h6M10 3v6l-3 3v2h10v-2l-3-3V3M12 14v7" />
                    </svg>
                  </Button>
                </Tooltip>
              )}
              <Tooltip content="Collapse context">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Collapse context"
                  onClick={collapseContext}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden="true"
                  >
                    <path d="m14 6-6 6 6 6M20 4v16" />
                  </svg>
                </Button>
              </Tooltip>
            </Inline>
          </Inline>
          <Grid
            layout="stack"
            className="lab-brief lab-pane-content"
            hidden={displaySide !== "brief"}
          >
            {challenge.stages && (
              <StageGuide
                stages={challenge.stages}
                index={stageIndex}
                passed={passed && !running}
                onAdvance={() => {
                  setSubmission(null);
                  setReport(null);
                  setRunning(false);
                  onSave({ ...entry, code, notes, stage: stageIndex + 1, completed: false });
                }}
              />
            )}
            <ChallengeBrief challenge={challenge} id="lab-brief-title" stage={stageIndex} />
          </Grid>
          {reviewVisited && (
            <Grid
              layout="stack"
              className="lab-reflection-main lab-pane-content"
              hidden={displaySide !== "coach"}
            >
              <Panel
                role="region"
                aria-labelledby="lab-final-checks-title"
                className="lab-flat-panel"
              >
                <Panel.Header>
                  <Heading level={2} size="sm" id="lab-final-checks-title">
                    1. Final checks
                  </Heading>
                  <Status live tone={running ? "running" : passed ? "success" : "neutral"}>
                    {running
                      ? "Running final checks…"
                      : passed
                        ? "All final checks passed"
                        : results
                          ? "Some checks need fixes"
                          : finalError
                            ? "Final run could not finish"
                            : "Run checks for this draft"}
                  </Status>
                </Panel.Header>
                <Panel.Body>
                  <Text size="sm">
                    Checks cover your current code and stage. Passing all stages is enough to
                    complete; AI review and communication practice are optional.
                  </Text>
                  {finalError && <Callout tone="warning">{finalError}</Callout>}
                  {!finalStage && (
                    <Text size="sm">
                      Finish the remaining stages before completing this challenge.
                    </Text>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!ready || running}
                    onClick={reviewImplementation}
                  >
                    Run final checks again
                  </Button>
                </Panel.Body>
              </Panel>
              <Coach
                challengeId={challenge.id}
                resetToken={resetToken}
                stage={challenge.stages ? stageIndex : undefined}
                code={code}
                explanation={notes}
                onTranscript={(text) => {
                  const next = notes.trim() ? `${notes}\n\n${text}` : text;
                  if (next.length > maxNotesLength) return false;
                  saveDraft(code, next);
                  return true;
                }}
              >
                <Textarea
                  label="Explain your reasoning"
                  description="Optional: explain what changed, why it works, and a tradeoff. Code review and completion work without this."
                  rows={5}
                  maxLength={maxNotesLength}
                  value={notes}
                  disabled={!ready}
                  onValueChange={(value) => saveDraft(code, value)}
                />
              </Coach>
              <Panel aria-labelledby="lab-reasoning-title" className="lab-flat-panel">
                <Panel.Header>
                  <Heading level={2} size="sm" id="lab-reasoning-title">
                    Optional self-review
                  </Heading>
                  <Badge appearance="plain">For practice</Badge>
                </Panel.Header>
                <Panel.Body>
                  <div className="lab-rubric">
                    {challenge.rubric.map((item) => (
                      <Checkbox
                        key={item}
                        label={item}
                        checked={reviewed.includes(item)}
                        onCheckedChange={(checked) =>
                          setReviewed((current) =>
                            checked
                              ? [...current, item]
                              : current.filter((value) => value !== item),
                          )
                        }
                      />
                    ))}
                  </div>
                  <Text size="sm" tone="muted">
                    These prompts are optional. Passing the final behavior checks completes the
                    challenge; notes and coaching scores are not required.
                  </Text>
                </Panel.Body>
              </Panel>
              <Inline gap="sm" className="lab-review-actions">
                <Button
                  disabled={!canComplete || !!entry?.completed}
                  onClick={() => onSave({ ...entry, code, notes, completed: true })}
                >
                  {entry?.completed ? "Completed" : "Complete challenge"}
                </Button>
                <ShowAnswer
                  onEnd={() =>
                    onSave({ ...entry, code, notes, completed: false, answerRevealed: true })
                  }
                />
              </Inline>
            </Grid>
          )}
          <Panel
            aria-labelledby="lab-reference-title"
            className="lab-flat-panel lab-reference-pane lab-pane-content"
            hidden={displaySide !== "reference"}
          >
            <Panel.Header>
              <Heading level={2} size="sm" id="lab-reference-title">
                References
              </Heading>
            </Panel.Header>
            <Panel.Body>
              <Text>
                Use the problem contract and official documentation to guide your next experiment.
              </Text>
              <a href={challenge.resource} target="_blank" rel="noreferrer">
                Official reference ↗
              </a>
              <Text size="sm" tone="muted">
                The full answer is available only through Show answer in final review. Choosing it
                ends this attempt.
              </Text>
              <Panel aria-labelledby="lab-hints-title" className="lab-flat-panel">
                <Panel.Header>
                  <Heading level={2} size="sm" id="lab-hints-title">
                    A nudge, not the answer
                  </Heading>
                </Panel.Header>
                <Panel.Body>
                  <Text size="sm" tone="muted">
                    Predict the failure before reaching for a fix.
                  </Text>
                  {hints > 0 && (
                    <div className="lab-hints">
                      <Text size="sm" className="lab-eyebrow">
                        Hint {hints} of 2
                      </Text>
                      {challenge.hints.slice(0, hints).map((hint, n) => (
                        <Text key={hint} size="sm">
                          <strong>{n + 1}.</strong> {hint}
                        </Text>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={hints >= 2}
                    onClick={() => setHints((value) => Math.min(2, value + 1))}
                  >
                    Reveal next hint
                  </Button>
                </Panel.Body>
              </Panel>
              <Panel aria-labelledby="lab-discussion-title" collapsible className="lab-flat-panel">
                <Panel.Header>
                  <Heading level={2} size="sm" id="lab-discussion-title">
                    Senior-level follow-up
                  </Heading>
                  <Panel.Toggle
                    aria-label="Senior follow-up details"
                    render={
                      <Button variant="ghost" size="icon" aria-label="Senior follow-up details" />
                    }
                    className="lab-follow-up-toggle"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="lab-follow-up-chevron"
                      aria-hidden="true"
                    >
                      <path d="m9 5 7 7-7 7" />
                    </svg>
                  </Panel.Toggle>
                </Panel.Header>
                <Panel.Body>
                  <Text>{challenge.followUp}</Text>
                  <a href={challenge.resource} target="_blank" rel="noreferrer">
                    Read official documentation ↗
                  </a>
                </Panel.Body>
              </Panel>
            </Panel.Body>
          </Panel>
        </div>
        <Panel.Handle
          aria-label="Resize brief and coach"
          className="lab-context-handle"
          hidden={!contextOpen}
          size={sideSize}
          onSizeChange={(size) =>
            size === 0 ? collapseContext() : setSideSize(Math.max(18, size))
          }
          min={0}
          max={30}
        />
        <Panel.Group direction="column" className="lab-center-stack" data-tool-open={toolOpen}>
          <Panel.Group direction="row" className="lab-ide-layout lab-main-panes">
            <Panel
              aria-labelledby="lab-editor-title"
              className="lab-editor-panel"
              data-pane="code"
              data-theme="dark"
            >
              <Heading level={2} id="lab-editor-title" className="lab-sr-only">
                {hasOpenFile ? activeFile : "Editor"}
              </Heading>
              <Panel.Header className="lab-editor-navigation">
                <Tooltip content={explorerOpen ? "Collapse file explorer" : "Expand file explorer"}>
                  <Button
                    ref={filesToggle}
                    variant="ghost"
                    size="icon"
                    aria-label={explorerOpen ? "Collapse file explorer" : "Expand file explorer"}
                    aria-expanded={explorerOpen}
                    aria-controls="lab-file-explorer"
                    onClick={() => setExplorerOpen((open) => !open)}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      aria-hidden="true"
                    >
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="M9 4v16M3 9h6" />
                    </svg>
                  </Button>
                </Tooltip>
                <FileTabs
                  paths={openFiles}
                  activeFile={activeFile}
                  onOpen={openFile}
                  onClose={closeFile}
                />
              </Panel.Header>
              <Panel.Body>
                <div className="lab-editor-workbench">
                  <div id="lab-file-explorer" className="lab-file-explorer" hidden={!explorerOpen}>
                    <Text as="div" size="sm" tone="muted" className="lab-explorer-title">
                      Explorer
                    </Text>
                    <FileTree
                      paths={Object.keys(files)}
                      activeFile={hasOpenFile ? activeFile : null}
                      onOpen={openFile}
                      onCollapse={() => {
                        setExplorerOpen(false);
                        filesToggle.current?.focus();
                      }}
                    />
                  </div>
                  <div className="lab-editor-column">
                    {!hasOpenFile && (
                      <div className="lab-editor-empty">
                        <Text>Open a file to start coding.</Text>
                        <Button variant="secondary" size="sm" onClick={() => setExplorerOpen(true)}>
                          Browse project files
                        </Button>
                        <Text size="sm">
                          Closing tabs keeps code and undo history for this session.
                        </Text>
                      </div>
                    )}
                    <div
                      className="lab-code-host"
                      id="lab-file-editor"
                      role="tabpanel"
                      aria-labelledby={
                        hasOpenFile ? `file-tab-${encodeURIComponent(activeFile)}` : undefined
                      }
                      hidden={!hasOpenFile}
                    >
                      <CodeEditor
                        code={fileCode}
                        filename={activeFile}
                        files={files}
                        ready={ready}
                        onChange={(next) => saveDraft(updateProjectFile(code, activeFile, next))}
                        onProjectChange={(next) => saveDraft(writeProjectSnapshot(code, next))}
                        onRun={run}
                        onOpenFile={openFile}
                      />
                    </div>
                  </div>
                </div>
              </Panel.Body>
              <Panel.Footer>
                <Inline gap="sm" align="center" justify="between">
                  <Text size="sm" as="span" className="lab-editor-help">
                    {fileCode.split("\n").length} lines ·{" "}
                    {ready ? "Draft kept on this device" : "Restoring draft…"}
                  </Text>
                  <Inline gap="sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={running}
                      onClick={() => {
                        setSubmission(null);
                        setReport(null);
                        saveDraft(challenge.starter);
                      }}
                    >
                      Reset code
                    </Button>
                    {running && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setLive(false);
                          setSubmission(null);
                          setRunning(false);
                          setReport(null);
                        }}
                      >
                        Stop
                      </Button>
                    )}
                  </Inline>
                </Inline>
              </Panel.Footer>
            </Panel>

            <Panel.Handle
              aria-label="Resize code editor"
              size={focusedEditorSize}
              onSizeChange={setFocusedEditorSize}
              min={28}
              max={72}
            />
            <Panel
              aria-labelledby="lab-preview-title"
              className="lab-flat-panel lab-preview-panel"
              data-pane="output"
            >
              <Panel.Header>
                <Heading level={2} size="sm" id="lab-preview-title">
                  Live preview
                </Heading>
                <Inline gap="sm" align="center" className="lab-output-controls">
                  <Switch label="Live preview" checked={live} onCheckedChange={setLive} size="sm" />
                  <Tooltip content="Reload preview">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Reload preview"
                      disabled={!ready || running}
                      onClick={() => {
                        setPreviewError("");
                        setSubmission({
                          code,
                          stage: stageIndex,
                          runId: crypto.randomUUID(),
                          mode: "preview",
                        });
                      }}
                    >
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        aria-hidden="true"
                      >
                        <path d="M20 11a8 8 0 1 0-2 6M20 4v7h-7" />
                      </svg>
                    </Button>
                  </Tooltip>
                  <Tooltip content={outputExpanded ? "Restore workspace" : "Expand output"}>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={outputExpanded ? "Restore workspace" : "Expand output"}
                      aria-pressed={outputExpanded}
                      onClick={() => setOutputExpanded(!outputExpanded)}
                    >
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        aria-hidden="true"
                      >
                        <path
                          d={
                            outputExpanded
                              ? "M9 3v6H3m18 6h-6v6M3 9l6-6m6 18 6-6"
                              : "M9 3H3v6m12 12h6v-6M3 3l6 6m6 6 6 6"
                          }
                        />
                      </svg>
                    </Button>
                  </Tooltip>
                </Inline>
              </Panel.Header>
              <Panel.Body className="lab-preview-body">
                <Preview
                  challenge={activeChallenge}
                  submission={submission?.stage === stageIndex ? submission : null}
                  onConsoleReset={() => setConsoleEntries([])}
                  onConsole={(entry) => {
                    setConsoleEntries((current) => [...current.slice(-199), entry]);
                    if (entry.level === "error" && !running) {
                      setToolOpen(true);
                      setToolView("console");
                    }
                  }}
                  onReport={(next) => {
                    if (submission?.mode === "preview") {
                      setPreviewError("error" in next ? next.error : "");
                    } else {
                      setReport({
                        ...next,
                        stage: submission?.stage ?? stageIndex,
                        engine: "preview",
                      });
                      setRunning(false);
                      if ("error" in next) setChecksOpen(true);
                    }
                  }}
                />
                {previewError && (
                  <Callout role="alert" tone="warning" title="Preview needs attention">
                    {previewError}
                  </Callout>
                )}
              </Panel.Body>
              <Panel.Footer>
                <Text size="sm" tone="muted">
                  {live
                    ? "Updates after edits · component state resets"
                    : "Preview paused · enable live preview to refresh"}
                  . React and local JS/TS modules only.
                </Text>
              </Panel.Footer>
            </Panel>
          </Panel.Group>
          <Panel.Handle
            aria-label="Resize workspace and tools"
            hidden={!toolOpen || toolsExpanded}
            size={mainSize}
            onSizeChange={setMainSize}
            min={35}
            max={85}
          />
          <div className="lab-support-panel" data-open={toolOpen}>
            <Inline justify="between" align="center" className="lab-support-bar">
              {/* kbui stopgap: Tabs (G4); approved supporting-tool navigation. */}
              <Inline role="tablist" aria-label="Supporting tools" gap="sm">
                {["console", "checks"].map((tool) => (
                  <Button
                    key={tool}
                    role="tab"
                    id={`support-tab-${tool}`}
                    aria-controls={`support-${tool}`}
                    aria-selected={toolView === tool}
                    aria-label={tool === "console" ? "Console" : "Checks"}
                    tabIndex={toolView === tool ? 0 : -1}
                    onKeyDown={(event) => {
                      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
                        event.preventDefault();
                        const next =
                          event.key === "Home"
                            ? "console"
                            : event.key === "End"
                              ? "checks"
                              : tool === "console"
                                ? "checks"
                                : "console";
                        setToolView(next);
                        setToolOpen(true);
                        event.currentTarget.parentElement
                          ?.querySelector<HTMLElement>(`#support-tab-${next}`)
                          ?.focus();
                      }
                    }}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setToolView(tool);
                      setToolOpen(true);
                      if (tool === "checks" && !toolOpen) setMainSize(60);
                    }}
                  >
                    {tool === "console" ? "Console" : "Checks"}
                    {tool === "console" && consoleEntries.length
                      ? ` · ${consoleEntries.length}`
                      : ""}
                  </Button>
                ))}
              </Inline>
              <Inline gap="sm">
                {toolOpen && (
                  <Tooltip content={focusToolsLabel}>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={focusToolsLabel}
                      aria-pressed={toolsExpanded}
                      onClick={() => setToolsExpanded((current) => !current)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        aria-hidden="true"
                      >
                        <path
                          d={
                            toolsExpanded
                              ? "M9 3v6H3m18 6h-6v6M3 9l6-6m6 18 6-6"
                              : "M9 3H3v6m12 12h6v-6M3 3l6 6m6 6 6 6"
                          }
                        />
                      </svg>
                    </Button>
                  </Tooltip>
                )}
                {toolView === "console" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!consoleEntries.length}
                    onClick={() => setConsoleEntries([])}
                  >
                    Clear console
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={
                    toolOpen
                      ? toolView === "console"
                        ? "Collapse console"
                        : "Collapse check results"
                      : toolView === "console"
                        ? "Expand console"
                        : "Expand check results"
                  }
                  onClick={() => {
                    setToolOpen(!toolOpen);
                    if (toolOpen) setToolsExpanded(false);
                  }}
                >
                  {toolOpen ? "▾" : "▸"}
                </Button>
              </Inline>
            </Inline>
            <div
              id="support-console"
              className="lab-support-content"
              role="tabpanel"
              aria-labelledby="support-tab-console"
              hidden={!toolOpen || toolView !== "console"}
            >
              <ConsolePanel entries={consoleEntries} />
            </div>
            <div
              id="support-checks"
              className="lab-support-content"
              role="tabpanel"
              aria-labelledby="support-tab-checks"
              hidden={!checksOpen}
            >
              <ChecksPanel
                autoChecks={autoChecks}
                onAutoChecksChange={setAutoChecks}
                checks={activeChallenge.checks}
                results={results}
                error={currentReport && "error" in currentReport ? currentReport.error : undefined}
                stale={!!report && !currentReport}
                running={running}
                stage={stageIndex}
                runner={checkRunner}
                playwrightReady={playwrightReady}
                resultRunner={currentReport?.engine}
                onRunnerChange={(runner) => {
                  setCheckRunner(runner);
                  if (runner === "playwright") setAutoChecks(false);
                }}
                onClear={report ? () => setReport(null) : undefined}
                onCancel={
                  remoteStage === stageIndex
                    ? () => {
                        verification.current?.abort();
                        verification.current = null;
                        setRemoteStage(null);
                      }
                    : undefined
                }
              />
            </div>
          </div>
        </Panel.Group>
      </Panel.Group>
      <Inline justify="between" gap="md" className="lab-next-nav">
        {index > 0 ? (
          <Link to={`/react-lab/${challenges[index - 1]?.id}`}>← Previous challenge</Link>
        ) : (
          <Text as="span" tone="muted">
            First challenge
          </Text>
        )}
        {index < challenges.length - 1 ? (
          <Link to={`/react-lab/${challenges[index + 1]?.id}`}>Next challenge →</Link>
        ) : (
          <Link to="/react-lab">Back to your learning path →</Link>
        )}
        <Inline gap="md" align="center">
          <ResetProgress onReset={onReset} disabled={!ready} />
          {entry?.completed && (
            <Status live tone="success">
              Challenge complete
            </Status>
          )}
        </Inline>
      </Inline>
    </Grid>
  );
}
