import { Button, Callout, Inline, Status, Text, Textarea } from "@kb.ui/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { isRecord } from "./coach";
import { coachFetch } from "./coach-transport";

type Capture = "idle" | "requesting" | "recording" | "recorded" | "transcribing";
export function VoiceCapture({
  enabled,
  local,
  onTranscript,
}: {
  enabled: boolean;
  local: boolean;
  onTranscript: (text: string) => boolean;
}) {
  const [state, setState] = useState<Capture>("idle");
  const [clip, setClip] = useState<Blob | null>(null);
  const [uninserted, setUninserted] = useState("");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [supported, setSupported] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const limit = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = useRef(false);
  const sending = useRef<AbortController | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;
  const release = () => {
    stream.current?.getTracks().forEach((track) => {
      track.stop();
    });
    stream.current = null;
    if (limit.current) clearTimeout(limit.current);
  };
  useEffect(() => {
    active.current = true;
    setSupported(!!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined");
    return () => {
      active.current = false;
      sending.current?.abort();
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((track) => {
        track.stop();
      });
      if (limit.current) clearTimeout(limit.current);
    };
  }, []);
  useEffect(() => {
    if (state !== "recording") return;
    const started = Date.now();
    const timer = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [state]);

  async function record() {
    setError("");
    setClip(null);
    setState("requesting");
    setSeconds(0);
    try {
      const microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!active.current) {
        microphone.getTracks().forEach((track) => {
          track.stop();
        });
        return;
      }
      stream.current = microphone;
      const mimeType = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus"].find(
        (type) => MediaRecorder.isTypeSupported(type),
      );
      const capture = new MediaRecorder(microphone, mimeType ? { mimeType } : undefined);
      recorder.current = capture;
      const chunks: Blob[] = [];
      let size = 0;
      let failed = false;
      capture.addEventListener("dataavailable", (event) => {
        if (event.data.size) {
          chunks.push(event.data);
          size += event.data.size;
        }
        if (size > 7 * 1024 * 1024 && capture.state === "recording") capture.stop();
      });
      capture.addEventListener("error", () => {
        failed = true;
        release();
        if (active.current) {
          setState("idle");
          setError("Recording failed. Try again or type your explanation.");
        }
      });
      capture.addEventListener("stop", () => {
        release();
        if (!active.current || failed) return;
        const audio = new Blob(chunks, { type: capture.mimeType || "audio/webm" });
        if (!audio.size || audio.size > 7 * 1024 * 1024) {
          setState("idle");
          setError("Recording was empty or too large. Try a shorter explanation.");
          return;
        }
        setClip(audio);
        setState("recorded");
      });
      capture.start(1000);
      setState("recording");
      limit.current = setTimeout(() => {
        if (capture.state === "recording") capture.stop();
      }, 180000);
    } catch {
      release();
      if (active.current) {
        setState("idle");
        setError(
          "Microphone unavailable or permission denied. Allow microphone access, try another browser, or type instead.",
        );
      }
    }
  }
  async function transcribe() {
    if (!clip) return;
    setError("");
    setState("transcribing");
    const controller = new AbortController();
    sending.current = controller;
    try {
      const form = new FormData();
      const extension = clip.type.includes("mp4")
        ? "mp4"
        : clip.type.includes("ogg")
          ? "ogg"
          : "webm";
      form.set("audio", clip, `explanation.${extension}`);
      const response = await coachFetch("/api/react-lab/transcribe", {
        method: "POST",
        body: form,
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(185000)]),
      });
      const result: unknown = await response.json();
      if (
        !response.ok ||
        !isRecord(result) ||
        typeof result.text !== "string" ||
        !result.text.trim()
      )
        throw new Error(
          isRecord(result) && typeof result.error === "string"
            ? result.error
            : "Transcription unavailable. Try again or type instead.",
        );
      if (active.current) {
        if (!onTranscriptRef.current(result.text)) {
          setUninserted(result.text);
          setError(
            "Notes reached their limit. Shorten them and append the transcript, or copy it below.",
          );
        }
        setClip(null);
        setState("idle");
      }
    } catch (failure) {
      if (active.current) {
        setState("recorded");
        setError(
          failure instanceof Error
            ? failure.message
            : "Transcription failed. Recording retained for retry.",
        );
      }
    }
  }
  const controls = (
    <Inline
      gap="sm"
      align="center"
      className="lab-voice-controls"
      data-recording={state === "recording" || undefined}
    >
      {state === "recording" ? (
        <>
          <Status live tone="running">
            Recording
          </Status>
          <Text as="span" size="sm">
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")} / 3:00
          </Text>
          <Button variant="secondary" size="sm" onClick={() => recorder.current?.stop()}>
            Stop recording
          </Button>
        </>
      ) : state === "recorded" || state === "transcribing" ? (
        <>
          <Button size="sm" disabled={state === "transcribing"} onClick={transcribe}>
            {state === "transcribing" ? "Transcribing…" : "Send audio & transcribe"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={state === "transcribing"}
            onClick={() => {
              setClip(null);
              setError("");
              setState("idle");
            }}
          >
            Discard recording
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          disabled={!enabled || !supported || state === "requesting" || !!uninserted}
          onClick={record}
        >
          {state === "requesting" ? "Requesting microphone…" : "Record explanation"}
        </Button>
      )}
    </Inline>
  );
  return (
    <div className="lab-voice">
      {state === "recording"
        ? createPortal(controls, document.querySelector(".react-lab") ?? document.body)
        : controls}
      <Text size="sm" tone="muted">
        Record up to 3 minutes per segment. Transcribe sends audio to{" "}
        {local ? "your local speech server" : "OpenAI"} only when you choose. Text appends to your
        explanation. Audio is not saved by the lab.
      </Text>
      {!supported && (
        <Text size="sm" tone="muted">
          Recording needs a browser with microphone and MediaRecorder support. Typing remains
          available.
        </Text>
      )}
      {uninserted && (
        <>
          <Textarea label="Transcript to copy" readOnly value={uninserted} rows={4} />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              if (onTranscriptRef.current(uninserted)) {
                setUninserted("");
                setError("");
              }
            }}
          >
            Append transcript
          </Button>
        </>
      )}
      {error && (
        <Callout role="alert" tone="warning">
          {error}
        </Callout>
      )}
    </div>
  );
}
