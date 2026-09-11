This is a full-stack portfolio app requiring persistent storage. Use Supabase/Postgres, not static files or hardcoded case-study content.
SELF-SERVICE ADMIN
Build a protected `/admin` interface where one authenticated admin can:
- create and edit case studies
- save cases as `draft`
- publish and unpublish cases
- upload and manage case-study images
- reorder case studies using drag-and-drop
- preview draft content without tracking
- manage case studies without editing code
Each case has `status = draft | published`.
Only published cases are publicly visible. Public queries must never return draft cases.
CASE CONFIGURATION
Each case contains:
- case_id
- case_name
- status
- display_position
- sections[]
- completion_section
Generate `case_id` as a slug when the case is created.
Before first publish, the admin may edit `case_id`. After the case has been published once, `case_id` becomes immutable even if the case is later unpublished. Editing `case_name` remains allowed.
Store `display_position` in the database and update it when the admin reorders cases.
When adding a section, the admin must select `section_id` from a fixed dropdown containing exactly:
- overview
- problem
- evidence
- insight
- decision
- solution
- experience
- measure
- reflection
Never allow free-text `section_id` input.
Each `section_id` may appear only once within a case.
Before publishing, validate that:
- case_id and case_name are present
- case_id is unique
- headline and summary are present
- tags is a valid array
- hero_image references an existing managed image
- the case contains at least one section
- the case contains a decision section
- completion_section references an existing section
- there are no duplicate section IDs
- every section_id belongs to the fixed allowed list
Block publishing and show a clear validation error if any rule fails.
DESIGN-TO-DATA MAPPING
The design reference contains a Case Hero followed by up to nine
standardized content sections.
Case Hero is page-level content and is not part of sections[].
Therefore:
- never create a hero section_id
- Case Hero must not fire case_section_viewed
- section_index starts at 1 for the first item in sections[]
- visual navigation numbering must not change analytics section_index
In addition to the existing case configuration, each case must contain:
- headline
- summary
- tags[]
- hero_image
Use these fields as follows:
- case_name: case/project name
- headline: primary Case Hero headline
- summary: short description used in homepage listings
- tags[]: displayed on the homepage card and Case Hero
- hero_image: database-backed reference to a managed case-study image
At a Glance maps to the overview section and must not be stored as a
separate standardized section.
The design image shows the complete template, but a case is not required
to contain all nine standardized sections. Render and display navigation
only for sections that exist. The decision section remains mandatory for
publishing.
HOMEPAGE SCOPE
For the MVP:
- Selected Work must be populated dynamically from published database cases
- do not hardcode a limit of two cases
- order cases by display_position
- Hero, How I Think, About/Journey, Writing and Contact are outside the
  case-study CMS scope and may use centralized static site configuration
- publishing a new case must not require a homepage code change
PUBLIC WEBSITE
Use one reusable dynamic case-study route and renderer. Do not create a separate page component for every case.
The public homepage and case-study pages must read published case data from the database.
A newly published case must automatically:
- become available at its public URL
- be available for homepage listing
- use the reusable case-study renderer
- use the existing Mixpanel event schema
- require no code change
MIXPANEL
Use exactly these 5 events:
- portfolio_viewed
- case_study_opened
- case_section_viewed
- case_study_completed
- high_intent_action
Do not create any additional events.
All Mixpanel calls must go through one centralized Analytics Service. UI components must never call mixpanel.track() directly.
Analytics Service must automatically attach device_type to all five events.
entry_source must use one centralized allowed-value list containing exactly:
- homepage
- next_case
- direct_or_external
UI components must not create arbitrary entry_source values.
Do not initialize or send Mixpanel events when:
- an authenticated admin session is present
- the URL contains `?preview=true`
- the app is running locally
- the deployment is not the production environment
The case-related events:
- case_study_opened
- case_section_viewed
- case_study_completed
may fire only when the case has `status = published`.
portfolio_viewed and high_intent_action may fire on the public website for non-admin visitors. For a high-intent action outside a case context, use `case_id = null`.
At render time, the Analytics Service must receive the current:
- case_id
- case_name
- status
- sections[]
- completion_section
- display_position
from database-backed page data. Never hardcode these values per case.
Capture display_position in `case_study_opened` at the moment the event fires. Historical events must retain their original position value.
CASE SECTION VIEWING
case_section_viewed fires only when at least 50% of the section remains visible for at least 2 continuous seconds.
Implement this using:
- IntersectionObserver
- a 2000ms timer
- Page Visibility API
- timer cancellation when visibility falls below 50%
- timer cancellation or pause when the tab becomes hidden
- in-memory Set plus sessionStorage deduplication
The deduplication key must combine `case_id + section_id`.
Refreshing or revisiting the page in the same browser session must not fire the same section event again. A new browser session may track it again.
UTM ATTRIBUTION
When a landing URL contains UTM parameters:
- store current-session UTM values in sessionStorage
- register them as Mixpanel super properties so subsequent events in the session receive them
- use mixpanel.people.set_once() for first-touch UTM on the persistent anonymous profile
- never overwrite first-touch user properties with later UTM values
Analytics Service must:
- read landing UTM values from the URL
- store them in sessionStorage
- register them as Mixpanel super properties only after analytics
  initialization is allowed
- never require UI components to pass or merge UTM properties
- continue to use mixpanel.people.set_once() for first-touch UTM
DATABASE SECURITY
Enforce authorization at the database/API level:
- anonymous users can read only published cases
- only the authenticated admin can create, edit, reorder, publish or unpublish cases
- configure Supabase Row Level Security
- never expose the Supabase service-role key or server secrets in client-side code
Before implementing, provide:
1. proposed architecture
2. database schema
3. Supabase RLS policy design
4. admin publishing workflow
5. dynamic public routing
6. Mixpanel implementation mapping
7. implementation milestones
Do not write code until I approve the architecture.

