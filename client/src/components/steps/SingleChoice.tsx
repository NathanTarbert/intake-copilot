import { useState } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/QuestionCard";
import { VoiceRecorder } from "@/components/VoiceRecorder";

export function SingleChoice({
  eyebrow,
  title,
  description,
  choices,
  disabled,
  onChoose,
  otherPrompt,
  otherHelper,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  choices: string[];
  disabled: boolean;
  onChoose: (choice: string) => void;
  /** Prompt shown when the patient picks "Other" (voice capture). */
  otherPrompt?: string;
  otherHelper?: string;
}) {
  const [showRecorder, setShowRecorder] = useState(false);

  if (showRecorder) {
    return (
      <VoiceRecorder
        prompt={otherPrompt ?? `Tell us more about your answer`}
        helper={otherHelper ?? "Speak naturally — we'll save what you say."}
        disabled={disabled}
        onCancel={() => setShowRecorder(false)}
        onConfirmed={(text) => {
          setShowRecorder(false);
          onChoose(`Other — ${text}`);
        }}
      />
    );
  }

  return (
    <QuestionCard eyebrow={eyebrow} title={title} description={description}>
      {choices.map((c) => {
        const isOther = c.trim().toLowerCase() === "other";
        return (
          <Button
            key={c}
            variant="choice"
            size="choice"
            disabled={disabled}
            onClick={() =>
              isOther ? setShowRecorder(true) : onChoose(c)
            }
            className={
              isOther
                ? "justify-start whitespace-normal text-left leading-snug sm:col-span-2"
                : "justify-start whitespace-normal text-left leading-snug"
            }
          >
            {isOther && <Mic size={16} className="text-brand-600 shrink-0" />}
            {isOther ? "Other — speak your answer" : c}
          </Button>
        );
      })}
    </QuestionCard>
  );
}
