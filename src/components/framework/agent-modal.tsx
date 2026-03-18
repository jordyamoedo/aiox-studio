'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AIOXAgent } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

const NS_STYLE: Record<string, { label: string; accent: string; chip: string }> = {
  AIOX:                 { label: 'Core AIOX',      accent: 'hsl(var(--accent-primary))',  chip: 'bg-[hsl(var(--accent-primary)/0.12)] border-[hsl(var(--accent-primary)/0.4)] text-[hsl(var(--accent-primary))]' },
  chiefs:               { label: 'Chiefs',          accent: '#f59e0b',                     chip: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
  'claude-code-mastery':{ label: 'Claude Mastery',  accent: '#6366f1',                     chip: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' },
  'design-system':      { label: 'Design System',  accent: '#ec4899',                     chip: 'bg-pink-500/10 border-pink-500/30 text-pink-400' },
  'cohort-squad':       { label: 'Squads',          accent: '#14b8a6',                     chip: 'bg-teal-500/10 border-teal-500/30 text-teal-400' },
  synapse:              { label: 'Synapse',          accent: '#8b5cf6',                     chip: 'bg-violet-500/10 border-violet-500/30 text-violet-400' },
}

const QUALITY_GATES: Record<string, { title: string; items: string[] }> = {
  qa: {
    title: 'QA Gate — 7 critérios obrigatórios',
    items: [
      '1. Code Review — padrões, legibilidade, manutenibilidade',
      '2. Unit Tests — cobertura adequada, todos passando',
      '3. Acceptance Criteria — todos os AC da story cumpridos',
      '4. No Regressions — funcionalidade existente preservada',
      '5. Performance — dentro dos limites aceitáveis',
      '6. Security — OWASP basics verificados',
      '7. Documentation — docs atualizados se necessário',
    ],
  },
  po: {
    title: 'Validação de Story — 10 critérios (GO ≥ 7/10)',
    items: [
      '1. Título claro e objetivo',
      '2. Descrição completa (problema/necessidade explicados)',
      '3. Critérios de aceite testáveis (Given/When/Then)',
      '4. Escopo bem definido (IN e OUT listados)',
      '5. Dependências mapeadas (stories/recursos pré-requisito)',
      '6. Estimativa de complexidade (pontos ou T-shirt)',
      '7. Valor de negócio claro (benefício para usuário/negócio)',
      '8. Riscos documentados (problemas potenciais identificados)',
      '9. Critérios de Done (definição clara de completo)',
      '10. Alinhamento com PRD/Épico (consistência com docs-fonte)',
    ],
  },
  devops: {
    title: 'Gate de Publicação',
    items: [
      'QA PASS obrigatório antes de qualquer push',
      'Branch limpa, sem conflitos',
      'CI pipeline verde',
      'PR criado com descrição e story vinculada',
      'Nenhum outro agente pode executar git push',
    ],
  },
  dev: {
    title: 'Self-Healing CodeRabbit',
    items: [
      'CRITICAL → auto-fix (máx 2 iterações)',
      'HIGH → auto-fix, documenta como dívida se falhar',
      'MEDIUM → documenta como dívida técnica',
      'LOW → ignora',
      'Após 2 iterações sem resolver CRITICAL → HALT para intervenção manual',
    ],
  },
  pm: {
    title: 'Gate de Épico',
    items: [
      'Épico criado com execução wave-based',
      'Stories delineadas antes de execução',
      'Quality gates previstos por story',
      'Agentes especializados assignados por domínio',
      'Spec Pipeline ativo para features complexas',
    ],
  },
}

// ── Seção colapsável ──────────────────────────────────────────────────────────

function Section({ title, defaultOpen = true, children }: {
  title: string; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-secondary/30 hover:bg-secondary/50 transition-colors"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
        {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function AgentModal({ agent, onClose }: { agent: AIOXAgent; onClose: () => void }) {
  const style = NS_STYLE[agent.namespace] || NS_STYLE['cohort-squad']
  const gate = QUALITY_GATES[agent.id]

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 flex flex-col h-full w-full max-w-xl bg-card border-l border-border shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border shrink-0">
          <div className="flex items-start gap-3">
            {agent.icon && (
              <span className="text-2xl mt-0.5" role="img" aria-label={agent.name}>{agent.icon}</span>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold text-base font-mono">@{agent.id}</h2>
                <Badge className={cn('text-xs border', style.chip)}>{style.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{agent.name}{agent.archetype ? ` — ${agent.archetype}` : ''}{agent.zodiac ? ` ${agent.zodiac}` : ''}</p>
              {agent.greeting && (
                <p className="text-xs text-muted-foreground/70 italic mt-1">"{agent.greeting}"</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <ScrollArea className="flex-1">
          <div className="p-5 space-y-3">

            {/* Função + Ativação */}
            <Section title="Identidade" defaultOpen={true}>
              <div className="space-y-3">
                {agent.role && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Função</p>
                    <p className="text-sm font-medium">{agent.role}</p>
                  </div>
                )}
                {agent.identity && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Identidade</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{agent.identity}</p>
                  </div>
                )}
                {agent.style && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Estilo</p>
                    <p className="text-sm text-muted-foreground">{agent.style}</p>
                  </div>
                )}
                {agent.whenToUse && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Quando usar</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{agent.whenToUse}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Ativar com</p>
                  <code className="block text-xs bg-secondary px-3 py-2 rounded-lg font-mono">{agent.activationCmd}</code>
                </div>
              </div>
            </Section>

            {/* Personalidade */}
            {(agent.tone || agent.vocabulary?.length || agent.signatureClosing) && (
              <Section title="Personalidade & Comunicação" defaultOpen={false}>
                <div className="space-y-3">
                  {agent.tone && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Tom</p>
                      <p className="text-sm capitalize text-muted-foreground">{agent.tone}</p>
                    </div>
                  )}
                  {agent.vocabulary && agent.vocabulary.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Vocabulário característico</p>
                      <div className="flex flex-wrap gap-1.5">
                        {agent.vocabulary.map(v => (
                          <span key={v} className="text-xs bg-secondary border border-border px-2 py-0.5 rounded-md text-muted-foreground">{v}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {agent.signatureClosing && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Assinatura</p>
                      <p className="text-xs italic text-muted-foreground">{agent.signatureClosing}</p>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Diretrizes */}
            {(agent.corePrinciples?.length || agent.customization) && (
              <Section title="Diretrizes & Princípios" defaultOpen={true}>
                <div className="space-y-3">
                  {agent.corePrinciples && agent.corePrinciples.length > 0 && (
                    <div className="space-y-1.5">
                      {agent.corePrinciples.map((p, i) => (
                        <div key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                          <span className="shrink-0 text-[hsl(var(--accent-primary))] font-bold mt-0.5">·</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {agent.customization && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Customização</p>
                      <div className="space-y-1">
                        {agent.customization.split('\n').filter(Boolean).map((line, i) => (
                          <p key={i} className="text-xs text-muted-foreground leading-relaxed">{line}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Quality Gate */}
            {gate && (
              <Section title={`Quality Gate — @${agent.id}`} defaultOpen={true}>
                <div>
                  <p className="text-xs font-medium text-foreground mb-3">{gate.title}</p>
                  <div className="space-y-1.5">
                    {gate.items.map((item, i) => (
                      <div key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                        <span className="shrink-0 text-[hsl(var(--status-success))] font-bold mt-0.5">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>
            )}

            {/* Comandos */}
            {(agent.commandsFull?.length > 0 || agent.commands.length > 0) && (
              <Section title={`Comandos (${agent.commandsFull?.length || agent.commands.length})`} defaultOpen={false}>
                <div className="space-y-2">
                  {(agent.commandsFull?.length ? agent.commandsFull : agent.commands.map(c => ({ name: c, description: '', args: undefined, visibility: undefined }))).map((cmd, i) => (
                    <div key={i} className="flex gap-3 py-1.5 border-b border-border/40 last:border-0">
                      <div className="shrink-0">
                        <code className="text-xs bg-secondary border border-border px-2 py-0.5 rounded font-mono whitespace-nowrap">
                          *{cmd.name}{cmd.args ? ` ${cmd.args}` : ''}
                        </code>
                      </div>
                      {cmd.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{cmd.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Dependências */}
            {agent.dependencies && Object.keys(agent.dependencies).some(k => (agent.dependencies as Record<string, string[] | undefined>)[k]?.length) && (
              <Section title="Dependências" defaultOpen={false}>
                <div className="space-y-3">
                  {(['tasks', 'templates', 'checklists', 'workflows', 'data', 'utils'] as const).map(key => {
                    const items = agent.dependencies?.[key]
                    if (!items?.length) return null
                    return (
                      <div key={key}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 capitalize">{key}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {items.map(item => (
                            <span key={item} className="text-[10px] bg-secondary border border-border px-1.5 py-0.5 rounded font-mono text-muted-foreground">{item}</span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}

          </div>
        </ScrollArea>

        {/* Footer */}
        {agent.signatureClosing && (
          <div className="px-5 py-3 border-t border-border shrink-0">
            <p className="text-xs text-muted-foreground italic">{agent.signatureClosing}</p>
          </div>
        )}
      </div>
    </div>
  )
}
