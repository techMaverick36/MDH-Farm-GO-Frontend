import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { SetPasswordPage } from "./SetPasswordPage";
import { OnboardingPage } from "./OnboardingPage";
import { ActivationPage } from "@/features/billing/ActivationPage";
import { SuspendedPage } from "./SuspendedPage";

// Stands between sign-in and the app. In order: a freshly provisioned account
// sets its own password, then (for managers) completes farm details, then the
// farm must have active access (trial or paid) — an expired farm hits the
// activation screen, a suspended one a support notice. Only once all pass does
// the real app render.
export function FirstLoginGate({ children }: { children: ReactNode }) {
  const { me, access } = useAuth();
  if (me?.mustResetPassword) return <SetPasswordPage />;
  if (me?.needsOnboarding) return <OnboardingPage />;
  if (access.status === "SUSPENDED") return <SuspendedPage />;
  if (access.status === "EXPIRED") return <ActivationPage />;
  return <>{children}</>;
}
