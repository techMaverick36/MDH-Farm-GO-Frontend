import { Fragment, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { Permission } from "@mdh/shared";
import { apiGet, apiDelete, apiPost } from "@/lib/api";
import { toMessage } from "@/lib/formErrors";
import { cx } from "@/lib/cx";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/toast";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/Spinner";
import { ErrorState } from "@/components/ErrorState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StaffCreateModal, StaffEditModal } from "./StaffForms";
import { STAFF_TYPE_LABELS, type Staff } from "./types";

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
        <MenuItems className="absolute right-0 z-10 mt-1 w-44 origin-top-right rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200 focus:outline-none">
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
        <button onClick={onClick} className={cx("flex w-full items-center rounded-lg px-3 py-2 text-sm", danger ? "text-red-600" : "text-slate-700", focus && (danger ? "bg-red-50" : "bg-slate-100"))}>
          {children}
        </button>
      )}
    </MenuItem>
  );
}

export function StaffPage() {
  const { can } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [deleting, setDeleting] = useState<Staff | null>(null);

  const staff = useQuery({ queryKey: ["staff"], queryFn: () => apiGet<Staff[]>("/staff") });

  const remove = useMutation({
    mutationFn: (s: Staff) => apiDelete(`/staff/${s.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff member removed.");
      setDeleting(null);
    },
    onError: (err) => toast.error(toMessage(err, "Couldn't remove the staff member.")),
  });

  const restore = useMutation({
    mutationFn: (s: Staff) => apiPost(`/staff/${s.id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff member restored.");
    },
    onError: (err) => toast.error(toMessage(err, "Couldn't restore the staff member.")),
  });

  const canCreate = can(Permission.STAFF_CREATE);
  const canEdit = can(Permission.STAFF_UPDATE);
  const canDelete = can(Permission.STAFF_DELETE);
  const addButton = canCreate ? <Button onClick={() => setCreateOpen(true)}>+ Add staff</Button> : undefined;

  return (
    <>
      <PageHeader
        title="Staff"
        subtitle="Your team, including the delivery people (suppliers) who take milk to customers. Add them here to give them a login for the delivery app."
        action={addButton}
      />

      {staff.isLoading ? (
        <LoadingState label="Loading staff…" />
      ) : staff.error ? (
        <Card>
          <ErrorState error={staff.error} onRetry={() => staff.refetch()} />
        </Card>
      ) : staff.data && staff.data.length > 0 ? (
        <Card className="overflow-visible">
          <ul className="divide-y divide-slate-100">
            {staff.data.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-800">{s.name}</p>
                  <p className="truncate text-sm text-slate-500">
                    {[s.staffType ? STAFF_TYPE_LABELS[s.staffType] ?? s.staffType : null, s.zone, s.email ?? s.phone]
                      .filter(Boolean)
                      .join(" · ") || "No details"}
                  </p>
                </div>
                {!s.isActive && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">Inactive</span>
                )}
                {(canEdit || canDelete) && (
                  <RowMenu>
                    {canEdit && <MenuAction onClick={() => setEditing(s)}>Edit</MenuAction>}
                    {canDelete && s.isActive && (
                      <MenuAction danger onClick={() => setDeleting(s)}>Remove</MenuAction>
                    )}
                    {canEdit && !s.isActive && (
                      <MenuAction onClick={() => restore.mutate(s)}>Restore</MenuAction>
                    )}
                  </RowMenu>
                )}
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card>
          <EmptyState title="No staff yet" description="Add your first team member to give them a login." action={addButton} />
        </Card>
      )}

      <StaffCreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <StaffEditModal open={Boolean(editing)} onClose={() => setEditing(null)} staff={editing} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Remove this staff member?"
        message={
          <>
            <strong>{deleting?.name}</strong> will lose access. You can restore them later.
          </>
        }
        confirmLabel="Remove"
        destructive
        onConfirm={async () => {
          if (deleting) await remove.mutateAsync(deleting);
        }}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
