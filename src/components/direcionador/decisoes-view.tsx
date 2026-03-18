'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { useLocalDecisions, type Decision } from '@/hooks/use-local-decisions'
import { GitBranch, ArrowRight, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ── Status config ──────────────────────────────────────────────────────────────

const STATUS: Record<Decision['status'], {
  label: string
  border: string
  badge: string
}> = {
  active: {
    label: 'Ativa',
    border: 'border-l-[hsl(var(--accent-primary))]',
    badge: 'bg-[hsl(var(--accent-primary))]/10 text-[hsl(var(--accent-primary))] border-[hsl(var(--accent-primary))]/30',
  },
  pending: {
    label: 'Em análise',
    border: 'border-l-[hsl(var(--status-warning))]',
    badge: 'bg-[hsl(var(--status-warning))]/10 text-[hsl(var(--status-warning))] border-[hsl(var(--status-warning))]/30',
  },
  resolved: {
    label: 'Concluída',
    border: 'border-l-[hsl(var(--status-success))]',
    badge: 'bg-[hsl(var(--status-success))]/10 text-[hsl(var(--status-success))] border-[hsl(var(--status-success))]/30',
  },
}

const STATUS_ORDER: Decision['status'][] = ['active', 'pending', 'resolved']

// ── Decision card ──────────────────────────────────────────────────────────────

function DecisionCard({
  decision, onUpdate, onRemove,
}: {
  decision: Decision
  onUpdate: (id: string, patch: Partial<Decision>) => void
  onRemove: (id: string) => void
}) {
  const s = STATUS[decision.status]

  const cycleStatus = () => {
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(decision.status) + 1) % STATUS_ORDER.length]
    onUpdate(decision.id, { status: next })
  }

  const date = new Date(decision.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: '2-digit',
  })

  return (
    <div className={cn(
      'rounded-lg border border-border border-l-2 bg-card p-4 transition-colors hover:bg-secondary/20',
      s.border
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium mb-1 truncate">{decision.title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {decision.excerpt}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={cycleStatus} className="shrink-0">
              <Badge className={cn('text-[10px] border cursor-pointer hover:opacity-80 transition-opacity', s.badge)}>
                {s.label}
              </Badge>
            </button>
            <span className="text-[10px] text-muted-foreground">{date}</span>
          </div>
        </div>
        <button
          onClick={() => onRemove(decision.id)}
          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5"
          title="Remover"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary mb-4">
        <GitBranch className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">Nenhuma decisão ainda</p>
      <p className="text-xs text-muted-foreground max-w-xs mb-6">
        No chat do Direcionador, clique em{' '}
        <span className="font-medium text-foreground">Salvar como decisão</span>{' '}
        nas respostas que fazem sentido manter.
      </p>
      <Link
        href="/direcionador/chat"
        className="inline-flex items-center gap-2 text-xs font-medium text-[hsl(var(--accent-direcionador))] hover:underline"
      >
        Abrir o Direcionador
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────

type Filter = Decision['status'] | 'all'

export function DecisoesView() {
  const { decisions, update, remove } = useLocalDecisions()
  const [filter, setFilter] = useState<Filter>('all')

  const counts = {
    all: decisions.length,
    active: decisions.filter(d => d.status === 'active').length,
    pending: decisions.filter(d => d.status === 'pending').length,
    resolved: decisions.filter(d => d.status === 'resolved').length,
  }

  const filtered = filter === 'all' ? decisions : decisions.filter(d => d.status === filter)

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-4">

        {decisions.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Filter tabs */}
            <div className="flex items-center gap-1 border-b border-border pb-3">
              {(['all', 'active', 'pending', 'resolved'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs transition-colors',
                    filter === f
                      ? 'bg-secondary text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  )}
                >
                  {f === 'all' ? 'Todas' : STATUS[f].label}
                  {' '}
                  <span className="text-[10px] opacity-60">({counts[f]})</span>
                </button>
              ))}
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {filtered.map(d => (
                <DecisionCard
                  key={d.id}
                  decision={d}
                  onUpdate={update}
                  onRemove={remove}
                />
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-10">
                  Nenhuma decisão com este filtro.
                </p>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
