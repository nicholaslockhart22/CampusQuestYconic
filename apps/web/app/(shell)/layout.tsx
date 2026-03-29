import { SessionGuard } from "@/components/auth/session-guard";
import { MobileAppChrome } from "@/components/mobile/mobile-app-chrome";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGuard>
      <MobileAppChrome>{children}</MobileAppChrome>
    </SessionGuard>
  );
}
