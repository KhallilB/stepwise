import { Badge, Grid, Heading, Inline, Panel, Text } from "@kb.ui/react";
import type { Challenge } from "./types";

export function ChallengeBrief({ challenge, id }: { challenge: Challenge; id: string }) {
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
