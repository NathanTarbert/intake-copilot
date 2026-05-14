import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Circle,
  FileText,
  Stethoscope,
  ShieldAlert,
  Calendar,
  ClipboardEdit,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ThinkingStep = {
  id: string;
  label: string;
  sub?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

type Status = "pending" | "active" | "done";

const ALMOST_FINISHED_AFTER = 10; // seconds

/**
 * Animated reasoning sequence while the agent generates the intake summary.
 * Cycles through steps every ~1.4s and HOLDS on the last step until the
 * parent unmounts us (by switching to the "done" view once `summary` arrives).
 * After 10 seconds total, the final step's copy switches to "Almost finished".
 */
export function ThinkingSteps({
  firstName,
  hasSymptoms,
  hasRedFlags,
}: {
  firstName: string;
  hasSymptoms: boolean;
  hasRedFlags: boolean;
}) {
  const name = firstName || "the patient";

  // ⏱ total seconds spent in this component (kept across all step transitions)
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const almostFinished = elapsed >= ALMOST_FINISHED_AFTER;

  const steps: ThinkingStep[] = [
    {
      id: "review",
      label: `Reviewing ${name}'s intake answers`,
      sub: "Contact info, reason for visit, history, insurance",
      icon: FileText,
    },
    ...(hasSymptoms
      ? [
          {
            id: "analyze",
            label: "Analyzing reported symptoms",
            sub: "Area, duration, severity, associated modifiers",
            icon: Stethoscope,
          },
        ]
      : []),
    {
      id: "redflags",
      label: hasRedFlags
        ? "Confirming red-flag symptoms"
        : "Running clinical red-flag checks",
      sub: hasRedFlags
        ? "Routing to emergency care"
        : "No emergency triggers detected",
      icon: ShieldAlert,
    },
    {
      id: "appointment",
      label: "Choosing the right appointment type",
      sub: hasRedFlags ? "Emergency · go to ER" : "Matching to visit duration",
      icon: Calendar,
    },
    {
      id: "summary",
      label: almostFinished
        ? "Almost finished"
        : "Drafting summary for the provider",
      sub: almostFinished
        ? "Polishing the clinical note and recommendation"
        : "Clinical note · 3–5 sentences",
      icon: ClipboardEdit,
    },
  ];

  // Step cycling: advance every 1.4s but clamp at the last step. The last
  // step keeps spinning until the parent unmounts us.
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = window.setInterval(
      () => setActive((i) => Math.min(i + 1, steps.length - 1)),
      1400,
    );
    return () => window.clearInterval(id);
  }, [steps.length]);

  const statusOf = (i: number): Status => {
    if (i < active) return "done";
    if (i === active) return "active";
    return "pending";
  };

  return (
    <div className="mt-6">
      <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-3">
        Generating intake summary
      </div>
      <ol className="space-y-2">
        {steps.map((step, i) => {
          const status = statusOf(i);
          const Icon = step.icon;
          return (
            <li
              key={step.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3 transition-all duration-300",
                status === "done" &&
                  "border-emerald-200 bg-emerald-50/40 opacity-90",
                status === "active" &&
                  "border-brand-300 bg-brand-50 shadow-sm",
                status === "pending" &&
                  "border-slate-200 bg-white opacity-60",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 grid h-7 w-7 place-items-center rounded-full shrink-0",
                  status === "done" && "bg-emerald-500 text-white",
                  status === "active" && "bg-brand-600 text-white",
                  status === "pending" && "bg-slate-100 text-slate-400",
                )}
              >
                {status === "done" ? (
                  <CheckCircle2 size={16} />
                ) : status === "active" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Circle size={14} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "text-sm font-medium leading-snug",
                    status === "pending"
                      ? "text-slate-500"
                      : "text-slate-900",
                  )}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Icon
                      size={13}
                      className={
                        status === "active"
                          ? "text-brand-600"
                          : status === "done"
                            ? "text-emerald-600"
                            : "text-slate-400"
                      }
                    />
                    {step.label}
                  </span>
                </div>
                {step.sub && (
                  <div className="text-xs text-slate-500 mt-0.5">{step.sub}</div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
