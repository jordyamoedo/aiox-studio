'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { AIOXAgent } from '@/types'

// Grupos de agentes por função
const AGENT_GROUPS = [
  {
    id: 'product',
    label: 'Produto',
    color: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    agents: ['pm', 'po', 'sm', 'analyst'],
  },
  {
    id: 'dev',
    label: 'Desenvolvimento',
    color: 'bg-green-500/10 border-green-500/30 text-green-400',
    agents: ['architect', 'dev', 'data-engineer', 'qa'],
  },
  {
    id: 'deploy',
    label: 'Deploy & Docs',
    color: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    agents: ['devops', 'doc-guardian', 'ux-design-expert'],
  },
  {
    id: 'master',
    label: 'Orquestrador',
    color: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    agents: ['aiox-master'],
  },
]

export function AgentMap() {
  const [agents, setAgents] = useState<AIOXAgent[]>([])
  const [selected, setSelected] = useState<AIOXAgent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/framework/agents')
      .then(r => r.json())
      .then(data => {
        setAgents(data.agents || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const getAgentsByGroup = (ids: string[]) =>
    agents.filter(a => ids.includes(a.id))

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando agentes...</p>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Mapa */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-lg font-semibold">Mapa do Framework</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {agents.length} agentes ativos — clique para ver detalhes
          </p>
        </div>

        <div className="space-y-6">
          {AGENT_GROUPS.map(group => {
            const groupAgents = getAgentsByGroup(group.agents)
            return (
              <div key={group.id}>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.agents.map(agentId => {
                    const agent = agents.find(a => a.id === agentId)
                    return (
                      <button
                        key={agentId}
                        onClick={() => setSelected(agent || null)}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-lg border text-sm
                          transition-all cursor-pointer
                          ${group.color}
                          ${selected?.id === agentId ? 'ring-1 ring-current' : 'hover:opacity-80'}
                          ${!agent ? 'opacity-40' : ''}
                        `}
                      >
                        <span className="font-mono text-xs">@{agentId}</span>
                        {agent && (
                          <span className="text-xs opacity-70 hidden sm:inline">
                            {agent.name}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Pipeline SDC */}
        <div className="mt-8">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Pipeline principal (SDC)
          </p>
          <div className="flex items-center gap-1 flex-wrap">
            {['sm', 'po', 'dev', 'qa', 'devops'].map((id, i) => (
              <div key={id} className="flex items-center gap-1">
                <button
                  onClick={() => setSelected(agents.find(a => a.id === id) || null)}
                  className="px-2 py-1 rounded text-xs font-mono bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  @{id}
                </button>
                {i < 4 && <span className="text-muted-foreground text-xs">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Painel lateral do agente selecionado */}
      {selected && (
        <div className="w-80 border-l border-border p-4 bg-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-semibold">@{selected.id}</h2>
              <p className="text-xs text-muted-foreground">{selected.name}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Função
              </p>
              <p className="text-sm">{selected.role}</p>
            </div>

            {selected.whenToUse && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Quando usar
                </p>
                <p className="text-sm text-muted-foreground">{selected.whenToUse}</p>
              </div>
            )}

            {selected.commands.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Comandos
                </p>
                <ScrollArea className="h-32">
                  <div className="space-y-1">
                    {selected.commands.map(cmd => (
                      <code
                        key={cmd}
                        className="block text-xs bg-secondary px-2 py-1 rounded font-mono"
                      >
                        *{cmd}
                      </code>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Ativar com
              </p>
              <code className="text-xs bg-secondary px-2 py-1 rounded font-mono block">
                /AIOX:agents:{selected.id}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
