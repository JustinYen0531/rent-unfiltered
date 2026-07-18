-- Bind saved AI outputs to the immutable XYZ event snapshot that produced them.

alter table public.ai_insights
  add column if not exists basis_event_id text,
  add column if not exists snapshot_hash text;

alter table public.strategy_sessions
  add column if not exists basis_event_id text,
  add column if not exists snapshot_hash text;

create index if not exists ai_insights_owner_snapshot_created_idx
  on public.ai_insights(owner_token, record_id, snapshot_hash, created_at desc);

create index if not exists strategy_sessions_owner_snapshot_created_idx
  on public.strategy_sessions(owner_token, record_id, snapshot_hash, created_at desc);
