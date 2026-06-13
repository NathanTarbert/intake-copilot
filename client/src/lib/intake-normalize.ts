import type { IntroField } from "@/components/steps/VoiceIntake";

/**
 * If a token looks like a single-character spell-out ("1-5-6-0", "G-I-S-I-N-G-E-R"),
 * strip the dashes and rejoin. Letter-only tokens become Title-Case.
 */
function joinSpelled(token: string): string {
  // Peel off any trailing punctuation so the regex can match the core.
  const m = token.match(/^(.*?)([.,;:!?]+)?$/);
  const core = m?.[1] ?? token;
  const tail = m?.[2] ?? "";
  if (!/^([A-Za-z0-9])(?:[-–—][A-Za-z0-9])+$/.test(core)) {
    return token;
  }
  const joined = core.replace(/[-–—]/g, "");
  const formatted = /^[A-Za-z]+$/.test(joined)
    ? joined.charAt(0).toUpperCase() + joined.slice(1).toLowerCase()
    : joined;
  return formatted + tail;
}

const STATE_ABBREVS = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
]);

function titleCaseWord(word: string): string {
  if (!word) return word;
  const upper = word.toUpperCase();
  if (STATE_ABBREVS.has(upper)) return upper;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function normalizeAddress(raw: string): string {
  let s = raw.trim();
  s = s.replace(/[.;!?]+$/g, "");
  s = s
    .split(/\s+/)
    .map(joinSpelled)
    .map(titleCaseWord)
    .join(" ");
  s = s.replace(/,\s*,/g, ",").replace(/\s+,/g, ",");
  return s;
}

export function normalizeName(raw: string): string {
  return raw
    .trim()
    .split(/\s+/)
    .map(titleCaseWord)
    .join(" ");
}

export function normalizeEmail(raw: string): string {
  let s = raw.toLowerCase().trim();
  // Whisper transcribes punctuation as words
  s = s.replace(/\s+at\s+/g, "@");
  s = s.replace(/\s+dot\s+/g, ".");
  s = s.replace(/\s+underscore\s+/g, "_");
  s = s.replace(/\s+dash\s+/g, "-");
  s = s.replace(/\s+hyphen\s+/g, "-");
  // Trailing punctuation Whisper often adds
  s = s.replace(/[.,;!?]+$/g, "");
  // If the patient spelled the local part / domain letter-by-letter
  // ("j-o-h-n at gmail dot com"), drop dashes between single chars.
  s = s.replace(
    /(?:^|[^A-Za-z0-9])([A-Za-z0-9](?:[-–—][A-Za-z0-9])+)/g,
    (match, group) => match.replace(group, group.replace(/[-–—]/g, "")),
  );
  // Collapse internal whitespace
  s = s.replace(/\s+/g, "");
  return s;
}

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D+/g, "");
  const core = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (core.length === 10) {
    return `(${core.slice(0, 3)}) ${core.slice(3, 6)}-${core.slice(6)}`;
  }
  if (core.length === 7) {
    return `${core.slice(0, 3)}-${core.slice(3)}`;
  }
  return core || raw.trim();
}

export function normalizeFor(field: IntroField, raw: string): string {
  if (field === "email") return normalizeEmail(raw);
  if (field === "phone") return normalizePhone(raw);
  if (field === "address") return normalizeAddress(raw);
  if (field === "name") return normalizeName(raw);
  return raw.trim();
}

export function isValidFor(field: IntroField, value: string): boolean {
  if (!value) return false;
  if (field === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  if (field === "phone") return /^[\d()\-\s+]{7,}$/.test(value);
  if (field === "name") return value.length >= 2 && /^[A-Za-zÀ-ÖØ-öø-ÿ'\- ]+$/.test(value);
  return value.length >= 2;
}
