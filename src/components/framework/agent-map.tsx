'use client'

import { useEffect, useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AIOXAgent } from '@/types'
import { AgentModal } from './agent-modal'

// ── Cores e metadados por namespace ──────────────────────────────────────────

const NS_STYLE: Record<string, { label: string; chip: string; zone: string }> = {
  AIOX:                { label: 'Core AIOX',      chip: 'bg-[hsl(var(--accent-primary)/0.12)] border-[hsl(var(--accent-primary)/0.35)] text-[hsl(var(--accent-primary))]',   zone: 'border-[hsl(var(--accent-primary)/0.3)] bg-[hsl(var(--accent-primary)/0.03)]' },
  chiefs:              { label: 'Chiefs',          chip: 'bg-amber-500/10 border-amber-500/30 text-amber-400',     zone: 'border-amber-500/30 bg-amber-500/[0.02]' },
  'claude-code-mastery':{ label: 'Claude Mastery', chip: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',  zone: 'border-indigo-500/30 bg-indigo-500/[0.02]' },
  'design-system':     { label: 'Design System',  chip: 'bg-pink-500/10 border-pink-500/30 text-pink-400',        zone: 'border-pink-500/30 bg-pink-500/[0.02]' },
  'cohort-squad':      { label: 'Squads',          chip: 'bg-teal-500/10 border-teal-500/30 text-teal-400',        zone: 'border-teal-500/30 bg-teal-500/[0.02]' },
  synapse:             { label: 'Synapse',         chip: 'bg-violet-500/10 border-violet-500/30 text-violet-400',  zone: 'border-violet-500/30 bg-violet-500/[0.02]' },
}

// ── Pipeline SDC ──────────────────────────────────────────────────────────────

const SDC_STEPS = [
  { id: 'sm',     label: 'Criar',       desc: 'Escreve a story a partir do épico' },
  { id: 'po',     label: 'Validar',     desc: 'Checklist de 10 pontos — GO/NO-GO' },
  { id: 'dev',    label: 'Implementar', desc: 'Código, commits locais, debugging' },
  { id: 'qa',     label: 'Revisar',     desc: '7 critérios — PASS/CONCERNS/FAIL' },
  { id: 'devops', label: 'Publicar',    desc: 'git push, PR, CI/CD — exclusivo' },
]

// Agentes que orbitam o SDC mas não são do pipeline
const SDC_SUPPORT: Record<string, { connectsTo: string; label: string }> = {
  'aiox-master':    { connectsTo: 'all',    label: 'Orquestra tudo' },
  'pm':             { connectsTo: 'sm',     label: 'Cria épicos → feeds @sm' },
  'analyst':        { connectsTo: 'pm',     label: 'Pesquisa → feeds @pm' },
  'architect':      { connectsTo: 'dev',    label: 'Arquitetura → feeds @dev' },
  'data-engineer':  { connectsTo: 'dev',    label: 'Schema/DB → feeds @dev' },
  'ux-design-expert':{ connectsTo: 'dev',   label: 'UX/UI → feeds @dev' },
  'doc-guardian':   { connectsTo: 'devops', label: 'Docs → valida após @devops' },
}

// ── AgentChip ─────────────────────────────────────────────────────────────────

function AgentChip({
  agent, selected, onClick,
}: { agent: AIOXAgent; selected: boolean; onClick: () => void }) {
  const style = NS_STYLE[agent.namespace] || NS_STYLE['cohort-squad']
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all cursor-pointer shrink-0',
        style.chip,
        selected ? 'ring-1 ring-current scale-[1.03] shadow-sm' : 'hover:opacity-80'
      )}
    >
      <span className="font-mono font-medium">@{agent.id}</span>
    </button>
  )
}


// ── SDC Pipeline visual ───────────────────────────────────────────────────────

function SdcPipeline({
  agents, selected, onSelect,
}: { agents: AIOXAgent[]; selected: AIOXAgent | null; onSelect: (a: AIOXAgent) => void }) {
  const getAgent = (id: string) => agents.find(a => a.id === id)

  return (
    <div className="rounded-xl border-2 border-[hsl(var(--accent-primary)/0.3)] bg-[hsl(var(--accent-primary)/0.03)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--accent-primary))]">Pipeline SDC</span>
        <span className="text-xs text-muted-foreground">— ciclo completo de desenvolvimento</span>
      </div>

      {/* Pipeline steps */}
      <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
        {SDC_STEPS.map((step, i) => {
          const agent = getAgent(step.id)
          const isSelected = selected?.id === step.id
          return (
            <div key={step.id} className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => agent && onSelect(agent)}
                disabled={!agent}
                className={cn(
                  'flex flex-col items-center text-center px-4 py-3 rounded-xl border transition-all min-w-[100px]',
                  isSelected
                    ? 'border-[hsl(var(--accent-primary)/0.6)] bg-[hsl(var(--accent-primary)/0.12)] shadow-sm'
                    : 'border-[hsl(var(--accent-primary)/0.2)] bg-card hover:border-[hsl(var(--accent-primary)/0.4)] hover:bg-[hsl(var(--accent-primary)/0.06)]',
                  !agent && 'opacity-40 cursor-default'
                )}
              >
                <span className={cn('text-xs font-semibold mb-0.5', isSelected ? 'text-[hsl(var(--accent-primary))]' : 'text-foreground')}>
                  {step.label}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">@{step.id}</span>
                <span className="text-[10px] text-muted-foreground mt-1 leading-tight max-w-[90px] hidden sm:block">{step.desc}</span>
              </button>
              {i < SDC_STEPS.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 text-[hsl(var(--accent-primary)/0.5)] shrink-0" />
              )}
            </div>
          )
        })}
      </div>

      {/* Support agents */}
      <div className="mt-4 pt-3 border-t border-[hsl(var(--accent-primary)/0.15)]">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Suporte ao pipeline</p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(SDC_SUPPORT).map(id => {
            const agent = getAgent(id)
            if (!agent) return null
            return (
              <AgentChip key={id} agent={agent} selected={selected?.id === id} onClick={() => onSelect(agent)} />
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
    <div className={cn('rounded-xl border-2 transition-all', style.zone)}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
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
        <div className="px-4 pb-4 border-t border-border/40 pt-3 flex flex-wrap gap-2">
          {agents.map(agent => (
            <AgentChip
              key={agent.id}
              agent={agent}
              selected={selected?.id === agent.id}
              onClick={() => onSelect(agent)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Domínios externos (não-SDC) ───────────────────────────────────────────────

const DOMAIN_ZONES = [
  {
    namespace: 'chiefs',
    label: 'Chiefs',
    description: 'Orquestradores de domínio — cada um comanda um time de especialistas',
  },
  {
    namespace: 'claude-code-mastery',
    label: 'Claude Mastery',
    description: 'Especialistas em otimizar e expandir o ambiente Claude Code',
  },
  {
    namespace: 'design-system',
    label: 'Design System',
    description: 'Atomic design, tokens, componentes, DesignOps e geração de imagens',
  },
  {
    namespace: 'cohort-squad',
    label: 'Cohort Squad',
    description: 'Gestão de cohorts de compradores',
  },
  {
    namespace: 'synapse',
    label: 'Synapse',
    description: 'Motor de contexto — domains, rules e star-commands',
  },
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

  // Agentes do SDC + suporte (namespace AIOX)
  const sdcAgents = byNamespace['AIOX'] || []

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando agentes...</p>
      </div>
    )
  }

  return (
    <div className="relative flex h-full">
      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-4 max-w-4xl">

            {/* Estatísticas */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
              <span><span className="font-semibold text-foreground">{agents.length}</span> agentes</span>
              <span><span className="font-semibold text-foreground">{Object.keys(byNamespace).length}</span> namespaces</span>
              <span>Clique em qualquer agente para abrir o perfil completo</span>
            </div>

            {/* SDC + suporte AIOX */}
            <SdcPipeline agents={sdcAgents} selected={selected} onSelect={setSelected} />

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Domínios especializados</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Zonas de domínio */}
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

      {/* Modal de detalhe */}
      {selected && (
        <AgentModal agent={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
