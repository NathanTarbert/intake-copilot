import { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import { ProgressRail } from "@/components/ProgressRail";
import { NotesPanel } from "@/components/NotesPanel";
import { SingleChoice } from "@/components/steps/SingleChoice";
import { SymptomTriage, type SymptomSubStep } from "@/components/steps/SymptomTriage";
import { MentalHealth, type MentalSubStep } from "@/components/steps/MentalHealth";
import { HistorySteps, type HistorySubStep } from "@/components/steps/HistorySteps";
import { RoutineFollowup } from "@/components/steps/RoutineFollowup";
import { VoiceIntake, type IntroField } from "@/components/steps/VoiceIntake";
import { IntroReview } from "@/components/steps/IntroReview";
import { ReviewSummary } from "@/components/ReviewSummary";
import { Profile } from "@/components/Profile";
import {
  CHRONIC_CHOICES,
  INSURANCE_CHOICES,
  REASON_CHOICES,
  type StepId,
} from "@/lib/intake-flow";
import { detectRedFlags } from "@/lib/red-flags";
import { recommendDoctor } from "@/lib/doctors";

export type IntakeState = {
  currentStep?: StepId;
  patient?: {
    firstName?: string;
    lastName?: string;
    preferredName?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  reason?: string;
  symptoms?: {
    bodyArea?: string;
    duration?: string;
    severity?: string;
    modifiers?: string[];
  };
  chronicCondition?: string;
  mentalHealth?: { mood?: string; interest?: string };
  allergies?: string[];
  conditions?: string[];
  insurance?: string;
  concerns?: string[];
  redFlags?: string[];
  narration?: string;
  summary?: string;
  recommendedVisitType?: string;
  recommendedDoctor?: {
    id?: string;
    name?: string;
    credentials?: string;
    specialty?: string;
    specialtyLabel?: string;
    focus?: string;
    nextAvailability?: string;
    location?: string;
    lat?: number;
    lng?: number;
    rationale?: string;
  };
};

const INTRO_FIELDS: IntroField[] = ["name", "address", "phone", "email"];
const AGENT_ID = "intakeAgent";

/** Deep-merge two IntakeState slices, with `over` winning on conflicts. */
function mergeIntake(
  base: IntakeState,
  over: Partial<IntakeState>,
): IntakeState {
  return {
    ...base,
    ...over,
    patient: { ...(base.patient ?? {}), ...(over.patient ?? {}) },
    symptoms: { ...(base.symptoms ?? {}), ...(over.symptoms ?? {}) },
    mentalHealth: {
      ...(base.mentalHealth ?? {}),
      ...(over.mentalHealth ?? {}),
    },
    recommendedDoctor: {
      ...(base.recommendedDoctor ?? {}),
      ...(over.recommendedDoctor ?? {}),
    },
  };
}

export function OnboardingShell() {
  const { copilotkit } = useCopilotKit();
  const { agent } = useAgent({ agentId: AGENT_ID });

  // currentStep is CLIENT-OWNED React state.
  const [currentStep, setCurrentStep] = useState<StepId>("intro");
  const [introField, setIntroField] = useState<IntroField>("name");
  const [introPhase, setIntroPhase] = useState<"collecting" | "reviewing">(
    "collecting",
  );
  const [symptomSub, setSymptomSub] = useState<SymptomSubStep>("bodyArea");
  const [mentalSub, setMentalSub] = useState<MentalSubStep>("mood");
  const [historySub, setHistorySub] = useState<HistorySubStep>("allergies");

  // Mirror of every client write. Survives agent.state overwrites.
  // Render-time state = agent.state overlaid with this.
  const [clientWrites, setClientWrites] = useState<Partial<IntakeState>>({});

  const agentState = (agent?.state ?? {}) as IntakeState;
  const state = mergeIntake(agentState, clientWrites);
  const isRunning = Boolean(agent?.isRunning);
  const redFlags = state.redFlags ?? [];
  const narration = state.narration ?? "";
  const firstName = state.patient?.firstName ?? "";

  /** Apply a patch to both the client mirror and the agent's working memory. */
  const writeState = (patch: Partial<IntakeState>) => {
    setClientWrites((prev) => mergeIntake(prev as IntakeState, patch));
    if (agent) {
      const cur = (agent.state ?? {}) as IntakeState;
      agent.setState?.(mergeIntake(cur, patch));
    }
  };

  /** Add to redFlags (de-duplicated) by scanning a freeform text fragment. */
  const detectAndMergeRedFlags = (text: string) => {
    const found = detectRedFlags(text);
    if (!found.length) return;
    const existing = state.redFlags ?? [];
    const merged = Array.from(new Set([...existing, ...found]));
    if (merged.length !== existing.length) writeState({ redFlags: merged });
  };

  const sendChoice = async (content: string) => {
    if (!agent || isRunning) return;
    agent.addMessage({ id: uuid(), role: "user", content });
    try {
      await copilotkit.runAgent({ agent });
    } catch (err) {
      console.error("runAgent failed", err);
    }
  };

  // ----- intro --------------------------------------------------------------

  const NEXT_NARRATION: Record<IntroField, string> = {
    name: "",
    address: "Got it — what's the best phone number to reach you?",
    phone: "Thanks — last one, what's your email?",
    email: "Looks great — please confirm your details on the next screen.",
  };

  const handleIntroField = async (f: IntroField, value: string) => {
    if (f === "name") {
      await sendChoice(`VOICE_INTRO_NAME: ${value}`);
    } else if (agent) {
      writeState({
        patient: { [f]: value },
        narration: NEXT_NARRATION[f],
      });
    }
    const idx = INTRO_FIELDS.indexOf(f);
    if (idx < INTRO_FIELDS.length - 1) {
      setIntroField(INTRO_FIELDS[idx + 1]);
    } else {
      setIntroPhase("reviewing");
    }
  };

  const handleIntroEdit = (f: IntroField) => {
    setIntroField(f);
    setIntroPhase("collecting");
  };
  const handleIntroConfirm = async () => {
    setCurrentStep("reason");
    await sendChoice("CONFIRM_INTAKE_INFO");
  };

  // ----- reason / routine / chronic / mental / symptom / history / insurance

  const handleReason = async (choice: string) => {
    const nextStep: StepId = /new symptom/i.test(choice)
      ? "symptom"
      : /chronic/i.test(choice)
        ? "chronic"
        : /mental/i.test(choice)
          ? "mental"
          : /routine|specialist/i.test(choice)
            ? "routine"
            : "history";
    writeState({ reason: choice });
    setCurrentStep(nextStep);
    await sendChoice(`Reason: ${choice}`);
  };

  const handleRoutine = async (selected: string[]) => {
    // Anything flagged as new pain routes through the symptom triage so we
    // capture body area / duration / severity / modifiers.
    const wantsSymptomTriage = selected.some((s) =>
      /pain|discomfort/i.test(s),
    );
    writeState({ concerns: selected });
    setCurrentStep(wantsSymptomTriage ? "symptom" : "history");
    const summary = selected.length
      ? `Recent concerns: ${selected.join(", ")}`
      : "Recent concerns: none — routine visit";
    await sendChoice(summary + ".");
  };

  const handleChronic = async (choice: string) => {
    writeState({ chronicCondition: choice });
    setCurrentStep("history");
    await sendChoice(`Chronic condition: ${choice}`);
  };

  const handleInsurance = async (choice: string) => {
    writeState({
      insurance: choice,
      narration: firstName
        ? `Almost done, ${firstName} — tap Submit and I'll draft your intake summary.`
        : "Almost done — tap Submit and I'll draft your intake summary.",
    });
    setCurrentStep("review");
    await sendChoice(`Insurance: ${choice}`);
  };

  const handleSymptom = async (label: string, value: string) => {
    if (symptomSub === "bodyArea") {
      writeState({ symptoms: { bodyArea: value } });
      detectAndMergeRedFlags(value);
      await sendChoice(`${label}: ${value}`);
      setSymptomSub("duration");
    } else if (symptomSub === "duration") {
      writeState({ symptoms: { duration: value } });
      await sendChoice(`${label}: ${value}`);
      setSymptomSub("severity");
    } else if (symptomSub === "severity") {
      writeState({ symptoms: { severity: value } });
      await sendChoice(`${label}: ${value}`);
      setSymptomSub("modifiers");
    }
  };

  const handleSymptomModifiers = async (selected: string[]) => {
    writeState({ symptoms: { modifiers: selected } });
    setCurrentStep("history");
    selected.forEach((s) => detectAndMergeRedFlags(s));
    const txt = selected.length
      ? `Modifiers: ${selected.join(", ")}`
      : "Modifiers: none";
    await sendChoice(txt + ". Symptom triage complete.");
  };

  const handleMental = async (label: string, value: string) => {
    if (mentalSub === "mood") {
      writeState({ mentalHealth: { mood: value } });
      detectAndMergeRedFlags(value);
      await sendChoice(`${label}: ${value}`);
      setMentalSub("interest");
    } else {
      writeState({ mentalHealth: { interest: value } });
      setCurrentStep("history");
      await sendChoice(`${label}: ${value}. Mental health screener complete.`);
    }
  };

  const handleHistory = async (label: string, selected: string[]) => {
    if (historySub === "allergies") {
      writeState({ allergies: selected });
      await sendChoice(
        selected.length ? `${label}: ${selected.join(", ")}` : `${label}: none`,
      );
      setHistorySub("conditions");
    } else {
      writeState({ conditions: selected });
      setCurrentStep("insurance");
      await sendChoice(
        (selected.length
          ? `${label}: ${selected.join(", ")}`
          : `${label}: none`) + ". Medical history complete.",
      );
    }
  };

  const handleReviewSubmit = async () => {
    // Pick the doctor + visit type deterministically — no LLM involved.
    const rec = recommendDoctor(state, redFlags);
    writeState({
      recommendedDoctor: rec.doctor,
      recommendedVisitType: rec.visitType,
    });

    const hint =
      `Recommended doctor: ${rec.doctor.name} (${rec.doctor.specialtyLabel}). ` +
      `Why: ${rec.doctor.rationale} ` +
      `Visit type: ${rec.visitType}.`;

    const submitMsg =
      redFlags.length > 0 ? "Acknowledge & call 911" : "Submit to provider";

    await sendChoice(`${submitMsg}\n${hint}`);
    setCurrentStep("profile");
  };

  const restart = () => window.location.reload();

  const center = useMemo(() => {
    if (!agent) {
      return (
        <div className="text-slate-500">Connecting to intake assistant…</div>
      );
    }

    const friendly = firstName ? `${firstName}, ` : "";

    switch (currentStep) {
      case "intro":
        if (introPhase === "reviewing") {
          return (
            <IntroReview
              details={state.patient ?? {}}
              disabled={isRunning}
              onEdit={handleIntroEdit}
              onConfirm={handleIntroConfirm}
            />
          );
        }
        return (
          <VoiceIntake
            field={introField}
            disabled={isRunning}
            onConfirmed={handleIntroField}
          />
        );
      case "reason":
        return (
          <SingleChoice
            eyebrow="Reason for visit"
            title={`${friendly}what brings you in today?`}
            description="Pick the option that best describes your visit."
            choices={REASON_CHOICES}
            disabled={isRunning}
            onChoose={handleReason}
          />
        );
      case "routine":
        return (
          <RoutineFollowup disabled={isRunning} onSubmit={handleRoutine} />
        );
      case "symptom":
        return (
          <SymptomTriage
            subStep={symptomSub}
            disabled={isRunning}
            onChoose={handleSymptom}
            onModifiers={handleSymptomModifiers}
          />
        );
      case "chronic":
        return (
          <SingleChoice
            eyebrow="Chronic condition"
            title="Which condition are we managing?"
            choices={CHRONIC_CHOICES}
            disabled={isRunning}
            onChoose={handleChronic}
            otherPrompt="Which chronic condition are we managing?"
            otherHelper="E.g. migraines, lupus, rheumatoid arthritis."
          />
        );
      case "mental":
        return (
          <MentalHealth
            subStep={mentalSub}
            disabled={isRunning}
            onChoose={handleMental}
          />
        );
      case "history":
        return (
          <HistorySteps
            subStep={historySub}
            disabled={isRunning}
            onSubmit={handleHistory}
          />
        );
      case "insurance":
        return (
          <SingleChoice
            eyebrow="Insurance"
            title={`${friendly}what kind of coverage do you have?`}
            choices={INSURANCE_CHOICES}
            disabled={isRunning}
            onChoose={handleInsurance}
          />
        );
      case "review":
        return (
          <ReviewSummary
            firstName={firstName}
            state={state}
            isRunning={isRunning}
            redFlags={redFlags}
            onSubmit={handleReviewSubmit}
            onRestart={restart}
          />
        );
      case "profile":
        return (
          <Profile
            firstName={firstName}
            lastName={state.patient?.lastName ?? ""}
            preferredName={state.patient?.preferredName ?? ""}
            address={state.patient?.address ?? ""}
            phone={state.patient?.phone ?? ""}
            email={state.patient?.email ?? ""}
            reason={state.reason ?? ""}
            concerns={state.concerns ?? []}
            summary={state.summary ?? ""}
            visitType={state.recommendedVisitType ?? ""}
            redFlags={redFlags}
            doctor={state.recommendedDoctor}
            onRestart={restart}
          />
        );
      default:
        return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    agent,
    currentStep,
    isRunning,
    introField,
    introPhase,
    symptomSub,
    mentalSub,
    historySub,
    redFlags,
    firstName,
    state,
  ]);

  return (
    <div className="flex h-full min-h-screen w-full">
      <ProgressRail current={currentStep} />
      <main className="flex flex-1 items-start justify-center px-6 py-10 md:px-10 md:py-16 bg-slate-50">
        <div className="w-full">{center}</div>
      </main>
      <NotesPanel
        narration={narration}
        isRunning={isRunning}
        firstName={firstName}
        state={state}
      />
    </div>
  );
}
