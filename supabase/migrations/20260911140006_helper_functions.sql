-- Reusable helper functions used by RLS policies, Storage policies, and triggers.

-- is_admin(): true if the calling user (auth.uid()) is in the admins allowlist.
-- SECURITY DEFINER + fixed search_path so it can read `admins` even though
-- that table has no SELECT policy for anon/authenticated (see RLS migration).
-- Granted to anon too: RLS policies below call is_admin() for every role,
-- and for anon (no auth.uid()) it simply evaluates to false.
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from admins where id = auth.uid()
  );
$$;

revoke all on function is_admin() from public;
grant execute on function is_admin() to anon, authenticated;

comment on function is_admin() is
  'True if the current request''s auth.uid() is in the admins allowlist. False for anon and for any authenticated user not in admins.';

-- can_read_case_image(object_name): true if a case_images row exists for
-- this Storage object path and its parent case is published. Used by the
-- storage.objects SELECT policy (see storage migration).
create or replace function can_read_case_image(object_name text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from case_images ci
    join cases c on c.id = ci.case_id
    where ci.storage_path = object_name
      and c.status = 'published'
  );
$$;

revoke all on function can_read_case_image(text) from public;
grant execute on function can_read_case_image(text) to anon, authenticated;

comment on function can_read_case_image(text) is
  'True if the given Storage object path belongs to a published case. Draft/unpublished images always return false here, regardless of role.';

-- touch_updated_at(): generic BEFORE UPDATE trigger to maintain updated_at.
create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- fixed_section_order(): the single source of truth for section ordering
-- (docs/architecture.md decision D1). Never reorder this array.
create or replace function fixed_section_order()
returns text[]
language sql
immutable
as $$
  select array[
    'overview', 'problem', 'evidence', 'insight', 'decision',
    'solution', 'experience', 'measure', 'reflection'
  ];
$$;
