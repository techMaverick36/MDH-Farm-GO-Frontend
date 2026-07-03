import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-sand-100 px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-2xl font-bold text-white shadow-sm">
          M
        </span>
        <span className="text-xl font-bold tracking-tight text-slate-900">MDH Farm GO</span>
      </div>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70 sm:p-8">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-5 text-sm text-slate-600">{footer}</div>}
    </div>
  );
}
