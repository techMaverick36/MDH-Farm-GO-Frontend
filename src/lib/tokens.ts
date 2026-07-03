import type { AuthTokens } from "@mdh/shared";

// Access + refresh tokens live in localStorage so a page reload keeps the user
// signed in. The tenant (farm) is implicit in the token; we never store or send
// a farm id. Components observe changes via onTokensChanged so the app reacts
// when a session ends (e.g. a failed refresh clears the tokens).

const ACCESS_KEY = "mdh.accessToken";
const REFRESH_KEY = "mdh.refreshToken";

const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(tokens: AuthTokens): void {
  localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  emit();
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  emit();
}

export function hasSession(): boolean {
  return getAccessToken() != null;
}

export function onTokensChanged(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
