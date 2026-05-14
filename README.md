# ai-copilot-onboarding

Enterprise-style patient onboarding demo built with CopilotKit headless (`useAgent`) on the client and a local Mastra agent on the backend. The agent drives a button-only intake flow, flags red-flag symptoms, and produces a clinical summary at the end.

## Stack
- **Client:** Vite + React + TypeScript, Tailwind, shadcn-style components, `@copilotkit/react-core/v2`
- **Server:** Node + Express, `@copilotkit/runtime`, Mastra (`@mastra/core`, `@mastra/memory`, `@mastra/libsql`)
- **LLM:** OpenAI `gpt-4o-mini` via `@ai-sdk/openai`

## Run it

### First-time setup
```bash
cp backend/.env.example backend/.env     # paste your OPENAI_API_KEY
pnpm install                              # root deps (concurrently)
pnpm install:all                          # backend + client deps
```

### Start both servers (one terminal)
```bash
pnpm dev:all
```
Streams interleaved, color-prefixed logs. Ctrl-C stops both. Backend on :4000, client on :5173.

### Or run them separately
```bash
pnpm dev:backend     # in one terminal
pnpm dev:client      # in another
```

## What to try

**Golden path:** Self → New symptom → Body: Chest → Duration: Past few days → Severity: Mild → Modifiers: None → Allergies: Penicillin → Conditions: none → Insurance: PPO → review the summary.

**Red-flag path:** Self → New symptom → Chest → Today → Severe → Shortness of breath. Watch the agent panel flag the red flag and route you to an emergency recommendation at review.

## How it works
- `client/src/components/OnboardingShell.tsx` uses `useAgent({ agentId: "intakeAgent" })` and renders different step components based on `agent.state.currentStep`.
- Each button click pushes a short message to the agent (`agent.addMessage` + `copilotkit.runAgent`).
- `backend/src/mastra/agents/intake-agent.ts` defines the agent with a Zod working-memory schema and three tools: `flag_red_flags`, `advance_step`, `finalize_intake`.
- The backend exposes the agent at `/api/copilotkit` via `MastraAgent.getLocalAgents` + `copilotRuntimeNodeExpressEndpoint`.
