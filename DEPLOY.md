# Deploying the web app to Vercel (free)

Prerequisite: the API is deployed first (see `DEPLOY.md` in the API repo) so
you have its URL, e.g. `https://<your-service>.onrender.com/api/v1`.

## 1. Push this repo to GitHub

`.gitignore` already excludes `node_modules`, `dist`, and `.env`.

```
git init
git add .
git commit -m "MDH Farm GO web"
git remote add origin https://github.com/<you>/<web-repo>.git
git push -u origin main
```

## 2. Import into Vercel

1. Sign up at https://vercel.com (free Hobby plan), click **Add New > Project**,
   import the GitHub repo.
2. Vercel auto-detects Vite: build `npm run build`, output `dist`. Leave as-is.
3. The API URL is already baked in via `.env.production`
   (`https://mdh-farm-go-backend.onrender.com/api/v1`), so no environment
   variable is needed on Vercel. Setting `VITE_API_BASE_URL` in the Vercel
   dashboard would override it if the API ever moves.
4. Deploy. Your shareable link is `https://<project>.vercel.app`.

`vercel.json` in this repo already rewrites all routes to `index.html` so
React Router deep links (e.g. `/deliveries`) work on refresh.

## Notes

- Every `git push` to main redeploys automatically.
- The free Render API sleeps when idle: the first page load after a quiet spell
  takes ~40 seconds. Tell the client, or warm it up yourself before a demo by
  opening the link a minute early.
- `@mdh/shared` is vendored in `vendor/mdh-shared`; after API contract changes,
  rebuild shared in the API repo and run `npm run sync-shared` here, then push.
