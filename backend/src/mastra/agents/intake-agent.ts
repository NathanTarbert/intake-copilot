import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { z } from "zod";
import { flagRedFlags, recommendDoctor } from "../../tools/index.js";

export const IntakeState = z.object({
  currentStep: z
    .enum([
      "intro",
      "reason",
      "symptom",
      "chronic",
      "mental",
      "history",
      "insurance",
      "review",
      "profile",
    ])
    .default("intro"),
  patient: z
    .object({
      firstName: z.string().default(""),
      lastName: z.string().default(""),
      preferredName: z.string().default(""),
      address: z.string().default(""),
      phone: z.string().default(""),
      email: z.string().default(""),
    })
    .default({
      firstName: "",
      lastName: "",
      preferredName: "",
      address: "",
      phone: "",
      email: "",
    }),
  reason: z.string().default(""),
  symptoms: z
    .object({
      bodyArea: z.string().default(""),
      duration: z.string().default(""),
      severity: z.string().default(""),
      modifiers: z.array(z.string()).default([]),
    })
    .default({ bodyArea: "", duration: "", severity: "", modifiers: [] }),
  chronicCondition: z.string().default(""),
  mentalHealth: z
    .object({
      mood: z.string().default(""),
      interest: z.string().default(""),
    })
    .default({ mood: "", interest: "" }),
  allergies: z.array(z.string()).default([]),
  conditions: z.array(z.string()).default([]),
  insurance: z.string().default(""),
  concerns: z.array(z.string()).default([]),
  redFlags: z.array(z.string()).default([]),
  narration: z.string().default(""),
  summary: z.string().default(""),
  recommendedVisitType: z
    .enum([
      "",
      "emergency",
      "urgent_care",
      "in_person_30min",
      "telehealth_15min",
      "telehealth_30min",
      "routine_60min",
    ])
    .default(""),
  recommendedDoctor: z
    .object({
      id: z.string().default(""),
      name: z.string().default(""),
      credentials: z.string().default(""),
      specialty: z.string().default(""),
      specialtyLabel: z.string().default(""),
      focus: z.string().default(""),
      nextAvailability: z.string().default(""),
      location: z.string().default(""),
      lat: z.number().default(0),
      lng: z.number().default(0),
      rationale: z.string().default(""),
    })
    .default({
      id: "",
      name: "",
      credentials: "",
      specialty: "",
      specialtyLabel: "",
      focus: "",
      nextAvailability: "",
      location: "",
      lat: 0,
      lng: 0,
      rationale: "",
    }),
});

const INSTRUCTIONS = `You are a clinical intake assistant. The UI walks the patient through a wizard; you only respond to specific messages.

==== HARD RULES ====

1. "currentStep" is owned by the UI. NEVER write currentStep, EXCEPT on the one case below (review → profile).
2. These working-memory fields are written by the UI. NEVER overwrite or clear them on any turn: patient.address, patient.phone, patient.email, reason, symptoms.*, chronicCondition, mentalHealth.*, allergies[], conditions[], insurance, concerns[], recommendedDoctor.*, recommendedVisitType. Just preserve them.
3. The ONLY fields you ever write are: narration, redFlags (via flag_red_flags), summary, and during VOICE_INTRO_NAME: patient.firstName / patient.lastName / patient.preferredName.
4. Always update "narration" to ONE short sentence (under 18 words). Once you know the patient's first name, address them by it. Never list button choices in narration.

==== MESSAGES YOU HANDLE ====

- "VOICE_INTRO_NAME: <spoken full name>"
    Parse and set patient.firstName, patient.lastName. Optionally patient.preferredName if mentioned.
    Do NOT touch currentStep. Narration: "Thanks <firstName> — please share your home address next."

- "CONFIRM_INTAKE_INFO"
    The patient confirmed their details. Do NOT touch currentStep (UI handles it).
    Narration: "All set <firstName> — let's pick why you're here today."

- Any "Reason: …", "Body area: …", "Duration: …", "Severity: …", "Modifiers: …", "Chronic condition: …", "Mood: …", "Interest: …", "Allergies: …", "Conditions: …", "Insurance: …" message:
    Do NOT touch currentStep. Just write a one-sentence narration that acknowledges what was picked and gently invites the next answer. Address the patient by first name.

- A message containing "Body area: …" or "Modifiers: …":
    Call flag_red_flags with the value. Merge any detected flags into redFlags.

- A "Submit to provider" or "Acknowledge & call 911" message arrives with a hint line on the next line, like:
    "Recommended doctor: Dr. Marcus Okonkwo (Psychiatry & Behavioral Health). Why: <rationale>. Visit type: <type>."
    The UI has ALREADY written recommendedDoctor and recommendedVisitType into working memory. You MUST NOT touch those fields.
    Your only job is to write the "summary" field: a polished 3–5 sentence clinical note addressed to the provider. Use the patient's first name. Cover: reason for visit, recent concerns or relevant findings (symptoms / chronic condition / mental-health / red flags), and end by naming the recommended specialist (from the hint line) with a one-line rationale. Do NOT use bullet points.
    Do NOT touch currentStep.
    Narration: a warm closing sentence using firstName mentioning the doctor's name.

Tone: calm, professional, warm. Never invent patient data — only record what the patient actually said or clicked.`;

export const intakeAgent = new Agent({
  id: "intake-agent",
  name: "Patient Intake Agent",
  model: openai("gpt-4o-mini"),
  instructions: INSTRUCTIONS,
  tools: { flagRedFlags, recommendDoctor },
  memory: new Memory({
    storage: new LibSQLStore({
      id: "intake-agent-memory",
      url: "file::memory:",
    }),
    options: {
      workingMemory: {
        enabled: true,
        schema: IntakeState,
        scope: "thread",
      },
    },
  }),
});
