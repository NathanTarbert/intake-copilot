export type StepId =
  | "intro"
  | "reason"
  | "routine"
  | "symptom"
  | "chronic"
  | "mental"
  | "history"
  | "insurance"
  | "review"
  | "profile";

export type StepDef = {
  id: StepId;
  label: string;
  hint: string;
};

export const STEPS: StepDef[] = [
  { id: "intro", label: "Introduce yourself", hint: "Tell us who you are" },
  { id: "reason", label: "Reason for visit", hint: "Why you're here today" },
  { id: "routine", label: "Recent concerns", hint: "Anything new this year" },
  { id: "symptom", label: "Symptom triage", hint: "A few quick questions" },
  { id: "chronic", label: "Chronic condition", hint: "Manage existing care" },
  { id: "mental", label: "Mental health", hint: "How you've been feeling" },
  { id: "history", label: "Medical history", hint: "Allergies & conditions" },
  { id: "insurance", label: "Insurance", hint: "Plan details" },
  { id: "review", label: "Review", hint: "Confirm and submit" },
  { id: "profile", label: "Your profile", hint: "All set" },
];

export const RAIL_STEPS: StepId[] = [
  "intro",
  "reason",
  "history",
  "insurance",
  "review",
  "profile",
];

export function railIndexFor(step: StepId): number {
  switch (step) {
    case "intro":
      return 0;
    case "reason":
    case "routine":
    case "symptom":
    case "chronic":
    case "mental":
      return 1;
    case "history":
      return 2;
    case "insurance":
      return 3;
    case "review":
      return 4;
    case "profile":
      return 5;
  }
}

export const ROUTINE_CONCERN_CHOICES = [
  "New pain or discomfort",
  "A new condition or diagnosis",
  "New medication started",
  "Recent ER visit or hospitalization",
  "Specific questions for the doctor",
  "Nothing new — just routine",
  "Other",
];

export const REASON_CHOICES = [
  "Routine checkup",
  "New symptom",
  "Chronic condition",
  "Mental health",
  "Specialist referral",
];

export const BODY_AREA_CHOICES = [
  "Head",
  "Chest",
  "Abdomen",
  "Back",
  "Limb",
  "Skin",
  "Other",
];

export const DURATION_CHOICES = [
  "Today",
  "Past few days",
  "1–2 weeks",
  "Over a month",
  "Other",
];

export const SEVERITY_CHOICES = ["Mild", "Moderate", "Severe"];

export const SYMPTOM_MODIFIERS = [
  "Shortness of breath",
  "Fever",
  "Numbness",
  "Bleeding",
  "None of these",
];

export const CHRONIC_CHOICES = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Heart disease",
  "Other",
];

export const MOOD_CHOICES = [
  "Felt down most days",
  "Some days",
  "Rarely",
  "Not at all",
];

export const INTEREST_CHOICES = [
  "Lost interest often",
  "Sometimes",
  "Rarely",
  "Not at all",
];

export const ALLERGY_CHOICES = [
  "Penicillin",
  "Sulfa drugs",
  "NSAIDs",
  "Latex",
  "Peanuts",
  "Shellfish",
  "Other",
];

export const CONDITION_CHOICES = [
  "Hypertension",
  "Diabetes",
  "Asthma",
  "Thyroid",
  "Depression",
  "Anxiety",
  "Other",
];


export const INSURANCE_CHOICES = [
  "PPO",
  "HMO",
  "Medicare",
  "Medicaid",
  "Self-pay",
];

export const VISIT_TYPE_LABEL: Record<string, string> = {
  emergency: "Emergency — go to ER",
  urgent_care: "Urgent care",
  in_person_30min: "In-person, 30 minutes",
  telehealth_15min: "Telehealth, 15 minutes",
  telehealth_30min: "Telehealth, 30 minutes",
  routine_60min: "Routine in-person, 60 minutes",
};
