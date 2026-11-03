import { platformLinks } from "@interview/platform";
import { Badge, Button, Callout, Container, FileInput, Inline, Text } from "@kb.ui/react";
import { useEffect, useMemo, useState } from "react";
import { data, Link } from "react-router";
import { challenges, findChallenge } from "~/react-lab/curriculum";
import { Dashboard } from "~/react-lab/Dashboard";
import { formatProjectSource } from "~/react-lab/format-source";
import { useNotebook } from "~/react-lab/use-notebook";
import { Workspace } from "~/react-lab/Workspace";
import "~/react-lab/lab.css";

export async function loader({ params }: { params: { id?: string } }) {
  return loadChallenge(params.id);
}
export async function loadChallenge(id?: string) {
  const challenge = id ? findChallenge(id) : undefined;
  if (id && !challenge) throw data(null, { status: 404 });
  const [starter, solution] = challenge
    ? await Promise.all([
        formatProjectSource(challenge.starter),
        formatProjectSource(challenge.solution),
      ])
    : [null, null];
  return {
    id: id ?? null,
    starter,
    solution,
  };
}
export const meta = ({ data: routeData }: { data?: Awaited<ReturnType<typeof loadChallenge>> }) => [
  {
    title: `${routeData?.id ? findChallenge(routeData.id)?.title : "React interview lab"} · Interview practice`,
  },
];

export default function ReactLab({
  loaderData,
}: {
  loaderData: Awaited<ReturnType<typeof loadChallenge>>;
}) {
  const [links, setLinks] = useState(platformLinks(""));
  useEffect(() => setLinks(platformLinks(location.hostname)), []);
  const [importError, setImportError] = useState("");
  const original = loaderData.id ? findChallenge(loaderData.id) : undefined;
  const challenge = useMemo(
    () =>
      original && loaderData.starter !== null && loaderData.solution !== null
        ? { ...original, starter: loaderData.starter, solution: loaderData.solution }
        : original,
    [original, loaderData.starter, loaderData.solution],
  );
  const {
    notebook,
    ready,
    storageError,
    conflict,
    resolveConflict,
    save,
    download,
    restore,
    reset,
    resetWarning,
  } = useNotebook(challenge?.id);
  const entry = challenge ? notebook.entries[challenge.id] : undefined;
  const completed = challenges.filter((item) => notebook.entries[item.id]?.completed).length;
  return (
    <div className="react-lab" data-workspace={!!challenge || undefined}>
      <a href="#lab-main" className="lab-skip">
        Skip to practice
      </a>
      <header className="lab-header" hidden={!!challenge}>
        <Container size="full">
          <Inline justify="between" align="center" className="lab-header-inner">
            <Inline gap="md" align="center">
              <Link className="lab-brand" to="/" aria-label="Interview practice home">
                <svg width="25" height="25" viewBox="0 0 25 25" fill="none" aria-hidden="true">
                  <path
                    d="M3 21V14H10V7H17V3H22"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                practice<span className="lab-brand-period">.</span>
              </Link>
              <span className="lab-header-divider" aria-hidden="true" />
              <Link className="lab-header-label" to="/react-lab">
                React lab
              </Link>
              <Badge appearance="plain" className="lab-personal-badge">
                Personal edition
              </Badge>
            </Inline>
            <Inline gap="md" align="center">
              <a href={links.stepwise}>Stepwise</a>
              <Link to="/profile">Profile</Link>
              <Link to="/prep">Senior+ prep plan</Link>
              {links.stepwise === "/" && <Link to="/local-model">Local reviewer</Link>}
              <Text as="span" size="sm" className="lab-header-progress">
                {completed} / {challenges.length} complete
              </Text>
              <Button size="sm" variant="secondary" onClick={download} disabled={!ready}>
                Export notebook <span aria-hidden="true">↗</span>
              </Button>
            </Inline>
          </Inline>
        </Container>
      </header>
      <Container as="main" size="full" id="lab-main" className="lab-main">
        {challenge && (
          <Inline>
            <Link to="/prep">Senior+ prep plan</Link>
          </Inline>
        )}
        {conflict && (
          <Callout
            tone="warning"
            title="Another tab changed this challenge"
            actions={
              <Inline gap="sm">
                <Button size="sm" variant="secondary" onClick={() => resolveConflict(false)}>
                  Load other tab's draft
                </Button>
                <Button size="sm" variant="secondary" onClick={() => resolveConflict(true)}>
                  Keep this tab's draft
                </Button>
              </Inline>
            }
          >
            This tab's work stays here until you choose. Export before reloading if you want to
            preserve both versions.
          </Callout>
        )}
        {resetWarning && (
          <Callout role="status" tone="warning">
            {resetWarning}
          </Callout>
        )}
        {storageError && (
          <Callout role="alert" tone="warning" title="Device storage unavailable">
            Work remains in this session. Export your notebook before leaving; drafts cannot
            currently be saved.
          </Callout>
        )}
        {challenge ? (
          <Workspace
            key={`${challenge.id}:${notebook.resets?.[challenge.id] ?? "initial"}`}
            challenge={challenge}
            entry={
              entry && entry.code === original?.starter
                ? { ...entry, code: challenge.starter }
                : entry
            }
            ready={ready}
            onSave={(entry) => save(challenge.id, entry)}
            onExport={download}
            onReset={() => reset(challenge.id)}
            resetToken={notebook.resets?.[challenge.id]}
          />
        ) : (
          <>
            <Dashboard notebook={notebook} ready={ready} onReset={() => reset()} />
            <FileInput
              label="Import notebook"
              items={[]}
              onRemove={() => {}}
              multiple={false}
              accept="application/json,.json"
              disabled={!ready}
              description="Replaces drafts, notes and progress from a backup. Export current notebook first. Coaching history stays in backup file."
              error={importError || undefined}
              onFiles={(files) => {
                const file = files[0];
                if (!file) return;
                if (file.size > 10000000) {
                  setImportError("Backup must be under 10 MB.");
                  return;
                }
                void file
                  .text()
                  .then((raw) => setImportError(restore(raw) ?? ""))
                  .catch(() => setImportError("Backup could not be read."));
              }}
            />
          </>
        )}
      </Container>
      <footer className="lab-footer">
        <Container size="full">
          <Inline justify="between" gap="md">
            <Text as="span" size="sm">
              Built for understanding. Practiced with intention.
            </Text>
            <Text as="span" size="sm">
              Saved locally. Voice & AI sharing is always your choice.
            </Text>
          </Inline>
        </Container>
      </footer>
    </div>
  );
}
