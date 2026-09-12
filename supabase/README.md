# Supabase foundation — Milestone 1

This directory contains the database schema, integrity triggers, RLS
policies, and storage authorization for the portfolio site, per
`docs/architecture.md` (Milestone 1 only: no admin UI, no public site, no
Next.js app yet — those are later milestones).

**Status: verified against a local Supabase instance (Docker) on 2026-09-11.**
All 25 pgTAP tests pass, and the Storage RLS cases the automated tests don't
cover were checked manually (curl against the local Storage/Auth REST API).
This has never been applied to a real/remote Supabase project. See the
verification report the assistant produced for full test-by-test results;
the summary is repeated in "Unverified assumptions" below, updated to say
what's now actually confirmed vs. still open.

## 1. Install prerequisites

- **Docker Desktop** (or another Docker-compatible engine): https://www.docker.com/products/docker-desktop/
- **Supabase CLI**:
  - macOS: `brew install supabase/tap/supabase`
  - Other platforms: https://supabase.com/docs/guides/cli/getting-started

Verify both are installed:
```
docker --version
supabase --version
```

## 2. Initialize the local Supabase project

From the repository root:
```
supabase init
```
This adds `supabase/config.toml` and a `supabase/.gitignore`. It will not
touch the `migrations/`, `seed.sql`, or `tests/` files already in this repo.

## 3. Start the local stack

```
supabase start
```
This launches local Postgres, Auth, Storage and Studio in Docker, applies
every file in `supabase/migrations/` in order, then runs `supabase/seed.sql`
(local-only fixtures: a fake admin user, one published sample case, one
draft sample case). It prints an anon key, a service-role key, and a Studio
URL — you'll need the anon key for the Next.js app in a later milestone.
**Never put the service-role key in client-side code.**

## 4. Run the tests

```
supabase test db
```
This runs `supabase/tests/database.test.sql` (pgTAP) against the local
instance. Verified: all 25 pass (`Result: PASS`). See "Unverified
assumptions" below for what's still open.

To stop the local stack afterwards: `supabase stop`.

## 5. Promote your real admin account (manual — only once you have a real project)

This repo intentionally hardcodes no email or user id anywhere. After you:

1. create your real Supabase project (dashboard, or `supabase projects create`),
2. push these migrations to it — `supabase link` then `supabase db push`
   (do **not** run `supabase/seed.sql` against it; that file is local-only),
3. sign up as a user via Supabase Auth for that project (e.g. from Supabase
   Studio's Authentication tab, or your future `/admin/login` page),

run this once in the **SQL editor of that real project** (not locally),
replacing the placeholder with the UUID of the user you just created
(Authentication → Users → copy the UUID):

```sql
insert into admins (id) values ('<your-auth-user-uuid>');
```

There is no other way to grant admin access — it is not derived from an
email address, and nothing in this repo self-registers an admin.

## What's included

| File | Purpose |
|---|---|
| `migrations/*_extensions.sql` | Enables `pgcrypto` for `gen_random_uuid()` |
| `migrations/*_admins.sql` | `admins` allowlist table |
| `migrations/*_cases.sql` | `cases` table |
| `migrations/*_case_sections.sql` | `case_sections` table |
| `migrations/*_case_images.sql` | `case_images` table + the composite FK linking `cases.hero_image_id` back to it |
| `migrations/*_helper_functions.sql` | `is_admin()`, `can_read_case_image()`, `touch_updated_at()`, `fixed_section_order()` |
| `migrations/*_triggers.sql` | Fixed section ordering, `case_id`/`first_published_at` locking, `validate_case()`, publish/published-integrity guard, `reorder_cases()` |
| `migrations/*_rls_policies.sql` | Row Level Security for all 4 tables |
| `migrations/*_storage.sql` | Private `case-images` bucket + `storage.objects` policies |
| `seed.sql` | **Local dev only.** Fake admin + sample cases. Never run against a real project. |
| `tests/database.test.sql` | pgTAP tests. 25/25 pass locally — see step 4. |

## Design notes worth knowing before you read the SQL

A couple of small implementation choices go slightly beyond the literal text
of `docs/architecture.md`, in the direction of its stated intent — flagging
them explicitly rather than leaving them implicit:

- **`display_position` is trigger-assigned on INSERT** (`max + 1`), the same
  way `section_index` is trigger-assigned, so it can never be set to be a
  reasonable value only by convention. Only `reorder_cases()` changes it
  afterwards. (There is no DB-level guard yet stopping a direct client
  `UPDATE ... SET display_position = ...` outside `reorder_cases()` — see
  limitations below.)
- **One combined trigger function** (`cases_guard_publish_integrity`)
  implements both "publish guard" and "published-integrity guard" from the
  architecture doc, since both are the same check (`validate_case`) applied
  whenever the resulting `status` is `'published'` — whether that's a
  draft→published transition or an edit to an already-published case.
- **`case_id`/`case_id`-ownership is also locked on `case_sections` and
  `case_images`**: a section or image can't be moved to a different case via
  `UPDATE`. Not explicitly stated in the architecture doc, but a direct
  consequence of "authorization/integrity enforced at the database layer."

## Bugs found and fixed during verification (2026-09-11)

Both were found by actually running the stack locally, not by inspection:

1. **`validate_case()` had a stray `is_admin()` check that broke its own
   caller.** It's invoked unconditionally by the `cases_guard_publish`
   trigger, which fires for *every* role that can reach an `UPDATE` on
   `cases` — including `postgres` (migrations, `seed.sql`, and any future
   service-role script), which bypasses RLS and has no admin JWT claim.
   `supabase start` failed applying `seed.sql` with `only the admin may
   validate a case (SQLSTATE 42501)` the first time it ran. Fixed by
   removing that check from `validate_case()` — the real authorization
   boundary (who can set `status = 'published'`) is the `cases_update` RLS
   policy, not this function. See the comment above the function in
   `migrations/20260911140007_triggers.sql`.
2. **Seeding `auth.users` directly failed sign-in with a 500.** Four text
   columns (`confirmation_token`, `recovery_token`,
   `email_change_token_new`, `email_change`) have no column default and
   were left `NULL`; GoTrue scans them as non-nullable and errored with
   `converting NULL to string is unsupported`. Fixed in `seed.sql` by
   setting all four to `''`.

Both fixes are in place in the files as they now stand; the sequence above
(clean `supabase db reset` → `supabase test db` → manual sign-in) was
re-run afterwards and passed end to end.

## Unverified assumptions — updated after verification

Confirmed, no longer open:
- **`auth.uid()` reads `request.jwt.claim.sub`** on this Supabase CLI
  version (2.117.0) — the pgTAP admin-context tests pass with it set that
  way. (The tests also set `request.jwt.claims` as a belt-and-braces
  measure; which one actually mattered wasn't isolated.)
- **RLS bypass by table owner** behaves as expected: migrations/seed run as
  `postgres` and bypass RLS; this is normal Postgres behavior, not a gap.
- **pgTAP is available** in this CLI's local dev template — no extra setup
  needed.
- **Storage RLS is verified**, via curl against the local Storage/Auth REST
  API (not through the pgTAP suite, which stays SQL-layer only):
  - anon: reads a published case's image (200, correct bytes) — verified
  - anon: reading a draft case's image returns the same "not found" as a
    nonexistent path (RLS makes them indistinguishable) — verified
  - anon: upload into an existing case's folder is denied — verified
  - anon: delete is denied — verified
  - admin (real password-grant session, not service_role): reads the draft
    image (200) — verified
  - admin: uploads into an existing case's folder (200) — verified
  - admin: uploading into a folder for a case id that doesn't exist is
    denied by the INSERT policy's `exists()` check — verified
  - admin: deletes an object (200) — verified
  - bucket config: `public = false`, `file_size_limit = 4194304` (4 MB),
    `allowed_mime_types = {image/jpeg,image/png,image/webp}` — verified
  - a disallowed MIME type (`text/plain`) is rejected (415) — verified
  - a file over 4 MB is rejected (413) — verified

Still open / not verified:
- **No concurrency testing.** `display_position` assignment and
  `reorder_cases()` assume low, single-admin concurrency (matching the MVP
  scope) — there is no advisory locking against simultaneous writes, and
  this wasn't exercised.
- **`display_position` is not fully locked down.** Unlike `section_index`,
  there's no trigger rejecting a direct client `UPDATE cases SET
  display_position = ...` outside `reorder_cases()`. RLS still requires the
  caller to be admin either way, so this is only a gap between "admin can
  reorder correctly via the RPC" and "admin can also bypass the RPC and set
  an inconsistent position directly" — worth a follow-up trigger in a later
  milestone if that matters to you.
- **Migration filenames use hand-picked timestamps**, not ones generated by
  `supabase migration new`. They apply in the intended order (confirmed by
  the `supabase db reset` output above), but were not generated by the CLI.
- **Only verified locally.** None of this has been applied to a real/remote
  Supabase project — `supabase link` + `supabase db push` against a real
  project is still untested, as is the real Studio/dashboard sign-up flow
  referenced in step 5.
- **Not covered at all in this milestone** (by design — later milestones):
  the `/media/[image_id]` application route itself, the admin upload UI,
  and anything client-bundle/Next.js-related.
