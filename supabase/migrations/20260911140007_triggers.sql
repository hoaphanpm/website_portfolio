-- Integrity triggers and admin-only functions.
-- These are the actual enforcement layer referenced throughout
-- docs/architecture.md §2 and §4 — authorization/validation "at the
-- server/database layer, not just disabled UI inputs."

-- ---------------------------------------------------------------------------
-- cases: touch_updated_at, display_position assignment, case_id/
-- first_published_at locking, publish validation + published-case integrity
-- ---------------------------------------------------------------------------

create trigger cases_touch_updated_at
  before update on cases
  for each row execute function touch_updated_at();

-- New cases always get the next position; only reorder_cases() (below)
-- rewrites display_position afterwards. Any client-supplied value on INSERT
-- is overwritten, mirroring how section_index is system-managed.
create or replace function assign_case_display_position()
returns trigger
language plpgsql
as $$
begin
  new.display_position := coalesce((select max(display_position) + 1 from cases), 1);
  return new;
end;
$$;

create trigger cases_assign_display_position
  before insert on cases
  for each row execute function assign_case_display_position();

-- Locks case_id once a case has ever been published, and prevents
-- first_published_at from being changed or cleared once set. This is the
-- literal DB-layer enforcement required by docs/portfolio-tracking-spec.md
-- Rule 3 ("Việc khóa phải được enforce ở server/database layer").
create or replace function lock_case_id_and_first_published_at()
returns trigger
language plpgsql
as $$
begin
  if old.first_published_at is not null and new.case_id is distinct from old.case_id then
    raise exception 'case_id is immutable once a case has been published (case %: % -> %)',
      old.id, old.case_id, new.case_id
      using errcode = '23514';
  end if;

  if old.first_published_at is not null and new.first_published_at is distinct from old.first_published_at then
    raise exception 'first_published_at cannot be changed once set (case %)', old.id
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger cases_lock_case_id
  before update on cases
  for each row execute function lock_case_id_and_first_published_at();

-- validate_case(): the single source of truth for the publish checklist in
-- docs/product-requirements.md / docs/portfolio-tracking-spec.md §12 Rule 6.
-- Returns one row per failed rule (empty result = passes).
--
-- Takes the prospective `cases` row as a parameter (rather than SELECTing it
-- by id) because it also runs from inside a BEFORE UPDATE trigger, where the
-- new values haven't been written to the table yet. Sections/images are
-- queried live since this statement doesn't modify those tables.
--
-- Deliberately has NO is_admin() gate: it is called unconditionally by the
-- cases_guard_publish trigger below, which fires for every role that can
-- reach an UPDATE on `cases` — including roles that bypass RLS entirely
-- (the `postgres` owner role used by migrations/seed, and any future
-- service-role maintenance script), not just requests that went through
-- PostgREST as `authenticated`. An is_admin() check here would incorrectly
-- block the trigger itself for those callers. The actual authorization
-- boundary — who can set status = 'published' in the first place — is
-- enforced by the cases_update RLS policy (using is_admin()), not by this
-- function. Direct RPC calls are still restricted to `authenticated` only
-- (see the REVOKE/GRANT below); it performs no writes and the row it
-- validates is caller-supplied, not looked up, so it exposes nothing
-- beyond what its caller already provided.
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

  -- The composite FK cases_hero_image_fk already guarantees that any
  -- non-null hero_image_id references an existing image belonging to this
  -- same case, so "references an existing managed image" only needs a
  -- not-null check here.
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

  -- tags validity, case_id uniqueness, no-duplicate-section-ids and the
  -- section_id allow-list are already guaranteed unconditionally by column
  -- NOT NULL defaults, UNIQUE and CHECK constraints on cases/case_sections,
  -- so they can never actually fail by the time this function runs. The
  -- case_id uniqueness check is kept anyway, for parity with the written
  -- publish checklist and as a defense-in-depth double-check.
  if exists (select 1 from cases c where c.case_id = p_case.case_id and c.id <> p_case.id) then
    code := 'case_id_not_unique'; message := 'case_id must be unique.'; return next;
  end if;

  return;
end;
$$;

revoke all on function validate_case(cases) from public;
grant execute on function validate_case(cases) to authenticated;

comment on function validate_case(cases) is
  'Returns one row per failed publish rule for the given prospective case row; empty result means it may be published. No internal is_admin() gate (see comment above the function body); direct RPC calls are restricted to authenticated only.';

-- Runs validate_case() whenever a case's status is (or remains) 'published',
-- covering both the publish transition and edits to an already-published
-- case (docs/architecture.md D7: "any write... that would break a publish
-- rule" is rejected). Sets first_published_at on first publish.
create or replace function cases_guard_publish_integrity()
returns trigger
language plpgsql
as $$
declare
  v_errors text[];
begin
  if new.status = 'published' then
    select array_agg(message) into v_errors from validate_case(new);

    if v_errors is not null then
      raise exception 'cannot publish/keep published (case %): %', new.id, array_to_string(v_errors, '; ')
        using errcode = '23514';
    end if;

    if old.first_published_at is null then
      new.first_published_at := now();
    end if;
  end if;

  return new;
end;
$$;

create trigger cases_guard_publish
  before update on cases
  for each row execute function cases_guard_publish_integrity();

-- ---------------------------------------------------------------------------
-- case_sections: fixed ordering (D1), section_id immutability, and
-- published-case protection for the decision/completion sections
-- ---------------------------------------------------------------------------

create trigger case_sections_touch_updated_at
  before update on case_sections
  for each row execute function touch_updated_at();

-- Recomputes section_index for every section of a case from
-- fixed_section_order(), counting only sections that case actually has.
-- Uses the app.resequencing session flag (below) so case_sections_before_update
-- can tell this internal call apart from a client-issued UPDATE.
create or replace function resequence_case_sections(p_case_id uuid)
returns void
language plpgsql
as $$
declare
  v_order text[] := fixed_section_order();
  v_section text;
  v_idx integer := 0;
begin
  perform set_config('app.resequencing', 'true', true); -- true = transaction-local

  foreach v_section in array v_order loop
    update case_sections
      set section_index = v_idx + 1
      where case_id = p_case_id and section_id = v_section;
    if found then
      v_idx := v_idx + 1;
    end if;
  end loop;

  perform set_config('app.resequencing', 'false', true);
end;
$$;

-- Not revoked from public/authenticated: it is called internally by the
-- triggers below, running as the same role that issued the original
-- INSERT/DELETE. Its own UPDATE statements are still subject to the
-- case_sections RLS policies for that role, so this grants no capability
-- beyond what the caller's role already has.
comment on function resequence_case_sections(uuid) is
  'Recomputes section_index for a case from the fixed order. Called internally by case_sections triggers; its writes still go through case_sections RLS for the calling role.';

-- Placeholder section_index on INSERT (corrected immediately by the AFTER
-- trigger below); the deferred unique constraint tolerates transient
-- duplicates within the same transaction.
create or replace function case_sections_before_insert()
returns trigger
language plpgsql
as $$
begin
  new.section_index := 0;
  return new;
end;
$$;

create trigger case_sections_guard_before_insert
  before insert on case_sections
  for each row execute function case_sections_before_insert();

-- Blocks moving a section to a different case or renaming its section_id;
-- ignores any client-supplied section_index unless the write is the
-- internal resequence call (app.resequencing = true).
create or replace function case_sections_before_update()
returns trigger
language plpgsql
as $$
begin
  if new.case_id is distinct from old.case_id then
    raise exception 'case_id cannot be changed on an existing section (section %)', old.id
      using errcode = '23514';
  end if;

  if new.section_id is distinct from old.section_id then
    raise exception 'section_id cannot be changed after creation; remove and re-add the section instead (section %)', old.id
      using errcode = '23514';
  end if;

  if coalesce(current_setting('app.resequencing', true), 'false') <> 'true' then
    new.section_index := old.section_index;
  end if;

  return new;
end;
$$;

create trigger case_sections_guard_before_update
  before update on case_sections
  for each row execute function case_sections_before_update();

-- Recomputes ordering for the affected case whenever a section is added or
-- removed.
create or replace function case_sections_after_write()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform resequence_case_sections(old.case_id);
    return old;
  else
    perform resequence_case_sections(new.case_id);
    return new;
  end if;
end;
$$;

create trigger case_sections_resequence
  after insert or delete on case_sections
  for each row execute function case_sections_after_write();

-- Published-case integrity for sections: the only sections a published case
-- can never lose are its decision section and whatever section
-- completion_section currently points at (both are required by
-- validate_case; every other section may be freely removed while published).
create or replace function case_sections_guard_before_delete()
returns trigger
language plpgsql
as $$
declare
  v_case cases%rowtype;
begin
  select * into v_case from cases where id = old.case_id;

  if v_case.status = 'published' then
    if old.section_id = 'decision' then
      raise exception 'cannot remove the decision section from a published case (case %); unpublish first', old.case_id
        using errcode = '23514';
    end if;
    if old.section_id = v_case.completion_section then
      raise exception 'cannot remove the completion_section (%) from a published case (case %); unpublish first',
        old.section_id, old.case_id
        using errcode = '23514';
    end if;
  end if;

  return old;
end;
$$;

create trigger case_sections_guard_delete
  before delete on case_sections
  for each row execute function case_sections_guard_before_delete();

-- ---------------------------------------------------------------------------
-- case_images: block moving an image to a different case
-- ---------------------------------------------------------------------------

create or replace function case_images_guard_before_update()
returns trigger
language plpgsql
as $$
begin
  if new.case_id is distinct from old.case_id then
    raise exception 'case_id cannot be changed on an existing image (image %)', old.id
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger case_images_guard_update
  before update on case_images
  for each row execute function case_images_guard_before_update();

-- ---------------------------------------------------------------------------
-- reorder_cases(): admin-only case reordering (docs/architecture.md §2, §4)
-- ---------------------------------------------------------------------------

create or replace function reorder_cases(p_case_ids uuid[])
returns void
language plpgsql
as $$
declare
  v_id uuid;
  v_idx integer := 1;
  v_total_cases integer;
  v_total_input integer;
begin
  if not is_admin() then
    raise exception 'only the admin may reorder cases' using errcode = '42501';
  end if;

  select count(*) into v_total_cases from cases;
  v_total_input := coalesce(array_length(p_case_ids, 1), 0);

  if v_total_input <> v_total_cases then
    raise exception 'reorder_cases requires every case id exactly once (got %, expected %)',
      v_total_input, v_total_cases
      using errcode = '22023';
  end if;

  if (select count(distinct x) from unnest(p_case_ids) as x) <> v_total_input then
    raise exception 'reorder_cases received duplicate case ids' using errcode = '22023';
  end if;

  foreach v_id in array p_case_ids loop
    update cases set display_position = v_idx where id = v_id;
    if not found then
      raise exception 'unknown case id % in reorder_cases', v_id using errcode = '22023';
    end if;
    v_idx := v_idx + 1;
  end loop;
end;
$$;

revoke all on function reorder_cases(uuid[]) from public;
grant execute on function reorder_cases(uuid[]) to authenticated;

comment on function reorder_cases(uuid[]) is
  'Admin-only. Rewrites display_position for every case in one transaction from the given ordered array, which must contain every existing case id exactly once.';

-- Deliberately no case deletion support (docs/architecture.md D8): no
-- DELETE trigger/policy is defined for `cases`.
