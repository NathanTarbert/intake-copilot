import {
  Sparkles,
  Loader2,
  ShieldAlert,
  User,
  MapPin,
  Phone,
  AtSign,
  Stethoscope,
  Activity,
  HeartPulse,
  Brain,
  ListChecks,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { IntakeState } from "@/components/OnboardingShell";

export function NotesPanel({
  narration,
  isRunning,
  firstName,
  state,
}: {
  narration: string;
  isRunning: boolean;
  firstName: string;
  state: IntakeState;
}) {
  const redFlags = state.redFlags ?? [];
  const hasContact = Boolean(
    state.patient?.address || state.patient?.phone || state.patient?.email,
  );
  const fullName =
    [state.patient?.firstName, state.patient?.lastName]
      .filter(Boolean)
      .join(" ") || "";

  return (
    <aside className="hidden xl:flex w-96 shrink-0 flex-col gap-4 border-l border-slate-200 bg-white px-6 py-8 overflow-y-auto max-h-screen">
      <header className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
          <Sparkles size={16} />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">
            {firstName ? `${firstName}'s intake` : "Intake assistant"}
          </div>
          <div className="text-xs text-slate-500">
            Powered by CopilotKit · Mastra
          </div>
        </div>
      </header>

      {/* Latest narration */}
      <div className={cn("card p-4", isRunning && "ring-brand-200")}>
        <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-2">
          {isRunning && <Loader2 size={11} className="animate-spin" />}
          {isRunning ? "Thinking" : "Latest update"}
        </div>
        <p className="text-sm leading-relaxed text-slate-700">
          {narration ||
            (firstName
              ? `Hi ${firstName} — let's continue your intake.`
              : "Welcome — start by introducing yourself with the mic.")}
        </p>
      </div>

      {/* Red flag alarm */}
      {redFlags.length > 0 && <RedFlagAlarm flags={redFlags} />}

      {/* Notes header */}
      <div className="flex items-center justify-between mt-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Intake notes
        </div>
        <div className="text-[10px] text-slate-400">
          auto-collected
        </div>
      </div>

      <div className="space-y-3">
        {(fullName || hasContact) && (
          <NoteSection icon={<User size={12} />} title="Patient">
            {fullName && <NoteRow label="Name" value={fullName} />}
            {state.patient?.preferredName && (
              <NoteRow label="Preferred" value={state.patient.preferredName} />
            )}
            {state.patient?.phone && (
              <NoteRow
                icon={<Phone size={11} />}
                label="Phone"
                value={state.patient.phone}
              />
            )}
            {state.patient?.email && (
              <NoteRow
                icon={<AtSign size={11} />}
                label="Email"
                value={state.patient.email}
              />
            )}
            {state.patient?.address && (
              <NoteRow
                icon={<MapPin size={11} />}
                label="Address"
                value={state.patient.address}
              />
            )}
          </NoteSection>
        )}

        {state.reason && (
          <NoteSection
            icon={<Stethoscope size={12} />}
            title="Reason for visit"
          >
            <NoteRow value={state.reason} />
            {(state.concerns?.length ?? 0) > 0 && (
              <NoteRow
                label="Concerns"
                value={state.concerns!.join(", ")}
              />
            )}
          </NoteSection>
        )}

        {(state.symptoms?.bodyArea ||
          state.symptoms?.duration ||
          state.symptoms?.severity ||
          (state.symptoms?.modifiers?.length ?? 0) > 0) && (
          <NoteSection icon={<Activity size={12} />} title="Symptom triage">
            {state.symptoms?.bodyArea && (
              <NoteRow label="Area" value={state.symptoms.bodyArea} />
            )}
            {state.symptoms?.duration && (
              <NoteRow label="Duration" value={state.symptoms.duration} />
            )}
            {state.symptoms?.severity && (
              <NoteRow label="Severity" value={state.symptoms.severity} />
            )}
            {(state.symptoms?.modifiers?.length ?? 0) > 0 && (
              <NoteRow
                label="Modifiers"
                value={state.symptoms!.modifiers!.join(", ")}
              />
            )}
          </NoteSection>
        )}

        {state.chronicCondition && (
          <NoteSection
            icon={<HeartPulse size={12} />}
            title="Chronic condition"
          >
            <NoteRow value={state.chronicCondition} />
          </NoteSection>
        )}

        {(state.mentalHealth?.mood || state.mentalHealth?.interest) && (
          <NoteSection icon={<Brain size={12} />} title="Mental health">
            {state.mentalHealth?.mood && (
              <NoteRow label="Mood" value={state.mentalHealth.mood} />
            )}
            {state.mentalHealth?.interest && (
              <NoteRow label="Interest" value={state.mentalHealth.interest} />
            )}
          </NoteSection>
        )}

        {((state.allergies?.length ?? 0) > 0 ||
          (state.conditions?.length ?? 0) > 0) && (
          <NoteSection icon={<ListChecks size={12} />} title="Medical history">
            {(state.allergies?.length ?? 0) > 0 && (
              <NoteRow
                label="Allergies"
                value={state.allergies!.join(", ")}
              />
            )}
            {(state.conditions?.length ?? 0) > 0 && (
              <NoteRow
                label="Conditions"
                value={state.conditions!.join(", ")}
              />
            )}
          </NoteSection>
        )}

        {state.insurance && (
          <NoteSection icon={<CreditCard size={12} />} title="Insurance">
            <NoteRow value={state.insurance} />
          </NoteSection>
        )}

        {state.recommendedDoctor?.name && (
          <NoteSection
            icon={<Stethoscope size={12} />}
            title="Recommended care team"
          >
            <NoteRow value={state.recommendedDoctor.name} />
            {state.recommendedDoctor.specialtyLabel && (
              <NoteRow
                label="Specialty"
                value={state.recommendedDoctor.specialtyLabel}
              />
            )}
            {state.recommendedDoctor.nextAvailability && (
              <NoteRow
                label="Next"
                value={state.recommendedDoctor.nextAvailability}
              />
            )}
          </NoteSection>
        )}

        {!fullName &&
          !hasContact &&
          !state.reason &&
          !state.symptoms?.bodyArea && (
            <div className="text-xs italic text-slate-400 px-1">
              Nothing yet — your notes will appear here as you answer.
            </div>
          )}
      </div>

      <div className="mt-auto pt-4 text-xs text-slate-400 leading-relaxed">
        Your responses are reviewed by a licensed provider before your
        appointment. Nothing here is medical advice.
      </div>
    </aside>
  );
}

function RedFlagAlarm({ flags }: { flags: string[] }) {
  return (
    <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-4 shadow-sm relative overflow-hidden">
      <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-rose-400 via-rose-600 to-rose-400 animate-pulse" />
      <div className="flex items-center gap-2 text-rose-800 mb-1.5">
        <ShieldAlert size={16} className="animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider">
          Red-flag symptoms
        </span>
      </div>
      <ul className="space-y-0.5 text-sm font-medium text-rose-900">
        {flags.map((f) => (
          <li key={f} className="flex items-start gap-1.5">
            <span className="text-rose-500 mt-0.5">•</span> {f}
          </li>
        ))}
      </ul>
      <p className="text-xs text-rose-700 mt-2 leading-relaxed">
        Please consider an emergency evaluation. We'll flag this for the provider.
      </p>
    </div>
  );
}

function NoteSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
        <span className="text-brand-600">{icon}</span> {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function NoteRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label?: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      {icon && <span className="text-slate-400">{icon}</span>}
      {label && <span className="text-xs text-slate-400">{label}:</span>}
      <span className="text-slate-900 font-medium break-words">{value}</span>
    </div>
  );
}
