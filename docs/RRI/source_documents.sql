-- Private source-document storage for the current anonymous-device ownership
-- model. Auth migration is intentionally out of scope for this iteration.

create table if not exists public.source_documents (
  id uuid primary key default gen_random_uuid(),
  owner_token uuid not null,
  record_id text not null,
  event_id text,
  storage_path text not null unique,
  original_filename text not null,
  mime_type text not null check (
    mime_type in ('application/pdf', 'image/jpeg', 'image/png')
  ),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 20971520),
  checksum text not null,
  version integer not null default 1 check (version > 0),
  processing_status text not null default 'uploaded' check (
    processing_status in ('uploaded', 'parsing', 'needs_paid_ocr', 'parsed', 'failed')
  ),
  review_status text not null default 'pending' check (
    review_status in ('pending', 'in_review', 'confirmed')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists source_documents_owner_record_created_idx
  on public.source_documents(owner_token, record_id, created_at desc);

create table if not exists public.document_extractions (
  id uuid primary key default gen_random_uuid(),
  owner_token uuid not null,
  document_id uuid not null references public.source_documents(id) on delete cascade,
  engine text not null check (engine in ('cloudflare-ai', 'mistral-ocr', 'image-native')),
  parser_hash text,
  extracted_text text,
  candidates jsonb not null default '[]'::jsonb check (jsonb_typeof(candidates) = 'array'),
  file_annotations jsonb not null default '[]'::jsonb check (jsonb_typeof(file_annotations) = 'array'),
  status text not null default 'pending' check (
    status in ('pending', 'parsed', 'needs_paid_ocr', 'failed', 'reviewed')
  ),
  paid_ocr boolean not null default false,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists document_extractions_owner_document_created_idx
  on public.document_extractions(owner_token, document_id, created_at desc);
create index if not exists document_extractions_document_id_idx
  on public.document_extractions(document_id);

alter table public.source_documents enable row level security;
alter table public.document_extractions enable row level security;

drop policy if exists "read own source documents" on public.source_documents;
create policy "read own source documents"
  on public.source_documents for select to anon, authenticated
  using (
    owner_token = nullif(
      (select current_setting('request.headers', true))::jsonb ->> 'x-ru-insight-token',
      ''
    )::uuid
  );

drop policy if exists "insert own source documents" on public.source_documents;
create policy "insert own source documents"
  on public.source_documents for insert to anon, authenticated
  with check (
    owner_token = nullif(
      (select current_setting('request.headers', true))::jsonb ->> 'x-ru-insight-token',
      ''
    )::uuid
  );

drop policy if exists "update own source documents" on public.source_documents;
create policy "update own source documents"
  on public.source_documents for update to anon, authenticated
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

drop policy if exists "read own document extractions" on public.document_extractions;
create policy "read own document extractions"
  on public.document_extractions for select to anon, authenticated
  using (
    owner_token = nullif(
      (select current_setting('request.headers', true))::jsonb ->> 'x-ru-insight-token',
      ''
    )::uuid
  );

drop policy if exists "insert own document extractions" on public.document_extractions;
create policy "insert own document extractions"
  on public.document_extractions for insert to anon, authenticated
  with check (
    owner_token = nullif(
      (select current_setting('request.headers', true))::jsonb ->> 'x-ru-insight-token',
      ''
    )::uuid
  );

drop policy if exists "update own document extractions" on public.document_extractions;
create policy "update own document extractions"
  on public.document_extractions for update to anon, authenticated
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

revoke all on table public.source_documents from anon, authenticated;
grant select, insert on table public.source_documents to anon, authenticated;
grant update (
  event_id, processing_status, review_status, updated_at
) on table public.source_documents to anon, authenticated;

revoke all on table public.document_extractions from anon, authenticated;
grant select, insert on table public.document_extractions to anon, authenticated;
grant update (
  candidates, status, failure_reason, updated_at
) on table public.document_extractions to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'rental-source-documents',
  'rental-source-documents',
  false,
  20971520,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "upload own rental source documents" on storage.objects;
create policy "upload own rental source documents"
  on storage.objects for insert to anon, authenticated
  with check (
    bucket_id = 'rental-source-documents'
    and (storage.foldername(name))[1] = (
      nullif(
        (select current_setting('request.headers', true))::jsonb ->> 'x-ru-insight-token',
        ''
      )
    )
  );

drop policy if exists "read own rental source documents" on storage.objects;
create policy "read own rental source documents"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'rental-source-documents'
    and (storage.foldername(name))[1] = (
      nullif(
        (select current_setting('request.headers', true))::jsonb ->> 'x-ru-insight-token',
        ''
      )
    )
  );
