import { Button, Callout, Dialog, Text } from "@kb.ui/react";
import { useState } from "react";

export function ResetProgress({
  all = false,
  onReset,
  disabled = false,
}: {
  all?: boolean;
  onReset: () => boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false),
    [failed, setFailed] = useState(false);
  const label = all ? "Reset all progress" : "Reset challenge";
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setFailed(false);
      }}
    >
      <Dialog.Trigger render={<Button variant="ghost" size="sm" disabled={disabled} />}>
        {label}
      </Dialog.Trigger>
      <Dialog.Content title={all ? "Reset the entire React lab?" : "Reset this challenge?"}>
        <Dialog.Body>
          <Text>
            This permanently removes{" "}
            {all
              ? "all saved challenge code, notes, stage progress, completion, answer-viewed status, and local coaching history on this device"
              : "this challenge’s saved code, notes, stage progress, completion, answer-viewed status, and local coaching history"}
            . {all ? "Every challenge starts fresh." : "Other challenges stay unchanged."} Export
            your notebook first if you want a copy.
          </Text>
          {failed && (
            <Callout role="alert" tone="warning">
              Reset could not finish in device storage. Export your notebook and retry.
            </Callout>
          )}
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Actions>
            <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
            <Button
              variant="danger"
              onClick={() => {
                if (onReset()) setOpen(false);
                else setFailed(true);
              }}
            >
              {label}
            </Button>
          </Dialog.Actions>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
