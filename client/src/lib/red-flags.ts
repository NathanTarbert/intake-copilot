// Mirrors the server-side flag_red_flags tool so the UI can alarm
// immediately on dangerous symptom combinations without waiting for the LLM.

const TERMS: { term: string; label: string }[] = [
  { term: "chest pain", label: "Chest pain" },
  { term: "shortness of breath", label: "Shortness of breath" },
  { term: "difficulty breathing", label: "Difficulty breathing" },
  { term: "suicidal", label: "Suicidal ideation" },
  { term: "self-harm", label: "Self-harm risk" },
  { term: "stroke", label: "Possible stroke" },
  { term: "facial droop", label: "Facial droop" },
  { term: "slurred speech", label: "Slurred speech" },
  { term: "severe bleeding", label: "Severe bleeding" },
  { term: "loss of consciousness", label: "Loss of consciousness" },
];

export function detectRedFlags(input: string): string[] {
  const text = input.toLowerCase();
  return TERMS.filter((t) => text.includes(t.term)).map((t) => t.label);
}
