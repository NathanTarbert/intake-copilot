import { MultiChoice } from "./MultiChoice";
import { ALLERGY_CHOICES, CONDITION_CHOICES } from "@/lib/intake-flow";

export type HistorySubStep = "allergies" | "conditions";

export function HistorySteps({
  subStep,
  disabled,
  onSubmit,
}: {
  subStep: HistorySubStep;
  disabled: boolean;
  onSubmit: (label: string, selected: string[]) => void;
}) {
  if (subStep === "allergies") {
    return (
      <MultiChoice
        key="allergies"
        eyebrow="Medical history · 1 of 2"
        title="Any known allergies?"
        description="Select all that apply, or continue if none."
        choices={ALLERGY_CHOICES}
        disabled={disabled}
        onSubmit={(s) => onSubmit("Allergies", s)}
        otherPrompt="What other allergies do you have?"
        otherHelper="E.g. bee stings, certain foods, contrast dye."
      />
    );
  }
  return (
    <MultiChoice
      key="conditions"
      eyebrow="Medical history · 2 of 2"
      title="Any ongoing conditions?"
      description="Select all that apply, or continue if none."
      choices={CONDITION_CHOICES}
      disabled={disabled}
      onSubmit={(s) => onSubmit("Conditions", s)}
      otherPrompt="What other condition are you managing?"
      otherHelper="E.g. migraines, IBS, sleep apnea."
    />
  );
}
