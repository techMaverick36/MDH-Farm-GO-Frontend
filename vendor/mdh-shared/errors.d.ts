export declare const ErrorCode: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly UNAUTHENTICATED: "UNAUTHENTICATED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly CONFLICT: "CONFLICT";
    readonly RATE_LIMITED: "RATE_LIMITED";
    readonly INTERNAL: "INTERNAL";
    readonly INVALID_CREDENTIALS: "INVALID_CREDENTIALS";
    readonly INVALID_REFRESH_TOKEN: "INVALID_REFRESH_TOKEN";
    readonly EMAIL_TAKEN: "EMAIL_TAKEN";
    readonly NO_TENANT_CONTEXT: "NO_TENANT_CONTEXT";
    readonly MODULE_NOT_ENABLED: "MODULE_NOT_ENABLED";
    readonly DELIVERY_CODE_INVALID: "DELIVERY_CODE_INVALID";
    readonly DELIVERY_CODE_EXPIRED: "DELIVERY_CODE_EXPIRED";
    readonly DELIVERY_CODE_USED: "DELIVERY_CODE_USED";
    readonly DELIVERY_CODE_LOCKED: "DELIVERY_CODE_LOCKED";
    readonly SUBSCRIPTION_INACTIVE: "SUBSCRIPTION_INACTIVE";
    readonly INVOICE_HAS_DISPUTES: "INVOICE_HAS_DISPUTES";
    readonly RESTORE_BLOCKED: "RESTORE_BLOCKED";
};
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
export interface ApiErrorBody {
    error: {
        code: ErrorCode;
        message: string;
        details?: {
            field: string;
            issue: string;
        }[];
        requestId?: string;
    };
}
