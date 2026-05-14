import { SingleChoice } from "./SingleChoice";
import { MOOD_CHOICES, INTEREST_CHOICES } from "@/lib/intake-flow";

export type MentalSubStep = "mood" | "interest";

export function MentalHealth({
  subStep,
  disabled,
  onChoose,
}: {
  subStep: MentalSubStep;
  disabled: boolean;
  onChoose: (label: string, value: string) => void;
}) {
  if (subStep === "mood") {
    return (
      <SingleChoice
        eyebrow="Mental health · 1 of 2"
        title="Over the last 2 weeks, have you felt down or hopeless?"
        choices={MOOD_CHOICES}
        disabled={disabled}
        onChoose={(c) => onChoose("Mood", c)}
      />
    );
  }
  return (
    <SingleChoice
      eyebrow="Mental health · 2 of 2"
      title="And how often have you lost interest in things you enjoy?"
      choices={INTEREST_CHOICES}
      disabled={disabled}
      onChoose={(c) => onChoose("Interest", c)}
    />
  );
}
