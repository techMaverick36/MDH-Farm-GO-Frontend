// Stable machine-readable error codes shared by API and clients.
// The API returns these in the error envelope; clients branch on them.
export const ErrorCode = {
    // generic
    VALIDATION_ERROR: "VALIDATION_ERROR",
    UNAUTHENTICATED: "UNAUTHENTICATED",
    FORBIDDEN: "FORBIDDEN",
    NOT_FOUND: "NOT_FOUND",
    CONFLICT: "CONFLICT",
    RATE_LIMITED: "RATE_LIMITED",
    INTERNAL: "INTERNAL",
    // auth
    INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
    INVALID_REFRESH_TOKEN: "INVALID_REFRESH_TOKEN",
    EMAIL_TAKEN: "EMAIL_TAKEN",
    // tenancy / context
    NO_TENANT_CONTEXT: "NO_TENANT_CONTEXT",
    MODULE_NOT_ENABLED: "MODULE_NOT_ENABLED",
    // delivery (used from Phase 1 on, defined early so clients are stable)
    DELIVERY_CODE_INVALID: "DELIVERY_CODE_INVALID",
    DELIVERY_CODE_EXPIRED: "DELIVERY_CODE_EXPIRED",
    DELIVERY_CODE_USED: "DELIVERY_CODE_USED",
    DELIVERY_CODE_LOCKED: "DELIVERY_CODE_LOCKED",
    // billing
    SUBSCRIPTION_INACTIVE: "SUBSCRIPTION_INACTIVE",
    // invoice
    INVOICE_HAS_DISPUTES: "INVOICE_HAS_DISPUTES",
    // recycle bin
    RESTORE_BLOCKED: "RESTORE_BLOCKED",
};
//# sourceMappingURL=errors.js.map