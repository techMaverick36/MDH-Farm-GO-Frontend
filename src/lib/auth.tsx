import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  MeResponse,
  LoginInput,
  RegisterInput,
  AuthTokens,
  PublicUser,
  PublicFarm,
  FarmAccess,
  ChangePasswordInput,
  UpdateProfileInput,
} from "@mdh/shared";
import { apiGet, apiPostNoAuth, apiPost, apiPatch } from "./api";
import {
  setTokens,
  clearTokens,
  hasSession,
  getRefreshToken,
  onTokensChanged,
} from "./tokens";
import { queryClient } from "./queryClient";

type Status = "loading" | "authed" | "guest";

interface AuthContextValue {
  status: Status;
  me: MeResponse | null;
  user: MeResponse["user"] | null;
  farm: MeResponse["farm"];
  currency: string;
  permissions: Set<string>;
  modules: Set<string>;
  /** Subscription/trial access state (drives the activation gate). */
  access: FarmAccess;
  can: (permission: string) => boolean;
  hasModule: (key: string) => boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
  logout: () => Promise<void>;
  /** Re-fetch the current profile (e.g. after a subscription change). */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>(hasSession() ? "loading" : "guest");
  const [me, setMe] = useState<MeResponse | null>(null);

  async function loadMe(): Promise<void> {
    const data = await apiGet<MeResponse>("/auth/me");
    setMe(data);
    setStatus("authed");
  }

  // On first load, resolve an existing session into a profile.
  useEffect(() => {
    let cancelled = false;
    if (hasSession()) {
      loadMe().catch(() => {
        if (!cancelled) {
          clearTokens();
          setMe(null);
          setStatus("guest");
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  // React to token loss (failed refresh, logout in another tab).
  useEffect(() => {
    return onTokensChanged(() => {
      if (!hasSession()) {
        setMe(null);
        setStatus("guest");
        queryClient.clear();
      }
    });
  }, []);

  async function login(input: LoginInput): Promise<void> {
    const result = await apiPostNoAuth<{ user: PublicUser } & AuthTokens>(
      "/auth/login",
      input,
    );
    setTokens(result);
    await loadMe();
  }

  // Public self-signup: a farmer creates their own farm and is signed straight in.
  async function register(input: RegisterInput): Promise<void> {
    const result = await apiPostNoAuth<
      { user: PublicUser; farm: PublicFarm } & AuthTokens
    >("/auth/register", input);
    setTokens(result);
    await loadMe();
  }

  // First-login forced reset and self-service password change both land here.
  async function changePassword(input: ChangePasswordInput): Promise<void> {
    await apiPost("/auth/change-password", input);
    await loadMe();
  }

  async function updateProfile(input: UpdateProfileInput): Promise<void> {
    await apiPatch("/auth/me", input);
    await loadMe();
  }

  async function logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      // Best-effort server-side revoke; ignore failures.
      await apiPost("/auth/logout", { refreshToken }).catch(() => undefined);
    }
    clearTokens();
    setMe(null);
    setStatus("guest");
    queryClient.clear();
  }

  const value = useMemo<AuthContextValue>(() => {
    const permissions = new Set(me?.permissions ?? []);
    const modules = new Set(me?.modules ?? []);
    return {
      status,
      me,
      user: me?.user ?? null,
      farm: me?.farm ?? null,
      currency: me?.farm?.currency ?? "UGX",
      permissions,
      modules,
      access: me?.access ?? { status: "NONE", trialEndsAt: null, expiresAt: null },
      can: (permission) => permissions.has(permission),
      hasModule: (key) => modules.has(key),
      login,
      register,
      changePassword,
      updateProfile,
      logout,
      refresh: loadMe,
    };
  }, [status, me]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
