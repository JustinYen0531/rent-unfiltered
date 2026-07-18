-- Persist manually saved AI Insight results without exposing one browser's
-- records to another anonymous browser. Replace owner_token with auth.uid()
-- ownership when Supabase Auth is introduced.

create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  owner_token uuid not null,
  record_id text not null,
  version_id text not null,
  prompt_version text not null default 'evidence-context-v1',
  rri_snapshot jsonb not null check (jsonb_typeof(rri_snapshot) = 'object'),
  evidence_context jsonb not null check (jsonb_typeof(evidence_context) = 'object'),
  insight_result jsonb not null check (jsonb_typeof(insight_result) = 'object'),
  model text,
  created_at timestamptz not null default now()
);

create index if not exists ai_insights_owner_record_version_created_idx
  on public.ai_insights(owner_token, record_id, version_id, created_at desc);

alter table public.ai_insights enable row level security;

drop policy if exists "read own anonymous insights" on public.ai_insights;
create policy "read own anonymous insights"
  on public.ai_insights
  for select
    to anon, authenticated
    using (
      owner_token = (
        select nullif(
          current_setting('request.headers', true)::jsonb ->> 'x-ru-insight-token',
          ''
        )::uuid
      )
    );

drop policy if exists "insert own anonymous insights" on public.ai_insights;
create policy "insert own anonymous insights"
  on public.ai_insights
  for insert
    to anon, authenticated
    with check (
      owner_token = (
        select nullif(
          current_setting('request.headers', true)::jsonb ->> 'x-ru-insight-token',
          ''
        )::uuid
      )
    );

revoke all on table public.ai_insights from anon, authenticated;
grant select, insert on table public.ai_insights to anon, authenticated;
