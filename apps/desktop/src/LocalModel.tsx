import {
  Button,
  Callout,
  Container,
  Grid,
  Heading,
  Inline,
  Progress,
  Select,
  Text,
} from "@kb.ui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { cancelOperation, downloadModel, type LocalStatus, localStatus } from "./native";
export function LocalModel() {
  const [status, setStatus] = useState<LocalStatus | null>(null);
  const [model, setModel] = useState("qwen2.5-coder:7b");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const next = await localStatus();
        if (active) {
          setStatus(next);
          setError("");
        }
      } catch {
        if (active)
          setError(
            "Bundled reviewer unavailable. Open installed desktop app to use local reviews.",
          );
      }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 1500);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);
  const busy = status?.phase === "downloading" || status?.phase === "reviewing";
  return (
    <Container as="main" className="page">
      <Grid layout="stack">
        <Inline gap="md">
          <Link to="/react-lab">Frontend practice</Link>
          <Link to="/">Stepwise</Link>
          <Link to="/profile">Profile</Link>
        </Inline>
        <Heading level={1}>Local solution reviewer</Heading>
        <Text>
          Ollama is included. Download a model once; reviews then run on your computer without an
          API key or per-review charge. Code stays local. Internet is needed for model download.
        </Text>
        <Select
          label="Review model"
          value={model}
          onValueChange={(value) => {
            if (value) setModel(value);
          }}
          options={[
            { value: "qwen2.5-coder:7b", label: "Qwen Coder 7B · 4.7 GB · stronger feedback" },
            {
              value: "qwen2.5-coder:1.5b",
              label: "Qwen Coder 1.5B · 986 MB · lighter, weaker feedback",
            },
          ]}
          disabled={busy}
        />
        <Text>
          Use 7B when memory allows. Small-model feedback can miss bugs; browser checks remain
          separate evidence. Model unloads after each review.
        </Text>
        <Button
          disabled={!status || busy || status.phase === "starting"}
          onClick={() => {
            void downloadModel(model).catch((failure) => setError(String(failure)));
          }}
        >
          Download / use selected model
        </Button>
        {status && (
          <Text role="status">
            {status.phase} · {status.model}
            {status.total > 0 ? ` · ${Math.round((status.completed / status.total) * 100)}%` : ""}
          </Text>
        )}
        {status?.phase === "downloading" && (
          <Progress
            label="Model download"
            value={status.total > 0 ? (status.completed / status.total) * 100 : 0}
          />
        )}
        {busy && status?.operationId && (
          <Button
            variant="secondary"
            onClick={() => void cancelOperation(status.operationId as string)}
          >
            Cancel local operation
          </Button>
        )}
        {(error || status?.error) && (
          <Callout tone="warning" title={error || status?.error || "Local reviewer unavailable"} />
        )}
      </Grid>
    </Container>
  );
}
