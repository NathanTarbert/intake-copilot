import { useEffect, useRef, useState } from "react";
import {
  CopilotChatAudioRecorder,
  type AudioRecorderState,
} from "@copilotkit/react-core/v2";
import { Mic, Square, Loader2, Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type AudioRecorderRef = {
  state: AudioRecorderState;
  start: () => Promise<void>;
  stop: () => Promise<Blob>;
  dispose: () => void;
};

const TRANSCRIBE_URL =
  (import.meta.env.VITE_RUNTIME_URL ?? "http://localhost:4000/api/copilotkit")
    .toString()
    .replace(/\/api\/copilotkit.*$/, "") + "/api/transcribe";

type UiState = "idle" | "recording" | "transcribing" | "verifying";

/**
 * Compact voice capture: record → transcribe → confirm. Used when the
 * patient picks "Other" on a button step or wants to attach extra context.
 */
export function VoiceRecorder({
  prompt,
  helper,
  disabled,
  onCancel,
  onConfirmed,
}: {
  prompt: string;
  helper?: string;
  disabled?: boolean;
  onCancel: () => void;
  onConfirmed: (text: string) => void | Promise<void>;
}) {
  const recorderRef = useRef<AudioRecorderRef>(null);
  const [ui, setUi] = useState<UiState>("idle");
  const [transcript, setTranscript] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      recorderRef.current?.dispose();
    };
  }, []);

  const start = async () => {
    setError(null);
    setTranscript("");
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
      setTranscript(text.trim());
      setUi("verifying");
    } catch (err: any) {
      setError(err?.message ?? "Recording failed");
      setUi("idle");
    }
  };

  const confirm = async () => {
    if (!transcript) return;
    await onConfirmed(transcript);
  };

  const retry = () => {
    setTranscript("");
    setError(null);
    setUi("idle");
  };

  return (
    <div className="card mx-auto w-full max-w-3xl p-8 md:p-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">
            Tell us in your own words
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 leading-tight">
            {prompt}
          </h2>
          {helper && <p className="mt-2 text-slate-600">{helper}</p>}
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={ui === "transcribing"}>
          <X size={14} /> Cancel
        </Button>
      </div>

      <CopilotChatAudioRecorder
        ref={recorderRef}
        style={{ display: "none" }}
      />

      <div className="mt-8 flex flex-col items-center gap-4">
        {ui !== "verifying" && (
          <>
            <button
              type="button"
              disabled={disabled || ui === "transcribing"}
              onClick={ui === "recording" ? stop : start}
              className={
                "relative grid h-24 w-24 place-items-center rounded-full text-white shadow-lg transition-all " +
                (ui === "recording"
                  ? "bg-rose-600 hover:bg-rose-700 scale-110"
                  : "bg-brand-600 hover:bg-brand-700") +
                " disabled:opacity-50 disabled:cursor-not-allowed"
              }
              aria-label={ui === "recording" ? "Stop recording" : "Start recording"}
            >
              {ui === "recording" ? (
                <Square size={28} fill="white" />
              ) : ui === "transcribing" ? (
                <Loader2 size={28} className="animate-spin" />
              ) : (
                <Mic size={32} />
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
            </div>
          </>
        )}

        {ui === "verifying" && (
          <div className="w-full space-y-4">
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-5">
              <div className="text-xs font-medium uppercase tracking-wider text-brand-700 mb-2">
                Does this sound right?
              </div>
              <div className="text-base text-slate-900">
                {transcript || "(empty)"}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={retry}>
                <RotateCcw size={14} /> Re-record
              </Button>
              <Button onClick={confirm} disabled={!transcript || disabled}>
                <Check size={14} /> Yes, use this
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="w-full rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
