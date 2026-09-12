# Portfolio Website — Approved Architecture

**Status:** Approved on 2026-09-11. Implementation has not started.

**Sources, in order of precedence:**
1. `docs/product-requirements.md`
2. `docs/portfolio-tracking-spec.md`
3. `docs/design-reference.png` (written requirements override the image)

This document records how those requirements will be built, plus the decisions made during architecture review. Where a decision below clarifies or narrows a source document, the decision wins.

---

## 0. Decision log

| # | Decision | Rationale |
|---|---|---|
| D1 | **No manual section reordering.** The database sets `section_index` from the fixed order of the 9 section IDs, counting only the sections a case has. | `product-requirements.md` (highest precedence) only allows drag-and-drop for cases. A fixed order keeps the Mixpanel funnel comparable across cases and prevents `reflection` appearing before `decision`. The tracking spec's "reorder section" capability is deferred, not dropped. Adding it later needs no schema change. |
| D2 | **Case images live in a private Storage bucket and are served only through `/media/[image_id]`,** which checks table RLS and storage RLS on every request. No signed URLs. | Draft and unpublished images must never be publicly accessible. Signed URLs can't be revoked and would keep working after an unpublish. |
| D3 | **There is no `/work` index page.** `/work/[case_id]` is the only case-study URL. Missing, draft and unpublished cases return 404. "Back to homepage" links to `/#case-studies`. | Approved routing. The spec's other option (redirect to `/work`) isn't available. |
| D4 | **Tall-section visibility rule.** A section qualifies when at least 50% of the section is visible, **or** the visible portion fills at least 50% of the viewport height, continuously for 2 seconds. | With the literal 50%-of-section rule, a section taller than twice the viewport could never qualify, which would silently undercount `decision` reach (the North Star). Also recorded in `portfolio-tracking-spec.md` §5. It supersedes the literal wording in `product-requirements.md` ("at least 50% of the section remains visible"). |
| D5 | **Page-level deduplication.** `portfolio_viewed` fires at most once per browser session. `case_study_opened` fires at most once per case per browser session and keeps the first `entry_source` and `display_position`. `high_intent_action` is **not** deduplicated. | Section events are already deduplicated per session. Without this, refreshes and re-opens would deflate Engaged Case Rate and inflate Case Open Rate. Also recorded in `portfolio-tracking-spec.md` §2. |
| D6 | **Public pages render on the server for every request** (no static generation or ISR). | Data is always fresh, admin/preview checks are reliable, and there's no revalidation logic. Portfolio traffic makes per-request reads negligible. |
| D7 | **Edits to a published case go live immediately,** but any write that would break a publish rule is rejected; the admin must unpublish first. | The MVP excludes version history. This keeps published cases valid, e.g. `completion_section` always exists. |
| D8 | **No case deletion in the MVP.** | Neither spec lists it as an admin capability. |
| D9 | **Smaller defaults:** the admin UI pre-selects `completion_section = reflection` when that section exists; an empty `tags[]` is valid; "Next case" wraps from last to first and is hidden when only one case is published; `homepage_contact` is added to the central `location` list for the design's Contact section. | Carried over from the architecture review. |

---

## 1. Architecture

- **Stack:** Next.js (App Router, TypeScript) on Vercel, Supabase (Postgres, Auth, Storage), Tailwind with shadcn/ui, and `mixpanel-browser` behind one Analytics Service.
- **Rendering:** public pages render on the server for every request (D6).
- **No service-role key** anywhere in the app. Authorization comes from RLS plus the caller's own identity.
- **The public browser never calls Supabase directly.** All public data and images go through the Next.js server.

```
Admin browser (/admin) ──admin session──► Supabase Storage (private bucket + storage RLS)
        │ server actions (admin session)
        ▼
Supabase Postgres (RLS + integrity triggers + admin-only RPCs)
        ▲
        │ per-request server render (anon role, or admin session for preview)
Next.js on Vercel:  /   ·   /work/[case_id]   ·   /media/[image_id]   ·   /admin/**
        │ page data (case config)
        ▼
Visitor browser: Case Study Renderer ──► Analytics Service ──► Mixpanel
```

| Who is calling | Credentials | Role in Postgres |
|---|---|---|
| Public page render, `/media` for visitors | Anon key | `anon` |
| Admin UI, preview, `/media` for the admin | Anon key + admin session cookie | `authenticated` + `is_admin()` |

**Environment variables:**
- Public: Supabase URL, Supabase anon key, and the Mixpanel token (set only in the production environment).
- No other secrets are needed.

---

## 2. Database schema

### `cases`

| Column | Type | Rules |
|---|---|---|
| `id` | uuid PK | Internal and never changes. Used by foreign keys and as the storage folder name |
| `case_id` | text | Unique, required, must be a valid slug. A trigger locks it once `first_published_at` is set |
| `case_name` | text | Required. Can be edited at any time |
| `status` | text | `draft` or `published`, default `draft` |
| `display_position` | int | Required. New cases get the last position (max + 1). Only the reorder RPC rewrites it |
| `headline`, `summary` | text | Can be empty while draft. Required to publish |
| `tags` | text[] | Required, defaults to an empty array |
| `hero_image_id` | uuid | Can be empty while draft. Composite FK `(hero_image_id, id)` → `case_images(id, case_id)`, so the hero image must belong to the same case. `ON DELETE RESTRICT` |
| `completion_section` | text | Can be empty while draft. Must be one of the 9 IDs and must exist in this case to publish |
| `first_published_at` | timestamptz | Set by the system on first publish. Can never be changed or cleared |
| `created_at`, `updated_at` | timestamptz | Automatic |

### `case_sections`

| Column | Type | Rules |
|---|---|---|
| `id` | uuid PK | |
| `case_id` | uuid | FK → `cases.id` (not the slug), cascade on delete |
| `section_id` | text | Must be one of the 9 IDs. `UNIQUE (case_id, section_id)`. Can't be changed after insert |
| `section_index` | int | Set by trigger from the fixed order (D1). `UNIQUE (case_id, section_index)`, deferrable |
| `content` | jsonb | Shape depends on `section_id` and is validated in server actions. Images are referenced by `case_images.id`, never by URL |
| `created_at`, `updated_at` | timestamptz | Automatic |

Fixed section order: `overview → problem → evidence → insight → decision → solution → experience → measure → reflection`.

### `case_images`

| Column | Type | Rules |
|---|---|---|
| `id` | uuid PK | `UNIQUE (id, case_id)` so the composite FK can point at it |
| `case_id` | uuid | FK → `cases.id` |
| `storage_path` | text | Unique. Format `{cases.id}/{case_images.id}.{ext}`, so editing the slug never moves files |
| `alt_text`, `mime_type`, `size_bytes`, `width`, `height`, `created_at` | | |

### `admins`

- `id` uuid PK → `auth.users.id`, holding one row.
- Public sign-ups are turned off in Supabase Auth.

### Database guards and functions

| Guard | Rule |
|---|---|
| `validate_case(case)` | The single source of truth for every publish rule. Returns the full list of errors. Admin-only; anon can't execute it |
| `case_id` lock trigger | Rejects `case_id` changes after first publish. Rejects any change to `first_published_at` once it's set |
| Section index trigger | Recalculates `section_index` after a section is added or removed. Rejects changes to `section_id` |
| Publish guard trigger | When `status` changes to `published`, runs `validate_case` and rejects the change if anything fails. Sets `first_published_at` if it's empty |
| Published-integrity trigger | Rejects any write to a published case, or to its sections or images, that would break a publish rule (D7). Changing `completion_section` to another existing section is allowed |
| `reorder_cases(ordered ids)` RPC | Admin-only. Rewrites every `display_position` in one transaction |
| No case deletion | No DELETE policy on `cases` (D8) |

**Publish rules checked by `validate_case`:** `case_id` and `case_name` present; `case_id` unique; `headline` and `summary` present; `tags` is an array; `hero_image` references an existing image of this case; at least one section; a `decision` section exists; `completion_section` is set and exists in the case; no duplicate section IDs; every `section_id` is one of the 9 allowed values.

---

## 3. Supabase RLS and Storage authorization

**Helper functions** (`security definer`, `stable`):
- `is_admin()`: is `auth.uid()` listed in `admins`?
- `can_read_case_image(object_name)`: does a `case_images` row with this `storage_path` exist, and is its case `published`?

### Table policies

RLS is on for every table; anything not listed is denied.

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `admins` | none | none | none | none |
| `cases` | `status = 'published'` OR `is_admin()` | `is_admin()` | `is_admin()` | none |
| `case_sections` | `is_admin()` OR parent case is `published` | `is_admin()` | `is_admin()` | `is_admin()` |
| `case_images` | `is_admin()` OR parent case is `published` | `is_admin()` | `is_admin()` | `is_admin()` |

Admin RPCs run as the caller, check `is_admin()` first, and can't be executed by `anon`.

### Storage: bucket `case-images`

- **Private** (`public = false`); no public object URLs exist for any image.
- Allowed file types: JPEG, PNG, WebP.
- Maximum file size: **4 MB**, so images fit within Vercel's function response limit.

| Operation on `storage.objects` | Allowed when |
|---|---|
| SELECT (download) | `is_admin()` OR `can_read_case_image(name)` |
| INSERT | `is_admin()` AND the first folder in the path is an existing `cases.id` |
| UPDATE / DELETE | `is_admin()` |

### Image delivery: `/media/[image_id]` (D2)

1. Look up the `case_images` row with the caller's own Supabase client (table RLS applies).
2. Download the file with the same client (storage RLS checks access again).
3. Stream it with `Cache-Control: private` (no CDN or shared cache).
4. Anything the caller can't see returns **404**; missing and forbidden look the same.

| Viewer | Result |
|---|---|
| Visitor viewing a published case | Both RLS layers allow it; the image is served |
| Visitor with a draft or unpublished image ID | 404. Calling the Storage API directly with the anon key is also denied |
| Admin in `/admin` or preview | Admin session passes `is_admin()`; any image is served |
| Image of a case that was just unpublished | 404 on the very next request |

### Uploads

- The admin's browser uploads straight to Storage with the admin session (avoids Vercel's request-size limit).
- A server action then inserts the `case_images` row. If that insert fails, the file is deleted.
- A file without a row can never be read publicly.

---

## 4. Admin publishing workflow

1. **Create a case.** Starts as `draft`. `case_id` is generated as a slug from `case_name`, with `-2`, `-3`, … added if taken. It gets the last display position.
2. **Edit fields.** `case_id` is editable until first publish; afterwards the UI shows it read-only and the trigger enforces the lock.
3. **Manage sections.**
   - Add from a dropdown of the 9 IDs; IDs already used in the case are hidden.
   - Remove sections.
   - No manual reordering; `section_index` is set automatically (D1).
   - Edit content through a form specific to each section type.
   - `completion_section` is pre-selected as `reflection` when that section exists.
4. **Manage images.**
   - Upload to the private bucket.
   - Choose the hero image from this case's image library.
   - Image pickers inside section content only offer this case's images. A reference to another case's draft image would still be refused by `/media`.
5. **Preview.** `/work/[case_id]?preview=true` from the editor.
   - Requires an admin session; uses the same renderer; images through `/media`.
   - No analytics.
   - Response is `noindex` and `Cache-Control: private, no-store`.
6. **Publish.**
   - The server action calls `validate_case` and shows every error at once.
   - If there are none, it sets `status = 'published'`. The publish guard re-checks and sets `first_published_at` if empty.
   - Changes appear on the next request.
7. **Edit a published case.** Live immediately; edits that would break a publish rule are rejected with a clear message (D7).
8. **Unpublish.**
   - `status` returns to `draft`; the page and its images return 404 immediately.
   - `case_id` stays locked.
   - Mixpanel history is untouched.
9. **Reorder cases.** Drag and drop the full list (drafts included), which calls `reorder_cases` to renumber positions 1…N in one transaction.

---

## 5. Public routing

| Route | Purpose |
|---|---|
| `/` | Homepage. The case-study list has the anchor `#case-studies` |
| `/work/[case_id]` | The only case-study route, using one reusable renderer |
| `/work/[case_id]?preview=true` | Draft preview, admin only |
| `/media/[image_id]` | Authorized image delivery |
| `/admin/login`, `/admin`, `/admin/cases/[id]` | Admin area. Middleware requires a session; RLS is the real boundary |

There is **no `/work` index page**; `/work` returns 404 (D3).

**Behavior:**
- **Homepage:**
  - Hero, How I Think, About/Journey, Writing, Contact and the CV file come from one static site config.
  - Selected Work shows every published case ordered by `display_position`, with no limit.
  - "View case studies ↓" scrolls to `#case-studies`.
- **Case page:** loads the case by slug with `status = 'published'`. Missing, draft or unpublished returns 404.
- **`?preview=true`:** unlocks drafts only with an admin session. For anyone else it doesn't change data access (drafts still 404), but it still turns tracking off.
- **Back to homepage** (top and bottom of the case page) links to `/#case-studies`.
- **Next case** goes to the next published case by `display_position`, wrapping from last to first; hidden when only one case is published.
- **Section navigation (01, 02, …)** shows only the sections the case has, numbered 1…N. Because of D1 this always matches `section_index`.

### `entry_source`

Exactly `homepage`, `next_case` or `direct_or_external`, from one constant list.

| How the visitor arrived | `entry_source` |
|---|---|
| Clicked a case card on the homepage | `homepage` |
| Clicked the Next case button | `next_case` |
| Anything else: typed URL, external link, bookmark, refresh, browser back/forward | `direct_or_external` |

**How it works:**
1. When one of the two internal links is clicked, it hands the Analytics Service a typed constant plus the target `case_id`.
2. The service saves a one-time marker in `sessionStorage`.
3. When the case page loads, the service reads and deletes the marker, using it only if its `case_id` matches the case being opened. Otherwise the value is `direct_or_external`.
4. The marker is consumed even when `case_study_opened` is deduplicated (D5), so it can't leak into a later open.
5. Any value not on the list falls back to `direct_or_external`.

No query parameters are used, so a copied or shared link can never carry a false `homepage` source.

---

## 6. Mixpanel implementation mapping

| Event | Fires when | Properties | Extra gate / dedup |
|---|---|---|---|
| `portfolio_viewed` | The homepage loads | Session UTM (only if present), `device_type` | Once per browser session (D5) |
| `case_study_opened` | A case page loads | `case_id`, `case_name`, `entry_source`, `display_position` (read when the event fires) | `status = published`; once per case per browser session, first values kept (D5) |
| `case_section_viewed` | A section meets the visibility rule (D4) for 2 continuous seconds | `case_id`, `section_id`, `section_index` | `status = published`; once per case + section per browser session |
| `case_study_completed` | Right after `case_section_viewed` fires for `completion_section` | `case_id` | `status = published`; at most once per case per session, because it depends on the deduplicated section event |
| `high_intent_action` | A visitor clicks a CTA from the central list | `action`, `location`, `case_id` (null on the homepage) | **Not deduplicated**; every click fires |

Every event also gets `device_type` automatically, and the session's UTM values through super properties when there are any.

### Tracking gate

Checked before Mixpanel is ever initialized:
- **Server:** tracking is allowed only when `VERCEL_ENV` is `production`, there's no admin session, and there's no `preview=true`. The result is passed to the client with the page.
- **Client:** the Analytics Service also checks that the hostname isn't `localhost` and the URL has no `?preview=true`.
- If either check fails, Mixpanel is never initialized; in development, events are only logged to the console.
- The Mixpanel token is only configured in the production environment.

### Page data

The server passes `case_id`, `case_name`, `status`, `display_position`, `completion_section` and `sections[{section_id, section_index}]` from the database. Nothing is hardcoded per case.

### Central lists

- **Events:** the 5 above.
- **Section IDs:** the 9 fixed IDs.
- **`entry_source`:** `homepage`, `next_case`, `direct_or_external`.
- **`action`:** `download_cv`, `linkedin_click`, `email_click`.
- **`location`:** `homepage_hero`, `navbar`, `homepage_contact`, `homepage_footer`, `case_footer`. The shared footer sends `homepage_footer` on `/` and `case_footer` (with `case_id`) on case pages.

### Deduplication keys

All use an in-memory `Set` plus `sessionStorage`. A key is written only after the event is actually sent, so visits blocked by the tracking gate never consume a key.

| Event | Key |
|---|---|
| `portfolio_viewed` | `viewed_portfolio` |
| `case_study_opened` | `opened_case:{case_id}` |
| `case_section_viewed` | `viewed_section:{case_id}:{section_id}` |

### UTM

- **Current session:** read from the landing URL, saved in `sessionStorage`, and registered as super properties once tracking is allowed. If there are no UTMs, the properties are omitted entirely.
- **First touch:** `mixpanel.people.set_once` records `first_utm_source`, `first_utm_medium`, `first_utm_campaign`; never overwritten.

### Device type

From viewport width: under 768px is `mobile`, 768–1023px is `tablet`, 1024px or more is `desktop`.

### Section view rule (D4)

A section **meets the visibility rule** when either:
1. at least 50% of the section is inside the viewport (intersection ratio ≥ 0.5), or
2. the visible portion of the section is at least 50% of the viewport height.

Mechanics:
- An IntersectionObserver with fine-grained thresholds watches each section. While a section is intersecting, the visible height is also recalculated on scroll and resize (throttled to animation frames), so condition 2 is detected precisely for tall sections.
- When the rule is met, a 2000ms timer starts. It's cancelled when neither condition holds any more, or when the tab is hidden (Page Visibility API).
- When the tab becomes visible again, the timer restarts if the section still meets the rule and hasn't been counted.
- Checks run in the spec's order: not admin/preview → case is published → dedup key not seen → send the event → save the key.
- The Case Hero isn't observed at all.

---

## 7. Implementation milestones

| # | Milestone | Done when |
|---|---|---|
| 1 | Supabase foundation: schema, guards, RLS, private bucket and storage policies, admin allowlist | Every row in tracking spec §15 "Database security" passes, plus storage tests (anon can't download draft images; anon can't upload) |
| 2 | Admin login and protected layout | Unauthenticated `/admin/**` requests redirect; public sign-up is off |
| 3 | Case and section editing for drafts | Dropdown-only section IDs; indexes set automatically; duplicate sections rejected by the database |
| 4 | Image library and `/media/[image_id]` | Draft image returns 404 to anon; admin can see it |
| 5 | Publish, unpublish and case reorder | Every §15 "CMS validation" row passes; `case_id` lock proven at the database level; unpublished images return 404 immediately |
| 6 | Homepage with static config and dynamic Selected Work | A newly published case appears with no code change |
| 7 | `/work/[case_id]` renderer, preview, 404, Back to homepage and Next case | Draft returns 404 to anon; admin preview renders the draft |
| 8 | Analytics Service core: gating, UTM, `device_type`, `entry_source`, central lists, dedup | No Mixpanel network calls locally, on preview deployments, with an admin session, or with `?preview=true` |
| 9 | Wiring the 5 events, including the section-view rule | Every §15 "Public tracking" row passes, including tall sections and page-level dedup |
| 10 | Full QA pass against §15, plus reorder and dynamic-config checks | All tables pass |
| 11 | Production launch | Mixpanel Live View confirms the funnel end to end |
