# Make the admin section real

Move every admin resource off `localStorage` and onto Lovable Cloud (Postgres + auth + RLS). Admin is gated by an `admin/editor/contributor` role system. The 95 imported drafts plus seed reviews are migrated into the database on first run.

## 1. Enable Lovable Cloud
Provisions Postgres, auth, storage, and the generated Supabase clients (`client.ts`, `auth-middleware.ts`, `client.server.ts`).

## 2. Database schema (migration)
Tables:
- `profiles` — `id` (FK `auth.users` cascade), `display_name`, `bio`, `avatar_url`, `city`, `created_at`
- `app_role` enum — `admin | editor | contributor`
- `user_roles` — `(user_id, role)` unique; never on profiles
- `reviews` — mirrors current `Review` type (artist, title, slug unique, label, format, genre, date, decade, kind, score, art, byline, read_mins, body jsonb, status, label_address, contact, archive_url, period)
- `features` — id, slug unique, kicker, title, dek, body jsonb, hero, byline, status, published_at
- `lists` — id, slug unique, title, dek, items jsonb, status, published_at
- `contributors` — id, name, role, bio, city (independent of auth users)
- `subscribers` — id, email unique, signed_up

Functions/triggers:
- `has_role(_user_id, _role)` — `SECURITY DEFINER`, used in every RLS policy (avoids recursion)
- `handle_new_user()` trigger — auto-create `profiles` row on signup

## 3. RLS policies
- Public read on `reviews/features/lists` where `status='published'`
- Admin/editor full CRUD on content tables via `has_role()`
- `profiles`: user reads/updates own; public reads name/bio/avatar
- `user_roles`: only admins manage; users read their own
- `subscribers`: anyone can insert (newsletter); only admins read/delete

## 4. Auth pages
- `/auth` — email + password sign in / sign up (uses `emailRedirectTo: window.location.origin`)
- `/reset-password` — required companion page for password recovery
- `_authenticated` pathless layout — `beforeLoad` gates all `/admin/*`
- `_authenticated/_admin` — extra `has_role('admin'|'editor')` gate via server fn

## 5. Server functions (`src/server/*.functions.ts`)
Replace `cdActions` with typed RPC calls:
- `reviews.functions.ts` — list/get/upsert/delete/bulkUpsert (uses `requireSupabaseAuth`)
- `features.functions.ts`, `lists.functions.ts`, `contributors.functions.ts`, `subscribers.functions.ts`
- `roles.functions.ts` — `getMyRoles`, `assignRole` (admin only)

Public read paths (homepage, /reviews, /archive) use the browser client directly with RLS doing the gating.

## 6. Migrate the localStorage data
A one-time `seedDatabase` server function (idempotent, admin-only button in `/admin`) inserts:
- All `SEED_REVIEWS` from `cd-data.ts`
- All 95 rows from `cd-imported-reviews.ts` (status `draft`)
- Seed features, lists, contributors

Uses `upsert` keyed on `slug` so re-running is safe.

## 7. Replace `useCdStore` consumers
Swap every `useCdStore(...)` selector in routes for TanStack Query / loader calls hitting the server fns. Keep the same component shapes so the UI doesn't change. Delete `cd-store.ts` and `cd-imported-reviews.ts` after migration runs.

## 8. First-run flow
1. You sign up at `/auth` with your email
2. I'll show a SQL snippet to grant your `auth.users.id` the `admin` role (one-time)
3. Hit "Seed database" in `/admin` — pulls in seed + 95 drafts
4. From then on, every CRUD action persists to Postgres and survives reloads, devices, and deploys

## Technical notes
- All mutations go through `createServerFn` with `requireSupabaseAuth` middleware (RLS still applies as the user)
- Bulk import keeps current xlsx parser; commit step calls `bulkUpsertReviews` server fn instead of `cdActions`
- No edge functions; everything is TanStack server functions
- `art` field stays as a string class name (no image storage needed yet)

Approve and I'll enable Cloud and ship this in one pass.