# GitHub Copilot Instructions for vinted-flips

## 🚀 Purpose
Short, focused guidance to help AI agents (Copilot / Automated contributors) be productive immediately in this repo.

## 🏗️ Big picture
- This is a Next.js app (App Router) under `src/app` (React 19, Next 16). UI is client-heavy and uses Tailwind CSS and TypeScript.
- Supabase is the single backend: auth (magic-link) + DB tables. The client is exported from `src/lib/supabase/client.ts` and must be reused (do NOT create extra clients).
- Primary domain concepts: **lots** and **items** (see `src/lib/types.ts`). CSV export and small utilities live in `src/lib`.

## 🔧 Key integration points & files
- Supabase client: `src/lib/supabase/client.ts` (env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Types and helpers: `src/lib/types.ts`, `src/lib/utils.ts`, `src/lib/csv.ts`
- Auth UI and flow: `src/components/auth/Login.tsx`, `src/components/auth/AuthGate.tsx`, `src/app/layout.tsx`
- Export feature: `src/app/export/page.tsx` (uses `exportToCSV` and `vf:lastTab` localStorage key)
- Dashboard and domain views: `src/components/dashboard/*` (lots/items views, modals)

## ⚙️ Dev workflow (commands)
- Start dev server: `npm run dev` (uses port 3000)
- Build for production: `npm run build`, then `npm run start`
- Lint: `npm run lint`

Note: Environment variables are required for local dev. Add them to a local `.env.local` (do not commit secrets). Consider adding a `.env.local.example` with variable names if missing.

## 📚 Project-specific conventions & patterns
- Most DB interactions and auth checks happen on the client via Supabase (`supabase.auth.getUser()`, `supabase.auth.getSession()`, `supabase.from('items')...`). Keep user-scoped queries filtered with `.eq('user_id', uid)`.
- Use `use client` at the top of components that access Supabase or browser APIs.
- Reuse shared helpers in `src/lib` (currency/date formatting, unit-cost logic) rather than duplicating logic.
- UI copy is Spanish and some utility CSS classes (e.g., `vf-*`) are used — mimic them when adding components.
- CSV exports: there are two patterns in the codebase — `exportToCSV` (simple util) and ad-hoc CSV builders. Prefer `src/lib/csv.exportToCSV` when appropriate.

## 📌 Examples (copy-paste)
- Get current user id:
```ts
const { data: userData } = await supabase.auth.getUser();
const uid = userData.user?.id
```
- Query user items:
```ts
const { data } = await supabase.from('items').select('*').eq('user_id', uid)
```
- Export CSV with existing util:
```ts
import { exportToCSV } from '@/lib/csv'
exportToCSV('prendas.csv', rows)
```

## ⚠️ Gotchas & notes for changes
- There are legacy/import path inconsistencies (e.g. old `@/lib/supabaseClient` vs current `@/lib/supabase/client.ts`). Prefer the canonical export at `src/lib/supabase/client.ts` and update usages.
- `.env.local` is present in this workspace; do not commit secrets or add real keys to repo. Recommend adding `.env.local` to `.gitignore` and creating `.env.local.example` with placeholder values.
- No tests/CI configured yet — be explicit about test or CI changes in PR descriptions.

## ✅ Suggested tasks for contributors (if asked)
- Add a `.env.local.example` and update README with local env setup
- Add basic unit tests around `src/lib/utils.ts` and CSV helper
- Normalise any remaining legacy import paths (search for `supabaseClient`)

---
If you'd like, I can: add a `.env.local.example`, normalise legacy imports, or extend these instructions with file-level examples or PR templates. Which would you prefer I do next? 👇
