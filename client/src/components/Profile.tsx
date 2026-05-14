import {
  CheckCircle2,
  AlertOctagon,
  User,
  MapPin,
  Phone,
  AtSign,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VISIT_TYPE_LABEL } from "@/lib/intake-flow";
import { DoctorCard, type DoctorRec } from "@/components/DoctorCard";

export type ProfileProps = {
  firstName: string;
  lastName: string;
  preferredName: string;
  address: string;
  phone: string;
  email: string;
  reason: string;
  concerns: string[];
  summary: string;
  visitType: string;
  redFlags: string[];
  doctor?: DoctorRec;
  onRestart: () => void;
};

export function Profile({
  firstName,
  lastName,
  preferredName,
  address,
  phone,
  email,
  reason,
  concerns,
  summary,
  visitType,
  redFlags,
  doctor,
  onRestart,
}: ProfileProps) {
  const display = preferredName || firstName || "Patient";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "—";
  const visitLabel = VISIT_TYPE_LABEL[visitType] ?? visitType;
  const isEmergency = visitType === "emergency" || redFlags.length > 0;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 px-8 py-10 text-white">
          <div className="flex items-center gap-5">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-white/15 text-3xl font-semibold ring-4 ring-white/20">
              {display.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-brand-100">
                Patient profile
              </div>
              <h1 className="text-3xl font-semibold leading-tight">
                Welcome, {display}
              </h1>
              <div className="text-sm text-brand-100 mt-1">
                Your intake is complete and shared with your care team.
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 px-8 py-6">
          <Field icon={<User size={14} />} label="Full name" value={fullName} />
          <Field label="Preferred name" value={preferredName || firstName || "—"} />
          <Field icon={<Phone size={14} />} label="Phone" value={phone || "—"} />
          <Field icon={<AtSign size={14} />} label="Email" value={email || "—"} />
          <Field icon={<MapPin size={14} />} label="Address" value={address || "—"} wide />
          <Field
            icon={<Stethoscope size={14} />}
            label="Visit reason"
            value={reason || "—"}
            wide
          />
        </div>
      </div>

      {concerns.length > 0 && (
        <div className="card p-6">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
            Concerns shared
          </div>
          <ul className="space-y-1 text-sm text-slate-700 list-disc pl-5">
            {concerns.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {summary && (
        <div className="card p-6">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
            Clinical summary
          </div>
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {summary}
          </p>
        </div>
      )}

      {doctor?.name && (
        <div className="card p-6">
          <DoctorCard
            doctor={doctor}
            tone={isEmergency ? "emergency" : "default"}
            patientAddress={address}
          />
        </div>
      )}

      <div
        className={
          "card p-5 flex items-center gap-3 " +
          (isEmergency
            ? "bg-rose-50 ring-rose-200 text-rose-800"
            : "bg-brand-50 ring-brand-200 text-brand-900")
        }
      >
        {isEmergency ? <AlertOctagon size={22} /> : <CheckCircle2 size={22} />}
        <div>
          <div className="text-xs uppercase tracking-wider opacity-80">
            Recommended next step
          </div>
          <div className="text-sm font-semibold">{visitLabel || "Routine visit"}</div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={onRestart}>
          Start a new intake
        </Button>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  wide,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <div className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
        {icon} {label}
      </div>
      <div className="text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}
