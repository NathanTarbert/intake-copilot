import { useState } from "react";
import { Mic, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/QuestionCard";
import { VoiceRecorder } from "@/components/VoiceRecorder";

export function MultiChoice({
  eyebrow,
  title,
  description,
  choices,
  disabled,
  onSubmit,
  allowNone = true,
  otherPrompt,
  otherHelper,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  choices: string[];
  disabled: boolean;
  onSubmit: (selected: string[]) => void;
  allowNone?: boolean;
  otherPrompt?: string;
  otherHelper?: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [otherText, setOtherText] = useState<string | null>(null);
  const [showRecorder, setShowRecorder] = useState(false);

  const toggle = (c: string) =>
    setSelected((s) =>
      s.includes(c) ? s.filter((x) => x !== c) : [...s, c],
    );

  if (showRecorder) {
    return (
      <VoiceRecorder
        prompt={otherPrompt ?? "Tell us what else applies"}
        helper={otherHelper ?? "Speak naturally — we'll add it to your list."}
        disabled={disabled}
        onCancel={() => setShowRecorder(false)}
        onConfirmed={(text) => {
          setOtherText(text);
          setShowRecorder(false);
        }}
      />
    );
  }

  const handleSubmit = () => {
    const result = [...selected];
    if (otherText) result.push(`Other — ${otherText}`);
    onSubmit(result);
  };

  return (
    <QuestionCard
      eyebrow={eyebrow}
      title={title}
      description={description}
      footer={
        <Button
          size="lg"
          disabled={disabled || (!allowNone && selected.length === 0 && !otherText)}
          onClick={handleSubmit}
        >
          {selected.length === 0 && !otherText
            ? "None of these · Continue"
            : `Continue (${selected.length + (otherText ? 1 : 0)})`}
        </Button>
      }
    >
      {choices.map((c) => {
        const isOther = c.trim().toLowerCase() === "other";
        const isSel = isOther ? Boolean(otherText) : selected.includes(c);
        return (
          <Button
            key={c}
            variant="choice"
            size="choice"
            data-selected={isSel}
            disabled={disabled}
            onClick={() =>
              isOther ? setShowRecorder(true) : toggle(c)
            }
            className={
              "justify-start whitespace-normal text-left leading-snug" +
              (isOther ? " sm:col-span-2" : "")
            }
          >
            <span
              className={
                "mr-2 inline-grid h-5 w-5 place-items-center rounded border shrink-0 " +
                (isSel
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-300 bg-white")
              }
            >
              {isSel ? "✓" : ""}
            </span>
            {isOther ? (
              <span className="flex items-center gap-1.5 min-w-0">
                <Mic size={14} className="text-brand-600 shrink-0" />
                <span className="break-words">
                  {otherText ? `Other: ${otherText}` : "Other — speak your answer"}
                </span>
              </span>
            ) : (
              c
            )}
          </Button>
        );
      })}
      {otherText && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOtherText(null)}
          className="col-span-full justify-start text-slate-500 hover:text-rose-600"
        >
          <X size={12} /> Remove "{otherText}"
        </Button>
      )}
    </QuestionCard>
  );
}
