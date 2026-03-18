'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Radio, RefreshCw, CheckCircle2, AlertCircle, ArrowUpCircle, Loader2, ScanLine } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VersionData {
  localVersion: string
  upstreamVersion: string | null
  hasUpdate: boolean
  error?: string
  checkedAt: string
}

interface Recommendation {
  type: 'ABSORVER' | 'AVALIAR' | 'IGNORAR'
  component: string
  reason: string
  conflict?: string
}

interface ScanData {
  recommendations: Recommendation[]
  total: number
  error?: string
}

const TYPE_CONFIG = {
  ABSORVER: {
    icon: CheckCircle2,
    label: 'Absorver',
    className: 'bg-[hsl(var(--status-success)/0.08)] border-[hsl(var(--status-success)/0.25)] text-foreground',
    badge: 'bg-[hsl(var(--status-success))]/10 text-[hsl(var(--status-success))] border-[hsl(var(--status-success))]/30',
    iconClass: 'text-[hsl(var(--status-success))]',
  },
  AVALIAR: {
    icon: AlertCircle,
    label: 'Avaliar',
    className: 'bg-[hsl(var(--status-warning)/0.08)] border-[hsl(var(--status-warning)/0.25)] text-foreground',
    badge: 'bg-[hsl(var(--status-warning))]/10 text-[hsl(var(--status-warning))] border-[hsl(var(--status-warning))]/30',
    iconClass: 'text-[hsl(var(--status-warning))]',
  },
  IGNORAR: {
    icon: Radio,
    label: 'Ignorar',
    className: 'bg-secondary/40 border-border text-muted-foreground',
    badge: 'bg-secondary text-muted-foreground border-border',
    iconClass: 'text-muted-foreground',
  },
}

export function SentinelaView() {
  const [version, setVersion] = useState<VersionData | null>(null)
  const [scan, setScan] = useState<ScanData | null>(null)
  const [loadingVersion, setLoadingVersion] = useState(false)
  const [loadingScan, setLoadingScan] = useState(false)

  const checkVersion = async () => {
    setLoadingVersion(true)
    try {
      const res = await fetch('/api/sentinel/check')
      setVersion(await res.json())
    } catch {
      setVersion({
        localVersion: 'unknown',
        upstreamVersion: null,
        hasUpdate: false,
        error: 'Erro ao verificar',
        checkedAt: new Date().toISOString(),
      })
    } finally {
      setLoadingVersion(false)
    }
  }

  const runScan = async () => {
    setLoadingScan(true)
    try {
      const res = await fetch('/api/sentinel/scan')
      setScan(await res.json())
    } catch {
      setScan({ recommendations: [], total: 0, error: 'Erro ao escanear' })
    } finally {
      setLoadingScan(false)
    }
  }

  const absorverCount = scan?.recommendations.filter(r => r.type === 'ABSORVER').length ?? 0
  const avaliarCount = scan?.recommendations.filter(r => r.type === 'AVALIAR').length ?? 0

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Version card */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Versão local
              </p>
              <div className="flex items-center gap-2">
                <code className="text-xl font-mono font-bold">
                  {version?.localVersion || 'v5.0.3'}
                </code>
                <Badge variant="secondary" className="text-xs">atual</Badge>
              </div>
              {version?.checkedAt && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Verificado {new Date(version.checkedAt).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
            <Button
              onClick={checkVersion}
              disabled={loadingVersion}
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
            >
              {loadingVersion
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <RefreshCw className="h-3.5 w-3.5" />
              }
              Verificar upstream
            </Button>
          </div>

          {version && (
            <div className="border-t border-border pt-4">
              {version.error ? (
                <p className="text-xs text-muted-foreground">{version.error} — sem conectividade com o upstream.</p>
              ) : version.hasUpdate ? (
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="h-4 w-4 text-[hsl(var(--status-warning))]" />
                  <p className="text-sm">
                    Versão <code className="font-mono font-semibold">{version.upstreamVersion}</code> disponível upstream
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

        {/* File scan card */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Scan de arquivos
              </p>
              <p className="text-xs text-muted-foreground">
                Compara hashes locais com os registrados em version.json
              </p>
              {scan && !scan.error && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  {scan.total === 0
                    ? 'Nenhuma modificação detectada'
                    : `${scan.total} arquivo${scan.total > 1 ? 's' : ''} modificado${scan.total > 1 ? 's' : ''} — ${absorverCount} absorver · ${avaliarCount} avaliar`
                  }
                </p>
              )}
            </div>
            <Button
              onClick={runScan}
              disabled={loadingScan}
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
            >
              {loadingScan
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <ScanLine className="h-3.5 w-3.5" />
              }
              Escanear
            </Button>
          </div>

          {scan?.error && (
            <p className="text-xs text-muted-foreground border-t border-border pt-3">{scan.error}</p>
          )}
        </div>

        {/* Recommendations */}
        {scan && scan.recommendations.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Recomendações
            </p>
            <div className="space-y-2.5">
              {scan.recommendations.map((rec, i) => {
                const cfg = TYPE_CONFIG[rec.type]
                const Icon = cfg.icon
                return (
                  <div key={i} className={cn('rounded-lg border p-4', cfg.className)}>
                    <div className="flex items-start gap-3">
                      <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', cfg.iconClass)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge className={cn('text-[10px] border', cfg.badge)}>
                            {cfg.label}
                          </Badge>
                          <code className="text-xs font-mono text-foreground truncate max-w-[280px]">
                            {rec.component}
                          </code>
                        </div>
                        <p className="text-xs leading-relaxed">{rec.reason}</p>
                        {rec.conflict && (
                          <p className="text-xs mt-1 opacity-70">⚠ {rec.conflict}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Como funciona */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Como o Sentinela funciona
          </p>
          <ul className="space-y-1.5">
            {[
              'Verifica a versão local vs repositório upstream via API do GitHub',
              'Escaneia hashes de cada arquivo do framework contra version.json',
              'ABSORVER: arquivos core/schemas — seguros para aplicar direto',
              'AVALIAR: arquivos data/tasks/scripts — verifique customizações antes',
              'Nunca aplica nada automaticamente — você sempre decide',
            ].map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground shrink-0 opacity-60" />
                {item}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  )
}
