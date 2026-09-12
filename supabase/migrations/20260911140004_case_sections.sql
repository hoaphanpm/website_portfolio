-- case_sections: one row per section within a case.
--
-- section_index is system-managed (docs/architecture.md decision D1: no
-- manual section reordering — order follows the fixed 9-value list). See the
-- triggers migration for how it's computed and protected from direct writes.
create table if not exists case_sections (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  section_id text not null,
  section_index integer not null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint case_sections_section_id_check check (
    section_id in (
      'overview', 'problem', 'evidence', 'insight', 'decision',
      'solution', 'experience', 'measure', 'reflection'
    )
  ),
  constraint case_sections_case_section_key unique (case_id, section_id),
  -- Deferred: the resequence trigger (see triggers migration) renumbers
  -- every sibling section within one transaction whenever a section is
  -- added or removed, which can transiently repeat a section_index value
  -- before the final state is written.
  constraint case_sections_case_index_key unique (case_id, section_index)
    deferrable initially deferred
);

comment on table case_sections is
  'Sections belonging to a case. Public (anon) may read only if the parent case is published (see RLS migration).';
comment on column case_sections.section_id is
  'One of the 9 fixed values. Immutable after insert (enforced by trigger) — remove and re-add instead of renaming.';
comment on column case_sections.section_index is
  'System-managed. Always derived from the fixed section order (overview..reflection), counting only sections this case has. Direct client writes are ignored (enforced by trigger).';
