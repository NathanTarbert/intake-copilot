# intake-copilot

Voice-first patient intake demo. The patient introduces themselves by voice, the wizard walks them through reason → triage → history → insurance, and a Mastra agent drafts a clinical summary for the provider with a recommended specialist and a live office map.

Built with **CopilotKit headless** (`useAgent` v2) on the client and a local **Mastra** agent on the backend.

## Stack
- **Client:** Vite + React + TypeScript, Tailwind v4, shadcn-style components, `@copilotkit/react-core/v2`, `mapbox-gl`
- **Backend:** Node + Express, `@copilotkit/runtime` (single-endpoint), Mastra (`@mastra/core`, `@mastra/memory`, `@mastra/libsql`), OpenAI Whisper for transcription
- **LLM:** OpenAI `gpt-4o-mini` via `@ai-sdk/openai` v3

## Run it

### First-time setup
```bash
cp backend/.env.example backend/.env     # paste OPENAI_API_KEY
cp client/.env.example  client/.env      # paste VITE_MAPBOX_TOKEN (optional)
pnpm install                              # root deps (concurrently)
pnpm install:all                          # backend + client deps
```

### Start both servers
```bash
pnpm dev:all
```
Color-prefixed logs in one terminal. Ctrl-C stops both. Backend on `:4000`, client on `:5173`.

### Or run them separately
```bash
pnpm dev:backend     # one terminal
pnpm dev:client      # another
```

## What to try

**Voice intro** — say your full name, address, phone number, and email one at a time. Each answer is normalized (e.g. spelled-out street names get stitched, `at`/`dot` become `@`/`.`) and verified before saving. A final confirm screen lets you edit any field.

**Mental-health path** — pick *Mental health* on the reason step → answer the two PHQ-2-style screener questions → the system routes to **Dr. Marcus Okonkwo, Psychiatry**.

**Red-flag path** — pick *New symptom* → *Chest* → *Today* → *Severe* → *Shortness of breath*. The right-side panel fires a red-flag alarm immediately (client-side detection), Review recommends the ER, and the map points to Atrium's Emergency Department.

**Routine checkup** — pick *Routine checkup* → answer the "anything new this year" multi-select. Selecting *New pain or discomfort* routes through symptom triage; otherwise straight to history.

## How it works

- `client/src/components/OnboardingShell.tsx` is the controller. It owns `currentStep` as React state (the LLM never routes the wizard) and mirrors every collected field into both `agent.setState` and a local `clientWrites` object so the agent can't accidentally wipe data.
- Each step writes its value via `writeState({...})` and advances `currentStep` imperatively.
- `client/src/lib/doctors.ts` picks the right specialist deterministically (`pickSpecialty` / `pickVisitType` / `buildRationale`) — no LLM call needed for the recommendation.
- `client/src/lib/red-flags.ts` mirrors the server's red-flag keywords so the alarm fires the instant a trigger word appears.
- `backend/src/mastra/agents/intake-agent.ts` defines a single Mastra agent. Its only writable fields are `narration`, `redFlags` (via the `flag_red_flags` tool), `summary`, and the name parts during voice intro. Everything else is UI-owned.
- `backend/src/index.ts` exposes the runtime at `/api/copilotkit` via `copilotRuntimeNodeExpressEndpoint`, plus a `/api/transcribe` endpoint that proxies audio blobs to OpenAI Whisper.
- `client/src/components/DoctorMap.tsx` renders an interactive Mapbox map of the selected office with a Google Maps deep link for actual navigation.

## Repo
https://github.com/NathanTarbert/intake-copilot
