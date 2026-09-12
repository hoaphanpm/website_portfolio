-- Row Level Security for all case-study tables.
-- docs/architecture.md §3. RLS is enabled on every table; anything not
-- explicitly granted by a policy below is denied.

alter table admins enable row level security;
alter table cases enable row level security;
alter table case_sections enable row level security;
alter table case_images enable row level security;

-- admins: intentionally zero policies -> default-deny for anon and
-- authenticated. Only the SECURITY DEFINER functions is_admin() and
-- can_read_case_image() can see inside this table.

-- ---------------------------------------------------------------------------
-- cases
-- ---------------------------------------------------------------------------

create policy cases_select on cases
  for select
  to anon, authenticated
  using (status = 'published' or is_admin());

create policy cases_insert on cases
  for insert
  to authenticated
  with check (is_admin());

create policy cases_update on cases
  for update
  to authenticated
  using (is_admin())
  with check (is_admin());

-- No delete policy: case deletion is out of scope for the MVP (D8).

-- ---------------------------------------------------------------------------
-- case_sections
-- ---------------------------------------------------------------------------

create policy case_sections_select on case_sections
  for select
  to anon, authenticated
  using (
    is_admin() or exists (
      select 1 from cases c where c.id = case_sections.case_id and c.status = 'published'
    )
  );

create policy case_sections_insert on case_sections
  for insert
  to authenticated
  with check (is_admin());

create policy case_sections_update on case_sections
  for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy case_sections_delete on case_sections
  for delete
  to authenticated
  using (is_admin());

-- ---------------------------------------------------------------------------
-- case_images
-- ---------------------------------------------------------------------------

create policy case_images_select on case_images
  for select
  to anon, authenticated
  using (
    is_admin() or exists (
      select 1 from cases c where c.id = case_images.case_id and c.status = 'published'
    )
  );

create policy case_images_insert on case_images
  for insert
  to authenticated
  with check (is_admin());

create policy case_images_update on case_images
  for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy case_images_delete on case_images
  for delete
  to authenticated
  using (is_admin());
