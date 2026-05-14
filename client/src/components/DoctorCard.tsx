import { Stethoscope, MapPin, Clock } from "lucide-react";
import { DoctorMap } from "@/components/DoctorMap";

export type DoctorRec = {
  id?: string;
  name?: string;
  credentials?: string;
  specialty?: string;
  specialtyLabel?: string;
  focus?: string;
  nextAvailability?: string;
  location?: string;
  lat?: number;
  lng?: number;
  rationale?: string;
};

export function DoctorCard({
  doctor,
  tone = "default",
  patientAddress,
}: {
  doctor: DoctorRec;
  tone?: "default" | "emergency";
  patientAddress?: string;
}) {
  if (!doctor?.name) return null;
  const isEmergency = tone === "emergency";

  return (
    <div
      className={
        "rounded-xl p-5 ring-1 " +
        (isEmergency
          ? "bg-rose-50 ring-rose-200"
          : "bg-white ring-slate-200")
      }
    >
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider mb-2">
        <Stethoscope
          size={12}
          className={isEmergency ? "text-rose-600" : "text-brand-600"}
        />
        <span className={isEmergency ? "text-rose-700" : "text-slate-500"}>
          Recommended care team
        </span>
      </div>

      <div className="flex items-start gap-4">
        <div
          className={
            "grid h-12 w-12 place-items-center rounded-full text-lg font-semibold shrink-0 " +
            (isEmergency
              ? "bg-rose-600 text-white"
              : "bg-gradient-to-br from-brand-500 to-brand-700 text-white")
          }
        >
          {doctor.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold text-slate-900 leading-tight">
            {doctor.name}
            {doctor.credentials && (
              <span className="ml-1 text-slate-500 font-normal">
                · {doctor.credentials}
              </span>
            )}
          </div>
          <div
            className={
              "text-sm font-medium " +
              (isEmergency ? "text-rose-700" : "text-brand-700")
            }
          >
            {doctor.specialtyLabel}
          </div>
          {doctor.focus && (
            <div className="text-sm text-slate-600 mt-1.5 leading-snug">
              {doctor.focus}
            </div>
          )}
        </div>
      </div>

      {(doctor.nextAvailability || doctor.location) && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {doctor.nextAvailability && (
            <div className="flex items-start gap-2 text-slate-700">
              <Clock size={13} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="uppercase tracking-wider text-[10px] text-slate-400">
                  Next availability
                </div>
                <div className="font-medium">{doctor.nextAvailability}</div>
              </div>
            </div>
          )}
          {doctor.location && (
            <div className="flex items-start gap-2 text-slate-700">
              <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="uppercase tracking-wider text-[10px] text-slate-400">
                  Where
                </div>
                <div className="font-medium">{doctor.location}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {doctor.rationale && (
        <div
          className={
            "mt-4 rounded-lg p-3 text-xs leading-relaxed " +
            (isEmergency
              ? "bg-rose-100 text-rose-800"
              : "bg-slate-50 text-slate-700")
          }
        >
          <span className="font-semibold">Why this match: </span>
          {doctor.rationale}
        </div>
      )}

      {doctor.lat && doctor.lng && (
        <DoctorMap
          doctorName={doctor.name ?? ""}
          doctorLat={doctor.lat}
          doctorLng={doctor.lng}
          patientAddress={patientAddress}
          tone={tone}
        />
      )}
    </div>
  );
}
