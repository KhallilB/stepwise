import { Badge, Button, Heading, Inline, Panel, Text } from "@kb.ui/react";
import type { Stage } from "./types";

export function StageGuide({
  stages,
  index,
  passed,
  onAdvance,
}: {
  stages: Stage[];
  index: number;
  passed: boolean;
  onAdvance: () => void;
}) {
  const stage = stages[index];
  if (!stage) return null;
  return (
    <Panel aria-labelledby="lab-stage-title" className="lab-flat-panel lab-stage-guide">
      <Panel.Header>
        <Heading level={2} size="sm" id="lab-stage-title">
          Growing constraints
        </Heading>
        <Badge>
          Stage {index + 1} of {stages.length}
        </Badge>
      </Panel.Header>
      <Panel.Body>
        <ol className="lab-stage-list" aria-label="Build stages">
          {stages.map((item, n) => (
            <li key={item.title} aria-current={n === index ? "step" : undefined}>
              {n + 1}. {n <= index ? item.title : "Next constraint"}
            </li>
          ))}
        </ol>
        <Inline justify="between" align="center">
          <Heading level={3} size="sm">
            {stage.title}
          </Heading>
          <Text as="span" size="sm">
            {stage.minutes} min
          </Text>
        </Inline>
        <ul>
          {stage.constraints.map((constraint) => (
            <li key={constraint}>{constraint}</li>
          ))}
        </ul>
        <Text size="sm" tone="muted">
          Checks are cumulative. Passing this stage keeps every earlier requirement in play.
        </Text>
        {index < stages.length - 1 ? (
          <Button size="sm" disabled={!passed} onClick={onAdvance}>
            Unlock next stage
          </Button>
        ) : (
          <Text size="sm">
            Final stage. Pass all checks, then explain your decisions to complete.
          </Text>
        )}
      </Panel.Body>
    </Panel>
  );
}
