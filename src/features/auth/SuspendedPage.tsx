import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { AuthLayout } from "./AuthLayout";
import { PAYMENT_INFO } from "@/lib/payment";

// Shown when a farm has been suspended by the platform admin. Self-activation is
// deliberately not offered — reactivation is an admin action.
export function SuspendedPage() {
  const { farm, logout } = useAuth();
  const navigate = useNavigate();
  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }
  return (
    <AuthLayout
      title="Your farm is paused"
      subtitle={`${farm?.name ?? "Your farm"} has been temporarily suspended.`}
      footer={
        <button onClick={handleLogout} className="text-slate-500 hover:text-slate-700 hover:underline">
          Sign out
        </button>
      }
    >
      <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-100">
        <p>
          Please contact <strong>{PAYMENT_INFO.contact}</strong> to restore access to your
          farm. Your data is safe and will be available as soon as the account is
          reactivated.
        </p>
      </div>
    </AuthLayout>
  );
}
