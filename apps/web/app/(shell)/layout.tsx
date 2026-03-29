import { MobileAppChrome } from "@/components/mobile/mobile-app-chrome";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return <MobileAppChrome>{children}</MobileAppChrome>;
}
