import { cn } from "@/lib/utils";
import { RAIL_STEPS, STEPS, railIndexFor, type StepId } from "@/lib/intake-flow";
import { Check } from "lucide-react";

export function ProgressRail({ current }: { current: StepId }) {
  const activeIdx = railIndexFor(current);
  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col gap-1 border-r border-slate-200 bg-white px-6 py-8">
      <div className="mb-8 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          A
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">
            Atrium Health
          </div>
          <div className="text-xs text-slate-500">New patient intake</div>
        </div>
      </div>
      <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
        Your progress
      </div>
      <ol className="relative space-y-1">
        {RAIL_STEPS.map((id, idx) => {
          const step = STEPS.find((s) => s.id === id)!;
          const done = idx < activeIdx;
          const active = idx === activeIdx;
          return (
            <li key={id} className="flex items-start gap-3 py-2">
              <div
                className={cn(
                  "mt-0.5 grid h-6 w-6 place-items-center rounded-full text-xs font-semibold",
                  done && "bg-brand-600 text-white",
                  active && "bg-brand-100 text-brand-700 ring-2 ring-brand-500",
                  !done && !active && "bg-slate-100 text-slate-400",
                )}
              >
                {done ? <Check size={14} /> : idx + 1}
              </div>
              <div className="flex-1">
                <div
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-slate-900" : "text-slate-600",
                  )}
                >
                  {step.label}
                </div>
                <div className="text-xs text-slate-400">{step.hint}</div>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
        <div className="font-medium text-slate-700">Need help?</div>
        Call the front desk at (555) 010-2240.
      </div>
    </aside>
  );
}
