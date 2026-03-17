'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Radio, RefreshCw, CheckCircle2, AlertCircle, ArrowUpCircle, Loader2 } from 'lucide-react'

interface SentinelaData {
  localVersion: string
  upstreamVersion: string | null
  hasUpdate: boolean
  error?: string
  checkedAt: string
}

const MOCK_RECOMMENDATIONS = [
  {
    type: 'ABSORVER' as const,
    component: 'autonomous-chaining.md',
    reason: 'Nova regra de encadeamento com support a Chiefs externos — melhora orquestração de squads não-SDC',
    conflict: undefined,
  },
  {
    type: 'AVALIAR' as const,
    component: 'agent-handoff-tmpl.yaml',
    reason: 'Template de handoff atualizado com campo deliverables — você tem handoffs customizados para avaliar antes de absorver',
    conflict: 'Handoffs existentes em .aiox/handoffs/ podem precisar de migração',
  },
  {
    type: 'IGNORAR' as const,
    component: 'bob-orchestrator.js',
    reason: 'Feature para perfil "bob" (assistido). Você usa perfil "advanced" — não se aplica.',
    conflict: undefined,
  },
]

const TYPE_CONFIG = {
  ABSORVER: {
    icon: CheckCircle2,
    label: 'Absorver',
    className: 'bg-[hsl(var(--status-success)/0.15)] text-[hsl(var(--status-success))] border-[hsl(var(--status-success)/0.3)]',
  },
  AVALIAR: {
    icon: AlertCircle,
    label: 'Avaliar',
    className: 'bg-[hsl(var(--status-warning)/0.15)] text-[hsl(var(--status-warning))] border-[hsl(var(--status-warning)/0.3)]',
  },
  IGNORAR: {
    icon: Radio,
    label: 'Ignorar',
    className: 'bg-secondary text-muted-foreground border-border',
  },
}

export function SentinelaView() {
  const [data, setData] = useState<SentinelaData | null>(null)
  const [loading, setLoading] = useState(false)

  const check = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sentinel/check')
      const json = await res.json()
      setData(json)
    } catch {
      setData({
        localVersion: 'unknown',
        upstreamVersion: null,
        hasUpdate: false,
        error: 'Erro ao verificar',
        checkedAt: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Version card */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium mb-1">Versão local</p>
              <div className="flex items-center gap-2">
                <code className="text-lg font-mono font-bold">
                  {data?.localVersion || 'v5.0.3'}
                </code>
                <Badge variant="secondary" className="text-xs">atual</Badge>
              </div>
              {data?.checkedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Verificado em {new Date(data.checkedAt).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
            <Button
              onClick={check}
              disabled={loading}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Verificar upstream
            </Button>
          </div>

          {data && (
            <div className="border-t border-border pt-4">
              {data.error ? (
                <p className="text-xs text-muted-foreground">{data.error} — sem conectividade com o upstream agora.</p>
              ) : data.hasUpdate ? (
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="h-4 w-4 text-[hsl(var(--status-warning))]" />
                  <p className="text-sm">
                    Versão <code className="font-mono font-semibold">{data.upstreamVersion}</code> disponível upstream
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[hsl(var(--status-success))]" />
                  <p className="text-sm text-muted-foreground">Você está na versão mais recente</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Recomendações</p>
            <Badge variant="outline" className="text-xs">Demo — dados reais após sync</Badge>
          </div>

          <div className="space-y-3">
            {MOCK_RECOMMENDATIONS.map((rec, i) => {
              const config = TYPE_CONFIG[rec.type]
              const Icon = config.icon
              return (
                <div key={i} className={`rounded-lg border p-4 ${config.className}`}>
                  <div className="flex items-start gap-3">
                    <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wide">{config.label}</span>
                        <code className="text-xs font-mono">{rec.component}</code>
                      </div>
                      <p className="text-xs">{rec.reason}</p>
                      {rec.conflict && (
                        <p className="text-xs mt-1 opacity-80">
                          ⚠ {rec.conflict}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Como o Sentinela funciona</p>
          <ul className="space-y-1.5">
            {[
              'Compara sua versão local com o repositório upstream do AIOX',
              'Para cada mudança, avalia se conflita com suas customizações',
              'Nunca aplica nada automaticamente — você sempre decide',
              'ABSORVER: seguro aplicar direto',
              'AVALIAR: analise antes — pode ter conflito',
              'IGNORAR: não se aplica ao seu contexto',
            ].map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
