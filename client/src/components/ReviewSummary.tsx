import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertOctagon, Sparkles } from "lucide-react";
import { VISIT_TYPE_LABEL } from "@/lib/intake-flow";
import { ThinkingSteps } from "@/components/ThinkingSteps";
import { DoctorCard } from "@/components/DoctorCard";
import type { IntakeState } from "@/components/OnboardingShell";

export function ReviewSummary({
  firstName,
  state,
  isRunning,
  redFlags,
  onSubmit,
  onRestart,
}: {
  firstName: string;
  state: IntakeState;
  isRunning: boolean;
  redFlags: string[];
  onSubmit: () => void | Promise<void>;
  onRestart: () => void;
}) {
  const summary = state.summary ?? "";
  const visitType = state.recommendedVisitType ?? "";
  const visitLabel = VISIT_TYPE_LABEL[visitType] ?? visitType;
  const isEmergency = visitType === "emergency" || redFlags.length > 0;
  const hasSymptoms = Boolean(state.symptoms?.bodyArea);

  // Tracks user intent — true the moment Submit is clicked. Keeps the
  // "running" view stable even if the agent run briefly stops between
  // ticks before the summary lands.
  const [submitted, setSubmitted] = useState(false);

  // Three view states:
  //   1. ready  — arrived on review, nothing generated yet
  //   2. running — Submit clicked, generation in flight
  //   3. done    — summary populated
  const view = summary ? "done" : submitted || isRunning ? "running" : "ready";

  const handleSubmit = async () => {
    setSubmitted(true);
    await onSubmit();
  };

  return (
    <div className="card mx-auto w-full max-w-3xl p-8 md:p-10">
      <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">
        Review
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
        {firstName
          ? `${firstName}, here's what we'll share with your provider`
          : "Here's what we'll share with your provider"}
      </h1>

      {view === "ready" && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Your intake is ready to send
              </div>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Tap <strong>{isEmergency ? "Acknowledge & call 911" : "Submit to provider"}</strong>{" "}
                — our assistant will draft a clinical summary and match you with the right specialist.
              </p>
            </div>
          </div>
        </div>
      )}

      {view === "running" && (
        <ThinkingSteps
          firstName={firstName}
          hasSymptoms={hasSymptoms}
          hasRedFlags={redFlags.length > 0}
        />
      )}

      {view === "done" && (
        <>
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6 text-slate-800 leading-relaxed whitespace-pre-line">
            {summary}
          </div>

          {state.recommendedDoctor?.name && (
            <div className="mt-4">
              <DoctorCard
                doctor={state.recommendedDoctor}
                tone={isEmergency ? "emergency" : "default"}
                patientAddress={state.patient?.address}
              />
            </div>
          )}

          <div
            className={
              "mt-4 flex items-center gap-3 rounded-xl p-4 " +
              (isEmergency
                ? "bg-rose-50 text-rose-800 ring-1 ring-rose-200"
                : "bg-brand-50 text-brand-800 ring-1 ring-brand-200")
            }
          >
            {isEmergency ? (
              <AlertOctagon size={20} />
            ) : (
              <CheckCircle2 size={20} />
            )}
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80">
                Recommended next step
              </div>
              <div className="text-sm font-semibold">
                {visitLabel || "Reviewing…"}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="ghost" onClick={onRestart}>
          Start over
        </Button>
        <Button
          size="lg"
          variant={isEmergency ? "danger" : "default"}
          disabled={view !== "ready"}
          onClick={handleSubmit}
        >
          {view === "done"
            ? "Sent to provider ✓"
            : view === "running"
              ? "Sending…"
              : isEmergency
                ? "Acknowledge & call 911"
                : "Submit to provider"}
        </Button>
      </div>
    </div>
  );
}
