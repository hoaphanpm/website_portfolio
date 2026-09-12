-- cases: one row per case study.
--
-- The FK from hero_image_id to case_images is added in the case_images
-- migration (circular dependency: case_images.case_id references cases.id).
create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  case_id text not null,
  case_name text not null,
  status text not null default 'draft',
  display_position integer not null default 0,
  headline text,
  summary text,
  tags text[] not null default '{}',
  hero_image_id uuid,
  completion_section text,
  first_published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint cases_status_check check (status in ('draft', 'published')),
  constraint cases_case_id_key unique (case_id),
  -- "must be a valid slug" per docs/architecture.md §2: lowercase
  -- alphanumeric groups separated by single hyphens, no leading/trailing
  -- hyphen, no double hyphens.
  constraint cases_case_id_slug_check check (case_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint cases_completion_section_check check (
    completion_section is null or completion_section in (
      'overview', 'problem', 'evidence', 'insight', 'decision',
      'solution', 'experience', 'measure', 'reflection'
    )
  )
);

comment on table cases is
  'Case studies. Public (anon) may only read rows with status = published (see RLS migration).';
comment on column cases.case_id is
  'URL slug. Editable until first_published_at is set, then immutable (enforced by trigger, not just the admin UI).';
comment on column cases.first_published_at is
  'Null until first publish; never cleared or changed once set (enforced by trigger).';
comment on column cases.display_position is
  'System-managed: set to (max + 1) on insert, rewritten only by the admin-only reorder_cases() RPC. Direct client writes are not blocked at the DB layer for this MVP (see supabase/README.md limitations) — the admin app should only ever call reorder_cases().';
