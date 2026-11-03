import { Button, Inline, Status, Text } from "@kb.ui/react";
import { useEffect, useState } from "react";

export function InterviewTimer({ minutes, ready }: { minutes: number; ready: boolean }) {
  const [started, setStarted] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(minutes * 60);
  useEffect(() => {
    if (deadline === null) return;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) setDeadline(null);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [deadline]);
  return (
    <Inline gap="sm" align="center" className="lab-timer">
      <Text as="span" className="lab-clock" aria-label="Practice time remaining">
        {String(Math.floor(remaining / 60)).padStart(2, "0")}:
        {String(remaining % 60).padStart(2, "0")}
      </Text>
      <Button
        disabled={!ready}
        size="sm"
        variant="ghost"
        onClick={() => {
          setStarted(true);
          setDeadline(deadline ? null : Date.now() + (remaining || minutes * 60) * 1000);
        }}
      >
        {deadline ? "Pause timer" : !started ? "Start interview" : "Resume timer"}
      </Button>
      <Button
        disabled={!ready}
        size="sm"
        variant="ghost"
        aria-label="Reset interview timer"
        onClick={() => {
          setDeadline(null);
          setStarted(false);
          setRemaining(minutes * 60);
        }}
      >
        ↺
      </Button>
      {remaining === 0 && (
        <Status live tone="info">
          Timebox finished. Explain your tradeoffs.
        </Status>
      )}
    </Inline>
  );
}
