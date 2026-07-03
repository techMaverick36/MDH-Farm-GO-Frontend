import type { ReactNode } from "react";

// A neutral, monochrome default mark so empty states read as calm and
// professional rather than playful. Callers may pass their own icon node.
function DefaultMark() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <path
          d="M4 8.5 12 4l8 4.5M4 8.5V16l8 4.5M4 8.5l8 4.5m8-4.5V16l-8 4.5m8-12-8 4.5m0 0V21"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {icon || <DefaultMark />}
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
