import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { lookupDoctor, type Specialty } from "../lib/doctors.js";

const RED_FLAG_TERMS = [
  "chest pain",
  "shortness of breath",
  "difficulty breathing",
  "suicidal",
  "self-harm",
  "stroke",
  "facial droop",
  "slurred speech",
  "severe bleeding",
  "loss of consciousness",
];

export const flagRedFlags = createTool({
  id: "flag_red_flags",
  description:
    "Detect emergency red-flag symptoms from a freeform symptom description. Call this only when the patient describes a new symptom. Returns the list of detected red flags.",
  inputSchema: z.object({
    description: z
      .string()
      .describe("Patient-reported symptom description in plain language."),
  }),
  outputSchema: z.object({
    redFlags: z.array(z.string()),
    requiresER: z.boolean(),
  }),
  execute: async ({ context }) => {
    const text = (context.description ?? "").toLowerCase();
    const redFlags = RED_FLAG_TERMS.filter((t) => text.includes(t));
    return { redFlags, requiresER: redFlags.length > 0 };
  },
});

const SPECIALTY_ENUM = [
  "family_medicine",
  "internal_medicine",
  "psychiatry",
  "cardiology",
  "endocrinology",
  "pulmonology",
  "neurology",
  "dermatology",
  "orthopedics",
  "gastroenterology",
  "emergency_medicine",
] as const;

export const recommendDoctor = createTool({
  id: "recommend_doctor",
  description:
    "Look up the best matching specialist from the clinic's care-team roster. Use the patient's intake findings (reason for visit, symptoms, chronic condition, mental-health screener, red flags) to choose the most appropriate specialty. Call this exactly once when generating the final intake summary. If redFlags is non-empty you MUST use emergency_medicine.",
  inputSchema: z.object({
    specialty: z.enum(SPECIALTY_ENUM).describe(
      [
        "The specialty best suited to the patient's findings. Mapping guide:",
        "- emergency_medicine: any redFlags (chest pain, shortness of breath, suicidal, stroke signs, etc.)",
        "- psychiatry: mental-health screener concerns, depression/anxiety symptoms",
        "- cardiology: chest symptoms (non-red-flag), hypertension, heart disease follow-up",
        "- endocrinology: diabetes, thyroid",
        "- pulmonology: asthma, breathing concerns (non-red-flag)",
        "- neurology: head/headache symptoms, prior stroke follow-up",
        "- dermatology: skin",
        "- orthopedics: limb, back, joint pain",
        "- gastroenterology: abdomen / GI",
        "- internal_medicine: chronic condition follow-up that doesn't fit elsewhere",
        "- family_medicine: routine checkup, specialist referral handoff, anything otherwise general",
      ].join("\n"),
    ),
    rationale: z
      .string()
      .describe(
        "One short sentence explaining WHY this specialty was chosen — references the patient's findings.",
      ),
  }),
  outputSchema: z.object({
    id: z.string(),
    name: z.string(),
    credentials: z.string(),
    specialty: z.string(),
    specialtyLabel: z.string(),
    focus: z.string(),
    nextAvailability: z.string(),
    location: z.string(),
    lat: z.number(),
    lng: z.number(),
    rationale: z.string(),
  }),
  execute: async ({ context }) => {
    const doc = lookupDoctor(context.specialty as Specialty);
    return { ...doc, rationale: context.rationale };
  },
});
