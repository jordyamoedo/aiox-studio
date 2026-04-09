'use client'

import { useEffect, useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AIOXAgent } from '@/types'
import { AgentModal } from './agent-modal'

// ── Estilos por namespace ─────────────────────────────────────────────────────

const NS_STYLE: Record<string, {
  label: string
  node: string        // estilo do nó
  nodeSel: string     // nó selecionado
  zone: string        // borda da zona
  tag: string         // badge/tag
}> = {
  AIOX: {
    label: 'Core AIOX',
    node:    'border-[hsl(var(--accent-primary)/0.3)] bg-card hover:border-[hsl(var(--accent-primary)/0.6)] hover:bg-[hsl(var(--accent-primary)/0.05)]',
    nodeSel: 'border-[hsl(var(--accent-primary)/0.8)] bg-[hsl(var(--accent-primary)/0.1)] shadow-sm ring-1 ring-[hsl(var(--accent-primary)/0.3)]',
    zone:    'border-[hsl(var(--accent-primary)/0.25)] bg-[hsl(var(--accent-primary)/0.02)]',
    tag:     'text-[hsl(var(--accent-primary))]',
  },
  chiefs: {
    label: 'Chiefs',
    node:    'border-amber-500/30 bg-card hover:border-amber-500/60 hover:bg-amber-500/5',
    nodeSel: 'border-amber-500/80 bg-amber-500/10 shadow-sm ring-1 ring-amber-500/30',
    zone:    'border-amber-500/25 bg-amber-500/[0.015]',
    tag:     'text-amber-400',
  },
  'claude-code-mastery': {
    label: 'Claude Mastery',
    node:    'border-indigo-500/30 bg-card hover:border-indigo-500/60 hover:bg-indigo-500/5',
    nodeSel: 'border-indigo-500/80 bg-indigo-500/10 shadow-sm ring-1 ring-indigo-500/30',
    zone:    'border-indigo-500/25 bg-indigo-500/[0.015]',
    tag:     'text-indigo-400',
  },
  'design-system': {
    label: 'Design System',
    node:    'border-pink-500/30 bg-card hover:border-pink-500/60 hover:bg-pink-500/5',
    nodeSel: 'border-pink-500/80 bg-pink-500/10 shadow-sm ring-1 ring-pink-500/30',
    zone:    'border-pink-500/25 bg-pink-500/[0.015]',
    tag:     'text-pink-400',
  },
  'cohort-squad': {
    label: 'Squads',
    node:    'border-teal-500/30 bg-card hover:border-teal-500/60 hover:bg-teal-500/5',
    nodeSel: 'border-teal-500/80 bg-teal-500/10 shadow-sm ring-1 ring-teal-500/30',
    zone:    'border-teal-500/25 bg-teal-500/[0.015]',
    tag:     'text-teal-400',
  },
  synapse: {
    label: 'Synapse',
    node:    'border-violet-500/30 bg-card hover:border-violet-500/60 hover:bg-violet-500/5',
    nodeSel: 'border-violet-500/80 bg-violet-500/10 shadow-sm ring-1 ring-violet-500/30',
    zone:    'border-violet-500/25 bg-violet-500/[0.015]',
    tag:     'text-violet-400',
  },
}

// ── AgentNode — nó visível no mapa ────────────────────────────────────────────

function AgentNode({
  agent, selected, onClick, size = 'md',
}: {
  agent: AIOXAgent
  selected: boolean
  onClick: () => void
  size?: 'sm' | 'md' | 'lg'
}) {
  const style = NS_STYLE[agent.namespace] || NS_STYLE['cohort-squad']

  // Role truncado para caber no nó
  const roleShort = agent.role
    ? agent.role.replace(/Specialist|Engineer|Architect|Expert|Manager|Master|Senior/g, '').trim().slice(0, 36)
    : ''

  if (size === 'sm') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'flex flex-col items-start gap-0.5 px-3 py-2 rounded-xl border transition-all cursor-pointer text-left',
          selected ? style.nodeSel : style.node
        )}
      >
        <div className="flex items-center gap-1.5">
          {agent.icon && <span className="text-sm leading-none">{agent.icon}</span>}
          <span className={cn('text-xs font-mono font-semibold', selected ? style.tag : 'text-foreground')}>
            @{agent.id}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground leading-tight">{agent.name}</span>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-1 px-4 py-3 rounded-xl border transition-all cursor-pointer text-left min-w-[130px]',
        selected ? style.nodeSel : style.node
      )}
    >
      <div className="flex items-center gap-2">
        {agent.icon && <span className="text-base leading-none">{agent.icon}</span>}
        <span className={cn('text-sm font-mono font-semibold', selected ? style.tag : 'text-foreground')}>
          @{agent.id}
        </span>
      </div>
      <span className="text-xs text-foreground/80 font-medium">{agent.name}</span>
      {roleShort && (
        <span className="text-[10px] text-muted-foreground leading-tight">{roleShort}</span>
      )}
    </button>
  )
}

// ── Pipeline SDC ──────────────────────────────────────────────────────────────

const SDC_STEPS = [
  { id: 'sm',     phase: '1',  label: 'Criar',       desc: 'Story a partir do épico' },
  { id: 'po',     phase: '2',  label: 'Validar',     desc: 'GO/NO-GO — 10 critérios' },
  { id: 'dev',    phase: '3',  label: 'Implementar', desc: 'Código + commits locais' },
  { id: 'qa',     phase: '4',  label: 'Revisar',     desc: 'PASS/FAIL — 7 critérios' },
  { id: 'devops', phase: '5',  label: 'Publicar',    desc: 'git push, PR — exclusivo' },
]

const SDC_SUPPORT: Record<string, string> = {
  'aiox-master':     'Orquestra tudo',
  'pm':              '→ alimenta @sm',
  'analyst':         '→ alimenta @pm',
  'architect':       '→ alimenta @dev',
  'data-engineer':   '→ alimenta @dev',
  'ux-design-expert':'→ alimenta @dev',
  'doc-guardian':    '→ audita docs',
}

function SdcPipeline({
  agents, selected, onSelect,
}: { agents: AIOXAgent[]; selected: AIOXAgent | null; onSelect: (a: AIOXAgent) => void }) {
  const get = (id: string) => agents.find(a => a.id === id)
  const style = NS_STYLE.AIOX

  return (
    <div className={cn('rounded-2xl border-2 p-5', style.zone)}>
      <div className="flex items-center gap-2 mb-5">
        <span className={cn('text-xs font-bold uppercase tracking-widest', style.tag)}>Pipeline SDC</span>
        <span className="text-xs text-muted-foreground">ciclo completo de desenvolvimento</span>
      </div>

      {/* Fases do pipeline */}
      <div className="flex items-start gap-2 overflow-x-auto pb-2">
        {SDC_STEPS.map((step, i) => {
          const agent = get(step.id)
          const isSel = selected?.id === step.id
          return (
            <div key={step.id} className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col gap-1">
                {/* Indicador de fase */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={cn(
                    'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                    isSel
                      ? 'bg-[hsl(var(--accent-primary))] text-white'
                      : 'bg-[hsl(var(--accent-primary)/0.15)] text-[hsl(var(--accent-primary))]'
                  )}>
                    {step.phase}
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{step.label}</span>
                </div>

                {/* Nó do agente */}
                {agent ? (
                  <AgentNode agent={agent} selected={isSel} onClick={() => onSelect(agent)} size="md" />
                ) : (
                  <div className="min-w-[130px] px-4 py-3 rounded-xl border border-dashed border-border opacity-40">
                    <span className="text-xs text-muted-foreground font-mono">@{step.id}</span>
                  </div>
                )}
                {/* Descrição da fase */}
                <span className="text-[10px] text-muted-foreground px-1 leading-tight max-w-[130px]">{step.desc}</span>
              </div>

              {i < SDC_STEPS.length - 1 && (
                <ArrowRight className={cn('h-4 w-4 shrink-0 mt-6', style.tag, 'opacity-50')} />
              )}
            </div>
          )
        })}
      </div>

      {/* Suporte ao pipeline */}
      <div className="mt-5 pt-4 border-t border-[hsl(var(--accent-primary)/0.15)]">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
          Suporte ao pipeline
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(SDC_SUPPORT).map(id => {
            const agent = get(id)
            if (!agent) return null
            return (
              <div key={id} className="flex flex-col gap-0.5">
                <AgentNode agent={agent} selected={selected?.id === id} onClick={() => onSelect(agent)} size="sm" />
                <span className="text-[9px] text-muted-foreground px-0.5">{SDC_SUPPORT[id]}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── DomainZone ────────────────────────────────────────────────────────────────

function DomainZone({
  namespace, label, description, agents, selected, onSelect,
}: {
  namespace: string
  label: string
  description: string
  agents: AIOXAgent[]
  selected: AIOXAgent | null
  onSelect: (a: AIOXAgent) => void
}) {
  const [open, setOpen] = useState(true)
  const style = NS_STYLE[namespace] || NS_STYLE['cohort-squad']

  if (agents.length === 0) return null

  return (
    <div className={cn('rounded-2xl border-2 transition-all', style.zone)}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold">{label}</span>
          <Badge variant="secondary" className="text-xs">{agents.length}</Badge>
          <span className="text-xs text-muted-foreground hidden sm:block">{description}</span>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        }
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-border/40 pt-4">
          <div className="flex flex-wrap gap-3">
            {agents.map(agent => (
              <AgentNode
                key={agent.id}
                agent={agent}
                selected={selected?.id === agent.id}
                onClick={() => onSelect(agent)}
                size="md"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Configuração das zonas de domínio ─────────────────────────────────────────

const DOMAIN_ZONES = [
  { namespace: 'chiefs',              label: 'Chiefs',         description: 'Orquestradores de domínio — cada um comanda um time de especialistas' },
  { namespace: 'claude-code-mastery', label: 'Claude Mastery', description: 'Especialistas em otimizar e expandir o ambiente Claude Code' },
  { namespace: 'design-system',       label: 'Design System',  description: 'Atomic design, tokens, componentes e geração de imagens' },
  { namespace: 'cohort-squad',        label: 'Cohort Squad',   description: 'Gestão de cohorts de compradores' },
  { namespace: 'synapse',             label: 'Synapse',        description: 'Motor de contexto — domains, rules e star-commands' },
]

// ── AgentMap principal ────────────────────────────────────────────────────────

export function AgentMap() {
  const [agents, setAgents] = useState<AIOXAgent[]>([])
  const [selected, setSelected] = useState<AIOXAgent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/framework/agents')
      .then(r => r.json())
      .then(data => { setAgents(data.agents || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const byNamespace = useMemo(() => {
    const map: Record<string, AIOXAgent[]> = {}
    for (const agent of agents) {
      if (!map[agent.namespace]) map[agent.namespace] = []
      map[agent.namespace].push(agent)
    }
    return map
  }, [agents])

  const sdcAgents = byNamespace['AIOX'] || []

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando agentes...</p>
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 min-h-0">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-4 max-w-5xl">

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span><span className="font-semibold text-foreground">{agents.length}</span> agentes</span>
              <span><span className="font-semibold text-foreground">{Object.keys(byNamespace).length}</span> namespaces</span>
              <span className="hidden sm:block">Clique em qualquer nó para abrir o perfil completo</span>
            </div>

            {/* SDC */}
            <SdcPipeline agents={sdcAgents} selected={selected} onSelect={setSelected} />

            {/* Divisor */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-1">
                Domínios especializados
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Zonas */}
            {DOMAIN_ZONES.map(zone => (
              <DomainZone
                key={zone.namespace}
                namespace={zone.namespace}
                label={zone.label}
                description={zone.description}
                agents={byNamespace[zone.namespace] || []}
                selected={selected}
                onSelect={setSelected}
              />
            ))}

          </div>
        </ScrollArea>
      </div>

      {/* Modal */}
      {selected && (
        <AgentModal agent={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
