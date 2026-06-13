import type { IntakeState } from "@/components/OnboardingShell";
import { VISIT_TYPE_LABEL } from "@/lib/intake-flow";

/**
 * Deterministic clinical-style summary built from working memory.
 * Used as a fallback when the agent fails to populate state.summary so the
 * provider-facing card is never empty.
 */
export function buildIntakeSummary(state: IntakeState): string {
  const first = state.patient?.firstName?.trim() || "The patient";
  const reason = state.reason?.trim();
  const concerns = state.concerns ?? [];
  const sym = state.symptoms ?? {};
  const chronic = state.chronicCondition?.trim();
  const mh = state.mentalHealth ?? {};
  const allergies = state.allergies ?? [];
  const conditions = state.conditions ?? [];
  const insurance = state.insurance?.trim();
  const redFlags = state.redFlags ?? [];
  const doc = state.recommendedDoctor;
  const visitLabel =
    VISIT_TYPE_LABEL[state.recommendedVisitType ?? ""] ??
    state.recommendedVisitType ??
    "";

  const sentences: string[] = [];

  // Opening
  const opener =
    reason && concerns.length
      ? `${first} is here for ${reason.toLowerCase()} and flagged ${joinList(concerns)}.`
      : reason
        ? `${first} is here for ${reason.toLowerCase()}.`
        : `${first} completed intake.`;
  sentences.push(opener);

  // Symptom triage
  if (sym.bodyArea) {
    const parts: string[] = [`reporting ${sym.bodyArea.toLowerCase()}`];
    if (sym.duration) parts.push(`for ${sym.duration.toLowerCase()}`);
    if (sym.severity) parts.push(`at ${sym.severity.toLowerCase()} severity`);
    let s = `They are ${parts.join(" ")}`;
    if (sym.modifiers?.length) {
      s += `, with ${joinList(sym.modifiers).toLowerCase()}`;
    }
    sentences.push(s + ".");
  }

  // Chronic
  if (chronic) {
    sentences.push(`Managing a chronic condition: ${chronic}.`);
  }

  // Mental health
  if (mh.mood || mh.interest) {
    const bits: string[] = [];
    if (mh.mood) bits.push(`mood "${mh.mood}"`);
    if (mh.interest) bits.push(`interest level "${mh.interest}"`);
    sentences.push(`PHQ-2 screener: ${bits.join(", ")}.`);
  }

  // History
  if (allergies.length || conditions.length) {
    const bits: string[] = [];
    if (allergies.length) bits.push(`known allergies to ${joinList(allergies)}`);
    if (conditions.length) bits.push(`existing conditions ${joinList(conditions)}`);
    sentences.push(`History on file: ${bits.join("; ")}.`);
  } else {
    sentences.push("No known allergies or chronic conditions on file.");
  }

  // Insurance
  if (insurance) {
    sentences.push(`Insurance: ${insurance}.`);
  }

  // Red flags
  if (redFlags.length) {
    sentences.push(
      `Urgent red flags noted: ${joinList(redFlags)} — please triage immediately.`,
    );
  }

  // Recommendation
  if (doc?.name) {
    const tail = doc.rationale ? ` ${trimPeriod(doc.rationale)}.` : "";
    const visit = visitLabel ? ` for a ${visitLabel.toLowerCase()}` : "";
    sentences.push(
      `Recommended care: ${doc.name}${doc.specialtyLabel ? `, ${doc.specialtyLabel}` : ""}${visit}.${tail}`,
    );
  }

  return sentences.join(" ");
}

function joinList(items: string[]): string {
  const cleaned = items.map((s) => s.trim()).filter(Boolean);
  if (cleaned.length === 0) return "";
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) return `${cleaned[0]} and ${cleaned[1]}`;
  return `${cleaned.slice(0, -1).join(", ")}, and ${cleaned[cleaned.length - 1]}`;
}

function trimPeriod(s: string): string {
  return s.replace(/[.\s]+$/g, "");
}
