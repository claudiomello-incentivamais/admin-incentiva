-- Contract for the append-only dispatch trail consumed by the Portal.
-- Current-state columns such as status_email, status_whatsapp, status_linkedin,
-- "Disparo Mensagem" and step remain operational fields for last touch only.
-- Historical channel cards must read from this append-only source.

create table if not exists public.portal_dispatch_events (
  id uuid primary key default gen_random_uuid(),
  operation_name text not null,
  page_id text null,
  lead_key text null,
  nome text null,
  empresa text null,
  channel text not null check (channel in ('email', 'whatsapp', 'linkedin')),
  idempotency_key text null,
  event_type text not null,
  workflow_name text null,
  execution_id text null,
  provider_message_id text null,
  event_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists portal_dispatch_events_operation_idx
  on public.portal_dispatch_events (operation_name, event_at desc);

create index if not exists portal_dispatch_events_channel_idx
  on public.portal_dispatch_events (channel, event_at desc);

create index if not exists portal_dispatch_events_page_idx
  on public.portal_dispatch_events (page_id);

create index if not exists portal_dispatch_events_lead_idx
  on public.portal_dispatch_events (lead_key);

create unique index if not exists portal_dispatch_events_idempotency_idx
  on public.portal_dispatch_events (idempotency_key)
  where idempotency_key is not null;

create or replace view public.portal_dispatch_events_v1 as
with ranked as (
  select
    operation_name,
    page_id,
    coalesce(lead_key, page_id) as lead_key,
    nome,
    empresa,
    channel,
    idempotency_key,
    event_type,
    workflow_name,
    execution_id,
    provider_message_id,
    event_at,
    metadata,
    row_number() over (
      partition by
        operation_name,
        coalesce(page_id, ''),
        coalesce(nome, ''),
        coalesce(empresa, ''),
        channel,
        event_type,
        event_at,
        coalesce(metadata->>'branch', '')
      order by created_at desc, id desc
    ) as dedupe_rank
  from public.portal_dispatch_events
)
select
  operation_name,
  page_id,
  lead_key,
  nome,
  empresa,
  channel,
  idempotency_key,
  event_type,
  workflow_name,
  execution_id,
  provider_message_id,
  event_at,
  metadata
from ranked
where coalesce(metadata->>'branch', '') <> 'manual_backfill_operacional'
   or dedupe_rank = 1;

create or replace function public.portal_dispatch_event_ingest_v1(
  p_operation_name text,
  p_page_id text default null,
  p_lead_key text default null,
  p_nome text default null,
  p_empresa text default null,
  p_channel text default null,
  p_idempotency_key text default null,
  p_event_type text default null,
  p_workflow_name text default null,
  p_execution_id text default null,
  p_provider_message_id text default null,
  p_event_at timestamptz default now(),
  p_metadata jsonb default '{}'::jsonb
) returns public.portal_dispatch_events
language plpgsql
security definer
as $$
declare
  inserted_row public.portal_dispatch_events;
begin
  if p_channel not in ('email', 'whatsapp', 'linkedin') then
    raise exception 'invalid channel: %', p_channel;
  end if;

  if p_event_type is null or btrim(p_event_type) = '' then
    raise exception 'event_type is required';
  end if;

  insert into public.portal_dispatch_events (
    operation_name,
    page_id,
    lead_key,
    nome,
    empresa,
    channel,
    idempotency_key,
    event_type,
    workflow_name,
    execution_id,
    provider_message_id,
    event_at,
    metadata
  )
  values (
    p_operation_name,
    p_page_id,
    p_lead_key,
    p_nome,
    p_empresa,
    p_channel,
    p_idempotency_key,
    p_event_type,
    p_workflow_name,
    p_execution_id,
    p_provider_message_id,
    coalesce(p_event_at, now()),
    coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (idempotency_key) where idempotency_key is not null
  do update set
    operation_name = excluded.operation_name,
    page_id = excluded.page_id,
    lead_key = excluded.lead_key,
    nome = excluded.nome,
    empresa = excluded.empresa,
    channel = excluded.channel,
    event_type = excluded.event_type,
    workflow_name = excluded.workflow_name,
    execution_id = excluded.execution_id,
    provider_message_id = excluded.provider_message_id,
    event_at = excluded.event_at,
    metadata = excluded.metadata
  returning * into inserted_row;

  return inserted_row;
end;
$$;

comment on table public.portal_dispatch_events is
  'Append-only dispatch/tentative events by channel for Portal historical analytics.';

comment on view public.portal_dispatch_events_v1 is
  'Projection consumed by the Portal channel cards and analytics loaders.';

comment on function public.portal_dispatch_event_ingest_v1 is
  'Idempotent ingestion helper for n8n workflows to append one dispatch-attempt event per channel.';
