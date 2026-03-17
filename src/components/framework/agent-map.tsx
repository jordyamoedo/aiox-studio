'use client'

import { useEffect, useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, X, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AIOXAgent } from '@/types'

// ── Metadados por namespace ──────────────────────────────────────────────────

const NAMESPACE_META: Record<string, {
  label: string
  description: string
  color: string
  defaultOpen: boolean
}> = {
  AIOX: {
    label: 'Core AIOX',
    description: 'Agentes do ciclo principal de desenvolvimento',
    color: 'border-[hsl(var(--accent-primary)/0.4)] bg-[hsl(var(--accent-primary)/0.04)]',
    defaultOpen: true,
  },
  chiefs: {
    label: 'Chiefs',
    description: 'Orquestradores de domínio — marketing, design, dados, tráfego',
    color: 'border-amber-500/40 bg-amber-500/[0.03]',
    defaultOpen: true,
  },
  'claude-code-mastery': {
    label: 'Claude Mastery',
    description: 'Especialistas em otimizar o ambiente Claude Code',
    color: 'border-[hsl(234_60%_55%/0.4)] bg-[hsl(234_60%_55%/0.04)]',
    defaultOpen: false,
  },
  'design-system': {
    label: 'Design System',
    description: 'Especialistas em sistemas de design atômico e visual',
    color: 'border-[hsl(330_70%_55%/0.4)] bg-[hsl(330_70%_55%/0.04)]',
    defaultOpen: false,
  },
  'cohort-squad': {
    label: 'Squads',
    description: 'Squads especializados para domínios específicos',
    color: 'border-teal-500/40 bg-teal-500/[0.03]',
    defaultOpen: false,
  },
}

// Agrupamento interno do Core AIOX
const AIOX_SUBGROUPS: Record<string, { ids: string[]; label: string; chipColor: string }> = {
  orquestrador: {
    ids: ['aiox-master'],
    label: 'Orquestrador',
    chipColor: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  },
  produto: {
    ids: ['pm', 'po', 'sm', 'analyst'],
    label: 'Produto',
    chipColor: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  },
  dev: {
    ids: ['architect', 'dev', 'data-engineer', 'qa', 'devops'],
    label: 'Dev',
    chipColor: 'bg-green-500/10 border-green-500/30 text-green-400',
  },
  especialistas: {
    ids: ['ux-design-expert', 'doc-guardian', 'squad-creator'],
    label: 'Especialistas',
    chipColor: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
  },
}

const NAMESPACE_ORDER = ['AIOX', 'chiefs', 'claude-code-mastery', 'design-system', 'cohort-squad']

// ── Pipeline SDC ─────────────────────────────────────────────────────────────

const SDC_PIPELINE = ['sm', 'po', 'dev', 'qa', 'devops']

// ── AgentChip ────────────────────────────────────────────────────────────────

function AgentChip({
  agent,
  chipColor,
  selected,
  onClick,
}: {
  agent: AIOXAgent
  chipColor: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all cursor-pointer',
        chipColor,
        selected ? 'ring-1 ring-current scale-[1.02]' : 'hover:opacity-90'
      )}
    >
      <span className="font-mono font-medium">@{agent.id}</span>
      <span className="opacity-60 hidden sm:inline truncate max-w-[80px]">{agent.name}</span>
    </button>
  )
}

// ── AgentDetail panel ────────────────────────────────────────────────────────

function AgentDetail({
  agent,
  onClose,
}: {
  agent: AIOXAgent
  onClose: () => void
}) {
  const nsMeta = NAMESPACE_META[agent.namespace] || NAMESPACE_META['cohort-squad']

  return (
    <div className="w-80 shrink-0 border-l border-border bg-card flex flex-col">
      <div className="flex items-start justify-between p-4 border-b border-border">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-sm">@{agent.id}</span>
            <Badge variant="outline" className="text-xs shrink-0">{nsMeta.label}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{agent.name}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {agent.role && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Função</p>
              <p className="text-sm">{agent.role}</p>
            </div>
          )}

          {agent.whenToUse && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Quando usar</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{agent.whenToUse}</p>
            </div>
          )}

          {agent.commands.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Comandos ({agent.commands.length})
              </p>
              <div className="space-y-1">
                {agent.commands.map(cmd => (
                  <code key={cmd} className="block text-xs bg-secondary px-2 py-1 rounded font-mono">
                    *{cmd}
                  </code>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Ativar com</p>
            <code className="block text-xs bg-secondary px-2 py-1.5 rounded font-mono break-all">
              {agent.activationCmd}
            </code>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

// ── NamespaceSection ─────────────────────────────────────────────────────────

function NamespaceSection({
  namespace,
  agents,
  selected,
  onSelect,
}: {
  namespace: string
  agents: AIOXAgent[]
  selected: AIOXAgent | null
  onSelect: (a: AIOXAgent) => void
}) {
  const meta = NAMESPACE_META[namespace] || NAMESPACE_META['cohort-squad']
  const [open, setOpen] = useState(meta.defaultOpen)

  if (agents.length === 0) return null

  const defaultChipColor = namespace === 'chiefs'
    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
    : namespace === 'claude-code-mastery'
    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
    : namespace === 'design-system'
    ? 'bg-pink-500/10 border-pink-500/30 text-pink-400'
    : namespace === 'cohort-squad'
    ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
    : 'bg-secondary border-border text-foreground'

  return (
    <div className={cn('rounded-xl border-2 transition-all', meta.color)}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">{meta.label}</span>
          <Badge variant="secondary" className="text-xs">{agents.length}</Badge>
          <span className="text-xs text-muted-foreground hidden sm:block">{meta.description}</span>
        </div>
        {open
          ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        }
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-border/50 pt-3">
          {namespace === 'AIOX' ? (
            // AIOX core: subgroups
            <div className="space-y-3">
              {Object.entries(AIOX_SUBGROUPS).map(([key, sub]) => {
                const subAgents = agents.filter(a => sub.ids.includes(a.id))
                if (subAgents.length === 0) return null
                return (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">{sub.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {sub.ids.map(id => {
                        const agent = subAgents.find(a => a.id === id)
                        if (!agent) return (
                          <div key={id} className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs opacity-30', sub.chipColor)}>
                            <span className="font-mono">@{id}</span>
                          </div>
                        )
                        return (
                          <AgentChip
                            key={id}
                            agent={agent}
                            chipColor={sub.chipColor}
                            selected={selected?.id === id}
                            onClick={() => onSelect(agent)}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // Outros namespaces: flat list
            <div className="flex flex-wrap gap-2">
              {agents.map(agent => (
                <AgentChip
                  key={agent.id}
                  agent={agent}
                  chipColor={defaultChipColor}
                  selected={selected?.id === agent.id}
                  onClick={() => onSelect(agent)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main AgentMap ─────────────────────────────────────────────────────────────

export function AgentMap() {
  const [agents, setAgents] = useState<AIOXAgent[]>([])
  const [selected, setSelected] = useState<AIOXAgent | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/api/framework/agents')
      .then(r => r.json())
      .then(data => { setAgents(data.agents || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return agents
    const q = query.toLowerCase()
    return agents.filter(a =>
      a.id.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      a.namespace.toLowerCase().includes(q)
    )
  }, [agents, query])

  const byNamespace = useMemo(() => {
    const map: Record<string, AIOXAgent[]> = {}
    for (const ns of NAMESPACE_ORDER) map[ns] = []
    for (const agent of filtered) {
      if (!map[agent.namespace]) map[agent.namespace] = []
      map[agent.namespace].push(agent)
    }
    return map
  }, [filtered])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando agentes...</p>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Left — map */}
      <div className={cn('flex flex-col overflow-hidden transition-all', selected ? 'flex-1' : 'flex-1')}>
        {/* Header + search */}
        <div className="border-b border-border px-6 py-3 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">
              {agents.length} agentes em {Object.keys(byNamespace).filter(k => byNamespace[k].length > 0).length} namespaces
              {query && ` — ${filtered.length} resultados`}
            </p>
          </div>
          <div className="relative w-56 shrink-0">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Filtrar agentes..."
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4 max-w-3xl">
            {NAMESPACE_ORDER.map(ns => (
              <NamespaceSection
                key={ns}
                namespace={ns}
                agents={byNamespace[ns] || []}
                selected={selected}
                onSelect={setSelected}
              />
            ))}

            {/* SDC Pipeline */}
            <div className="pt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Pipeline principal (SDC)
              </p>
              <div className="flex items-center gap-1 flex-wrap">
                {SDC_PIPELINE.map((id, i) => {
                  const agent = agents.find(a => a.id === id)
                  return (
                    <div key={id} className="flex items-center gap-1">
                      <button
                        onClick={() => agent && setSelected(agent)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-secondary hover:bg-secondary/80 border border-border transition-colors"
                      >
                        @{id}
                      </button>
                      {i < SDC_PIPELINE.length - 1 && (
                        <span className="text-muted-foreground text-xs">→</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right — detail panel */}
      {selected && (
        <AgentDetail agent={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
