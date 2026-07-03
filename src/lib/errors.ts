import { ErrorCode } from "@mdh/shared";

// Maps stable API error codes to friendly, action-oriented messages for farm
// managers. The API's own `message` is a sensible fallback; this table lets us
// say something kinder/clearer for the codes the UI cares about.
// For these codes the API's own message is specific and user-friendly (e.g.
// "Invalid or already-used token", "This code was issued for a different farm",
// "A paid invoice cannot be deleted"), so we surface it instead of a vague
// generic. Only fall back to a generic line if the server sent no message.
const PREFER_SERVER_MESSAGE = new Set<string>([ErrorCode.CONFLICT, ErrorCode.NOT_FOUND]);

const FRIENDLY: Partial<Record<string, string>> = {
  [ErrorCode.VALIDATION_ERROR]: "Please check the highlighted fields and try again.",
  [ErrorCode.UNAUTHENTICATED]: "Your session has ended. Please sign in again.",
  [ErrorCode.FORBIDDEN]: "You don't have permission to do that.",
  [ErrorCode.NOT_FOUND]: "We couldn't find that item.",
  [ErrorCode.CONFLICT]: "That action conflicts with the current state. Refresh and try again.",
  [ErrorCode.RATE_LIMITED]: "Too many attempts. Please wait a moment and try again.",
  [ErrorCode.INTERNAL]: "Something went wrong on our side. Please try again.",

  [ErrorCode.INVALID_CREDENTIALS]: "That email/phone or password is incorrect.",
  [ErrorCode.INVALID_REFRESH_TOKEN]: "Your session has ended. Please sign in again.",
  [ErrorCode.EMAIL_TAKEN]: "That email or phone is already registered.",

  [ErrorCode.MODULE_NOT_ENABLED]: "That feature isn't enabled for your farm.",

  [ErrorCode.DELIVERY_CODE_INVALID]: "That verification code doesn't match this delivery.",
  [ErrorCode.DELIVERY_CODE_EXPIRED]: "This verification code has expired. Create a new delivery.",
  [ErrorCode.DELIVERY_CODE_USED]: "This delivery has already been confirmed.",
  [ErrorCode.DELIVERY_CODE_LOCKED]:
    "Too many wrong codes were entered for this delivery. Delete it and create a new one to issue a fresh code.",

  [ErrorCode.SUBSCRIPTION_INACTIVE]:
    "Your trial or subscription has ended. Redeem an activation code on the Subscription page to continue.",

  [ErrorCode.INVOICE_HAS_DISPUTES]:
    "This invoice has a disputed delivery. Resolve the dispute before approving.",

  [ErrorCode.RESTORE_BLOCKED]:
    "Restore the parent record first (e.g. the customer), then try again.",
};

export function friendlyErrorMessage(code: string | undefined, fallback?: string): string {
  // Prefer the server's specific message for codes that carry a useful one.
  if (code && PREFER_SERVER_MESSAGE.has(code) && fallback) return fallback;
  if (code && FRIENDLY[code]) return FRIENDLY[code]!;
  return fallback ?? "Something went wrong. Please try again.";
}
