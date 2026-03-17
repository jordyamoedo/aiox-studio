# AIOX Studio -- Camada de Inteligencia

> Sistema que aprende com o uso e gera insights acionaveis para Jordy.
> Versao: 1.0 | Data: 2026-03-17

---

## Principio Fundamental

**Toda metrica capturada deve passar no teste "E dai?":**
- Esse dado muda alguma decisao do Jordy? Se nao, nao captura.
- Esta claro qual acao tomar? Se nao, nao mostra.
- O Jordy sabe o proximo passo? Se nao, reescreve.

A inteligencia do Studio nao e sobre acumular dados. E sobre reduzir o tempo entre "algo aconteceu" e "sei o que fazer".

---

## North Star Metric

**Decisoes melhores por unidade de tempo.**

Proxy mensuravel: **Taxa de resolucao na primeira interacao** -- quando Jordy consulta a IA e resolve o problema sem precisar voltar ao mesmo topico em 24h.

Essa metrica e o termometro de toda a camada de inteligencia. Se sobe, o sistema esta aprendendo. Se desce, algo esta errado.

---

## 1. Dados Passivos (captura automatica, zero esforco)

### 1.1 O que capturar em cada interacao

| Campo | Tipo | Exemplo | Por que capturar |
|-------|------|---------|-----------------|
| `session_id` | uuid | auto | Agrupar interacoes de uma sessao |
| `agent_id` | string | `"dev"`, `"architect"`, `"pm"` | Saber quais agentes Jordy mais usa |
| `project_slug` | string | `"crm-imob"`, `"aiox-studio"` | Contexto multi-projeto |
| `intent_category` | enum | `"implement"`, `"debug"`, `"plan"`, `"review"`, `"research"` | Tipo de trabalho |
| `duration_seconds` | int | 340 | Tempo gasto por interacao |
| `resolution` | enum | `"resolved"`, `"partial"`, `"abandoned"`, `"deferred"` | Se resolveu ou nao |
| `tokens_used` | int | 2400 | Custo e eficiencia |
| `timestamp` | timestamptz | auto | Padrao temporal |
| `day_of_week` | int | 1 (segunda) | Correlacao com produtividade |
| `hour_of_day` | int | 14 | Horario de pico |

### 1.2 Como capturar

A captura acontece no middleware da API route que processa cada mensagem do chat. Nao precisa de input do Jordy.

```
POST /api/chat -> middleware registra metadados -> processa mensagem -> responde
                         |
                         v
                  supabase.intelligence_events
```

### 1.3 Schema Supabase

```sql
-- Tabela principal de eventos
create table intelligence_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  agent_id text,
  project_slug text not null default 'default',
  intent_category text check (intent_category in (
    'implement', 'debug', 'plan', 'review', 'research', 'config', 'other'
  )),
  duration_seconds int,
  resolution text check (resolution in (
    'resolved', 'partial', 'abandoned', 'deferred'
  )),
  tokens_used int,
  energy_level smallint check (energy_level between 1 and 5),
  focus_area text,
  external_context text,
  created_at timestamptz default now(),
  day_of_week smallint generated always as (extract(isodow from created_at)) stored,
  hour_of_day smallint generated always as (extract(hour from created_at)) stored
);

-- Indice para queries temporais (o mais comum)
create index idx_events_created on intelligence_events (created_at desc);
create index idx_events_session on intelligence_events (session_id);
create index idx_events_agent on intelligence_events (agent_id);

-- RLS: so Jordy
alter table intelligence_events enable row level security;
create policy "owner_only" on intelligence_events
  for all using (true); -- single user, auth via service key
```

**Decisao: tabela unica.** Com um unico usuario e volume baixo (<100 eventos/dia), normalizar seria over-engineering. Uma tabela plana com indices resolve.

---

## 2. Check-in de Sessao

### 2.1 Os 3 Campos

| Campo | Tipo | Valores | Proposito |
|-------|------|---------|-----------|
| `energy_level` | 1-5 | 1=exausto, 3=ok, 5=no pico | Correlacionar energia com qualidade de decisoes |
| `focus_area` | texto livre | "arquitetura do studio", "bug no auth" | Saber no que Jordy quer focar |
| `external_context` | texto livre (opcional) | "reuniao pesada de manha", "dormiu mal" | Fator externo que afeta performance |

### 2.2 UX do Check-in

O check-in aparece como a **primeira mensagem da sessao**, nao como modal ou formulario separado.

```
IA: "Antes de comecar: como esta sua energia hoje? (1-5)"
    [1] [2] [3] [4] [5]

IA: "Em que voce quer focar?"
    [campo de texto]

IA: "Algo externo afetando hoje? (opcional, pode pular)"
    [campo de texto] [Pular]
```

**Regra: maximo 15 segundos.** Se o check-in demorar mais, Jordy para de fazer. Tres cliques/respostas e comeca a trabalhar.

### 2.3 Adaptacao de Comportamento

A IA ajusta seu comportamento com base no check-in:

| Energia | Comportamento da IA |
|---------|-------------------|
| 1-2 | Respostas mais curtas. Decisoes simplificadas. Sugere tarefas mecanicas (bugs, ajustes). Evita arquitetura. |
| 3 | Comportamento padrao. Mix de tarefas. |
| 4-5 | Pode sugerir trabalho de arquitetura, planejamento estrategico, refatoracao profunda. |

**Implementacao:** O energy_level vai como system prompt adicional para o Groq:

```typescript
function buildEnergyContext(energy: number): string {
  if (energy <= 2) {
    return "O usuario esta com energia baixa. Seja conciso, evite decisoes complexas, sugira tarefas mecanicas.";
  }
  if (energy >= 4) {
    return "O usuario esta com energia alta. Pode propor trabalho estrategico e decisoes de arquitetura.";
  }
  return ""; // energia 3 = comportamento padrao
}
```

### 2.4 Quando Mostrar Insights de Padroes

**Threshold para ativar insights: 14 check-ins completados** (aproximadamente 2 semanas de uso).

**Formato de insight (aparece no inicio da sessao, apos check-in):**

```
"Nos ultimos 14 dias, seus melhores resultados em arquitetura
aconteceram com energia 4+ nas tercas e quintas de manha.
Hoje e terca, sua energia esta em 4. Bom dia para decisoes de design."
```

**Regras para gerar insights:**

1. **Minimo 14 data points** antes de qualquer sugestao
2. **Correlacao minima 0.6** entre variavel e resultado (nao mostrar correlacoes fracas)
3. **Maximo 1 insight por sessao** (mais que isso e ruido)
4. **Formato: observacao + dado + sugestao** (nunca so o dado)

### 2.5 Query para Gerar Insights

```sql
-- Melhor horario por tipo de tarefa
select
  intent_category,
  hour_of_day,
  avg(case when resolution = 'resolved' then 1.0 else 0.0 end) as taxa_resolucao,
  count(*) as total
from intelligence_events
where created_at > now() - interval '30 days'
  and energy_level is not null
group by intent_category, hour_of_day
having count(*) >= 3
order by taxa_resolucao desc;

-- Correlacao energia vs resolucao
select
  energy_level,
  intent_category,
  avg(case when resolution = 'resolved' then 1.0 else 0.0 end) as taxa_resolucao,
  count(*) as total
from intelligence_events
where created_at > now() - interval '30 days'
group by energy_level, intent_category
having count(*) >= 3
order by energy_level, taxa_resolucao desc;
```

---

## 3. Sentinela de Atualizacoes do Framework

### 3.1 Mecanismo de Comparacao

O AIOX upstream (repositorio da Synkra) publica versoes com hashes de arquivo em `version.json`. O Studio ja tem uma copia local em `/home/amoedo/Projetos/AIOX/.aiox-core/version.json`.

**Fluxo de verificacao (roda 1x por dia, ou sob demanda):**

```
1. Ler version.json local (ja tem: v5.0.3)
2. Buscar version.json do upstream (GitHub raw ou API)
3. Comparar:
   a. Versao semver (major.minor.patch)
   b. fileHashes (arquivo por arquivo)
4. Cruzar com lista de "customized" (arquivos que Jordy alterou)
5. Gerar recomendacao
```

### 3.2 Classificacao de Mudancas

| Tipo de Arquivo | Acao Default | Logica |
|----------------|-------------|--------|
| `core/` (runtime) | ABSORVER | Core nao deve ser customizado. Atualiza sempre. |
| `development/tasks/` | AVALIAR | Jordy pode ter customizado tasks. Comparar. |
| `development/templates/` | AVALIAR | Templates frequentemente customizados. |
| `data/` (configs, registries) | AVALIAR | Dados do projeto podem ter divergido. |
| `infrastructure/` | ABSORVER | CI/CD e infra devem estar em sync. |
| `schemas/` | ABSORVER | Schemas quebram se desatualizados. |
| `constitution.md` | AVALIAR | Raro mudar, mas importante quando muda. |

### 3.3 Decisao: ABSORVER / AVALIAR / IGNORAR

```
ABSORVER (automatico):
  - Hash upstream != hash local
  - Arquivo NAO esta na lista "customized"
  - Tipo e core, infrastructure, ou schemas
  -> Resultado: "Atualizar sem revisao"

AVALIAR (precisa do Jordy):
  - Hash upstream != hash local
  - Arquivo ESTA na lista "customized" OU tipo e tasks/templates/data
  -> Resultado: "Mostrar diff e pedir decisao"

IGNORAR:
  - Hash upstream == hash local (nada mudou)
  - Ou: mudanca so em comentarios/formatacao (diff < 5 linhas, sem mudanca funcional)
  -> Resultado: silencio
```

### 3.4 Formato da Recomendacao de Atualizacao

Quando existem atualizacoes, o Sentinela mostra no inicio da primeira sessao do dia:

```
--------------------------------------------------
AIOX Framework: v5.0.3 (local) -> v5.1.0 (upstream)

ABSORVER (3 arquivos, atualizacao automatica):
  core/index.js          - bugfix no loader
  schemas/agent-v3.json  - novo campo opcional
  infrastructure/ci.yml  - melhoria no cache

AVALIAR (1 arquivo, precisa sua decisao):
  development/tasks/dev-develop-story.md
  -> Mudou: adicionou step de pre-flight checklist
  -> Voce customizou: sim (adicionou step de coderabbit)
  -> Conflito: baixo (mudancas em secoes diferentes)

Quer que eu aplique os 3 automaticos e mostre o diff do 4o?
[Aplicar] [Ver tudo] [Depois]
--------------------------------------------------
```

### 3.5 Rastreamento de Customizacoes

O `version.json` ja tem um campo `"customized": []`. Sempre que Jordy (via AIOX) modifica um arquivo do framework:

1. Calcular novo hash do arquivo
2. Adicionar ao array `customized` com path e hash
3. Na proxima verificacao, o Sentinela sabe que esse arquivo foi alterado intencionalmente

```json
{
  "customized": [
    {
      "path": "development/tasks/dev-develop-story.md",
      "hash": "sha256:abc123...",
      "reason": "Added coderabbit step",
      "date": "2026-03-15"
    }
  ]
}
```

---

## 4. Pattern Extraction (Aprendizado entre Projetos)

### 4.1 Threshold para Ativacao

**Minimo: 3 sprints completos (com stories DONE) em pelo menos 1 projeto.**

Calculo:
```sql
select count(distinct sprint_id)
from stories
where status = 'Done'
  and completed_at > now() - interval '90 days';
-- Se >= 3, pattern extraction ativa
```

Antes de 3 sprints, o sistema nao tem dados suficientes para distinguir padrao de coincidencia.

### 4.2 Tipos de Padrao que o Sistema Detecta

| Padrao | Deteccao | Exemplo |
|--------|----------|---------|
| **Erro recorrente** | Mesmo tipo de QA FAIL em 3+ stories | "RLS policy esquecida em 4 das ultimas 7 stories com banco" |
| **Agente subutilizado** | Agente disponivel mas nunca consultado para tarefas onde seria ideal | "Voce nunca usou @analyst antes de decisoes de stack. Nos 3 casos que testou, o resultado foi melhor." |
| **Gargalo de workflow** | Fase que consistentemente demora mais | "A fase de QA Gate esta levando 3x mais que implementacao. Possivel causa: AC vagos na validacao." |
| **Horario produtivo** | Correlacao tempo-resultado | "Seus commits com menos bugs acontecem entre 9h-12h." |
| **Template faltante** | Mesmo tipo de artefato criado manualmente 3+ vezes | "Voce criou 3 migration scripts com estrutura similar. Quer que eu crie um template?" |

### 4.3 Formato de Proposta de Melhoria

Quando o sistema detecta um padrao com confianca suficiente, gera uma proposta:

```
--------------------------------------------------
PROPOSTA DE MELHORIA #7
Confianca: alta (5 ocorrencias em 3 sprints)

O QUE NOTEI:
  Em 5 das ultimas 8 stories com mudancas de banco,
  a policy RLS foi esquecida e pegada so no QA Gate.

POR QUE IMPORTA:
  Cada ida-e-volta QA->Dev por RLS custa ~45min.
  Total estimado perdido: ~3h45 nas ultimas 8 stories.

O QUE PROPONHO:
  Adicionar check automatico de RLS no task dev-develop-story.md,
  logo apos a criacao de migration. Um lembrete, nao um bloqueio.

QUER IMPLEMENTAR?
  [Sim, adicionar ao workflow] [Nao, estou ciente] [Depois]
--------------------------------------------------
```

### 4.4 Regras de Apresentacao

1. **Maximo 1 proposta por semana.** Mais que isso e spam.
2. **Nunca interromper trabalho em andamento.** Propostas aparecem no inicio da sessao ou ao final de um sprint.
3. **Tom: observacao, nao ordem.** "Notei que..." em vez de "Voce deveria...".
4. **Sempre com opcao de ignorar.** Jordy decide, o sistema sugere.
5. **Confianca minima: 60%** (3+ ocorrencias do padrao). Abaixo disso, silencio.

---

## 5. O que NAO Capturar

| Dado | Por que parece util | Por que NAO capturar |
|------|--------------------|--------------------|
| Conteudo das mensagens do Jordy | "Para analisar tom e intencao" | Privacidade. Metadados (intent_category) bastam. Volume imenso, valor marginal. |
| Keystroke timing | "Para medir hesitacao" | Complexidade de implementacao desproporcional ao valor. Energia do check-in e proxy suficiente. |
| Screenshots/gravacao de tela | "Para replay de sessoes" | Storage absurdo, processamento caro, Jordy e 1 pessoa -- nao precisa de replay. |
| Metricas de outros apps | "Para contexto completo" | Integracao fragil, manutencao alta, invasivo. O campo external_context do check-in cobre isso manualmente. |
| Diff de cada commit | "Para analisar qualidade de codigo" | Git ja tem isso. Duplicar e desperdicio. Quando precisar, consulta o git direto. |
| Metricas de infra (CPU, RAM) | "Para correlacionar com performance" | Irrelevante para um unico usuario local. Se o app trava, Jordy percebe. |
| Historico de navegacao | "Para saber onde pesquisou" | Invasivo, complexo, zero valor acionavel. |
| Sentimento das mensagens (NLP) | "Para detectar frustracao" | Over-engineering. O check-in de energia e mais confiavel e direto. |

**Principio: capturar menos, interpretar melhor.** Um dado que ninguem olha e custo puro.

---

## 6. Tabela de Funcoes e Prioridade de Implementacao

| # | Funcao | Complexidade | Valor | Implementar em |
|---|--------|-------------|-------|----------------|
| 1 | Captura passiva de eventos | Baixa | Alto | Sprint 1 |
| 2 | Check-in de sessao (3 campos) | Baixa | Alto | Sprint 1 |
| 3 | Adaptacao de comportamento por energia | Baixa | Medio | Sprint 1 |
| 4 | Dashboard basico (agentes, horarios, resolucao) | Media | Medio | Sprint 2 |
| 5 | Insights de padrao temporal | Media | Alto | Sprint 2 |
| 6 | Sentinela de atualizacoes (versao) | Media | Medio | Sprint 3 |
| 7 | Sentinela de atualizacoes (file-level diff) | Alta | Medio | Sprint 3 |
| 8 | Pattern extraction (erros recorrentes) | Alta | Alto | Sprint 4+ |
| 9 | Propostas de melhoria automaticas | Alta | Alto | Sprint 4+ |

---

## 7. Arquitetura Tecnica (Resumo)

```
                    AIOX Studio (Next.js)
                           |
           +---------------+---------------+
           |               |               |
      /api/chat      /api/checkin     /api/sentinel
           |               |               |
      middleware        handler         cron/manual
      captura           salva           compara
      metadados        check-in       version.json
           |               |               |
           +-------+-------+               |
                   |                        |
            intelligence_events        upstream API
            (Supabase)                 (GitHub raw)
                   |
           +-------+-------+
           |               |
      Insights Engine   Pattern Engine
      (queries SQL)     (apos 3 sprints)
           |               |
      Adapta comportamento   Gera propostas
      da IA em tempo real    semanais
```

### Componentes no codigo:

```
src/
  lib/
    intelligence/
      capture.ts          -- middleware de captura passiva
      checkin.ts           -- logica do check-in de sessao
      insights.ts          -- queries e formatacao de insights
      sentinel.ts          -- comparacao de versoes
      patterns.ts          -- pattern extraction (Sprint 4+)
      types.ts             -- tipos compartilhados
  app/
    api/
      chat/
        route.ts           -- ja existe, adicionar middleware
      checkin/
        route.ts           -- novo endpoint
      sentinel/
        route.ts           -- novo endpoint
```

---

## 8. Metricas de Sucesso da Camada de Inteligencia

Como saber se esse sistema esta funcionando:

| Metrica | Meta | Medicao |
|---------|------|---------|
| Taxa de check-in completado | > 80% das sessoes | check-ins / total sessoes |
| Insight acionado (Jordy mudou comportamento) | > 30% dos insights mostrados | tracking de clique/acao |
| Tempo de resolucao por interacao | Reduzir 20% em 90 dias | media de duration_seconds com resolution=resolved |
| Atualizacoes do framework aplicadas em < 48h | > 90% dos ABSORVER | sentinela log |
| Propostas de melhoria aceitas | > 40% | tracking de decisao |

---

## Decisoes de Design (Registro)

1. **Tabela unica em vez de normalizada.** Volume baixo (1 usuario), simplicidade > normalizacao.
2. **Check-in via chat, nao modal.** Menos friccao, mais natural. Jordy ja esta no chat.
3. **Sentinela baseado em hashes, nao em git diff.** O version.json ja tem os hashes. Nao precisa clonar o upstream inteiro.
4. **Pattern extraction so apos 3 sprints.** Antes disso, qualquer padrao e coincidencia estatistica.
5. **Maximo 1 insight por sessao.** Ruido mata confianca. Menos e mais.
6. **Zero NLP no conteudo das mensagens.** Metadados estruturados (intent_category, resolution) sao mais confiaveis e baratos.
7. **Groq processa insights, nao regras hardcoded.** A IA interpreta os dados e gera texto natural. As queries SQL fornecem os dados, o LLM fornece o contexto.
