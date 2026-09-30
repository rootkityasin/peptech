# Medusa development and production

Run these commands from the repository root.

## Local development

```sh
npm run dev:backend
```

Open http://localhost:9000/app. This runs `medusa develop` with
`NODE_ENV=development`, source extensions, Vite, and hot reload.
Vite stores optimized dependencies in
`backend/apps/backend/node_modules/.vite-medusa-development-orders`.

The native Medusa dashboard includes lazy-loaded modules and Vite pre-bundles
its dependencies even in development. Hashed dependency URLs are normal;
they are not the production admin build. Do not disable the dependency
optimizer or modify installed dashboard chunks to avoid those URLs.

Do not run `scripts/sync_dashboard_chunks.js`: it mutates the installed
dashboard and purges caches. It is no longer part of startup or builds.
Admin changes belong in supported source routes and widgets.

The existing custom Orders screens are connected through
`backend/apps/backend/admin-order-overrides.ts`. This narrowly resolves the
installed dashboard's order-list and order-detail page imports to the saved
`src/admin/components/orders` components. Production bundles those sources;
development leaves them outside the dependency optimizer for Vite/HMR. This
compatibility integration depends on Medusa's internal page-module naming and
must be checked when upgrading Medusa. It does not modify the installed package.

After switching from the old startup scripts, restart the development server
and hard-refresh the browser once to discard old module URLs.

## Production

```sh
npm run build:backend
npm start
```

For the existing hosting deployment mirrors (`dist`, `app`, and `.next`), use
`npm run build` instead of `npm run build:backend`.

Both builds use the same backend build script with `NODE_ENV=production` and
Medusa linting enabled. The canonical runtime output is
`backend/apps/backend/.medusa/server`; its admin assets are in `public/admin`.
Production startup requires that output and never falls back to source files.
The TypeScript `medusa-config.ts` is the only source configuration; Medusa
compiles it to JavaScript for production.

Builds do not patch dependencies, clear development caches, or copy production
admin assets into `backend/apps/backend/public/admin`. Turbo tracks
`.medusa/server` as build output. Startup does not implicitly rebuild; build
explicitly before deploying or starting a new release.
