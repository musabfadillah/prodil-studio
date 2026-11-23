# Prodil Studio project context

## Prodil Studio v2.0 architecture

- **No generative services:** the product has no AI endpoints, external model dependencies, or AI credit usage. The editor supports manual editing and JSON backup/restore.
- **Global language:** only `en-GB`, `en-US`, `it-IT`, `de-DE`, and `id-ID` are supported. The preference is persisted in `localStorage` under `prodil_lang`. The shared `LanguageContext` provides localized UI labels, while the 15 CV and Cover Letter layouts preserve selectable-text vector output.
- **Canonical data:** `frontend/src/types/prodil.ts` is the single source of truth. `frontend/src/types/cv.ts` is a compatibility bridge for the established renderer/editor API. Master profiles include `hiddenFields`, `visibleSections`, `sectionOrder`, and typed `customSections` for timeline, credentials, and list layouts.

## Project layout

- `frontend/` is the React + TypeScript + Vite application.
- `backend/` is the Express API, JWT middleware, PostgreSQL access and local development store.
- `frontend/src/types/prodil.ts` is the canonical contract for profiles, CV variants, cover letters and the 15 template identifiers.
- `frontend/src/types/cv.ts` adapts that canonical model to the existing editor and the 15-template vector renderer. Keep this adapter in sync when either side changes.
- `frontend/src/templates/CVRenderer.tsx` and `frontend/src/templates/TemplateRegistry.ts` contain the established printable CV designs. The print flow uses browser print CSS for selectable-text A4 output; do not replace it with a screenshot or canvas export.

## Frontend

Install dependencies with `npm ci` from `frontend/`. Run the app with `npm run dev`, and verify production compilation with `npm run build`.

- `src/components/LandingPage.tsx` and `Navbar.tsx` provide the landing/navigation experience.
- `src/components/StudioEditor.tsx` owns the editor tabs and local drafts; it uses `services/api.ts` for authenticated cloud synchronization.
- `src/context/AuthContext.tsx` owns email/password authentication state and email verification. Studio access requires an authenticated user; requests send the bearer JWT through `services/api.ts`.
- `src/index.css` contains Tailwind layers, the glass-panel treatment, and print rules.

The old numeric CV template IDs (`1`–`15`) map to canonical `TemplateId` strings through each `TemplateMeta.legacyId`. Preserve that mapping and the selectable-text print layout.

## Backend

Install dependencies with `npm ci` from `backend/`. Use `npm run dev` for local development and `npm start` for production. Configure secrets and database connection through the backend environment; do not commit `.env` values.

- `src/server.js` mounts API routers and keeps the existing general rate limiter and error handling.
- `src/middleware/auth.js` remains the JWT authentication boundary.
- `src/routes/workspace.routes.js` implements authenticated workspace CRUD for profiles, CV variants and cover letters.
- `src/config/db.js` uses PostgreSQL when configured and a JSON-backed local store otherwise.
- `src/db/migrate.js` creates/extends the workspace schema. Run `npm run db:migrate` when deploying against PostgreSQL.

## API contract

- `GET /api/workspace` returns the authenticated user, master profile, CV variants and cover letters.
- `PUT /api/workspace/profile`, `/workspace/cv/:id` and `/workspace/cover-letter/:id` persist workspace data.
- `GET /api/profile` and all workspace/document routes require a valid JWT.
- CORS allows the production Vercel domain, Vercel preview deployments, and configured local origins.

The frontend API base URL is `VITE_API_URL` (defaults to `http://localhost:5000`). Apply schema changes before using the workspace API with an existing PostgreSQL database.
