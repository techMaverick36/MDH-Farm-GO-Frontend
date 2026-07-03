import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Permission } from "@mdh/shared";
import { apiGet } from "@/lib/api";
import { formatLitres, formatDateTime } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/Spinner";
import { ErrorState } from "@/components/ErrorState";
import { MilkForm } from "./MilkForm";
import type { MilkCollection } from "./types";
import type { Cow } from "@/features/cows/types";
import type { Staff } from "@/features/staff/types";

export function MilkPage() {
  const { can, user } = useAuth();
  const [formOpen, setFormOpen] = useState(false);

  const collections = useQuery({
    queryKey: ["milk-collections"],
    queryFn: () => apiGet<MilkCollection[]>("/dairy/milk-collections?limit=100"),
  });
  // Cows power the optional "which cow" picker and tag labels in the list.
  const cows = useQuery({
    queryKey: ["cows"],
    queryFn: () => apiGet<Cow[]>("/dairy/cows"),
    enabled: can(Permission.COW_VIEW),
  });
  // Staff names let us show who recorded each collection (accountability).
  const staff = useQuery({
    queryKey: ["staff"],
    queryFn: () => apiGet<Staff[]>("/staff"),
    enabled: can(Permission.USER_VIEW),
  });

  const cowById = useMemo(() => {
    const map = new Map<string, Cow>();
    for (const c of cows.data ?? []) map.set(c.id, c);
    return map;
  }, [cows.data]);

  // Map a collector's user id to a display name: staff list plus the manager
  // themselves (who isn't in the staff list).
  const collectorName = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of staff.data ?? []) map.set(s.id, s.name);
    if (user) map.set(user.id, user.name);
    return (id: string) => map.get(id) ?? "Team member";
  }, [staff.data, user]);

  const recordButton = can(Permission.MILK_COLLECT) ? (
    <Button onClick={() => setFormOpen(true)}>+ Record milk</Button>
  ) : undefined;

  const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

  const todayMl = useMemo(
    () =>
      (collections.data ?? [])
        .filter((c) => isToday(c.collectedAt))
        .reduce((s, c) => s + c.quantityMl, 0),
    [collections.data],
  );

  // Today's litres grouped by collector, so a collector reporting low stands out.
  const todayByCollector = useMemo(() => {
    const acc = new Map<string, { ml: number; count: number }>();
    for (const c of collections.data ?? []) {
      if (!isToday(c.collectedAt)) continue;
      const cur = acc.get(c.collectedBy) ?? { ml: 0, count: 0 };
      cur.ml += c.quantityMl;
      cur.count += 1;
      acc.set(c.collectedBy, cur);
    }
    return [...acc.entries()].sort((a, b) => b[1].ml - a[1].ml);
  }, [collections.data]);

  return (
    <>
      <PageHeader
        title="Milk"
        subtitle={
          collections.data && collections.data.length > 0
            ? `${formatLitres(todayMl)} collected today.`
            : "Record and review milk collections."
        }
        action={recordButton}
      />

      {collections.isLoading ? (
        <LoadingState label="Loading milk records…" />
      ) : collections.error ? (
        <Card>
          <ErrorState error={collections.error} onRetry={() => collections.refetch()} />
        </Card>
      ) : collections.data && collections.data.length > 0 ? (
        <div className="space-y-4">
          {todayByCollector.length > 0 && (
            <Card className="p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-slate-700">Today by collector</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Who recorded what today. Use it to spot under-reporting early.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {todayByCollector.map(([id, v]) => (
                  <div key={id} className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                    <p className="truncate text-sm font-medium text-slate-700">{collectorName(id)}</p>
                    <p className="text-base font-bold text-brand-700">{formatLitres(v.ml)}</p>
                    <p className="text-xs text-slate-400">
                      {v.count} collection{v.count === 1 ? "" : "s"}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {collections.data.map((c) => {
                const cow = c.cowId ? cowById.get(c.cowId) : undefined;
                return (
                  <li key={c.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                        <path d="M8 3h8M9 3v3l-2 3v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9l-2-3V3M7 13h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800">{formatLitres(c.quantityMl)}</p>
                      <p className="truncate text-sm text-slate-500">
                        {c.session === "MORNING" ? "Morning" : "Evening"}
                        {cow ? ` · ${cow.name ?? `Cow ${cow.tag}`}` : " · Whole tank"}
                        {` · by ${collectorName(c.collectedBy)}`}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-sm text-slate-400">
                      {formatDateTime(c.collectedAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      ) : (
        <Card>
          <EmptyState
            title="No milk recorded yet"
            description="Record your first collection to start tracking production."
            action={recordButton}
          />
        </Card>
      )}

      <MilkForm open={formOpen} onClose={() => setFormOpen(false)} cows={cows.data ?? []} />
    </>
  );
}
