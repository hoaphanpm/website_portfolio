-- pgTAP tests for Milestone 1 (docs/architecture.md §2, §3, §4).
--
-- NOT EXECUTED. I have not run these against a real Postgres/Supabase
-- instance (Docker is not installed in this environment) and make no claim
-- that they pass. Run them yourself after following supabase/README.md, and
-- read "Unverified assumptions" there before trusting the results.
--
-- Run with: supabase test db   (after `supabase start`, which applies the
-- migrations and supabase/seed.sql first).
--
-- Depends on the fixtures created by supabase/seed.sql:
--   admin user:      00000000-0000-0000-0000-000000000001
--   published case:  00000000-0000-0000-0000-0000000000a1 ('sample-published-case')
--   draft case:      00000000-0000-0000-0000-0000000000a2 ('sample-draft-case')

begin;
select plan(44);

-- ---------------------------------------------------------------------------
-- 1. RLS: anonymous visitor
-- ---------------------------------------------------------------------------
set local role anon;

select is(
  (select count(*)::int from cases where case_id = 'sample-published-case'),
  1,
  'anon can read a published case'
);

select is(
  (select count(*)::int from cases where case_id = 'sample-draft-case'),
  0,
  'anon cannot read a draft case'
);

select is(
  (select count(*)::int from case_sections cs join cases c on c.id = cs.case_id
     where c.case_id = 'sample-draft-case'),
  0,
  'anon cannot read sections of a draft case'
);

select is(
  (select count(*)::int from case_sections cs join cases c on c.id = cs.case_id
     where c.case_id = 'sample-published-case'),
  3,
  'anon can read sections of a published case'
);

-- throws_ok's 3-arg form is (sql, errcode, exact_error_message), not
-- (sql, errcode, description) — there is no description-only 3-arg
-- overload. Using the 2-arg form here checks only the SQLSTATE, which is
-- what these tests actually intend; pgTAP supplies its own description.
select throws_ok(
  $$ insert into cases (case_id, case_name) values ('anon-attempt', 'Anon Attempt') $$,
  '42501'
);

reset role;

-- An RLS-blocked UPDATE (no rows match the USING clause) affects 0 rows
-- rather than raising an error, so this is checked via row content, not
-- throws_ok.
select is(
  (select case_name from cases where case_id = 'sample-published-case'),
  'Sample Published Case',
  'anon UPDATE attempt affects 0 rows (RLS); case_name is unchanged'
);

-- ---------------------------------------------------------------------------
-- 2. RLS: authenticated admin
-- ---------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';

select is(
  (select count(*)::int from cases where case_id = 'sample-draft-case'),
  1,
  'admin can read a draft case'
);

select lives_ok(
  $$ update cases set case_name = 'Sample Draft Case (edited)' where case_id = 'sample-draft-case' $$,
  'admin can update a draft case'
);

select lives_ok(
  $$ insert into cases (case_id, case_name) values ('admin-new-case', 'Admin New Case') $$,
  'admin can insert a new case'
);

reset role;

-- ---------------------------------------------------------------------------
-- 3. RLS: authenticated but not in admins
-- ---------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000ff';
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000ff","role":"authenticated"}';

select is(
  (select count(*)::int from cases where case_id = 'sample-draft-case'),
  0,
  'a non-admin authenticated user cannot read a draft case'
);

reset role;

-- ---------------------------------------------------------------------------
-- 4. case_id / first_published_at immutability after first publish
-- ---------------------------------------------------------------------------
select throws_ok(
  $$ update cases set case_id = 'renamed' where id = '00000000-0000-0000-0000-0000000000a1' $$,
  '23514'
);

select throws_ok(
  $$ update cases set first_published_at = null where id = '00000000-0000-0000-0000-0000000000a1' $$,
  '23514'
);

-- ---------------------------------------------------------------------------
-- 5. section_index follows the fixed order, not insertion order
-- ---------------------------------------------------------------------------
select is(
  (select section_index from case_sections
     where case_id = '00000000-0000-0000-0000-0000000000a1' and section_id = 'overview'),
  1,
  'overview is section_index 1 in the published sample case'
);
select is(
  (select section_index from case_sections
     where case_id = '00000000-0000-0000-0000-0000000000a1' and section_id = 'decision'),
  2,
  'decision is section_index 2 (problem/evidence/insight are absent)'
);
select is(
  (select section_index from case_sections
     where case_id = '00000000-0000-0000-0000-0000000000a1' and section_id = 'reflection'),
  3,
  'reflection is section_index 3'
);

-- Add sections to the draft case out of fixed order: decision first, then
-- problem. problem must slot in ahead of decision once resequenced.
select lives_ok(
  $$ insert into case_sections (case_id, section_id, content)
     values ('00000000-0000-0000-0000-0000000000a2', 'decision', '{}') $$,
  'can add a decision section to the draft case'
);
select lives_ok(
  $$ insert into case_sections (case_id, section_id, content)
     values ('00000000-0000-0000-0000-0000000000a2', 'problem', '{}') $$,
  'can add a problem section after decision, out of fixed order'
);
select is(
  (select section_index from case_sections
     where case_id = '00000000-0000-0000-0000-0000000000a2' and section_id = 'problem'),
  2,
  'problem resequences to index 2 (fixed order), ahead of decision'
);
select is(
  (select section_index from case_sections
     where case_id = '00000000-0000-0000-0000-0000000000a2' and section_id = 'decision'),
  3,
  'decision resequences to index 3 once problem is inserted'
);

select lives_ok(
  $$ set constraints case_sections_case_index_key immediate $$,
  'section_index values are actually unique per case once resequencing settles (forces the deferred constraint check)'
);

-- ---------------------------------------------------------------------------
-- 6. duplicate section_id rejected
-- ---------------------------------------------------------------------------
select throws_ok(
  $$ insert into case_sections (case_id, section_id, content)
     values ('00000000-0000-0000-0000-0000000000a2', 'decision', '{}') $$,
  '23505'
);

-- ---------------------------------------------------------------------------
-- 7. publish validation
-- ---------------------------------------------------------------------------
select throws_ok(
  $$ update cases set status = 'published' where id = '00000000-0000-0000-0000-0000000000a2' $$,
  '23514'
);

-- ---------------------------------------------------------------------------
-- 8. published-integrity guard
-- ---------------------------------------------------------------------------
select throws_ok(
  $$ delete from case_sections
     where case_id = '00000000-0000-0000-0000-0000000000a1' and section_id = 'decision' $$,
  '23514'
);

-- ---------------------------------------------------------------------------
-- 9. reorder_cases (admin-only; is_admin() is checked inside the function
-- body, not just via RLS, so the admin role/claim must be set again here)
-- ---------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';

select lives_ok(
  $$ select reorder_cases(array(select id from cases order by display_position desc)) $$,
  'admin can call reorder_cases with every existing case id exactly once'
);

select throws_ok(
  $$ select reorder_cases(array[gen_random_uuid()]) $$,
  '22023'
);

reset role;

-- ---------------------------------------------------------------------------
-- 10. Case-study redesign milestone: optional artifact link
-- ---------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';

select throws_ok(
  $$ update cases set artifact_url = 'javascript:alert(1)' where id = '00000000-0000-0000-0000-0000000000a1' $$,
  '23514'
);

select lives_ok(
  $$ update cases set artifact_url = 'https://example.com/deck', artifact_label = 'View deck'
     where id = '00000000-0000-0000-0000-0000000000a1' $$,
  'admin can set a valid https artifact_url and label'
);

select is(
  (select artifact_url from cases where id = '00000000-0000-0000-0000-0000000000a1'),
  'https://example.com/deck',
  'artifact_url persisted'
);

select is(
  (select artifact_url from cases where id = '00000000-0000-0000-0000-0000000000a2'),
  null,
  'an existing case never touched by this milestone still has artifact_url = null'
);

-- ---------------------------------------------------------------------------
-- 11. Case-study redesign milestone: multiple ordered images per section
-- ---------------------------------------------------------------------------

select lives_ok(
  $$ insert into case_images (id, case_id, section_id, storage_path, alt_text, mime_type, display_order)
     values (
       '00000000-0000-0000-0000-0000000000c1',
       '00000000-0000-0000-0000-0000000000a1',
       (select id from case_sections where case_id = '00000000-0000-0000-0000-0000000000a1' and section_id = 'overview'),
       '00000000-0000-0000-0000-0000000000a1/c1.jpg', 'First section image', 'image/jpeg', 1
     ) $$,
  'admin can insert a section image for the overview section'
);

select lives_ok(
  $$ insert into case_images (id, case_id, section_id, storage_path, alt_text, mime_type, display_order)
     values (
       '00000000-0000-0000-0000-0000000000c2',
       '00000000-0000-0000-0000-0000000000a1',
       (select id from case_sections where case_id = '00000000-0000-0000-0000-0000000000a1' and section_id = 'overview'),
       '00000000-0000-0000-0000-0000000000a1/c2.jpg', 'Second section image', 'image/jpeg', 2
     ) $$,
  'admin can insert a second, ordered section image for the same section'
);

-- case_images_section_case_fk: a section_id from a DIFFERENT case than
-- case_id must be rejected (foreign_key_violation).
select throws_ok(
  $$ insert into case_images (id, case_id, section_id, storage_path, mime_type)
     values (
       '00000000-0000-0000-0000-0000000000c3',
       '00000000-0000-0000-0000-0000000000a1',
       (select id from case_sections where case_id = '00000000-0000-0000-0000-0000000000a2' and section_id = 'overview'),
       '00000000-0000-0000-0000-0000000000a1/c3.jpg', 'image/jpeg'
     ) $$,
  '23503'
);

select lives_ok(
  $$ select reorder_section_images(
       (select id from case_sections where case_id = '00000000-0000-0000-0000-0000000000a1' and section_id = 'overview'),
       array['00000000-0000-0000-0000-0000000000c2'::uuid, '00000000-0000-0000-0000-0000000000c1'::uuid]
     ) $$,
  'admin can reorder this section''s images'
);

select is(
  (select display_order from case_images where id = '00000000-0000-0000-0000-0000000000c2'),
  1,
  'c2 is display_order 1 after reorder'
);

select is(
  (select display_order from case_images where id = '00000000-0000-0000-0000-0000000000c1'),
  2,
  'c1 is display_order 2 after reorder'
);

-- Mirrors reorder_cases: must contain every image in the section exactly
-- once, not a subset.
select throws_ok(
  $$ select reorder_section_images(
       (select id from case_sections where case_id = '00000000-0000-0000-0000-0000000000a1' and section_id = 'overview'),
       array['00000000-0000-0000-0000-0000000000c1'::uuid]
     ) $$,
  '22023'
);

-- validate_case: a non-decorative image with empty alt_text blocks
-- (re-)publish; a decorative image with null alt_text does not.
select lives_ok(
  $$ update case_images set alt_text = '' where id = '00000000-0000-0000-0000-0000000000c1' $$,
  'can clear alt_text on a section image'
);

select throws_ok(
  $$ update cases set headline = headline where id = '00000000-0000-0000-0000-0000000000a1' $$,
  '23514'
);

select lives_ok(
  $$ update case_images set alt_text = 'First section image (restored)'
     where id = '00000000-0000-0000-0000-0000000000c1' $$,
  'restoring alt_text fixes the section image'
);

select lives_ok(
  $$ update cases set headline = headline where id = '00000000-0000-0000-0000-0000000000a1' $$,
  'the case is publishable again once every non-decorative image has alt_text'
);

select lives_ok(
  $$ insert into case_images (id, case_id, section_id, storage_path, alt_text, mime_type, is_decorative, display_order)
     values (
       '00000000-0000-0000-0000-0000000000c4',
       '00000000-0000-0000-0000-0000000000a1',
       (select id from case_sections where case_id = '00000000-0000-0000-0000-0000000000a1' and section_id = 'overview'),
       '00000000-0000-0000-0000-0000000000a1/c4.jpg', null, 'image/jpeg', true, 3
     ) $$,
  'a decorative image can be inserted with null alt_text'
);

select lives_ok(
  $$ update cases set headline = headline where id = '00000000-0000-0000-0000-0000000000a1' $$,
  'a decorative image with null alt_text does not block publish validity'
);

-- Backward compatibility: the existing hero image (case-level, no
-- section_id) is completely unaffected by any of the above.
select is(
  (select section_id from case_images where id = '00000000-0000-0000-0000-0000000000b1'),
  null,
  'the pre-existing hero image still has section_id = null (unaffected)'
);

select is(
  (select count(*)::int from case_images
     where section_id = (select id from case_sections where case_id = '00000000-0000-0000-0000-0000000000a1' and section_id = 'reflection')),
  0,
  'a section with no images (reflection) still has zero case_images rows — imageless sections keep working'
);

reset role;

select * from finish();
rollback;
