import { Button, Code, Dialog, Grid, Heading, Inline, Panel, Text } from "@kb.ui/react";
import { useState } from "react";
import { Link } from "react-router";
import { readProject } from "./project";
import { ResetProgress } from "./ResetProgress";
import type { Challenge } from "./types";

export function ShowAnswer({ onEnd }: { onEnd: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={<Button variant="ghost" size="sm" />}>Show answer</Dialog.Trigger>
      <Dialog.Content title="End this attempt and view the answer?">
        <Dialog.Body>
          <Text>
            This will end this attempt as Answer viewed. It will not count as a completed challenge.
            Your draft stays saved; resetting the challenge starts a fresh attempt.
          </Text>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Actions>
            <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
            <Button onClick={onEnd}>End attempt and show answer</Button>
          </Dialog.Actions>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

export function AnswerAttempt({
  challenge,
  onReset,
}: {
  challenge: Challenge;
  onReset: () => boolean;
}) {
  return (
    <Grid layout="stack" className="lab-answer-attempt">
      <Inline justify="between" align="center">
        <Link to="/react-lab">All challenges</Link>
        <ResetProgress onReset={onReset} />
      </Inline>
      <Heading level={1}>Answer viewed</Heading>
      <Text>{challenge.title} · This attempt has ended. It does not count toward completion.</Text>
      <div className="lab-answer-content">
        <Panel aria-labelledby="lab-answer-title">
          <Panel.Header>
            <Heading level={2} size="md" id="lab-answer-title">
              One reference approach
            </Heading>
          </Panel.Header>
          <Panel.Body>
            <Text>{challenge.explanation}</Text>
            {Object.entries(readProject(challenge.solution)).map(([path, source]) => (
              <div key={path}>
                <Heading level={3} size="sm">
                  {path}
                </Heading>
                <pre className="lab-reference-code">
                  <Code>{source}</Code>
                </pre>
              </div>
            ))}
            <Text size="sm" tone="muted">
              Compare the reasoning with your saved draft. Reset this challenge to reattempt from
              its starter.
            </Text>
          </Panel.Body>
        </Panel>
      </div>
    </Grid>
  );
}
