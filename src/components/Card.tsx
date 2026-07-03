import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70",
        className,
      )}
    >
      {children}
    </div>
  );
}
