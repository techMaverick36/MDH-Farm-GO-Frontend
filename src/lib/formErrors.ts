import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "./api";
import { friendlyErrorMessage } from "./errors";

// Pushes a server VALIDATION_ERROR's field details into the form so they show
// inline next to the right inputs. Returns true if it handled field-level
// errors (so the caller can skip a generic toast).
export function applyApiFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (error instanceof ApiError && error.code === "VALIDATION_ERROR" && error.details?.length) {
    for (const d of error.details) {
      setError(d.field as Path<T>, { type: "server", message: d.issue });
    }
    return true;
  }
  return false;
}

export function toMessage(error: unknown, fallback?: string): string {
  if (error instanceof ApiError) return friendlyErrorMessage(error.code, error.message);
  return fallback ?? "Something went wrong. Please try again.";
}
