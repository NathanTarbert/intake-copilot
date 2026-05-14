import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { OnboardingShell } from "@/components/OnboardingShell";

const runtimeUrl =
  import.meta.env.VITE_RUNTIME_URL ?? "http://localhost:4000/api/copilotkit";

export default function App() {
  return (
    <CopilotKitProvider runtimeUrl={runtimeUrl} useSingleEndpoint>
      <OnboardingShell />
    </CopilotKitProvider>
  );
}
