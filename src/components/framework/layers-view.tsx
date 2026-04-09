'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Lock, Settings, FolderOpen, Hammer, ChevronDown, ChevronRight } from 'lucide-react'

const LAYERS = [
  {
    id: 'L1',
    label: 'L1 — Core',
    subtitle: 'Nunca modificar',
    description: 'Motor do framework. Tocar aqui quebra o AIOX inteiro.',
    mutability: 'NEVER' as const,
    icon: Lock,
    paths: [
      '.aiox-core/core/',
      '.aiox-core/constitution.md',
      'bin/aiox.js',
      'bin/aiox-init.js',
    ],
    examples: [
      'Runtime de synapse',
      'Constitution (princípios inegociáveis)',
      'CLI principal',
    ],
    rule: 'Qualquer alteração aqui exige aprovação do maintainer do AIOX upstream.',
  },
  {
    id: 'L2',
    label: 'L2 — Templates',
    subtitle: 'Extend-only',
    description: 'Templates e workflows base. Crie novos, nunca modifique os existentes.',
    mutability: 'EXTEND' as const,
    icon: FolderOpen,
    paths: [
      '.aiox-core/development/tasks/',
      '.aiox-core/development/templates/',
      '.aiox-core/development/checklists/',
      '.aiox-core/development/workflows/',
      '.aiox-core/infrastructure/',
    ],
    examples: [
      'create-story.md, qa-gate.md',
      'prd-tmpl.yaml, story-tmpl.yaml',
      'Workflows: SDC, brownfield, greenfield',
    ],
    rule: 'Se precisar customizar um template, crie um novo em L3 baseado no de L2.',
  },
  {
    id: 'L3',
    label: 'L3 — Configuração',
    subtitle: 'Mutável com exceções',
    description: 'Configuração do projeto e memória dos agentes. Sua área de customização.',
    mutability: 'MUTABLE' as const,
    icon: Settings,
    paths: [
      '.aiox-core/data/',
      'agents/*/MEMORY.md',
      '.aiox-core/core-config.yaml',
    ],
    examples: [
      'entity-registry.yaml (entidades do projeto)',
      'MEMORY.md de cada agente',
      'core-config.yaml (boundary, toggles)',
    ],
    rule: 'É aqui que você adiciona novos agentes, regras e dados. Seguro para modificar.',
  },
  {
    id: 'L4',
    label: 'L4 — Runtime',
    subtitle: 'Sempre modificar',
    description: 'Stories, código do projeto, testes. O trabalho real acontece aqui.',
    mutability: 'ALWAYS' as const,
    icon: Hammer,
    paths: [
      'docs/stories/',
      'packages/',
      'squads/',
      'tests/',
    ],
    examples: [
      'docs/stories/epic-X/story-Y.md',
      'packages/crm/, packages/studio/',
      'Testes e documentação do projeto',
    ],
    rule: 'Sem restrições aqui. É onde código e stories vivem.',
  },
]

const MUTABILITY_CONFIG = {
  NEVER: { label: 'Protegido', className: 'bg-[hsl(var(--status-error)/0.15)] text-[hsl(var(--status-error))] border-[hsl(var(--status-error)/0.3)]' },
  EXTEND: { label: 'Extend-only', className: 'bg-[hsl(var(--status-warning)/0.15)] text-[hsl(var(--status-warning))] border-[hsl(var(--status-warning)/0.3)]' },
  MUTABLE: { label: 'Configurável', className: 'bg-[hsl(var(--accent-primary)/0.15)] text-[hsl(var(--accent-primary))] border-[hsl(var(--accent-primary)/0.3)]' },
  ALWAYS: { label: 'Livre', className: 'bg-[hsl(var(--status-success)/0.15)] text-[hsl(var(--status-success))] border-[hsl(var(--status-success)/0.3)]' },
}

const BORDER_COLOR = {
  NEVER: 'border-[hsl(var(--status-error)/0.4)]',
  EXTEND: 'border-[hsl(var(--status-warning)/0.4)]',
  MUTABLE: 'border-[hsl(var(--accent-primary)/0.4)]',
  ALWAYS: 'border-[hsl(var(--status-success)/0.4)]',
}

export function LayersView() {
  const [expanded, setExpanded] = useState<string | null>('L3')

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="border-b border-border px-6 py-4">
        <p className="text-sm text-muted-foreground max-w-2xl">
          O AIOX é organizado em 4 camadas de mutabilidade. Entender onde cada coisa vive é a chave
          para adicionar capacidades sem quebrar o ecossistema existente.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {LAYERS.map((layer) => {
            const Icon = layer.icon
            const isExpanded = expanded === layer.id
            const mutConfig = MUTABILITY_CONFIG[layer.mutability]
            const borderColor = BORDER_COLOR[layer.mutability]

            return (
              <div
                key={layer.id}
                className={cn(
                  'rounded-lg border-2 bg-card transition-all',
                  borderColor
                )}
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : layer.id)}
                  className="w-full flex items-center gap-4 p-4 text-left"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold">{layer.label}</span>
                      <Badge variant="outline" className={cn('text-xs border', mutConfig.className)}>
                        {mutConfig.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{layer.description}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">Paths</p>
                      <div className="space-y-1">
                        {layer.paths.map(p => (
                          <code key={p} className="block text-xs font-mono bg-secondary px-2 py-1 rounded text-foreground">
                            {p}
                          </code>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">Exemplos</p>
                      <ul className="space-y-1">
                        {layer.examples.map(e => (
                          <li key={e} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                            {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={cn('rounded-md border px-3 py-2', mutConfig.className)}>
                      <p className="text-xs font-medium">Regra: {layer.rule}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Visual legend */}
        <div className="max-w-2xl mx-auto mt-6 rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">Como decidir onde adicionar algo novo</p>
          <div className="space-y-2">
            {[
              { q: 'Quero criar um novo agente', a: 'Crie em L3 → agents/meu-agente.md', layer: 'L3' },
              { q: 'Quero criar uma nova task', a: 'Crie em L3 baseado num template L2', layer: 'L3' },
              { q: 'Quero modificar uma task existente', a: 'Nunca. Crie uma nova versão em L3', layer: 'L2' },
              { q: 'Quero criar código do projeto', a: 'Sempre em L4 → packages/ ou squads/', layer: 'L4' },
            ].map(item => (
              <div key={item.q} className="flex items-start gap-3 text-xs">
                <span className="text-muted-foreground shrink-0 mt-0.5">→</span>
                <div>
                  <span className="text-foreground font-medium">{item.q}</span>
                  <span className="text-muted-foreground"> — {item.a}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
