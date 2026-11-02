import {
  Badge,
  Button,
  Card,
  Grid,
  Heading,
  Inline,
  Input,
  Panel,
  Progress,
  Select,
  Split,
  Text,
} from "@kb.ui/react";
import { Link, useSearchParams } from "react-router";
import { challenges, tracks } from "./curriculum";
import type { Notebook } from "./progress";
import { ResetProgress } from "./ResetProgress";
import { difficultyLevels } from "./types";

export function Dashboard({
  notebook,
  ready,
  onReset,
}: {
  notebook: Notebook;
  ready: boolean;
  onReset: () => boolean;
}) {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const trackFilter = params.get("track") ?? "all";
  const status = params.get("status") ?? "all";
  const level = params.get("level") ?? "all";
  const complete = challenges.filter(
    (challenge) => notebook.entries[challenge.id]?.completed,
  ).length;
  const next =
    challenges.find(
      (challenge) =>
        !notebook.entries[challenge.id]?.completed &&
        !notebook.entries[challenge.id]?.answerRevealed,
    ) ?? challenges[0];
  const visible = challenges.filter((challenge) => {
    const entry = notebook.entries[challenge.id];
    return (
      (trackFilter === "all" || challenge.track === trackFilter) &&
      (level === "all" || challenge.level === level) &&
      (status === "all" || (status === "complete" ? entry?.completed : !entry?.completed)) &&
      `${challenge.title} ${challenge.summary} ${challenge.tags.join(" ")}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
    );
  });
  function filter(key: string, value: string | null) {
    const nextParams = new URLSearchParams(params);
    if (!value || value === "all") nextParams.delete(key);
    else nextParams.set(key, value);
    setParams(nextParams, { replace: true, preventScrollReset: true });
  }
  return (
    <Grid layout="stack" className="lab-dashboard">
      <Split ratio="wide-start" gap="lg" collapse="md" className="lab-hero" align="center">
        <div>
          <Text className="lab-eyebrow">Your personal React practice ground</Text>
          <Heading level={1} className="lab-hero-title">
            Think in React.
            <br />
            <span>Build with intention.</span>
          </Heading>
          <Text size="lg" className="lab-hero-description">
            Start with web foundations. Practice responsive layouts, accessible interactions,
            resilient React features, and the reasoning behind your decisions.
          </Text>
          <Inline gap="md" align="center">
            <Button
              render={<Link to={`/react-lab/${next?.id}`} />}
              nativeButton={false}
              role="link"
            >
              {complete === challenges.length
                ? "Practice again"
                : complete > 0
                  ? "Continue your path"
                  : "Start practicing"}
              <span aria-hidden="true">↗</span>
            </Button>
            <Text as="span" size="sm" tone="muted">
              {challenges.length} challenges · {tracks.length} milestones · your pace
            </Text>
          </Inline>
        </div>
        <Panel className="lab-session-card" aria-labelledby="next-session-title">
          <Panel.Header>
            <Text as="span" className="lab-eyebrow">
              Next on your path
            </Text>
            <span className="lab-orbit" aria-hidden="true">
              ✳
            </span>
          </Panel.Header>
          <Panel.Body>
            <Heading level={2} id="next-session-title" size="lg">
              {next?.title}
            </Heading>
            <Text tone="muted">{next?.summary}</Text>
            <div className="lab-session-sequence">
              <div>
                <span>01</span>
                <Text as="span">Predict the behavior</Text>
              </div>
              <div>
                <span>02</span>
                <Text as="span">Build and check</Text>
              </div>
              <div>
                <span>03</span>
                <Text as="span">Explain the tradeoff</Text>
              </div>
            </div>
            <Inline justify="between" align="center">
              <Badge appearance="plain">{next?.minutes} minute session</Badge>
              <Link to={`/react-lab/${next?.id}`} aria-label={`Open next session: ${next?.title}`}>
                Open session ↗
              </Link>
            </Inline>
          </Panel.Body>
        </Panel>
      </Split>
      <Inline align="center" justify="between" className="lab-path-heading">
        <div>
          <Text className="lab-eyebrow">Deliberate practice, visible progress</Text>
          <Heading level={2}>Your learning path</Heading>
        </div>
        <ResetProgress all onReset={onReset} disabled={!ready} />
        <div className="lab-overall-progress">
          <Progress
            label="Challenges completed"
            value={complete}
            max={challenges.length}
            valueText={`${complete} of ${challenges.length}`}
          />
        </div>
      </Inline>
      <Inline gap="md" align="end" className="lab-filters">
        <Input
          label="Find a challenge"
          disabled={!ready}
          type="search"
          placeholder="Search topics, patterns, challenges…"
          value={query}
          onValueChange={(value) => filter("q", value)}
          startContent={<span aria-hidden="true">⌕</span>}
        />
        <Select
          label="Milestone"
          disabled={!ready}
          value={trackFilter}
          onValueChange={(value) => filter("track", value)}
          options={[
            { value: "all", label: "All milestones" },
            ...tracks.map((track) => ({ value: track.id, label: track.title })),
          ]}
        />
        <Select
          label="Difficulty"
          disabled={!ready}
          value={level}
          onValueChange={(value) => filter("level", value)}
          options={[
            { value: "all", label: "All difficulties" },
            ...difficultyLevels.map((value) => ({ value, label: value })),
          ]}
        />
        <Select
          label="Progress"
          disabled={!ready}
          value={status}
          onValueChange={(value) => filter("status", value)}
          options={[
            { value: "all", label: "All challenges" },
            { value: "todo", label: "To practice" },
            { value: "complete", label: "Completed" },
          ]}
        />
      </Inline>
      <Text role="status" size="sm" tone="muted" className="lab-filter-count">
        {visible.length} {visible.length === 1 ? "challenge" : "challenges"}
        {query ? ` matching “${query}”` : " to explore"}
      </Text>
      {visible.length === 0 && (
        <Panel className="lab-empty" aria-labelledby="lab-empty-title">
          <Panel.Body>
            <Heading level={3} id="lab-empty-title">
              No matching challenges
            </Heading>
            <Text tone="muted">Try another topic or show all milestones.</Text>
            <Button variant="secondary" onClick={() => setParams({})}>
              Clear filters
            </Button>
          </Panel.Body>
        </Panel>
      )}
      {tracks.map((track) => {
        const items = visible.filter((challenge) => challenge.track === track.id);
        if (items.length === 0) return null;
        const trackComplete = challenges.filter(
          (challenge) => challenge.track === track.id && notebook.entries[challenge.id]?.completed,
        ).length;
        return (
          <section className="lab-track" key={track.id} aria-labelledby={`track-${track.id}`}>
            <Inline align="center" justify="between" className="lab-track-header">
              <Inline align="center" gap="md">
                <span className="lab-track-number" aria-hidden="true">
                  {track.number}
                </span>
                <div>
                  <Heading level={3} size="lg" id={`track-${track.id}`}>
                    {track.title}
                  </Heading>
                  <Text tone="muted" size="sm">
                    {track.description}
                  </Text>
                </div>
              </Inline>
              <Text as="span" size="sm" tone="muted">
                {trackComplete} /{" "}
                {challenges.filter((challenge) => challenge.track === track.id).length} complete
              </Text>
            </Inline>
            <Grid as="ul" className="lab-challenge-grid">
              {items.map((challenge) => {
                const entry = notebook.entries[challenge.id];
                return (
                  <Card key={challenge.id} as="li" className="lab-challenge-card">
                    <Inline justify="between" align="center">
                      <Text as="span" size="sm" className="lab-card-number">
                        LAB {String(challenges.indexOf(challenge) + 1).padStart(2, "0")}
                      </Text>
                      <Badge tone={entry?.completed ? "success" : "neutral"} appearance="plain">
                        {entry?.answerRevealed
                          ? "Answer viewed"
                          : entry?.completed
                            ? "✓ Complete"
                            : entry
                              ? "In progress"
                              : "To practice"}
                      </Badge>
                    </Inline>
                    <Heading level={4} size="md">
                      <Link to={`/react-lab/${challenge.id}`}>
                        {challenge.title}
                        <span aria-hidden="true">↗</span>
                      </Link>
                    </Heading>
                    <Text tone="muted" size="sm">
                      {challenge.summary}
                    </Text>
                    <Inline gap="sm" className="lab-card-tags">
                      <Badge appearance="plain">{challenge.level}</Badge>
                      {challenge.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </Inline>
                    <Text size="sm" className="lab-card-time">
                      {challenge.minutes} min <span>·</span> Debug / build / explain
                    </Text>
                  </Card>
                );
              })}
            </Grid>
            <Text size="sm" tone="muted" className="lab-track-outcome">
              <span aria-hidden="true">↳ </span>Milestone outcome: {track.outcome}
            </Text>
          </section>
        );
      })}
    </Grid>
  );
}
