import { Fragment, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { Permission } from "@mdh/shared";
import { apiGet, apiDelete } from "@/lib/api";
import { toMessage } from "@/lib/formErrors";
import { formatMoney } from "@/lib/format";
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
import { CustomerForm } from "./CustomerForm";
import { StatementModal } from "./StatementModal";
import type { Customer } from "./types";

function RowMenu({ children }: { children: React.ReactNode }) {
  return (
    <Menu as="div" className="relative">
      <MenuButton
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
        aria-label="Actions"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200 focus:outline-none">
          {children}
        </MenuItems>
      </Transition>
    </Menu>
  );
}

function MenuAction({
  onClick,
  children,
  danger,
}: {
  onClick: () => void;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <MenuItem>
      {({ focus }) => (
        <button
          onClick={onClick}
          className={cx(
            "flex w-full items-center rounded-lg px-3 py-2 text-sm",
            danger ? "text-red-600" : "text-slate-700",
            focus && (danger ? "bg-red-50" : "bg-slate-100"),
          )}
        >
          {children}
        </button>
      )}
    </MenuItem>
  );
}

export function CustomersPage() {
  const { can, currency } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [statementFor, setStatementFor] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);

  const customers = useQuery({
    queryKey: ["customers"],
    queryFn: () => apiGet<Customer[]>("/customers"),
  });

  const remove = useMutation({
    mutationFn: (c: Customer) => apiDelete(`/customers/${c.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer moved to the bin.");
      setDeleting(null);
    },
    onError: (err) => toast.error(toMessage(err, "Couldn't delete the customer.")),
  });

  const addButton = can(Permission.CUSTOMER_CREATE) ? (
    <Button
      onClick={() => {
        setEditing(null);
        setFormOpen(true);
      }}
    >
      + Add customer
    </Button>
  ) : undefined;

  const canStatement = can(Permission.STATEMENT_VIEW);
  const canEdit = can(Permission.CUSTOMER_UPDATE);
  const canDelete = can(Permission.CUSTOMER_DELETE);
  const hasMenu = canStatement || canEdit || canDelete;

  return (
    <>
      <PageHeader title="Customers" subtitle="The people you sell and deliver to." action={addButton} />

      {customers.isLoading ? (
        <LoadingState label="Loading customers…" />
      ) : customers.error ? (
        <Card>
          <ErrorState error={customers.error} onRetry={() => customers.refetch()} />
        </Card>
      ) : customers.data && customers.data.length > 0 ? (
        <Card className="overflow-visible">
          <ul className="divide-y divide-slate-100">
            {customers.data.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-800">{c.name}</p>
                  <p className="truncate text-sm text-slate-500">
                    {[c.phone, c.zone].filter(Boolean).join(" · ") || "No contact details"}
                  </p>
                </div>
                {c.openingBalMinor > 0 && (
                  <span className="hidden text-sm text-slate-500 sm:block">
                    Opening {formatMoney(c.openingBalMinor, currency)}
                  </span>
                )}
                {hasMenu && (
                  <RowMenu>
                    {canStatement && (
                      <MenuAction onClick={() => setStatementFor(c)}>View statement</MenuAction>
                    )}
                    {canEdit && (
                      <MenuAction
                        onClick={() => {
                          setEditing(c);
                          setFormOpen(true);
                        }}
                      >
                        Edit details
                      </MenuAction>
                    )}
                    {canDelete && (
                      <MenuAction danger onClick={() => setDeleting(c)}>
                        Delete
                      </MenuAction>
                    )}
                  </RowMenu>
                )}
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card>
          <EmptyState
            title="No customers yet"
            description="Add your first customer to start recording deliveries and invoices."
            action={addButton}
          />
        </Card>
      )}

      <CustomerForm open={formOpen} onClose={() => setFormOpen(false)} customer={editing} />
      <StatementModal
        open={Boolean(statementFor)}
        onClose={() => setStatementFor(null)}
        customer={statementFor}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this customer?"
        message={
          <>
            <strong>{deleting?.name}</strong> will move to the recycle bin. You can restore them
            later.
          </>
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => (deleting ? remove.mutateAsync(deleting) : undefined)}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
