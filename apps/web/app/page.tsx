import { AuthGate } from "@/components/auth/auth-gate";
import { HomeRedirect } from "@/components/auth/home-redirect";
import { WelcomeGate } from "@/components/welcome/welcome-gate";

export default function HomePage() {
  return (
    <WelcomeGate>
      <AuthGate>
        <HomeRedirect />
      </AuthGate>
    </WelcomeGate>
  );
}
