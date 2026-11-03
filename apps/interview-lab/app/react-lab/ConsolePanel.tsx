import { Badge, Code, Panel, Text } from "@kb.ui/react";
export type ConsoleEntry = { id: string; level: string; text: string };
export function ConsolePanel({ entries }: { entries: ConsoleEntry[] }) {
  return (
    <Panel className="lab-console" aria-label="Console">
      <Panel.Body>
        <div
          className="lab-console-entries"
          role="log"
          aria-label="Console messages"
          aria-live="off"
        >
          {entries.length ? (
            entries.map((entry) => (
              <div key={entry.id} data-level={entry.level}>
                <Badge appearance="plain">{entry.level}</Badge>
                <Code>{entry.text}</Code>
              </div>
            ))
          ) : (
            <Text size="sm">No console messages yet.</Text>
          )}
        </div>
        <Text size="sm" tone="muted">
          Up to 200 captured messages per run · resets on preview reload · Strict Mode can log twice
        </Text>
      </Panel.Body>
    </Panel>
  );
}
