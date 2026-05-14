import { User, MapPin, Phone, AtSign, Edit3, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IntroField, PatientDetails } from "./VoiceIntake";

export function IntroReview({
  details,
  disabled,
  onEdit,
  onConfirm,
}: {
  details: PatientDetails;
  disabled: boolean;
  onEdit: (field: IntroField) => void;
  onConfirm: () => void;
}) {
  const fullName =
    [details.firstName, details.lastName].filter(Boolean).join(" ") || "—";
  const rows: {
    id: IntroField;
    label: string;
    value: string;
    icon: typeof User;
    sub?: string;
  }[] = [
    {
      id: "name",
      label: "Full name",
      value: fullName,
      icon: User,
      sub: details.preferredName
        ? `Preferred: ${details.preferredName}`
        : undefined,
    },
    { id: "address", label: "Address", value: details.address || "—", icon: MapPin },
    { id: "phone", label: "Phone", value: details.phone || "—", icon: Phone },
    { id: "email", label: "Email", value: details.email || "—", icon: AtSign },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl card p-8 md:p-10">
      <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">
        Welcome · confirm your details
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-tight">
        Does everything look right?
      </h1>
      <p className="mt-3 text-slate-600 max-w-prose">
        If anything needs a fix, tap <strong>Edit</strong> next to it to
        re-record. Otherwise confirm to continue.
      </p>

      <ul className="mt-8 space-y-3">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <li
              key={row.id}
              className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600 shrink-0">
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  {row.label}
                </div>
                <div className="text-sm font-medium text-slate-900 break-words">
                  {row.value}
                </div>
                {row.sub && (
                  <div className="text-xs text-slate-500 mt-0.5">{row.sub}</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => onEdit(row.id)}
              >
                <Edit3 size={14} /> Edit
              </Button>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex justify-end">
        <Button size="lg" onClick={onConfirm} disabled={disabled}>
          <Check size={16} /> Yes, everything is correct
        </Button>
      </div>
    </div>
  );
}
