-- Persist personalized strategy generations separately from objective RHIR,
-- RRI and AI Insight records. Each generation is an immutable session; only
-- its follow-up consultation messages and updated_at may be updated.

create table if not exists public.strategy_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_token uuid not null,
  record_id text not null,
  version_id text not null,
  ai_insight_id uuid references public.ai_insights(id) on delete set null,
  prompt_version text not null default 'personal-strategy-v1',
  strategy_profile jsonb not null check (jsonb_typeof(strategy_profile) = 'object'),
  rri_snapshot jsonb not null check (jsonb_typeof(rri_snapshot) = 'object'),
  evidence_context jsonb not null check (jsonb_typeof(evidence_context) = 'object'),
  insight_snapshot jsonb check (
    insight_snapshot is null or jsonb_typeof(insight_snapshot) = 'object'
  ),
  strategy_result jsonb not null check (jsonb_typeof(strategy_result) = 'object'),
  strategy_trace jsonb not null default '[]'::jsonb check (
    jsonb_typeof(strategy_trace) = 'array'
  ),
  consultation_messages jsonb not null default '[]'::jsonb check (
    jsonb_typeof(consultation_messages) = 'array'
  ),
  status text not null default 'completed' check (status in ('draft', 'completed')),
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists strategy_sessions_owner_record_version_created_idx
  on public.strategy_sessions(owner_token, record_id, version_id, created_at desc);
create index if not exists strategy_sessions_ai_insight_id_idx
  on public.strategy_sessions(ai_insight_id);

alter table public.strategy_sessions enable row level security;

drop policy if exists "read own anonymous strategies" on public.strategy_sessions;
create policy "read own anonymous strategies"
  on public.strategy_sessions
  for select
  to anon, authenticated
  using (
    owner_token = nullif(
      (select current_setting('request.headers', true))::jsonb ->> 'x-ru-insight-token',
      ''
    )::uuid
  );

drop policy if exists "insert own anonymous strategies" on public.strategy_sessions;
create policy "insert own anonymous strategies"
  on public.strategy_sessions
  for insert
  to anon, authenticated
  with check (
    owner_token = nullif(
      (select current_setting('request.headers', true))::jsonb ->> 'x-ru-insight-token',
      ''
    )::uuid
  );

drop policy if exists "update own anonymous strategy messages" on public.strategy_sessions;
create policy "update own anonymous strategy messages"
  on public.strategy_sessions
  for update
  to anon, authenticated
  using (
    owner_token = nullif(
      (select current_setting('request.headers', true))::jsonb ->> 'x-ru-insight-token',
      ''
    )::uuid
  )
  with check (
    owner_token = nullif(
      (select current_setting('request.headers', true))::jsonb ->> 'x-ru-insight-token',
      ''
    )::uuid
  );

revoke all on table public.strategy_sessions from anon, authenticated;
grant select, insert on table public.strategy_sessions to anon, authenticated;
grant update (consultation_messages, updated_at)
  on table public.strategy_sessions to anon, authenticated;
