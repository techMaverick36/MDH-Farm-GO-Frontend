import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Permission } from "@mdh/shared";
import { apiGet, apiDelete } from "@/lib/api";
import { toMessage } from "@/lib/formErrors";
import { ageInYears } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/toast";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/Spinner";
import { ErrorState } from "@/components/ErrorState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CowForm } from "./CowForm";
import type { Cow } from "./types";

export function CowsPage() {
  const { can } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Cow | null>(null);
  const [deleting, setDeleting] = useState<Cow | null>(null);

  const cows = useQuery({
    queryKey: ["cows"],
    queryFn: () => apiGet<Cow[]>("/dairy/cows"),
  });

  const remove = useMutation({
    mutationFn: (cow: Cow) => apiDelete(`/dairy/cows/${cow.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cows"] });
      toast.success("Cow moved to the bin.");
      setDeleting(null);
    },
    onError: (err) => toast.error(toMessage(err, "Couldn't delete the cow.")),
  });

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(cow: Cow) {
    setEditing(cow);
    setFormOpen(true);
  }

  const addButton = can(Permission.COW_CREATE) ? (
    <Button onClick={openAdd}>+ Add cow</Button>
  ) : undefined;

  return (
    <>
      <PageHeader
        title="Cows"
        subtitle="Your herd at a glance."
        action={addButton}
      />

      {cows.isLoading ? (
        <LoadingState label="Loading your herd…" />
      ) : cows.error ? (
        <Card>
          <ErrorState error={cows.error} onRetry={() => cows.refetch()} />
        </Card>
      ) : cows.data && cows.data.length > 0 ? (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {cows.data.map((cow) => {
              const age = ageInYears(cow.dateOfBirth);
              return (
                <li
                  key={cow.id}
                  className="flex items-center gap-3 px-4 py-3.5 sm:px-5"
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-bold text-brand-700">
                    {cow.tag.slice(0, 4)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-800">
                      {cow.name ?? `Cow ${cow.tag}`}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {[cow.breed, age != null ? `${age} yr` : null]
                        .filter(Boolean)
                        .join(" · ") || "No details yet"}
                    </p>
                  </div>
                  <StatusBadge status={cow.status} />
                  <div className="flex items-center gap-1">
                    {can(Permission.COW_UPDATE) && (
                      <Button variant="ghost" size="sm" onClick={() => openEdit(cow)}>
                        Edit
                      </Button>
                    )}
                    {can(Permission.COW_DELETE) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setDeleting(cow)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : (
        <Card>
          <EmptyState
            title="No cows yet"
            description="Add your first cow to start tracking your herd and milk."
            action={addButton}
          />
        </Card>
      )}

      <CowForm open={formOpen} onClose={() => setFormOpen(false)} cow={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this cow?"
        message={
          <>
            <strong>{deleting?.name ?? `Cow ${deleting?.tag}`}</strong> will move to the
            recycle bin. You can restore it later.
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
