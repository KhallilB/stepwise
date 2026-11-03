import { Badge, Grid, Heading, Inline, Panel, Text } from "@kb.ui/react";
import type { Challenge } from "./types";

export function ChallengeBrief({
  challenge,
  id,
  stage = 0,
}: {
  challenge: Challenge;
  id: string;
  stage?: number;
}) {
  const details = challenge.buildBrief ?? challenge.debugBrief;
  return (
    <Panel aria-labelledby={id} className="lab-flat-panel lab-challenge-brief">
      <Panel.Header>
        <Heading level={2} size="sm" id={id}>
          The brief
        </Heading>
        <Badge mono>{challenge.minutes} min</Badge>
      </Panel.Header>
      <Panel.Body>
        <Text size="sm" tone="muted">
          {challenge.kind === "build" ? "Build from scratch" : "Debug existing code"}
        </Text>
        <Text>{challenge.brief}</Text>
        {details && (
          <>
            <Heading level={3} size="sm">
              Sample data
            </Heading>
            <Text>{details.inputs}</Text>
            <Heading level={3} size="sm">
              {challenge.kind === "debug" ? "Expected starting UI" : "Starting UI"}
            </Heading>
            <Text>{details.initialUi}</Text>
            {challenge.kind === "debug" && (
              <Text size="sm" tone="muted">
                These examples describe the intended behavior. Investigate the supplied code to find
                where it differs.
              </Text>
            )}
            <Heading level={3} size="sm">
              Examples
            </Heading>
            <ol className="lab-requirements" aria-label="Sample inputs and expected UI">
              {details.examples
                .filter((example) => (example.stage ?? 0) <= stage)
                .map((example) => (
                  <li key={example.title}>
                    <Grid layout="stack">
                      <Heading level={4} size="sm">
                        {example.title}
                      </Heading>
                      <Text size="sm">
                        <strong>Sample input:</strong> {example.input}
                      </Text>
                      <Text size="sm">
                        <strong>Action:</strong> {example.action}
                      </Text>
                      <Text size="sm">
                        <strong>Expected UI:</strong> {example.expected}
                      </Text>
                    </Grid>
                  </li>
                ))}
            </ol>
          </>
        )}
        <Heading level={3} size="sm">
          Acceptance criteria
        </Heading>
        <ol className="lab-requirements">
          {challenge.requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <Inline gap="sm">
          {challenge.tags.map((tag) => (
            <Badge key={tag} appearance="plain">
              {tag}
            </Badge>
          ))}
        </Inline>
      </Panel.Body>
    </Panel>
  );
}

export function BriefConstraints({ challenge, stage }: { challenge: Challenge; stage: number }) {
  if (!challenge.stages) return null;
  return (
    <Grid layout="stack" className="lab-brief-constraints">
      {challenge.stages.slice(0, stage + 1).map((item, index) => (
        <div key={item.title}>
          <Inline justify="between" align="center">
            <Heading level={3} size="sm">
              {item.title}
            </Heading>
            <Badge appearance="plain">
              Stage {index + 1} · {item.minutes} min
            </Badge>
          </Inline>
          <ul>
            {item.constraints.map((constraint) => (
              <li key={constraint}>{constraint}</li>
            ))}
          </ul>
        </div>
      ))}
    </Grid>
  );
}
