import { useEffect, useRef, useState } from "react";
import {
  CopilotChatAudioRecorder,
  type AudioRecorderState,
} from "@copilotkit/react-core/v2";
import {
  Mic,
  Square,
  Loader2,
  Check,
  RotateCcw,
  User,
  MapPin,
  Phone,
  AtSign,
  AlertTriangle,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { normalizeFor, isValidFor } from "@/lib/intake-normalize";

export type IntroField = "name" | "address" | "phone" | "email";

type AudioRecorderRef = {
  state: AudioRecorderState;
  start: () => Promise<void>;
  stop: () => Promise<Blob>;
  dispose: () => void;
};

const TRANSCRIBE_URL =
  (import.meta.env.VITE_RUNTIME_URL ?? "/api/copilotkit")
    .toString()
    .replace(/\/api\/copilotkit.*$/, "") + "/api/transcribe";

const FIELDS: {
  id: IntroField;
  label: string;
  prompt: string;
  helper: string;
  icon: typeof User;
}[] = [
  {
    id: "name",
    label: "Full name",
    prompt: "Please say your full name",
    helper: "E.g. Maria Lopez. Add a preferred name if you'd like.",
    icon: User,
  },
  {
    id: "address",
    label: "Home address",
    prompt: "Please say your home address",
    helper: "Street, city, state, and zip.",
    icon: MapPin,
  },
  {
    id: "phone",
    label: "Phone number",
    prompt: "Please say your phone number",
    helper: "Ten digits. We'll format it for you.",
    icon: Phone,
  },
  {
    id: "email",
    label: "Email address",
    prompt: "Please say your email address",
    helper: 'Say "at" for @ and "dot" for the period.',
    icon: AtSign,
  },
];

type UiState = "idle" | "recording" | "transcribing" | "verifying" | "sending";

export type PatientDetails = {
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  address?: string;
  phone?: string;
  email?: string;
};

export function VoiceIntake({
  field,
  disabled,
  onConfirmed,
}: {
  field: IntroField;
  disabled: boolean;
  onConfirmed: (field: IntroField, value: string) => Promise<void>;
}) {
  const meta = FIELDS.find((f) => f.id === field)!;
  const recorderRef = useRef<AudioRecorderRef>(null);
  const [ui, setUi] = useState<UiState>("idle");
  const [transcript, setTranscript] = useState("");
  const [normalized, setNormalized] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"voice" | "type">("voice");
  const [typedValue, setTypedValue] = useState("");
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    setTranscript("");
    setNormalized("");
    setError(null);
    setUi("idle");
    setTypedValue("");
  }, [field]);

  useEffect(() => {
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      recorderRef.current?.dispose();
    };
  }, []);

  const start = async () => {
    setError(null);
    setTranscript("");
    setNormalized("");
    try {
      await recorderRef.current?.start();
      setSeconds(0);
      tickRef.current = window.setInterval(
        () => setSeconds((s) => s + 1),
        1000,
      );
      setUi("recording");
    } catch (err: any) {
      setError(err?.message ?? "Microphone access failed");
      setUi("idle");
    }
  };

  const stop = async () => {
    if (tickRef.current) window.clearInterval(tickRef.current);
    setUi("transcribing");
    try {
      const blob = await recorderRef.current?.stop();
      if (!blob) throw new Error("No audio captured");
      const res = await fetch(TRANSCRIBE_URL, {
        method: "POST",
        headers: { "Content-Type": blob.type || "audio/webm" },
        body: blob,
      });
      if (!res.ok) throw new Error(`Transcribe HTTP ${res.status}`);
      const { text } = (await res.json()) as { text: string };
      setTranscript(text);
      setNormalized(normalizeFor(field, text));
      setUi("verifying");
    } catch (err: any) {
      setError(err?.message ?? "Recording failed");
      setUi("idle");
    }
  };

  const confirmValue = async () => {
    setUi("sending");
    try {
      await onConfirmed(field, normalized);
      setUi("idle");
    } catch (err: any) {
      setError(err?.message ?? "Save failed");
      setUi("verifying");
    }
  };

  const retry = () => {
    setTranscript("");
    setNormalized("");
    setError(null);
    setUi("idle");
  };

  const submitTyped = () => {
    const value = normalizeFor(field, typedValue);
    setTranscript(typedValue);
    setNormalized(value);
    setUi("verifying");
  };

  const inputType =
    field === "email" ? "email" : field === "phone" ? "tel" : "text";
  const autoComplete =
    field === "email"
      ? "email"
      : field === "phone"
        ? "tel"
        : field === "address"
          ? "street-address"
          : "name";

  const stepIdx = FIELDS.findIndex((f) => f.id === field);
  const valid = isValidFor(field, normalized);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="card p-8 md:p-10">
        <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">
          Welcome · step {stepIdx + 1} of {FIELDS.length}
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-tight">
          {meta.prompt}
        </h1>
        <p className="mt-3 text-slate-600 max-w-prose">{meta.helper}</p>

        <div className="mt-6 flex justify-center">
          <div
            role="tablist"
            aria-label="Input mode"
            className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "voice"}
              onClick={() => {
                setMode("voice");
                retry();
              }}
              disabled={disabled || ui === "recording" || ui === "transcribing" || ui === "sending"}
              className={
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition " +
                (mode === "voice"
                  ? "bg-brand-600 text-white shadow"
                  : "text-slate-600 hover:text-slate-900")
              }
            >
              <Mic size={14} /> Voice
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "type"}
              onClick={() => {
                setMode("type");
                retry();
              }}
              disabled={disabled || ui === "recording" || ui === "transcribing" || ui === "sending"}
              className={
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition " +
                (mode === "type"
                  ? "bg-brand-600 text-white shadow"
                  : "text-slate-600 hover:text-slate-900")
              }
            >
              <Keyboard size={14} /> Type
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-5">
          <CopilotChatAudioRecorder
            ref={recorderRef}
            style={{ display: "none" }}
          />

          {mode === "type" && ui !== "verifying" && (
            <form
              className="w-full max-w-md space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!typedValue.trim() || disabled || ui === "sending") return;
                submitTyped();
              }}
            >
              <label className="block text-sm font-medium text-slate-700">
                {meta.label}
              </label>
              <input
                type={inputType}
                autoComplete={autoComplete}
                value={typedValue}
                onChange={(e) => setTypedValue(e.target.value)}
                placeholder={meta.helper}
                disabled={disabled || ui === "sending"}
                autoFocus
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:opacity-50"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!typedValue.trim() || disabled || ui === "sending"}
                >
                  <Check size={14} /> Continue
                </Button>
              </div>
            </form>
          )}

          {mode === "voice" && ui !== "verifying" && (
            <>
              <button
                type="button"
                disabled={
                  disabled || ui === "transcribing" || ui === "sending"
                }
                onClick={ui === "recording" ? stop : start}
                className={
                  "relative grid h-32 w-32 place-items-center rounded-full text-white shadow-lg transition-all " +
                  (ui === "recording"
                    ? "bg-rose-600 hover:bg-rose-700 scale-110"
                    : "bg-brand-600 hover:bg-brand-700") +
                  " disabled:opacity-50 disabled:cursor-not-allowed"
                }
                aria-label={
                  ui === "recording" ? "Stop recording" : "Start recording"
                }
              >
                {ui === "recording" ? (
                  <Square size={36} fill="white" />
                ) : ui === "transcribing" || ui === "sending" ? (
                  <Loader2 size={36} className="animate-spin" />
                ) : (
                  <Mic size={40} />
                )}
                {ui === "recording" && (
                  <span className="absolute inset-0 rounded-full ring-4 ring-rose-300/60 animate-ping" />
                )}
              </button>

              <div className="text-sm text-slate-600 min-h-[1.25rem]">
                {ui === "idle" && "Tap to record"}
                {ui === "recording" &&
                  `Recording… ${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")} · tap to stop`}
                {ui === "transcribing" && "Transcribing…"}
                {ui === "sending" && "Saving to your file…"}
              </div>
            </>
          )}

          {ui === "verifying" && (
            <div className="w-full space-y-4">
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-5">
                <div className="text-xs font-medium uppercase tracking-wider text-brand-700 mb-2">
                  Does this look right?
                </div>
                <div className="text-lg font-semibold text-slate-900 break-words">
                  {normalized || "(empty)"}
                </div>
                {transcript && transcript !== normalized && (
                  <div className="mt-2 text-xs text-slate-500">
                    Heard: "{transcript}"
                  </div>
                )}
                {!valid && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-rose-700">
                    <AlertTriangle size={14} />
                    This doesn't look like a valid {meta.label.toLowerCase()}.
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={retry}>
                  <RotateCcw size={14} /> {mode === "voice" ? "Re-record" : "Edit"}
                </Button>
                <Button
                  onClick={confirmValue}
                  disabled={!valid || disabled}
                >
                  <Check size={14} /> Yes, that's right
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="w-full rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            {FIELDS.map((f, i) => (
              <div
                key={f.id}
                className={
                  "h-2 w-8 rounded-full " +
                  (i < stepIdx
                    ? "bg-brand-500"
                    : i === stepIdx
                      ? "bg-brand-300"
                      : "bg-slate-200")
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
