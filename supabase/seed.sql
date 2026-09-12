-- LOCAL DEVELOPMENT ONLY.
-- Never run this against a real/production Supabase project — it creates a
-- fake Supabase Auth user with a throwaway password, purely so the schema,
-- RLS and triggers can be exercised locally (`supabase start` runs this
-- automatically) and by supabase/tests/database.test.sql.
--
-- No real email or UUID from any person is used here. The real admin row
-- for a production project is seeded manually — see supabase/README.md step 5.

-- Fake admin auth user. auth.users / auth.identities are already created by
-- the Supabase local dev template before this file runs.
--
-- The four token columns below (confirmation_token, recovery_token,
-- email_change_token_new, email_change) have no column default and are
-- left NULL by a minimal insert; GoTrue's Go client scans them as
-- non-nullable strings and a sign-in then fails with a 500 ("converting
-- NULL to string is unsupported"). Confirmed locally: signing in as this
-- seed user failed until these were explicitly set to ''.
insert into auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'local-admin@example.test',
  crypt('local-test-password-not-real', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  '', '', '', ''
)
on conflict (id) do nothing;

insert into admins (id) values ('00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Sample published case: overview, decision, reflection sections + hero image.
-- Inserted as draft, then published via UPDATE below, so the real publish
-- guard trigger (validate_case + first_published_at) actually runs.
-- ---------------------------------------------------------------------------

insert into cases (id, case_id, case_name, status, headline, summary, tags, completion_section)
values (
  '00000000-0000-0000-0000-0000000000a1',
  'sample-published-case',
  'Sample Published Case',
  'draft',
  'A sample headline for local testing',
  'A sample summary used on the homepage card.',
  array['Sample', 'Local'],
  'reflection'
)
on conflict (case_id) do nothing;

insert into case_sections (case_id, section_id, content)
values
  ('00000000-0000-0000-0000-0000000000a1', 'overview', '{"note": "sample overview"}'),
  ('00000000-0000-0000-0000-0000000000a1', 'decision', '{"note": "sample decision"}'),
  ('00000000-0000-0000-0000-0000000000a1', 'reflection', '{"note": "sample reflection"}')
on conflict (case_id, section_id) do nothing;

insert into case_images (id, case_id, storage_path, alt_text, mime_type)
values (
  '00000000-0000-0000-0000-0000000000b1',
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-0000000000a1/00000000-0000-0000-0000-0000000000b1.jpg',
  'Sample hero image',
  'image/jpeg'
)
on conflict (id) do nothing;

update cases
  set hero_image_id = '00000000-0000-0000-0000-0000000000b1'
  where id = '00000000-0000-0000-0000-0000000000a1'
    and hero_image_id is null;

update cases
  set status = 'published'
  where id = '00000000-0000-0000-0000-0000000000a1'
    and status = 'draft';

-- ---------------------------------------------------------------------------
-- Sample draft case: intentionally missing a decision section and a hero
-- image, so it cannot be published — exercises validate_case's failures.
-- ---------------------------------------------------------------------------

insert into cases (id, case_id, case_name, status, headline, summary)
values (
  '00000000-0000-0000-0000-0000000000a2',
  'sample-draft-case',
  'Sample Draft Case',
  'draft',
  'Draft headline',
  'Draft summary'
)
on conflict (case_id) do nothing;

insert into case_sections (case_id, section_id, content)
values ('00000000-0000-0000-0000-0000000000a2', 'overview', '{}')
on conflict (case_id, section_id) do nothing;
