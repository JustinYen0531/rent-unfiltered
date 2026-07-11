-- Run once after docs/RRI/evidence_cases.sql.
-- Prototype review controls for the current no-login team workflow.
-- Before public release, replace this policy with Supabase Auth-based RLS.

alter table public.evidence_cases
  drop constraint if exists evidence_cases_review_status_check;

alter table public.evidence_cases
  add constraint evidence_cases_review_status_check
  check (review_status in ('draft', 'verified', 'revise', 'rejected', 'archived'));

alter table public.evidence_cases
  add column if not exists review_notes text;

alter table public.evidence_cases
  add column if not exists reviewed_at timestamptz;

alter table public.evidence_cases
  add column if not exists reviewed_by text;

alter table public.evidence_cases enable row level security;

drop policy if exists "prototype review evidence cases" on public.evidence_cases;
create policy "prototype review evidence cases"
  on public.evidence_cases for update
  using (true)
  with check (review_status in ('draft', 'verified', 'revise', 'rejected', 'archived'));

grant update (review_status, review_notes, reviewed_at, reviewed_by)
  on table public.evidence_cases to anon;

-- Ask PostgREST to reload the new columns immediately.
notify pgrst, 'reload schema';
