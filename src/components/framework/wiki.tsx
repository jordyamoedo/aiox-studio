'use client'

import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface WikiSection {
  id: string
  title: string
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'outline'
  content: WikiBlock[]
}

type WikiBlock =
  | { type: 'lead'; text: string }
  | { type: 'p'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'cards'; items: { title: string; desc: string; tag?: string; color?: string }[] }
  | { type: 'steps'; items: { label: string; desc: string }[] }
  | { type: 'code'; text: string }
  | { type: 'callout'; variant: 'info' | 'warning' | 'tip'; text: string }
  | { type: 'tags'; items: string[] }
  | { type: 'divider' }

// ── Conteúdo ──────────────────────────────────────────────────────────────────

const SECTIONS: WikiSection[] = [
  // ── O QUE É O AIOX ──────────────────────────────────────────────────────────
  {
    id: 'o-que-e',
    title: 'O que é o AIOX',
    badge: 'Conceito',
    content: [
      {
        type: 'lead',
        text: 'AIOX é um meta-framework de orquestração de agentes de IA para desenvolvimento full-stack. Em vez de um único assistente genérico, o AIOX distribui o trabalho entre especialistas — cada um com escopo, persona e autoridade definidos.',
      },
      {
        type: 'callout',
        variant: 'tip',
        text: 'Pense assim: um escritório completo de especialistas que trabalham juntos, cada um fazendo só o que é melhor nisso.',
      },
      { type: 'h3', text: 'Os dois espaços' },
      {
        type: 'cards',
        items: [
          {
            title: 'O Framework',
            desc: 'Aprenda, explore e consulte o AIOX. Mapa de agentes, busca nos arquivos, camadas do sistema.',
            tag: 'Aprender',
            color: 'text-[hsl(var(--accent-primary))]',
          },
          {
            title: 'O Direcionador',
            desc: 'Tome decisões estratégicas com IA como parceiro. Qual caminho seguir, o que priorizar, como resolver bloqueios.',
            tag: 'Decidir',
            color: 'text-[hsl(var(--accent-direcionador))]',
          },
        ],
      },
      { type: 'h3', text: 'Princípios fundamentais' },
      {
        type: 'table',
        headers: ['Artigo', 'Princípio', 'Significado'],
        rows: [
          ['I', 'CLI First', 'Todo agente opera no terminal. Sem cliques — só comandos.'],
          ['II', 'Agent Authority', 'Cada agente tem escopo exclusivo. @devops é o único que faz git push.'],
          ['III', 'Story-Driven', 'Todo trabalho começa com uma story. Nada fora de stories.'],
          ['IV', 'No Invention', 'Agentes executam o que foi especificado — sem improvisar features.'],
          ['V', 'Quality First', 'QA gate obrigatório antes de qualquer merge.'],
        ],
      },
    ],
  },

  // ── AGENTES ─────────────────────────────────────────────────────────────────
  {
    id: 'agentes',
    title: 'Sistema de Agentes',
    badge: 'Referência',
    content: [
      {
        type: 'lead',
        text: 'O AIOX tem mais de 30 agentes distribuídos em 5 namespaces. Cada agente tem uma persona, um escopo e comandos específicos.',
      },
      { type: 'h3', text: 'Como ativar' },
      {
        type: 'code',
        text: '/AIOX:agents:dev\n/chiefs:agents:copy-chief\n/design-system:agents:design-chief',
      },
      {
        type: 'callout',
        variant: 'info',
        text: 'Depois de ativado, use * para comandos: *help, *develop, *create-story, *exit.',
      },
      { type: 'h3', text: 'Namespace: AIOX Core' },
      {
        type: 'table',
        headers: ['Agente', 'Persona', 'Escopo principal'],
        rows: [
          ['@aiox-master', 'Orion', 'Orquestrador universal — executa qualquer task, cria componentes do framework'],
          ['@pm', 'Morgan', 'PRDs, épicos, estratégia de produto, priorização'],
          ['@po', 'Pax', 'Validação de stories (10 critérios), gestão do backlog'],
          ['@sm', 'River', 'Criação de stories a partir de épicos e PRDs'],
          ['@analyst', 'Alex', 'Pesquisa, análise competitiva, brainstorming'],
          ['@architect', 'Aria', 'Decisões de arquitetura, escolha de tecnologia, ADRs'],
          ['@dev', 'Dex', 'Implementação de código, commits, debugging'],
          ['@data-engineer', 'Dara', 'Schema, migrations, RLS, otimização de queries'],
          ['@qa', 'Quinn', 'QA Gate (7 critérios), testes, cobertura, segurança'],
          ['@devops', 'Gage', 'git push, PRs, CI/CD — AUTORIDADE EXCLUSIVA'],
          ['@ux-design-expert', 'Uma', 'UX/UI, wireframes, design system, acessibilidade'],
          ['@doc-guardian', 'Guardian', 'Auditoria de documentação, sync, health report'],
        ],
      },
      { type: 'h3', text: 'Namespace: Chiefs' },
      {
        type: 'cards',
        items: [
          { title: 'copy-chief', desc: 'Orquestra 24 copywriters. Diagnóstico → Tier 1-3 → Hopkins audit.', tag: 'Marketing' },
          { title: 'design-chief', desc: 'Brad Frost + Dan Mall + Dave Malouf. Atomic design completo.', tag: 'Design' },
          { title: 'data-chief', desc: 'Data Intelligence em tiers. Fundamentação → Operação → Comunicação.', tag: 'Dados' },
          { title: 'traffic-masters-chief', desc: 'Paid traffic em 7 especialistas. Google, Meta, LinkedIn e escala.', tag: 'Tráfego' },
          { title: 'story-chief', desc: '12 storytellers. Diagnóstico → Execução → Quality check.', tag: 'Narrativa' },
          { title: 'legal-chief', desc: 'Frameworks globais + especialistas BR. LGPD, contratos, compliance.', tag: 'Jurídico' },
        ],
      },
    ],
  },

  // ── PIPELINE SDC ────────────────────────────────────────────────────────────
  {
    id: 'sdc',
    title: 'Pipeline SDC',
    badge: 'Workflow',
    content: [
      {
        type: 'lead',
        text: 'O Story Development Cycle (SDC) é o workflow principal do AIOX. Todo desenvolvimento começa aqui — da criação da story até o push para o repositório.',
      },
      { type: 'h3', text: 'As 4 fases' },
      {
        type: 'steps',
        items: [
          { label: '@sm — Criar', desc: 'Escreve a story a partir do épico e PRD. Output: arquivo .story.md com título, descrição, AC, escopo e dependências.' },
          { label: '@po — Validar', desc: 'Aplica checklist de 10 pontos. Resultado: GO (≥7/10) ou NO-GO com lista de correções obrigatórias.' },
          { label: '@dev — Implementar', desc: 'Escreve o código seguindo os AC. Faz commits locais. NÃO faz push — isso é @devops.' },
          { label: '@qa — Revisar', desc: 'Aplica QA Gate de 7 critérios. Resultado: PASS, CONCERNS, FAIL ou WAIVED.' },
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        text: '@devops é o único autorizado a fazer git push e gh pr create. Se @dev tentar fazer push, é violação constitucional.',
      },
      { type: 'h3', text: 'Status da story' },
      {
        type: 'code',
        text: 'Draft → Ready → InProgress → InReview → Done',
      },
      { type: 'h3', text: 'Encadeamento autônomo' },
      {
        type: 'p',
        text: 'Os agentes se ativam em sequência sem intervenção do usuário. Quando @sm termina, ativa @po automaticamente. @po aprova → ativa @dev. @dev conclui → ativa @qa. @qa PASS → ativa @devops. O único momento que o usuário precisa agir é em decisões ambíguas ou erros.',
      },
    ],
  },

  // ── QA GATE ─────────────────────────────────────────────────────────────────
  {
    id: 'qa-gate',
    title: 'QA Gate',
    badge: 'Qualidade',
    content: [
      {
        type: 'lead',
        text: 'O QA Gate é a barreira de qualidade executada por @qa antes de qualquer merge. São 7 critérios obrigatórios.',
      },
      { type: 'h3', text: 'Os 7 critérios' },
      {
        type: 'table',
        headers: ['#', 'Critério', 'O que verifica'],
        rows: [
          ['1', 'Code Review', 'Padrões, legibilidade, manutenibilidade'],
          ['2', 'Unit Tests', 'Cobertura adequada, todos passando'],
          ['3', 'Acceptance Criteria', 'Todos os AC da story cumpridos'],
          ['4', 'No Regressions', 'Funcionalidade existente preservada'],
          ['5', 'Performance', 'Dentro dos limites aceitáveis'],
          ['6', 'Security', 'OWASP basics verificados'],
          ['7', 'Documentation', 'Docs atualizados se necessário'],
        ],
      },
      { type: 'h3', text: 'Decisões possíveis' },
      {
        type: 'cards',
        items: [
          { title: 'PASS', desc: 'Todos os critérios OK. Segue para @devops.', color: 'text-[hsl(var(--status-success))]' },
          { title: 'CONCERNS', desc: 'Issues menores. Aprovado com observações documentadas.', color: 'text-[hsl(var(--status-warning))]' },
          { title: 'FAIL', desc: 'Issues HIGH/CRITICAL. Retorna para @dev com feedback.', color: 'text-[hsl(var(--status-error))]' },
          { title: 'WAIVED', desc: 'Issues aceitos conscientemente. Raro — requer justificativa.', color: 'text-muted-foreground' },
        ],
      },
      { type: 'h3', text: 'QA Loop' },
      {
        type: 'p',
        text: 'Se o resultado for FAIL, @qa ativa @dev com a lista de problemas. @dev corrige e @qa revisa novamente. Máximo 5 iterações. Após a 5ª sem aprovação, o processo é escalado para @aiox-master.',
      },
    ],
  },

  // ── CAMADAS ─────────────────────────────────────────────────────────────────
  {
    id: 'camadas',
    title: 'Camadas L1–L4',
    badge: 'Arquitetura',
    content: [
      {
        type: 'lead',
        text: 'O AIOX usa um modelo de 4 camadas para separar o que é do framework do que é do projeto. Essa separação é enforced por deny rules no Claude Code.',
      },
      {
        type: 'table',
        headers: ['Camada', 'Nome', 'Regra', 'Paths'],
        rows: [
          ['L1', 'Framework Core', '🔒 NUNCA modifique', '.aiox-core/core/, bin/aiox.js'],
          ['L2', 'Templates', '📁 Só estenda', '.aiox-core/development/, .aiox-core/infrastructure/'],
          ['L3', 'Config', '⚙️ Mutável com cuidado', '.aiox-core/data/, agents/*/MEMORY.md'],
          ['L4', 'Runtime', '🔨 Sempre modifique', 'docs/stories/, packages/, tests/'],
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        text: 'Dúvida de onde criar algo? Stories e código de produto → L4. Novos agentes ou tasks → L3. Nunca toque L1 ou L2 sem ser contribuidor do framework.',
      },
      { type: 'h3', text: 'Guia rápido de decisão' },
      {
        type: 'cards',
        items: [
          { title: 'Criar novo agente', desc: 'L3 → .claude/commands/AIOX/agents/', tag: 'L3' },
          { title: 'Criar nova task', desc: 'L3 → .aiox-core/development/tasks/', tag: 'L3' },
          { title: 'Criar código do projeto', desc: 'L4 → packages/ ou src/', tag: 'L4' },
          { title: 'Criar nova story', desc: 'L4 → docs/stories/', tag: 'L4' },
        ],
      },
    ],
  },

  // ── HANDOFF ENTRE AGENTES ───────────────────────────────────────────────────
  {
    id: 'handoff',
    title: 'Handoff entre Agentes',
    badge: 'Protocolo',
    content: [
      {
        type: 'lead',
        text: 'Quando um agente conclui seu trabalho, ele escreve um artifact de handoff e ativa o próximo. Esse mecanismo é o que permite o encadeamento autônomo do SDC.',
      },
      { type: 'h3', text: 'Estrutura do handoff' },
      {
        type: 'code',
        text: `handoff:
  from_agent: dev
  to_agent: qa
  auto_execute: true
  consumed: false
  last_command: "*develop"
  next_command: "*qa-gate docs/stories/1.1.story.md"
  next_action: "Revisar implementação da story 1.1"
  decisions:
    - "Usou React Query para cache do servidor"
  files_modified:
    - src/components/agents/agent-card.tsx`,
      },
      { type: 'h3', text: 'Onde ficam os artifacts' },
      {
        type: 'p',
        text: 'Todos os handoffs são escritos em .aiox/handoffs/. São arquivos YAML com nome handoff-{from}-to-{to}.yaml. São gitignored — existem só durante a execução.',
      },
      {
        type: 'callout',
        variant: 'tip',
        text: 'Quando um agente ativa e encontra um handoff com auto_execute: true, ele executa o next_command imediatamente sem pedir confirmação.',
      },
    ],
  },

  // ── SPEC PIPELINE ───────────────────────────────────────────────────────────
  {
    id: 'spec-pipeline',
    title: 'Spec Pipeline',
    badge: 'Workflow',
    content: [
      {
        type: 'lead',
        text: 'Para features complexas, o Spec Pipeline transforma requisitos informais em uma especificação executável antes de qualquer linha de código.',
      },
      { type: 'h3', text: 'As 6 fases' },
      {
        type: 'table',
        headers: ['Fase', 'Agente', 'Output', 'Pular se'],
        rows: [
          ['1', '@pm', 'requirements.json', 'Nunca'],
          ['2', '@architect', 'complexity.json', 'fonte=simples'],
          ['3', '@analyst', 'research.json', 'Classe SIMPLES'],
          ['4', '@pm', 'spec.md', 'Nunca'],
          ['5', '@qa', 'critique.json', 'Nunca'],
          ['6', '@architect', 'implementation.yaml', 'Se APROVADO'],
        ],
      },
      { type: 'h3', text: 'Classes de complexidade' },
      {
        type: 'cards',
        items: [
          { title: 'SIMPLES (≤8)', desc: '3 fases: gather → spec → critique. Bugs e fixes pequenos.', color: 'text-[hsl(var(--status-success))]' },
          { title: 'PADRÃO (9-15)', desc: 'Todas as 6 fases. Features novas sem infra complexa.', color: 'text-[hsl(var(--status-warning))]' },
          { title: 'COMPLEXO (≥16)', desc: '6 fases + ciclo de revisão. Mudanças estruturais, integrações.', color: 'text-[hsl(var(--status-error))]' },
        ],
      },
    ],
  },

  // ── IDS ──────────────────────────────────────────────────────────────────────
  {
    id: 'ids',
    title: 'IDS — Incremental Development',
    badge: 'Sistema',
    content: [
      {
        type: 'lead',
        text: 'O IDS (Incremental Development System) é o sistema de governança de artefatos do AIOX. Ele evita duplicação e promove reuso antes de criação.',
      },
      { type: 'h3', text: 'Hierarquia de decisão' },
      {
        type: 'steps',
        items: [
          { label: 'REUSE (relevância ≥90%)', desc: 'Use o artefato existente diretamente. Sem modificação, sem justificativa.' },
          { label: 'ADAPT (relevância 60-89%)', desc: 'Adapte o existente. Mudanças ≤30%. Não quebre consumidores. Documente.' },
          { label: 'CREATE (sem match)', desc: 'Crie novo. Justifique por que não reusou. Registre no registry em até 24h.' },
        ],
      },
      { type: 'h3', text: 'Gates de verificação' },
      {
        type: 'table',
        headers: ['Gate', 'Quem', 'Bloqueante?'],
        rows: [
          ['G1 — Epic', '@pm', 'Não (advisory)'],
          ['G2 — Story', '@sm', 'Não (advisory)'],
          ['G3 — Validação', '@po', 'Soft (pode override)'],
          ['G4 — Dev', '@dev', 'Não (informacional)'],
          ['G5 — QA', '@qa', 'Sim (bloqueia merge)'],
          ['G6 — CI/CD', '@devops', 'Sim (bloqueia CRITICAL)'],
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        text: 'O IDS nunca bloqueia por falha técnica. Circuit breaker: timeout de 2s → warn-and-proceed. Desenvolvimento nunca para por causa do IDS.',
      },
    ],
  },

  // ── COMANDOS RÁPIDOS ────────────────────────────────────────────────────────
  {
    id: 'comandos',
    title: 'Comandos Rápidos',
    badge: 'Referência',
    content: [
      {
        type: 'lead',
        text: 'Os comandos mais usados no dia a dia. Todos requerem o agente ativo.',
      },
      { type: 'h3', text: '@aiox-master' },
      {
        type: 'tags',
        items: ['*help', '*kb', '*create agent {nome}', '*modify agent {nome}', '*workflow {nome}', '*plan', '*team {objetivo}', '*ids check {intenção}', '*ids stats', '*validate-workflow {nome}'],
      },
      { type: 'h3', text: '@pm' },
      {
        type: 'tags',
        items: ['*create-prd', '*create-brownfield-prd', '*create-epic', '*execute-epic {path}', '*research {tema}'],
      },
      { type: 'h3', text: '@sm' },
      {
        type: 'tags',
        items: ['*draft', '*create-story'],
      },
      { type: 'h3', text: '@po' },
      {
        type: 'tags',
        items: ['*validate-story-draft', '*help'],
      },
      { type: 'h3', text: '@dev' },
      {
        type: 'tags',
        items: ['*develop {story}', '*debug', '*help'],
      },
      { type: 'h3', text: '@qa' },
      {
        type: 'tags',
        items: ['*qa-gate {story}', '*qa-loop {storyId}', '*create-suite'],
      },
      { type: 'h3', text: '@devops' },
      {
        type: 'tags',
        items: ['*push', '*pr create', '*release'],
      },
      { type: 'h3', text: '@doc-guardian' },
      {
        type: 'tags',
        items: ['*sync-docs', '*map-decisions', '*health-report'],
      },
    ],
  },
]

// ── Navegação lateral ─────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: 'Fundamentos',
    items: ['o-que-e', 'camadas'],
  },
  {
    label: 'Agentes',
    items: ['agentes', 'handoff', 'comandos'],
  },
  {
    label: 'Workflows',
    items: ['sdc', 'qa-gate', 'spec-pipeline'],
  },
  {
    label: 'Sistemas',
    items: ['ids'],
  },
]

// ── Renderer de blocos ────────────────────────────────────────────────────────

function renderBlock(block: WikiBlock, idx: number) {
  switch (block.type) {
    case 'lead':
      return <p key={idx} className="text-base text-foreground leading-relaxed mb-4 font-normal">{block.text}</p>

    case 'p':
      return <p key={idx} className="text-sm text-muted-foreground leading-relaxed mb-4">{block.text}</p>

    case 'h3':
      return <h3 key={idx} className="text-sm font-semibold text-foreground mt-6 mb-3 pt-4 border-t border-border/50">{block.text}</h3>

    case 'divider':
      return <hr key={idx} className="border-border my-6" />

    case 'code':
      return (
        <pre key={idx} className="text-xs bg-secondary rounded-lg p-4 font-mono text-foreground whitespace-pre overflow-x-auto mb-4 leading-relaxed">
          {block.text}
        </pre>
      )

    case 'callout': {
      const styles = {
        info: 'border-[hsl(var(--accent-primary)/0.4)] bg-[hsl(var(--accent-primary)/0.06)] text-[hsl(var(--accent-primary))]',
        warning: 'border-[hsl(var(--status-warning)/0.4)] bg-[hsl(var(--status-warning)/0.06)] text-[hsl(var(--status-warning))]',
        tip: 'border-[hsl(var(--status-success)/0.4)] bg-[hsl(var(--status-success)/0.06)] text-[hsl(var(--status-success))]',
      }
      return (
        <div key={idx} className={`border rounded-lg px-4 py-3 mb-4 text-sm leading-relaxed ${styles[block.variant]}`}>
          {block.text}
        </div>
      )
    }

    case 'table':
      return (
        <div key={idx} className="mb-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {block.headers.map((h, i) => (
                  <th key={i} className="text-left py-2 pr-4 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-border/40">
                  {row.map((cell, ci) => (
                    <td key={ci} className={`py-2 pr-4 leading-relaxed align-top ${ci === 0 ? 'font-mono font-medium text-foreground' : 'text-muted-foreground'}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'cards':
      return (
        <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {block.items.map((item, i) => (
            <div key={i} className="border border-border rounded-lg p-3 bg-card">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-medium font-mono ${item.color || 'text-foreground'}`}>{item.title}</span>
                {item.tag && <Badge variant="secondary" className="text-xs">{item.tag}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      )

    case 'steps':
      return (
        <div key={idx} className="space-y-3 mb-4">
          {block.items.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent-primary)/0.15)] text-[hsl(var(--accent-primary))] text-xs font-bold">
                  {i + 1}
                </div>
                {i < block.items.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
              </div>
              <div className="pb-4 min-w-0">
                <p className="text-sm font-medium text-foreground mb-0.5">{item.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )

    case 'tags':
      return (
        <div key={idx} className="flex flex-wrap gap-2 mb-4">
          {block.items.map((tag, i) => (
            <code key={i} className="text-xs bg-secondary border border-border rounded px-2 py-1 font-mono text-foreground">
              {tag}
            </code>
          ))}
        </div>
      )

    default:
      return null
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function Wiki() {
  const [activeId, setActiveId] = useState('o-que-e')
  const [query, setQuery] = useState('')

  const allSectionIds = SECTIONS.map(s => s.id)

  const filteredSections = query.trim().length > 1
    ? SECTIONS.filter(s =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.content.some(b => {
          if (b.type === 'lead' || b.type === 'p' || b.type === 'h3') return b.text.toLowerCase().includes(query.toLowerCase())
          if (b.type === 'table') return b.rows.some(r => r.some(c => c.toLowerCase().includes(query.toLowerCase())))
          return false
        })
      )
    : null

  const activeSection = SECTIONS.find(s => s.id === activeId) || SECTIONS[0]

  return (
    <div className="flex h-full">
      {/* Sidebar de navegação */}
      <div className="w-52 shrink-0 border-r border-border flex flex-col">
        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Filtrar..."
              className="pl-8 h-7 text-xs"
            />
          </div>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 py-2">
          {filteredSections ? (
            <div className="px-2">
              <p className="text-xs text-muted-foreground px-2 py-1">{filteredSections.length} resultados</p>
              {filteredSections.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setActiveId(s.id); setQuery('') }}
                  className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-secondary transition-colors text-foreground"
                >
                  {s.title}
                </button>
              ))}
            </div>
          ) : (
            NAV_GROUPS.map(group => (
              <div key={group.label} className="mb-3">
                <p className="px-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  {group.label}
                </p>
                {group.items.map(id => {
                  const section = SECTIONS.find(s => s.id === id)
                  if (!section) return null
                  const isActive = activeId === id
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveId(id)}
                      className={cn(
                        'w-full text-left flex items-center justify-between px-4 py-1.5 text-xs transition-colors rounded-none',
                        isActive
                          ? 'text-[hsl(var(--accent-primary))] bg-[hsl(var(--accent-primary)/0.08)] font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      )}
                    >
                      {section.title}
                      {isActive && <ChevronRight className="h-3 w-3 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col min-w-0">
        <ScrollArea className="flex-1">
          <div className="max-w-2xl px-8 py-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-semibold text-foreground">{activeSection.title}</h2>
              {activeSection.badge && (
                <Badge variant="outline" className="text-xs">{activeSection.badge}</Badge>
              )}
            </div>

            {/* Blocos de conteúdo */}
            {activeSection.content.map((block, idx) => renderBlock(block, idx))}

            {/* Navegação inferior */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-border">
              {(() => {
                const currentIdx = allSectionIds.indexOf(activeId)
                const prev = currentIdx > 0 ? SECTIONS[currentIdx - 1] : null
                const next = currentIdx < SECTIONS.length - 1 ? SECTIONS[currentIdx + 1] : null
                return (
                  <>
                    {prev ? (
                      <button
                        onClick={() => setActiveId(prev.id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
                      >
                        <span className="block text-[10px] uppercase tracking-wider mb-0.5">Anterior</span>
                        {prev.title}
                      </button>
                    ) : <div />}
                    {next ? (
                      <button
                        onClick={() => setActiveId(next.id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors text-right"
                      >
                        <span className="block text-[10px] uppercase tracking-wider mb-0.5">Próximo</span>
                        {next.title}
                      </button>
                    ) : <div />}
                  </>
                )
              })()}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
