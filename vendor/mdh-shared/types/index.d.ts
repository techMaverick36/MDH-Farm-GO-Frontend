import type { RoleType, FarmStatus, SubscriptionStatus } from "../enums.js";
export interface PublicUser {
    id: string;
    farmId: string | null;
    name: string;
    email: string | null;
    phone: string | null;
    role: RoleType;
    isActive: boolean;
}
export interface PublicFarm {
    id: string;
    name: string;
    country: string;
    currency: string;
    status: FarmStatus;
    referralCode: string;
}
export interface PublicSubscription {
    id: string;
    status: SubscriptionStatus;
    startsAt: string | null;
    expiresAt: string | null;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export type AccessStatus = "NONE" | "TRIAL" | "ACTIVE" | "GRACE" | "EXPIRED" | "SUSPENDED";
export interface FarmAccess {
    status: AccessStatus;
    /** End of the free trial, if on one. ISO string. */
    trialEndsAt: string | null;
    /** End of the paid subscription, if any. ISO string. */
    expiresAt: string | null;
}
export interface MeResponse {
    user: PublicUser;
    farm: PublicFarm | null;
    modules: string[];
    permissions: string[];
    /** The user must set a new password before using the app (first login). */
    mustResetPassword: boolean;
    /** The manager must complete farm details before using the app (first login). */
    needsOnboarding: boolean;
    /** Subscription/trial access state for the gate. */
    access: FarmAccess;
}
export interface AccessTokenClaims {
    sub: string;
    farmId: string | null;
    role: RoleType;
}
export interface Envelope<T> {
    data: T;
}
export interface ListEnvelope<T> {
    data: T[];
    nextCursor: string | null;
}
