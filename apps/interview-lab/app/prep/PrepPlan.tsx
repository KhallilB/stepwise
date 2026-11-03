import { createLocalState } from "@interview/platform/storage";
import {
  Badge,
  Callout,
  Checkbox,
  Container,
  Grid,
  Heading,
  Inline,
  Panel,
  Progress,
  Link as ResourceLink,
  Text,
} from "@kb.ui/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { type PrepProgress, parseProgress, progressKey, sections } from "./plan";

export default function PrepPlan() {
  const [completed, setCompleted] = useState<string[]>([]);
  const unsaved = useRef(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const store = useRef<ReturnType<typeof createLocalState<PrepProgress>> | null>(null);
  const items = sections.flatMap((section) => section.items);
  const total = items.reduce((sum, item) => sum + item.minutes, 0);
  const covered = items
    .filter((item) => completed.includes(item.id))
    .reduce((sum, item) => sum + item.minutes, 0);
  useEffect(() => {
    function restore() {
      if (unsaved.current) return;
      try {
        store.current ??= createLocalState(localStorage, progressKey, parseProgress);
        setCompleted(store.current.reload()?.completed ?? []);
      } catch {
        setError(
          "Progress is not saved. Device storage is unavailable; keep this page open for this session.",
        );
      }
    }
    restore();
    setReady(true);
    function changed(event: StorageEvent) {
      if (event.key === progressKey || event.key === null) restore();
    }
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, []);
  function toggle(id: string, checked: boolean) {
    let baseline = completed;
    try {
      store.current ??= createLocalState(localStorage, progressKey, parseProgress);
      if (!unsaved.current) baseline = store.current.reload()?.completed ?? [];
    } catch {
      /* Keep session progress when reads fail. */
    }
    const next = checked
      ? [...new Set([...baseline, id])]
      : baseline.filter((value) => value !== id);
    setCompleted(next);
    try {
      if (!store.current) throw new Error("Storage unavailable");
      store.current.write({ version: 1, completed: next });
      unsaved.current = false;
      setError("");
      setMessage("Saved on this device.");
    } catch {
      unsaved.current = true;
      setMessage("");
      setError(
        "Progress is not saved. Keep this plan open; leaving or reloading loses pending changes.",
      );
    }
  }
  return (
    <Container as="main" className="page">
      <Grid layout="stack">
        <Inline gap="md">
          <Link to="/react-lab">All challenges</Link>
          <Link to="/profile">Profile</Link>
        </Inline>
        <Text tone="muted">YOUR INTERVIEW ITINERARY · NOVEMBER 4</Text>
        <Heading level={1}>Senior+ frontend interview prep</Heading>
        <Text>Interview: November 4, 2026 · mixed coding and discussion.</Text>
        <Text>
          Build, diagnose, then explain. Timeboxes are practice budgets; add breaks between blocks.
          Check an item when you can explain its edge cases and tradeoffs.
        </Text>
        <Inline gap="md">
          <Badge>
            {total} minutes · {total / 60} hours
          </Badge>
          <Text>{total - covered} planned minutes remaining</Text>
        </Inline>
        <Progress
          label="Prep checklist"
          value={completed.length}
          max={items.length}
          valueText={`${completed.length} of ${items.length} complete`}
        />
        <Text tone="muted">
          Checklist progress saves separately from exercise drafts on this device and origin.
          Completing an exercise does not automatically check its prep item. Browser and desktop
          keep separate local progress.
        </Text>
        {error && (
          <Callout role="alert" tone="warning" title="Storage unavailable">
            {error}
          </Callout>
        )}
        <Text role="status">{message}</Text>
        {sections.map((section) => (
          <Panel key={section.id} aria-labelledby={`prep-${section.id}`}>
            <Panel.Header>
              <Heading level={2} id={`prep-${section.id}`}>
                {section.title}
              </Heading>
              <Badge>{section.items.reduce((sum, item) => sum + item.minutes, 0)} min</Badge>
            </Panel.Header>
            <Panel.Body>
              <Grid layout="stack">
                {section.items.map((item) => (
                  <Panel
                    key={item.id}
                    aria-labelledby={`task-${item.id}`}
                    tone="quiet"
                    density="compact"
                  >
                    <Panel.Header>
                      <Heading level={3} id={`task-${item.id}`}>
                        {item.title}
                      </Heading>
                      <Badge>{item.minutes} min</Badge>
                    </Panel.Header>
                    <Panel.Body>
                      <Grid layout="stack">
                        <Text>{item.detail}</Text>
                        <Text>
                          <strong>Explain aloud:</strong> {item.question}
                        </Text>
                        <Inline gap="md">
                          {item.exercise && (
                            <Link
                              to={`/react-lab/${item.exercise}`}
                              aria-label={`Open ${item.title}`}
                            >
                              Open exercise
                            </Link>
                          )}
                          {item.resources.map((resource) => (
                            <ResourceLink
                              key={resource.href}
                              href={resource.href}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {resource.label} ↗
                            </ResourceLink>
                          ))}
                        </Inline>
                        <Checkbox
                          label={`Complete ${item.title}`}
                          checked={completed.includes(item.id)}
                          onCheckedChange={(checked) => toggle(item.id, checked)}
                          disabled={!ready}
                        />
                      </Grid>
                    </Panel.Body>
                  </Panel>
                ))}
              </Grid>
            </Panel.Body>
          </Panel>
        ))}
      </Grid>
    </Container>
  );
}
