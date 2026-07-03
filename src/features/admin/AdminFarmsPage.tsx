import { Fragment, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { apiGet, apiPatch } from "@/lib/api";
import { toMessage } from "@/lib/formErrors";
import { cx } from "@/lib/cx";
import { useToast } from "@/components/toast";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/Spinner";
import { ErrorState } from "@/components/ErrorState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { OnboardFarmModal } from "./OnboardFarmModal";
import { EditManagerModal, ResetManagerPasswordModal } from "./ManagerModals";
import { IssueTokenModal } from "./IssueTokenModal";
import type { AdminFarm } from "./types";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  TRIAL: "bg-amber-50 text-amber-700 ring-amber-200",
  SUSPENDED: "bg-red-50 text-red-700 ring-red-200",
};

function RowMenu({ children }: { children: ReactNode }) {
  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Actions">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </MenuButton>
      <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
        <MenuItems className="absolute right-0 z-10 mt-1 w-52 origin-top-right rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200 focus:outline-none">
          {children}
        </MenuItems>
      </Transition>
    </Menu>
  );
}

function MenuAction({ onClick, children, danger }: { onClick: () => void; children: ReactNode; danger?: boolean }) {
  return (
    <MenuItem>
      {({ focus }) => (
        <button
          onClick={onClick}
          className={cx("flex w-full items-center rounded-lg px-3 py-2 text-sm", danger ? "text-red-600" : "text-slate-700", focus && (danger ? "bg-red-50" : "bg-slate-100"))}
        >
          {children}
        </button>
      )}
    </MenuItem>
  );
}

export function AdminFarmsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [editing, setEditing] = useState<AdminFarm | null>(null);
  const [resetting, setResetting] = useState<AdminFarm | null>(null);
  const [suspending, setSuspending] = useState<AdminFarm | null>(null);
  const [issuing, setIssuing] = useState<AdminFarm | null>(null);

  const farms = useQuery({
    queryKey: ["admin-farms"],
    queryFn: () => apiGet<AdminFarm[]>("/admin/farms"),
  });

  const setSuspend = useMutation({
    mutationFn: ({ farm, suspend }: { farm: AdminFarm; suspend: boolean }) =>
      apiPatch(`/admin/farms/${farm.id}/suspend`, { suspend }),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-farms"] });
      toast.success(vars.suspend ? "Farm suspended." : "Farm reactivated.");
      setSuspending(null);
    },
    onError: (err) => toast.error(toMessage(err, "Couldn't update the farm.")),
  });

  const onboardButton = <Button onClick={() => setOnboardOpen(true)}>+ Onboard farm</Button>;

  return (
    <>
      <PageHeader title="Farms" subtitle="Onboard farms and manage their managers." action={onboardButton} />

      {farms.isLoading ? (
        <LoadingState label="Loading farms…" />
      ) : farms.error ? (
        <Card>
          <ErrorState error={farms.error} onRetry={() => farms.refetch()} />
        </Card>
      ) : farms.data && farms.data.length > 0 ? (
        <Card className="overflow-visible">
          <ul className="divide-y divide-slate-100">
            {farms.data.map((f) => (
              <li key={f.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                  {f.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-800">{f.name}</p>
                  <p className="truncate text-sm text-slate-500">
                    {[f.country, f.currency].filter(Boolean).join(" · ")}
                    {!f.onboardingCompletedAt && " · setup pending"}
                  </p>
                </div>
                <span className={cx("hidden rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 sm:inline", STATUS_STYLES[f.status] ?? "bg-slate-50 text-slate-600 ring-slate-200")}>
                  {f.status.toLowerCase()}
                </span>
                <RowMenu>
                  <MenuAction onClick={() => setIssuing(f)}>Issue activation code</MenuAction>
                  <MenuAction onClick={() => setEditing(f)}>Edit manager</MenuAction>
                  <MenuAction onClick={() => setResetting(f)}>Reset manager password</MenuAction>
                  {f.status === "SUSPENDED" ? (
                    <MenuAction onClick={() => setSuspend.mutate({ farm: f, suspend: false })}>Reactivate farm</MenuAction>
                  ) : (
                    <MenuAction danger onClick={() => setSuspending(f)}>Suspend farm</MenuAction>
                  )}
                </RowMenu>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card>
          <EmptyState title="No farms yet" description="Onboard your first farm and its manager to get started." action={onboardButton} />
        </Card>
      )}

      <OnboardFarmModal open={onboardOpen} onClose={() => setOnboardOpen(false)} />
      <IssueTokenModal open={Boolean(issuing)} onClose={() => setIssuing(null)} farm={issuing} />
      <EditManagerModal open={Boolean(editing)} onClose={() => setEditing(null)} farm={editing} />
      <ResetManagerPasswordModal open={Boolean(resetting)} onClose={() => setResetting(null)} farm={resetting} />
      <ConfirmDialog
        open={Boolean(suspending)}
        title="Suspend this farm?"
        message={
          <>
            <strong>{suspending?.name}</strong> will be locked out until reactivated.
          </>
        }
        confirmLabel="Suspend"
        destructive
        onConfirm={async () => {
          if (suspending) await setSuspend.mutateAsync({ farm: suspending, suspend: true });
        }}
        onCancel={() => setSuspending(null)}
      />
    </>
  );
}
