# @mdh/web — MDH Farm GO dashboard

A responsive web dashboard for **farm managers** running dairy + sales
operations on MDH Farm GO. It is a pure consumer of the existing `@mdh/api`
REST API — mobile-first, plain-language, and permission-aware.

## Stack

- **Vite + React + TypeScript + Tailwind CSS**
- **React Router** for routing, **TanStack Query** for server state/caching
- **React Hook Form + zod** for forms (reusing the `@mdh/shared` schemas)
- **Headless UI** for accessible modals/menus
- A small typed `apiFetch` wrapper handling Bearer auth, the `{ data }` /
  `{ error: { code } }` envelope, and transparent token refresh on 401.

## Prerequisites

1. The **API must be running** at the configured base URL (default
   `http://localhost:4000/api/v1`). From the repo root:

   ```bash
   docker compose up -d db
   pnpm --filter @mdh/api db:deploy
   pnpm --filter @mdh/api db:seed
   pnpm dev:api
   ```

2. Install workspace dependencies (from the repo root). If `pnpm` isn't global,
   use `npx -y pnpm@9.15.9`:

   ```bash
   pnpm install
   ```

## Configure

Copy the example env and adjust if your API runs elsewhere:

```bash
cp apps/web/.env.example apps/web/.env
# VITE_API_BASE_URL=http://localhost:4000/api/v1
```

## Run

```bash
pnpm --filter @mdh/web dev
```

Open http://localhost:5173. The dev script rebuilds `@mdh/shared` first (the web
app consumes its built `dist`). If you edit `packages/shared`, the next
`dev`/`build`/`typecheck` picks it up automatically, or rebuild manually:

```bash
pnpm --filter @mdh/shared build
```

## First sign-in

The API seed only creates a platform admin (no farm), so **register a farm** from
the app's “Register your farm” screen. That creates a `FARM_MANAGER` and a farm
with the dairy module enabled — the account this dashboard is built for. Then
sign in with that email/phone + password.

## Scripts

| Script | What it does |
|---|---|
| `pnpm --filter @mdh/web dev` | Start the dev server (rebuilds shared first) |
| `pnpm --filter @mdh/web build` | Typecheck + production build |
| `pnpm --filter @mdh/web typecheck` | Type-check only |
| `pnpm --filter @mdh/web preview` | Preview the production build |

## Conventions baked in

- **Money** is integer minor units, **quantities** integer base units (ml,
  pieces, g) on the wire. The UI formats litres/currency for display and converts
  back on submit (`src/lib/format.ts`) — users never see raw units.
- **Idempotency**: retryable creates send a fresh `clientUuid`
  (`src/lib/clientUuid.ts`).
- **Permissions**: the `<Can permission="…">` gate and the nav hide actions the
  signed-in user can't perform (from `GET /auth/me`). The server still enforces.
- **Errors**: stable API `code`s map to friendly messages (`src/lib/errors.ts`);
  success → toast, validation → inline, destructive → confirm dialog.
# MDH-Farm-GO-Frontend
