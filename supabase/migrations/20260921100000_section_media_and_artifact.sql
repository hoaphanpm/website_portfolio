-- Case-study redesign milestone: optional artifact link + multiple ordered
-- images per section. Fully additive — no column is dropped, renamed, or
-- narrowed, and no existing row's data changes. Every existing case_images
-- row (all of them hero/case-level images today) keeps section_id = null
-- and continues to work exactly as before; nothing here requires a data
-- backfill.

-- ---------------------------------------------------------------------------
-- Optional artifact link (cases)
-- ---------------------------------------------------------------------------

alter table cases add column if not exists artifact_url text;
alter table cases add column if not exists artifact_label text;

-- Defense-in-depth mirror of the app-layer check (lib/cases/validation.ts):
-- absolute http(s) only. Never enforced as the sole boundary — the app
-- validates and trims before ever writing here, same pattern as
-- cases_case_id_slug_check.
alter table cases add constraint cases_artifact_url_check check (
  artifact_url is null or artifact_url ~ '^https?://'
);

comment on column cases.artifact_url is
  'Optional external artifact (Figma, Miro, prototype, deck, research doc, ...). Absolute http(s) URL only, or null.';
comment on column cases.artifact_label is
  'Optional CTA label for artifact_url. When null and artifact_url is set, the app renders "View artifact ↗".';

-- ---------------------------------------------------------------------------
-- Multiple ordered images per section (case_images)
-- ---------------------------------------------------------------------------

-- Lets case_images.section_id's composite FK below guarantee a section
-- image always belongs to the same case as the section itself, mirroring
-- the existing cases_hero_image_fk / case_images_id_case_id_key pattern.
alter table case_sections add constraint case_sections_id_case_id_key unique (id, case_id);

alter table case_images add column if not exists section_id uuid references case_sections(id) on delete cascade;
alter table case_images add column if not exists caption text;
alter table case_images add column if not exists display_order integer not null default 0;
alter table case_images add column if not exists is_decorative boolean not null default false;

-- Composite FK is skipped by Postgres whenever section_id is null (MATCH
-- SIMPLE, the default), so every existing hero/case-level image row
-- (section_id null) is completely unaffected by this constraint.
alter table case_images add constraint case_images_section_case_fk
  foreign key (section_id, case_id) references case_sections (id, case_id);

comment on column case_images.section_id is
  'Null = case-level image (e.g. the hero image, via cases.hero_image_id). Non-null = this image belongs to that section''s ordered gallery, and must belong to the same case (enforced by case_images_section_case_fk).';
comment on column case_images.caption is
  'Optional, shown beneath the image in the section gallery. Never required.';
comment on column case_images.display_order is
  'Position within its section''s gallery, ascending. Meaningless (and unused) for case-level images. Rewritten only by the admin-only reorder_section_images() RPC.';
comment on column case_images.is_decorative is
  'When true, alt_text may be empty (the image is marked decorative and validate_case will not require alt text for it). Defaults to false, so existing and new content images still require real alt text before publish.';

-- Admin-only: rewrites display_order for every image in one section, in one
-- transaction. Mirrors reorder_cases() exactly (docs/architecture.md §2) —
-- same admin check, same "every id from this collection exactly once"
-- validation, same not-found handling.
create or replace function reorder_section_images(p_section_id uuid, p_image_ids uuid[])
returns void
language plpgsql
as $$
declare
  v_id uuid;
  v_idx integer := 1;
  v_total_images integer;
  v_total_input integer;
begin
  if not is_admin() then
    raise exception 'only the admin may reorder section images' using errcode = '42501';
  end if;

  select count(*) into v_total_images from case_images where section_id = p_section_id;
  v_total_input := coalesce(array_length(p_image_ids, 1), 0);

  if v_total_input <> v_total_images then
    raise exception 'reorder_section_images requires every image id in this section exactly once (got %, expected %)',
      v_total_input, v_total_images
      using errcode = '22023';
  end if;

  if (select count(distinct x) from unnest(p_image_ids) as x) <> v_total_input then
    raise exception 'reorder_section_images received duplicate image ids' using errcode = '22023';
  end if;

  foreach v_id in array p_image_ids loop
    update case_images set display_order = v_idx where id = v_id and section_id = p_section_id;
    if not found then
      raise exception 'unknown image id % for section % in reorder_section_images', v_id, p_section_id
        using errcode = '22023';
    end if;
    v_idx := v_idx + 1;
  end loop;
end;
$$;

revoke all on function reorder_section_images(uuid, uuid[]) from public;
grant execute on function reorder_section_images(uuid, uuid[]) to authenticated;

comment on function reorder_section_images(uuid, uuid[]) is
  'Admin-only. Rewrites display_order for every image in the given section in one transaction, from the given ordered array, which must contain every image currently in that section exactly once.';

-- ---------------------------------------------------------------------------
-- validate_case(): additive rule — non-decorative images need real alt text
-- before publish. Same function, same signature, same "single source of
-- truth for every publish rule" role — every existing check is preserved
-- verbatim below; only one new check is appended.
-- ---------------------------------------------------------------------------

create or replace function validate_case(p_case cases)
returns table(code text, message text)
language plpgsql
stable
as $$
begin
  if p_case.case_id is null or btrim(p_case.case_id) = '' then
    code := 'case_id_missing'; message := 'case_id is required.'; return next;
  end if;

  if p_case.case_name is null or btrim(p_case.case_name) = '' then
    code := 'case_name_missing'; message := 'case_name is required.'; return next;
  end if;

  if p_case.headline is null or btrim(p_case.headline) = '' then
    code := 'headline_missing'; message := 'headline is required to publish.'; return next;
  end if;

  if p_case.summary is null or btrim(p_case.summary) = '' then
    code := 'summary_missing'; message := 'summary is required to publish.'; return next;
  end if;

  if p_case.hero_image_id is null then
    code := 'hero_image_missing'; message := 'hero_image must reference an existing managed image.'; return next;
  end if;

  if p_case.completion_section is null then
    code := 'completion_section_missing'; message := 'completion_section is required to publish.'; return next;
  elsif not exists (
    select 1 from case_sections where case_id = p_case.id and section_id = p_case.completion_section
  ) then
    code := 'completion_section_not_in_case'; message := 'completion_section must reference a section that exists in this case.'; return next;
  end if;

  if not exists (select 1 from case_sections where case_id = p_case.id) then
    code := 'no_sections'; message := 'the case must contain at least one section.'; return next;
  end if;

  if not exists (select 1 from case_sections where case_id = p_case.id and section_id = 'decision') then
    code := 'decision_section_missing'; message := 'the case must contain a decision section.'; return next;
  end if;

  if exists (select 1 from cases c where c.case_id = p_case.case_id and c.id <> p_case.id) then
    code := 'case_id_not_unique'; message := 'case_id must be unique.'; return next;
  end if;

  -- New: every non-decorative image belonging to this case (hero or
  -- section) needs real alt text before publish (accessibility
  -- requirement). An image explicitly marked decorative is exempt.
  if exists (
    select 1 from case_images
    where case_id = p_case.id
      and is_decorative = false
      and (alt_text is null or btrim(alt_text) = '')
  ) then
    code := 'image_alt_text_missing';
    message := 'every non-decorative image needs alt text before publishing (mark it decorative if it carries no meaning).';
    return next;
  end if;

  return;
end;
$$;
