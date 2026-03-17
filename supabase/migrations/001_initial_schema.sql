-- ============================================================
-- AIOX Studio — Initial Schema
-- Migration: 001_initial_schema
-- Author: @data-engineer (Dara)
-- Date: 2026-03-17
-- Description: Core tables for AIOX Studio MVP (M1 sprint)
--   - chat_sessions / chat_messages  → Chat com IA por espaço
--   - session_checkins               → Check-in de sessão do Jordy
--   - usage_events                   → Padrões de uso (agentes, tópicos)
--   - sentinel_checks                → Sentinela de versões AIOX upstream
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- HELPER: single_user_id()
-- Returns the only allowed user UUID from app.settings.
-- Avoids hardcoding the UUID in every RLS policy.
-- ============================================================
create or replace function public.single_user_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('app.user_id', true), '')::uuid;
$$;

-- ============================================================
-- TABLE: chat_sessions
-- Agrupa mensagens em conversas por espaço (workspace).
-- Um espaço = "Framework" ou "Direcionador" (ou qualquer string
-- futura). Cada sessão tem um título gerado pela IA no primeiro
-- turno e timestamps de criação e último uso.
-- ============================================================
create table public.chat_sessions (
  id           uuid        primary key default uuid_generate_v4(),
  user_id      uuid        not null default single_user_id(),
  space        text        not null check (space <> ''),
  title        text        not null default 'Nova conversa',
  model        text        not null default 'llama-3.3-70b-versatile',
  message_count integer    not null default 0,
  last_used_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  archived_at  timestamptz                          -- soft delete
);

comment on table  public.chat_sessions               is 'Conversas abertas por espaço (Framework, Direcionador, etc).';
comment on column public.chat_sessions.space         is 'Identificador do espaço: "framework" | "direcionador" | custom.';
comment on column public.chat_sessions.model         is 'Modelo Groq usado nesta sessão — gravado para referência histórica.';
comment on column public.chat_sessions.message_count is 'Contador desnormalizado — atualizado por trigger para evitar COUNT(*) frequente.';
comment on column public.chat_sessions.archived_at   is 'Preenchido em soft-delete. NULL = sessão ativa.';

create index idx_chat_sessions_user_space_last
  on public.chat_sessions (user_id, space, last_used_at desc)
  where archived_at is null;

-- ============================================================
-- TABLE: chat_messages
-- Mensagens individuais de cada sessão. role = "user" | "assistant".
-- token_count é opcional — preenchido quando a API Groq retorna
-- usage.total_tokens (útil para controle de custo futuro).
-- ============================================================
create table public.chat_messages (
  id           uuid        primary key default uuid_generate_v4(),
  session_id   uuid        not null references public.chat_sessions (id) on delete cascade,
  user_id      uuid        not null default single_user_id(),
  role         text        not null check (role in ('user', 'assistant', 'system')),
  content      text        not null check (content <> ''),
  token_count  integer,                             -- nullable: nem sempre disponível
  created_at   timestamptz not null default now()
);

comment on table  public.chat_messages             is 'Histórico de mensagens de cada sessão de chat.';
comment on column public.chat_messages.role        is '"user" | "assistant" | "system".';
comment on column public.chat_messages.token_count is 'Total de tokens desta mensagem (usage da API Groq). Opcional.';

create index idx_chat_messages_session_created
  on public.chat_messages (session_id, created_at asc);

create index idx_chat_messages_user_created
  on public.chat_messages (user_id, created_at desc);

-- ============================================================
-- TRIGGER: atualiza chat_sessions.message_count e last_used_at
-- Desnormalização controlada — evita subqueries caras na UI.
-- ============================================================
create or replace function public.fn_update_session_stats()
returns trigger
language plpgsql
security definer
as $$
begin
  if TG_OP = 'INSERT' then
    update public.chat_sessions
    set
      message_count = message_count + 1,
      last_used_at  = new.created_at
    where id = new.session_id;
  elsif TG_OP = 'DELETE' then
    update public.chat_sessions
    set message_count = greatest(message_count - 1, 0)
    where id = old.session_id;
  end if;
  return null;
end;
$$;

create trigger trg_chat_messages_stats
  after insert or delete on public.chat_messages
  for each row execute function public.fn_update_session_stats();

-- ============================================================
-- TABLE: session_checkins
-- Estado do Jordy no início de cada sessão de trabalho.
-- Três campos obrigatórios: energia (1-5), foco (1-5),
-- contexto_externo (texto livre). Persiste histórico completo
-- para análise de padrões futura.
-- ============================================================
create table public.session_checkins (
  id               uuid        primary key default uuid_generate_v4(),
  user_id          uuid        not null default single_user_id(),
  energy_level     smallint    not null check (energy_level between 1 and 5),
  focus_level      smallint    not null check (focus_level between 1 and 5),
  external_context text        not null default '',  -- pode ser vazio
  notes            text,                             -- anotação livre opcional
  session_date     date        not null default current_date,
  created_at       timestamptz not null default now()
);

comment on table  public.session_checkins                  is 'Check-in diário do Jordy: energia, foco, contexto externo.';
comment on column public.session_checkins.energy_level     is 'Nível de energia subjetivo: 1 (esgotado) → 5 (ótimo).';
comment on column public.session_checkins.focus_level      is 'Nível de foco subjetivo: 1 (disperso) → 5 (estado de flow).';
comment on column public.session_checkins.external_context is 'Contexto externo: eventos, pressões, mood geral.';
comment on column public.session_checkins.session_date     is 'Data do check-in (pode diferir de created_at por fuso).';

create index idx_session_checkins_user_date
  on public.session_checkins (user_id, session_date desc);

-- ============================================================
-- TABLE: usage_events
-- Registro granular de interações para análise de padrões.
-- Cada evento = um turno de chat ou ação significativa.
-- Evita JOIN com chat_messages para analytics — desnormaliza
-- intencionalmente agent_slug e topic_slug.
-- ============================================================
create table public.usage_events (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null default single_user_id(),
  event_type  text        not null check (event_type in (
                'chat_turn',       -- mensagem enviada pelo usuário
                'session_start',   -- abertura de sessão de chat
                'checkin',         -- check-in realizado
                'sentinel_run'     -- verificação do sentinela
              )),
  space       text,                -- espaço relacionado (se aplicável)
  agent_slug  text,                -- ex: "dev", "architect", "qa"
  topic_slug  text,                -- tag inferida do conteúdo (ex: "stories", "schema")
  session_id  uuid        references public.chat_sessions (id) on delete set null,
  metadata    jsonb       not null default '{}',
  created_at  timestamptz not null default now()
);

comment on table  public.usage_events             is 'Eventos de uso para análise de padrões. Desnormalizado intencionalmente.';
comment on column public.usage_events.agent_slug  is 'Agente consultado neste evento: "dev", "qa", "architect", etc.';
comment on column public.usage_events.topic_slug  is 'Tópico inferido (ex: "stories", "rls", "sprint"). Gerado pelo app.';
comment on column public.usage_events.metadata    is 'Dados extras livres: model usado, latência, tokens, etc.';

create index idx_usage_events_user_created
  on public.usage_events (user_id, created_at desc);

create index idx_usage_events_agent_slug
  on public.usage_events (user_id, agent_slug, created_at desc)
  where agent_slug is not null;

create index idx_usage_events_type_created
  on public.usage_events (user_id, event_type, created_at desc);

-- ============================================================
-- TABLE: sentinel_checks
-- Registro de cada vez que o Sentinela verificou versões
-- AIOX upstream. Persiste a versão encontrada, a versão local
-- e as recomendações geradas pela IA.
-- ============================================================
create table public.sentinel_checks (
  id                  uuid        primary key default uuid_generate_v4(),
  user_id             uuid        not null default single_user_id(),
  local_version       text        not null,          -- ex: "5.0.3"
  upstream_version    text        not null,          -- ex: "5.1.0"
  has_update          boolean     not null generated always as (local_version <> upstream_version) stored,
  recommendations     jsonb       not null default '[]',  -- array de strings
  raw_diff_summary    text,                          -- resumo do diff (opcional)
  check_source        text        not null default 'manual' check (check_source in ('manual', 'scheduled')),
  checked_at          timestamptz not null default now()
);

comment on table  public.sentinel_checks                   is 'Histórico de verificações do Sentinela AIOX.';
comment on column public.sentinel_checks.local_version     is 'Versão do .aiox-core local no momento da verificação.';
comment on column public.sentinel_checks.upstream_version  is 'Versão encontrada no upstream (GitHub ou source configurado).';
comment on column public.sentinel_checks.has_update        is 'Coluna gerada: true quando versões diferem.';
comment on column public.sentinel_checks.recommendations   is 'Array JSON de strings com recomendações geradas.';
comment on column public.sentinel_checks.check_source      is '"manual" = acionado pelo usuário | "scheduled" = automático.';

create index idx_sentinel_checks_user_checked
  on public.sentinel_checks (user_id, checked_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- Single-user app, mas RLS é boa prática: protege se a
-- anon key vazar, e prepara para multi-user futuro sem
-- refatoração. Todas as policies usam single_user_id()
-- para evitar hardcode de UUID.
-- ============================================================
alter table public.chat_sessions    enable row level security;
alter table public.chat_messages    enable row level security;
alter table public.session_checkins enable row level security;
alter table public.usage_events     enable row level security;
alter table public.sentinel_checks  enable row level security;

-- chat_sessions: SELECT
create policy "chat_sessions_select"
  on public.chat_sessions for select
  using (auth.uid() = user_id);

-- chat_sessions: INSERT
create policy "chat_sessions_insert"
  on public.chat_sessions for insert
  with check (auth.uid() = user_id);

-- chat_sessions: UPDATE (ex: arquivar, renomear)
create policy "chat_sessions_update"
  on public.chat_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- chat_sessions: DELETE (hard delete permitido apenas pelo owner)
create policy "chat_sessions_delete"
  on public.chat_sessions for delete
  using (auth.uid() = user_id);

-- chat_messages: SELECT
create policy "chat_messages_select"
  on public.chat_messages for select
  using (auth.uid() = user_id);

-- chat_messages: INSERT
create policy "chat_messages_insert"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

-- chat_messages: DELETE (limpeza de histórico)
create policy "chat_messages_delete"
  on public.chat_messages for delete
  using (auth.uid() = user_id);

-- session_checkins: SELECT
create policy "checkins_select"
  on public.session_checkins for select
  using (auth.uid() = user_id);

-- session_checkins: INSERT
create policy "checkins_insert"
  on public.session_checkins for insert
  with check (auth.uid() = user_id);

-- usage_events: SELECT
create policy "usage_events_select"
  on public.usage_events for select
  using (auth.uid() = user_id);

-- usage_events: INSERT
create policy "usage_events_insert"
  on public.usage_events for insert
  with check (auth.uid() = user_id);

-- sentinel_checks: SELECT
create policy "sentinel_select"
  on public.sentinel_checks for select
  using (auth.uid() = user_id);

-- sentinel_checks: INSERT
create policy "sentinel_insert"
  on public.sentinel_checks for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- GRANT: permite ao role authenticated acesso total às tabelas
-- (RLS já restringe por user_id — o grant só libera a camada SQL)
-- ============================================================
grant select, insert, update, delete
  on public.chat_sessions,
     public.chat_messages,
     public.session_checkins,
     public.usage_events,
     public.sentinel_checks
  to authenticated;

-- ============================================================
-- END OF MIGRATION 001
-- ============================================================
