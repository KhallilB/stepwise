import { Badge, Button, Grid, Heading, Inline, Panel, Split, Text } from "@kb.ui/react";
import { Link } from "react-router";
import { BriefConstraints, ChallengeBrief } from "./ChallengeBrief";
import { ResetProgress } from "./ResetProgress";
import type { Challenge } from "./types";

export function ProjectStart({
  challenge,
  stage,
  resume,
  ready,
  onStart,
  onReset,
}: {
  challenge: Challenge;
  stage: number;
  resume: boolean;
  ready: boolean;
  onStart: () => void;
  onReset: () => boolean;
}) {
  return (
    <Grid layout="stack" className="lab-project-start">
      <div className="lab-start-heading">
        <Link to="/react-lab" className="lab-back" aria-label="All challenges">
          ← All challenges
        </Link>
        <Text className="lab-eyebrow">Stepwise React lab · read, build, explain</Text>
        <Heading level={1}>{challenge.title}</Heading>
        <Text tone="muted">{challenge.summary}</Text>
        <Inline gap="sm">
          <Badge>{challenge.level}</Badge>
          <Badge appearance="plain">{challenge.minutes} minute timebox</Badge>
          {challenge.stages && (
            <Badge appearance="plain">
              Stage {stage + 1} of {challenge.stages.length}
            </Badge>
          )}
        </Inline>
      </div>
      <div className="lab-start-content">
        <Split ratio="wide-start" collapse="md" gap="lg" align="start">
          <Grid layout="stack">
            <ChallengeBrief challenge={challenge} id="lab-start-brief-title" stage={stage} />
            {challenge.stages && (
              <Panel aria-labelledby="lab-start-constraints-title">
                <Panel.Header>
                  <Heading level={2} size="sm" id="lab-start-constraints-title">
                    Your current constraints
                  </Heading>
                </Panel.Header>
                <Panel.Body>
                  <BriefConstraints challenge={challenge} stage={stage} />
                </Panel.Body>
              </Panel>
            )}
          </Grid>
          <Panel aria-labelledby="lab-start-plan-title">
            <Panel.Header>
              <Heading level={2} size="sm" id="lab-start-plan-title">
                Your practice session
              </Heading>
            </Panel.Header>
            <Panel.Body>
              <ol className="lab-start-steps">
                <li>
                  <Heading level={3} size="sm">
                    Understand the contract
                  </Heading>
                  <Text size="sm" tone="muted">
                    Predict the behavior. Name the edge cases before coding.
                  </Text>
                </li>
                <li>
                  <Heading level={3} size="sm">
                    Build and check
                  </Heading>
                  <Text size="sm" tone="muted">
                    Code beside the live preview. Use Console and behavior checks to inspect your
                    work.
                  </Text>
                </li>
                <li>
                  <Heading level={3} size="sm">
                    Explain your decisions
                  </Heading>
                  <Text size="sm" tone="muted">
                    Think aloud, compare tradeoffs, and request coaching when ready.
                  </Text>
                </li>
              </ol>
              <Text size="sm" tone="muted">
                Your timer stays paused until you start it. Hover or focus Brief in the workspace
                for a quick reminder; click to keep it open.
              </Text>
            </Panel.Body>
          </Panel>
        </Split>
      </div>
      <Inline justify="between" align="center" className="lab-start-actions">
        <Text size="sm" tone="muted">
          {resume
            ? "Your saved code and notes are ready to resume."
            : "Your code and notes save on this device."}
        </Text>
        {resume && <ResetProgress onReset={onReset} disabled={!ready} />}
        <Button disabled={!ready} onClick={onStart}>
          {resume ? "Resume project" : "Start project"}
          <span aria-hidden="true">↗</span>
        </Button>
      </Inline>
    </Grid>
  );
}
