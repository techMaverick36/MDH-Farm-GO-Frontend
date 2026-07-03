import type { AuthTokens, Envelope, ApiErrorBody } from "@mdh/shared";
import { API_BASE_URL } from "./env";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./tokens";

// A thrown ApiError carries the stable `code` so callers can branch on it, plus
// the human `message` and any field-level `details` from the envelope.
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: { field: string; issue: string }[];

  constructor(
    status: number,
    code: string,
    message: string,
    details?: { field: string; issue: string }[],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
  /** Set false for the auth endpoints that must not send/refresh a token. */
  auth?: boolean;
}

// Single-flight refresh: many requests may 401 at once; they all await one
// refresh round-trip rather than stampeding the endpoint.
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const json = (await res.json()) as Envelope<AuthTokens>;
        setTokens(json.data);
        return true;
      } catch {
        return false;
      }
    })().finally(() => {
      // Allow the next 401 to trigger a fresh attempt.
      setTimeout(() => {
        refreshPromise = null;
      }, 0);
    });
  }
  return refreshPromise;
}

async function rawFetch(path: string, opts: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.auth !== false) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${API_BASE_URL}${path}`, {
    method: opts.method ?? (opts.body !== undefined ? "POST" : "GET"),
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });
}

async function parseError(res: Response): Promise<ApiError> {
  let body: ApiErrorBody | null = null;
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    /* no/invalid JSON body */
  }
  const err = body?.error;
  return new ApiError(
    res.status,
    err?.code ?? "INTERNAL",
    err?.message ?? res.statusText ?? "Request failed",
    err?.details,
  );
}

/**
 * Core request. Adds the Bearer token, and on a 401 for an authed request it
 * transparently refreshes once and retries. If the retry still 401s, the session
 * is cleared (the token observers route the user back to sign-in).
 */
async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await rawFetch(path, opts);
  } catch {
    throw new ApiError(0, "NETWORK", "Can't reach the server. Check your connection.");
  }

  if (res.status === 401 && opts.auth !== false && getRefreshToken()) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await rawFetch(path, opts);
    }
  }

  if (res.status === 401 && opts.auth !== false) {
    clearTokens();
  }

  if (!res.ok) throw await parseError(res);

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

// Convenience helpers that unwrap the standard `{ data }` envelope.
export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const body = await request<Envelope<T>>(path, { method: "GET", signal });
  return body.data;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await request<Envelope<T>>(path, { method: "POST", body: body ?? {} });
  return res?.data;
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await request<Envelope<T>>(path, { method: "PATCH", body: body ?? {} });
  return res?.data;
}

export async function apiDelete(path: string): Promise<void> {
  await request<void>(path, { method: "DELETE" });
}

// For the auth endpoints (no token attached, no refresh-retry).
export async function apiPostNoAuth<T>(path: string, body: unknown): Promise<T> {
  const res = await request<Envelope<T>>(path, { method: "POST", body, auth: false });
  return res?.data;
}
