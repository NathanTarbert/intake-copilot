import { SingleChoice } from "./SingleChoice";
import { MultiChoice } from "./MultiChoice";
import {
  BODY_AREA_CHOICES,
  DURATION_CHOICES,
  SEVERITY_CHOICES,
  SYMPTOM_MODIFIERS,
} from "@/lib/intake-flow";

export type SymptomSubStep = "bodyArea" | "duration" | "severity" | "modifiers";

export function SymptomTriage({
  subStep,
  disabled,
  onChoose,
  onModifiers,
}: {
  subStep: SymptomSubStep;
  disabled: boolean;
  onChoose: (label: string, value: string) => void;
  onModifiers: (selected: string[]) => void;
}) {
  if (subStep === "bodyArea") {
    return (
      <SingleChoice
        key={subStep}
        eyebrow="Symptom triage · 1 of 4"
        title="Where is your symptom?"
        description="Pick the area that best matches."
        choices={BODY_AREA_CHOICES}
        disabled={disabled}
        onChoose={(c) => onChoose("Body area", c)}
        otherPrompt="Where exactly is your symptom?"
        otherHelper="E.g. left foot, jaw, lower back."
      />
    );
  }
  if (subStep === "duration") {
    return (
      <SingleChoice
        key={subStep}
        eyebrow="Symptom triage · 2 of 4"
        title="How long have you had it?"
        choices={DURATION_CHOICES}
        disabled={disabled}
        onChoose={(c) => onChoose("Duration", c)}
        otherPrompt="How long have you had it?"
        otherHelper="E.g. about three months, since last summer."
      />
    );
  }
  if (subStep === "severity") {
    return (
      <SingleChoice
        key={subStep}
        eyebrow="Symptom triage · 3 of 4"
        title="How severe is it?"
        choices={SEVERITY_CHOICES}
        disabled={disabled}
        onChoose={(c) => onChoose("Severity", c)}
      />
    );
  }
  return (
    <MultiChoice
      key="modifiers"
      eyebrow="Symptom triage · 4 of 4"
      title="Any of these alongside your symptom?"
      description="Select all that apply. This helps us flag urgent issues."
      choices={SYMPTOM_MODIFIERS}
      disabled={disabled}
      onSubmit={onModifiers}
    />
  );
}
