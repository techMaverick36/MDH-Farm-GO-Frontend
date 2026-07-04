// Refreshes vendor/mdh-shared from the API monorepo's built shared package.
// This web repo is standalone; the API owns the wire contracts. After the API's
// packages/shared changes, build it there, then run `npm run sync-shared` here.
//
// Expects the API monorepo checked out as a sibling of this repo:
//   <parent>/MDH Farm GO/packages/shared   (the monorepo)
//   <parent>/web                           (this repo)
// Override the source with SHARED_DIST=<path to packages/shared/dist>.

import { cpSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const source =
  process.env.SHARED_DIST ??
  path.resolve(repoRoot, "..", "MDH Farm GO", "packages", "shared", "dist");
const target = path.resolve(repoRoot, "vendor", "mdh-shared");

if (!existsSync(path.join(source, "index.js"))) {
  console.error(
    `Shared dist not found at:\n  ${source}\n` +
      "Build it first (in the API monorepo): npx -y pnpm@9.15.9 --filter @mdh/shared build\n" +
      "Or point SHARED_DIST at the dist folder.",
  );
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
console.log(`Synced ${source} -> ${target}`);
