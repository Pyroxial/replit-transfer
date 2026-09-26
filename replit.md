# BBREU Regeneration Visualizer

An interactive educational 3D visualization of the BBREU biodegradable bone-regeneration concept across an 18-month healing timeline.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/bbreu-visualizer/src/pages/home.tsx` — main research-console experience and application state
- `artifacts/bbreu-visualizer/src/components/bbreu/` — 3D viewport, timeline, telemetry, chart, and shared model calculations
- `artifacts/bbreu-visualizer/src/index.css` — visual system and responsive console styling
- `artifacts/bbreu-visualizer/index.html` — Three.js CDN and OrbitControls entry points

## Architecture decisions

- The first build is frontend-only; timeline, telemetry, chart, and layer visibility are deterministic educational model calculations.
- Three.js is loaded from the CDN so the artifact stays lightweight and self-contained; the canvas falls back to a 2D assembly rendering when WebGL is unavailable.
- The app intentionally labels itself as an educational visualization rather than clinical guidance.

## Product

- Inspect the layered BBREU construct in perspective or vertical section view.
- Scrub or play through month 0–18 to see modeled degradation, graft, and native bone fusion changes.
- Review live telemetry, toggle assembly layers, and compare implant versus regenerated bone load transfer.

## User preferences

No additional preferences recorded.

## Gotchas

- The artifact workflow supplies `PORT` and `BASE_PATH`; direct production builds need both variables set.
- Some browser preview environments cannot create WebGL contexts; do not remove the 2D fallback in `RegenerationViewport.tsx`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
