// The API base URL is configurable via VITE_API_BASE_URL (see .env.example).
// Falls back to the local API so a fresh checkout runs without extra setup.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api/v1";
