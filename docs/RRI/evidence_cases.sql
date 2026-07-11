-- Rent Unfiltered: internal evidence case library (Phase 1)
-- Run this file in Supabase SQL Editor.
-- This version stores structured case records only. Embeddings are intentionally deferred.

create table if not exists public.evidence_cases (
  id text primary key,
  source_type text not null check (source_type in ('gov', 'court', 'research', 'social', 'interview')),
  source_name text not null,
  source_url text not null,
  title text not null,
  year integer,
  keywords text[] not null default '{}',
  rhir_fields text[] not null default '{}',
  risk_types text[] not null default '{}',
  summary text not null,
  common_outcome text not null,
  legal_basis text[] not null default '{}',
  action_hints text[] not null default '{}',
  evidence_to_keep text[] not null default '{}',
  confidence text not null default 'medium' check (confidence in ('high', 'medium', 'low')),
  review_status text not null default 'draft' check (review_status in ('draft', 'verified', 'revise', 'rejected', 'archived')),
  review_notes text,
  reviewed_at timestamptz,
  reviewed_by text,
  notes text,
  case_record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence_mappings (
  id uuid primary key default gen_random_uuid(),
  case_id text not null references public.evidence_cases(id) on delete cascade,
  rhir_field text not null,
  disclosure_status text not null check (disclosure_status in ('missing', 'disclosed', 'conflict', 'unknown')),
  risk_type text not null,
  mapping_note text,
  created_at timestamptz not null default now(),
  unique (case_id, rhir_field, disclosure_status, risk_type)
);

create index if not exists evidence_cases_source_type_idx on public.evidence_cases(source_type);
create index if not exists evidence_cases_review_status_idx on public.evidence_cases(review_status);
create index if not exists evidence_cases_year_idx on public.evidence_cases(year);
create index if not exists evidence_cases_keywords_idx on public.evidence_cases using gin(keywords);
create index if not exists evidence_cases_rhir_fields_idx on public.evidence_cases using gin(rhir_fields);
create index if not exists evidence_cases_risk_types_idx on public.evidence_cases using gin(risk_types);
create index if not exists evidence_mappings_lookup_idx
  on public.evidence_mappings(rhir_field, disclosure_status, risk_type);

alter table public.evidence_cases enable row level security;
alter table public.evidence_mappings enable row level security;

-- Prototype read policies: the current frontend has no login flow yet.
-- Do not add public insert/update policies until Supabase Auth is introduced.
drop policy if exists "prototype read evidence cases" on public.evidence_cases;
create policy "prototype read evidence cases"
  on public.evidence_cases for select using (true);

drop policy if exists "prototype read evidence mappings" on public.evidence_mappings;
create policy "prototype read evidence mappings"
  on public.evidence_mappings for select using (true);

-- Prototype review policy for the current no-login team workflow.
-- Run the migration file separately when upgrading an existing table.
drop policy if exists "prototype review evidence cases" on public.evidence_cases;
create policy "prototype review evidence cases"
  on public.evidence_cases for update
  using (true)
  with check (review_status in ('draft', 'verified', 'revise', 'rejected', 'archived'));
grant update (review_status, review_notes, reviewed_at, reviewed_by)
  on table public.evidence_cases to anon;

notify pgrst, 'reload schema';
