import {
  Button,
  Callout,
  Container,
  FileInput,
  Grid,
  Heading,
  Inline,
  Input,
  Link,
  Text,
} from "@kb.ui/react";
import { useEffect, useRef, useState } from "react";
import { platformLinks } from "./index";
import { createLocalState, type Profile, parseProfile, profileKey } from "./local-state";

const blank: Profile = { version: 1, displayName: "", goal: "" };
export function ProfilePage() {
  const [profile, setProfile] = useState(blank);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const store = useRef<ReturnType<typeof createLocalState<Profile>> | null>(null);
  const [links, setLinks] = useState(platformLinks(""));
  useEffect(() => {
    setLinks(platformLinks(location.hostname));
    try {
      store.current = createLocalState(localStorage, profileKey, parseProfile);
      setProfile(store.current.read() ?? blank);
    } catch {
      setError("Device storage unavailable. Profile changes cannot be saved.");
    }
    setReady(true);
  }, []);
  function save(next: Profile) {
    try {
      if (!store.current) throw new Error();
      store.current.write(next);
      setProfile(next);
      setError("");
      setMessage("Profile saved on this device.");
    } catch {
      setError("Profile could not be saved. Export your profile before leaving.");
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(profile)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "interview-profile.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function restore(files: File[]) {
    const file = files[0];
    if (!file) return;
    try {
      if (file.size > 4096) throw new Error();
      const value = parseProfile(await file.text());
      if (!value) throw new Error();
      save(value);
    } catch {
      setError("Choose a valid interview-profile.json file under 4 KB. Saved profile unchanged.");
    }
  }
  return (
    <Container as="main" className="page">
      <Grid layout="stack">
        <Inline gap="md">
          <Link href={links.lab}>Frontend practice</Link>
          <Link href={links.stepwise}>Algorithm walkthroughs</Link>
        </Inline>
        <Heading level={1}>Your practice profile</Heading>
        <Text>
          Stored in this browser for this app. Export and import to use on another app, domain or
          device. No account or automatic sync.
        </Text>
        {error && <Callout tone="warning" title={error} />}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save(profile);
          }}
        >
          <Grid layout="stack">
            <Input
              label="Display name"
              value={profile.displayName}
              maxLength={80}
              onValueChange={(displayName) => {
                setProfile({ ...profile, displayName });
                setMessage("");
              }}
              disabled={!ready}
            />
            <Input
              label="Practice goal"
              value={profile.goal}
              maxLength={200}
              onValueChange={(goal) => {
                setProfile({ ...profile, goal });
                setMessage("");
              }}
              disabled={!ready}
            />
            <Inline gap="md">
              <Button type="submit" disabled={!ready}>
                Save profile
              </Button>
              <Button type="button" variant="secondary" onClick={download} disabled={!ready}>
                Export profile
              </Button>
            </Inline>
          </Grid>
        </form>
        <Text role="status">{message}</Text>
        <FileInput
          label="Import profile"
          items={[]}
          onRemove={() => {}}
          onFiles={(files) => void restore(files)}
          multiple={false}
          accept="application/json,.json"
          disabled={!ready}
          description="Replaces this app's saved profile after validation. Practice progress stays unchanged."
        />
      </Grid>
    </Container>
  );
}
