import { MultiChoice } from "./MultiChoice";
import { ROUTINE_CONCERN_CHOICES } from "@/lib/intake-flow";

export function RoutineFollowup({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (selected: string[]) => void;
}) {
  return (
    <MultiChoice
      key="routine"
      eyebrow="Before your visit"
      title="Anything new since your last checkup?"
      description="Select anything that applies in the last year, or continue if it's truly routine."
      choices={ROUTINE_CONCERN_CHOICES}
      disabled={disabled}
      onSubmit={onSubmit}
      otherPrompt="What's been going on?"
      otherHelper="A few sentences works — pain, condition, medication, anything."
    />
  );
}
