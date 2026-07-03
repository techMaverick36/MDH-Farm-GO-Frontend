import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "@/lib/cx";

const controlBase =
  "block w-full rounded-xl border-0 bg-white px-3.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 disabled:bg-slate-50 disabled:text-slate-500";

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

function Help({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (error) {
    return (
      <p id={id} className="mt-1.5 text-sm text-red-600">
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={id} className="mt-1.5 text-sm text-slate-500">
        {hint}
      </p>
    );
  }
  return null;
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  suffix?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, suffix, className, id, ...rest },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const helpId = `${fieldId}-help`;
  return (
    <div>
      <Label htmlFor={fieldId}>{label}</Label>
      <div className="relative">
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? helpId : undefined}
          className={cx(
            controlBase,
            "h-11",
            suffix ? "pr-12" : null,
            error && "ring-red-400 focus:ring-red-500",
            className,
          )}
          {...rest}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-slate-500">
            {suffix}
          </span>
        )}
      </div>
      <Help id={helpId} error={error} hint={hint} />
    </div>
  );
});

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField({ label, error, hint, className, id, children, ...rest }, ref) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    const helpId = `${fieldId}-help`;
    return (
      <div>
        <Label htmlFor={fieldId}>{label}</Label>
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? helpId : undefined}
          className={cx(controlBase, "h-11", error && "ring-red-400 focus:ring-red-500", className)}
          {...rest}
        >
          {children}
        </select>
        <Help id={helpId} error={error} hint={hint} />
      </div>
    );
  },
);
