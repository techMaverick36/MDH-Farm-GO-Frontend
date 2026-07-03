import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/layout/AppShell";
import { AdminShell } from "@/layout/AdminShell";
import { RequireAuth, RedirectIfAuthed } from "@/routes/RequireAuth";
import { AdminOnly, ManagerArea } from "@/routes/RoleGate";
import { LoginPage } from "@/features/auth/LoginPage";
import { CreateFarmPage } from "@/features/auth/CreateFarmPage";
import { FirstLoginGate } from "@/features/auth/FirstLoginGate";
import { HomePage } from "@/features/dashboard/HomePage";
import { SubscriptionPage } from "@/features/billing/SubscriptionPage";
import { CowsPage } from "@/features/cows/CowsPage";
import { MilkPage } from "@/features/milk/MilkPage";
import { CustomersPage } from "@/features/customers/CustomersPage";
import { DeliveriesPage } from "@/features/deliveries/DeliveriesPage";
import { InvoicesPage } from "@/features/invoices/InvoicesPage";
import { StaffPage } from "@/features/staff/StaffPage";
import { RecycleBinPage } from "@/features/recyclebin/RecycleBinPage";
import { AdminOverviewPage } from "@/features/admin/AdminOverviewPage";
import { AdminFarmsPage } from "@/features/admin/AdminFarmsPage";
import { AdminSubscriptionsPage } from "@/features/admin/AdminSubscriptionsPage";
import { AdminPlansPage } from "@/features/admin/AdminPlansPage";
import { AdminTokensPage } from "@/features/admin/AdminTokensPage";
import { AdminReferralsPage } from "@/features/admin/AdminReferralsPage";

export function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <LoginPage />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/signup"
        element={
          <RedirectIfAuthed>
            <CreateFarmPage />
          </RedirectIfAuthed>
        }
      />

      {/* Manager / staff dashboard. Admins are redirected to /admin. */}
      <Route
        element={
          <RequireAuth>
            <ManagerArea>
              <FirstLoginGate>
                <AppShell />
              </FirstLoginGate>
            </ManagerArea>
          </RequireAuth>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/cows" element={<CowsPage />} />
        <Route path="/milk" element={<MilkPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/deliveries" element={<DeliveriesPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/recycle-bin" element={<RecycleBinPage />} />
      </Route>

      {/* Platform admin console. Non-admins are redirected to the dashboard. */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminOnly>
              <AdminShell />
            </AdminOnly>
          </RequireAuth>
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="farms" element={<AdminFarmsPage />} />
        <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
        <Route path="plans" element={<AdminPlansPage />} />
        <Route path="tokens" element={<AdminTokensPage />} />
        <Route path="referrals" element={<AdminReferralsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
