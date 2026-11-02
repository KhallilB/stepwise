import {
  Badge,
  Button,
  Callout,
  Grid,
  Heading,
  Inline,
  Panel,
  Select,
  Status,
  Switch,
  Text,
  Tooltip,
} from "@kb.ui/react";
import { useState } from "react";
import type { CheckResult } from "./sandbox";
import type { Check } from "./types";

export type CheckRunner = "preview" | "playwright";
export function ChecksPanel({
  checks,
  results,
  error,
  stale,
  running,
  stage,
  runner,
  onRunnerChange,
  playwrightReady,
  resultRunner,
  onClear,
  onCancel,
  autoChecks,
  onAutoChecksChange,
}: {
  checks: Check[];
  results: CheckResult[] | null;
  error?: string;
  stale: boolean;
  running: boolean;
  stage: number;
  runner: CheckRunner;
  onRunnerChange: (runner: CheckRunner) => void;
  playwrightReady: boolean;
  resultRunner?: CheckRunner;
  onClear?: () => void;
  onCancel?: () => void;
  autoChecks: boolean;
  onAutoChecksChange: (checked: boolean) => void;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [disclosures, setDisclosures] = useState<{
    report: CheckResult[] | null;
    values: Record<string, boolean>;
  }>({ report: null, values: {} });
  const fresh = !running && !stale;
  const passed = fresh ? (results?.filter((result) => result.passed).length ?? 0) : 0;
  const allPassed = !!results?.length && passed === checks.length;
  const summary = running
    ? "Checking…"
    : error
      ? "Run could not finish"
      : stale
        ? "Results out of date"
        : "Ready to check";
  return (
    <Panel
      collapsible
      open={settingsOpen}
      onOpenChange={setSettingsOpen}
      aria-labelledby="lab-checks-title"
      className="lab-flat-panel lab-checks-panel"
      data-check-state={
        running
          ? "running"
          : error
            ? "error"
            : results && !stale
              ? "done"
              : stale
                ? "stale"
                : "idle"
      }
      data-check-error={error}
      data-check-stage={stage}
    >
      <Panel.Header>
        <Inline gap="sm" align="center">
          <Heading level={2} size="sm" id="lab-checks-title">
            Behavior checks
          </Heading>
          {results && fresh ? (
            <Badge role="status" tone={allPassed ? "success" : "warning"}>
              {passed} of {results.length} checks passed
            </Badge>
          ) : (
            <Status
              live
              compact
              tone={running ? "running" : error ? "blocked" : stale ? "warning" : "neutral"}
            >
              {summary}
            </Status>
          )}
        </Inline>
        <Inline gap="sm" align="center">
          {running && onCancel && (
            <Button variant="secondary" size="sm" onClick={onCancel}>
              Cancel run
            </Button>
          )}
          <Tooltip content="Check settings">
            <Panel.Toggle
              render={<Button variant="ghost" size="icon" aria-label="Check settings" />}
              aria-label="Check settings"
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
                <path d="M12 8v8M8 12h8M4 7h5m6 0h5M4 17h5m6 0h5" />
                <circle cx="12" cy="7" r="3" />
                <circle cx="12" cy="17" r="3" />
              </svg>
            </Panel.Toggle>
          </Tooltip>
        </Inline>
      </Panel.Header>
      <Panel.Body className="lab-check-settings">
        <Inline gap="md" align="end">
          <Select
            label="Run with"
            value={runner}
            disabled={running}
            onValueChange={(value) => {
              if (value === "preview" || value === "playwright") onRunnerChange(value);
            }}
            options={[
              { value: "preview", label: "Preview browser" },
              { value: "playwright", label: "Playwright · Chromium", disabled: !playwrightReady },
            ]}
          />
          {runner === "preview" && (
            <Switch label="Auto checks" checked={autoChecks} onCheckedChange={onAutoChecksChange} />
          )}
          {onClear && (
            <Button variant="ghost" size="sm" disabled={running} onClick={onClear}>
              Clear check results
            </Button>
          )}
        </Inline>
        {!playwrightReady && (
          <Text size="sm" tone="muted">
            Playwright requires the local development server and Chromium.
          </Text>
        )}
      </Panel.Body>
      <div className="lab-check-results">
        <Text size="sm" tone="muted" className="lab-check-runner">
          {resultRunner && fresh && results
            ? resultRunner === "playwright"
              ? "Verified with Playwright · Chromium"
              : "Verified in preview"
            : runner === "playwright"
              ? "Playwright · Chromium"
              : "Preview browser"}
        </Text>
        {error && (
          <Callout role="alert" tone="danger" title="Run needs attention">
            {error}
          </Callout>
        )}
        {stale && (
          <Callout tone="info">Draft changed. Run checks again to verify this version.</Callout>
        )}
        <Grid as="ul" layout="stack" aria-label="Challenge checks" className="lab-check-items">
          {checks.map((check, index) => {
            const result = fresh ? results?.[index] : undefined;
            const state = running
              ? "Running"
              : stale
                ? "Outdated"
                : result
                  ? result.passed
                    ? "Passed"
                    : "Failed"
                  : "Not run";
            const overrides = disclosures.report === results ? disclosures.values : {};
            const open = overrides[check.name] ?? state === "Failed";
            return (
              <li
                className="lab-check-entry"
                key={check.name}
                data-check-name={check.name}
                data-check-passed={result ? String(result.passed) : undefined}
                data-check-detail={result?.detail}
              >
                <Panel
                  collapsible
                  open={open}
                  onOpenChange={(next) =>
                    setDisclosures((current) => ({
                      report: results,
                      values: {
                        ...(current.report === results ? current.values : {}),
                        [check.name]: next,
                      },
                    }))
                  }
                  tone="quiet"
                  aria-label={check.name}
                  className="lab-check-item"
                >
                  <Panel.Header>
                    <Panel.Toggle
                      render={<Button variant="ghost" size="sm" />}
                      className="lab-check-item-toggle"
                      aria-label={check.name}
                      aria-describedby={`lab-check-state-${index}`}
                    >
                      <Text as="span" size="sm" className="lab-check-name">
                        {index + 1}. {check.name}
                      </Text>
                      <Status
                        id={`lab-check-state-${index}`}
                        compact
                        tone={
                          state === "Passed"
                            ? "success"
                            : state === "Failed"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {state}
                      </Status>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        className="lab-check-chevron"
                        aria-hidden="true"
                      >
                        <path d="m9 5 7 7-7 7" />
                      </svg>
                    </Panel.Toggle>
                  </Panel.Header>
                  <Panel.Body>
                    <Text size="sm" className="lab-check-message">
                      {result
                        ? result.passed
                          ? "The expected behavior matched in a fresh render."
                          : result.detail
                        : running
                          ? "Checking the submitted version…"
                          : stale
                            ? "Run checks to verify the updated draft."
                            : "Run checks to test this requirement."}
                    </Text>
                  </Panel.Body>
                </Panel>
              </li>
            );
          })}
        </Grid>
        <Text size="sm" tone="muted" className="lab-check-scope">
          Runtime requirements only. Review types and reasoning separately.
        </Text>
      </div>
    </Panel>
  );
}
