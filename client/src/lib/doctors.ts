/**
 * Client-side doctor roster. Mirrors backend/src/lib/doctors.ts so the
 * client can deterministically pick a specialist from intake findings —
 * no LLM call required. The agent only writes the prose summary.
 */

export type Specialty =
  | "family_medicine"
  | "internal_medicine"
  | "psychiatry"
  | "cardiology"
  | "endocrinology"
  | "pulmonology"
  | "neurology"
  | "dermatology"
  | "orthopedics"
  | "gastroenterology"
  | "emergency_medicine";

export type Doctor = {
  id: string;
  name: string;
  credentials: string;
  specialty: Specialty;
  specialtyLabel: string;
  focus: string;
  nextAvailability: string;
  location: string;
  lat: number;
  lng: number;
};

export const DOCTORS: Record<Specialty, Doctor> = {
  family_medicine: {
    id: "dr_chen",
    name: "Dr. Aisha Chen",
    credentials: "MD",
    specialty: "family_medicine",
    specialtyLabel: "Family Medicine",
    focus: "Routine care, preventive screenings, and minor urgent concerns.",
    nextAvailability: "Tomorrow, 10:30 AM",
    location: "Atrium Health · Main Clinic, 1000 Blythe Blvd, Charlotte, NC",
    lat: 35.2031,
    lng: -80.8447,
  },
  internal_medicine: {
    id: "dr_singh",
    name: "Dr. Vikram Singh",
    credentials: "MD",
    specialty: "internal_medicine",
    specialtyLabel: "Internal Medicine",
    focus: "Adult primary care and chronic disease coordination.",
    nextAvailability: "Wednesday, 9:00 AM",
    location: "Atrium Health · 1350 South Kings Dr, Charlotte, NC",
    lat: 35.205,
    lng: -80.831,
  },
  psychiatry: {
    id: "dr_okonkwo",
    name: "Dr. Marcus Okonkwo",
    credentials: "MD",
    specialty: "psychiatry",
    specialtyLabel: "Psychiatry & Behavioral Health",
    focus:
      "Mood disorders, anxiety, depression screening, medication management.",
    nextAvailability: "Friday, 1:15 PM",
    location: "Atrium Behavioral Health · 501 Billingsley Rd, Charlotte, NC",
    lat: 35.2127,
    lng: -80.812,
  },
  cardiology: {
    id: "dr_patel",
    name: "Dr. Riya Patel",
    credentials: "MD, FACC",
    specialty: "cardiology",
    specialtyLabel: "Cardiology",
    focus: "Hypertension, chest discomfort workup, heart disease follow-up.",
    nextAvailability: "Tuesday, 11:45 AM",
    location:
      "Atrium Cardiovascular Center · 1237 Harding Place, Charlotte, NC",
    lat: 35.2089,
    lng: -80.8362,
  },
  endocrinology: {
    id: "dr_garcia",
    name: "Dr. Elena Garcia",
    credentials: "DO",
    specialty: "endocrinology",
    specialtyLabel: "Endocrinology",
    focus: "Diabetes, thyroid disorders, hormonal imbalances.",
    nextAvailability: "Thursday, 2:00 PM",
    location: "Atrium Endocrine Clinic · 3535 Randolph Rd, Charlotte, NC",
    lat: 35.1916,
    lng: -80.79,
  },
  pulmonology: {
    id: "dr_lee",
    name: "Dr. Jin-ho Lee",
    credentials: "MD",
    specialty: "pulmonology",
    specialtyLabel: "Pulmonology",
    focus: "Asthma, COPD, chronic cough, shortness of breath.",
    nextAvailability: "Monday, 3:30 PM",
    location: "Atrium Pulmonary Clinic · 1718 East 4th St, Charlotte, NC",
    lat: 35.22,
    lng: -80.8323,
  },
  neurology: {
    id: "dr_thompson",
    name: "Dr. Sarah Thompson",
    credentials: "MD",
    specialty: "neurology",
    specialtyLabel: "Neurology",
    focus: "Headaches, migraines, neurological symptoms, stroke follow-up.",
    nextAvailability: "Thursday, 9:30 AM",
    location: "Atrium Neuroscience Center · 225 Baldwin Ave, Charlotte, NC",
    lat: 35.203,
    lng: -80.8527,
  },
  dermatology: {
    id: "dr_rivera",
    name: "Dr. Sofia Rivera",
    credentials: "MD",
    specialty: "dermatology",
    specialtyLabel: "Dermatology",
    focus: "Skin conditions, rashes, lesions, and chronic skin disease.",
    nextAvailability: "Next Monday, 12:30 PM",
    location:
      "Atrium Dermatology · 8830 Blakeney Professional Dr, Charlotte, NC",
    lat: 35.0728,
    lng: -80.8516,
  },
  orthopedics: {
    id: "dr_novak",
    name: "Dr. Jakub Novak",
    credentials: "MD",
    specialty: "orthopedics",
    specialtyLabel: "Orthopedics",
    focus: "Joint pain, sprains, fractures, musculoskeletal injuries.",
    nextAvailability: "Friday, 10:00 AM",
    location: "Atrium Orthopedic Center · 1320 Scott Ave, Charlotte, NC",
    lat: 35.211,
    lng: -80.8443,
  },
  gastroenterology: {
    id: "dr_kim",
    name: "Dr. Hannah Kim",
    credentials: "MD",
    specialty: "gastroenterology",
    specialtyLabel: "Gastroenterology",
    focus: "Abdominal pain, GI symptoms, reflux, IBS follow-up.",
    nextAvailability: "Next Wednesday, 1:00 PM",
    location: "Atrium GI Clinic · 1900 Randolph Rd, Charlotte, NC",
    lat: 35.1985,
    lng: -80.8079,
  },
  emergency_medicine: {
    id: "er_intake",
    name: "Atrium Emergency Department",
    credentials: "24/7 ER",
    specialty: "emergency_medicine",
    specialtyLabel: "Emergency Medicine",
    focus: "Immediate evaluation for life-threatening symptoms.",
    nextAvailability: "Walk in now — or call 911",
    location: "Atrium Main Hospital ER · 1000 Blythe Blvd, Charlotte, NC",
    lat: 35.2032,
    lng: -80.8455,
  },
};

export type VisitType =
  | "emergency"
  | "urgent_care"
  | "in_person_30min"
  | "telehealth_15min"
  | "telehealth_30min"
  | "routine_60min";

type Findings = {
  reason?: string;
  chronicCondition?: string;
  symptoms?: { bodyArea?: string; severity?: string };
  mentalHealth?: { mood?: string; interest?: string };
  concerns?: string[];
};

/** Deterministic specialty pick from intake findings. */
export function pickSpecialty(
  findings: Findings,
  redFlags: string[],
): Specialty {
  if (redFlags.length > 0) return "emergency_medicine";

  const reason = (findings.reason ?? "").toLowerCase();
  if (reason.includes("mental")) return "psychiatry";

  const mood = findings.mentalHealth?.mood ?? "";
  const interest = findings.mentalHealth?.interest ?? "";
  if (
    /down most days|lost interest often/i.test(mood) ||
    /down most days|lost interest often/i.test(interest)
  ) {
    return "psychiatry";
  }

  const chronic = (findings.chronicCondition ?? "").toLowerCase();
  if (chronic.includes("diabetes")) return "endocrinology";
  if (chronic.includes("hypertension") || chronic.includes("heart")) {
    return "cardiology";
  }
  if (chronic.includes("asthma")) return "pulmonology";
  if (chronic && !chronic.startsWith("other")) return "internal_medicine";
  if (chronic.startsWith("other")) return "internal_medicine";

  const area = (findings.symptoms?.bodyArea ?? "").toLowerCase();
  if (area.includes("chest")) return "cardiology";
  if (area.includes("head")) return "neurology";
  if (area.includes("skin")) return "dermatology";
  if (area.includes("limb") || area.includes("back")) return "orthopedics";
  if (area.includes("abdomen")) return "gastroenterology";

  return "family_medicine";
}

/** Deterministic visit-type pick. */
export function pickVisitType(
  specialty: Specialty,
  redFlags: string[],
  findings: Findings,
): VisitType {
  if (redFlags.length > 0 || specialty === "emergency_medicine") {
    return "emergency";
  }
  const severity = (findings.symptoms?.severity ?? "").toLowerCase();
  if (severity === "severe") return "urgent_care";
  if (specialty === "psychiatry") return "telehealth_30min";
  if (specialty === "family_medicine" && !findings.symptoms?.bodyArea) {
    return "routine_60min";
  }
  return "in_person_30min";
}

/** Short, human-readable rationale for the chosen specialty. */
export function buildRationale(
  specialty: Specialty,
  findings: Findings,
  redFlags: string[],
): string {
  if (redFlags.length > 0) {
    return `Red-flag symptoms (${redFlags
      .slice(0, 2)
      .join(", ")}) require immediate evaluation.`;
  }
  switch (specialty) {
    case "psychiatry":
      return "Mental-health screener indicates the patient would benefit from a behavioral health specialist.";
    case "cardiology":
      if (findings.chronicCondition?.toLowerCase().includes("hypertension")) {
        return "Ongoing hypertension management is a fit for cardiology.";
      }
      return "Chest-area concerns are best evaluated by cardiology.";
    case "endocrinology":
      return "Diabetes management is the focus of this clinic's endocrinology team.";
    case "pulmonology":
      return "Asthma and chronic breathing issues are this clinic's pulmonology focus.";
    case "neurology":
      return "Head/neurological symptoms map to neurology for workup.";
    case "dermatology":
      return "Skin concerns are routed to dermatology.";
    case "orthopedics":
      return "Limb/back musculoskeletal concerns are routed to orthopedics.";
    case "gastroenterology":
      return "Abdominal/GI symptoms map to gastroenterology.";
    case "internal_medicine":
      return "Chronic condition management is the focus of internal medicine.";
    case "family_medicine":
    default:
      return findings.concerns?.length
        ? `Family medicine can address: ${findings.concerns.slice(0, 2).join(", ")}.`
        : "A routine visit with family medicine is the right next step.";
  }
}

export function recommendDoctor(findings: Findings, redFlags: string[]) {
  const specialty = pickSpecialty(findings, redFlags);
  const visitType = pickVisitType(specialty, redFlags, findings);
  const doctor = DOCTORS[specialty];
  const rationale = buildRationale(specialty, findings, redFlags);
  return { doctor: { ...doctor, rationale }, visitType, specialty };
}
