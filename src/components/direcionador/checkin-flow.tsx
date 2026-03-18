'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { Checkin } from '@/hooks/use-daily-checkin'

interface CheckinFlowProps {
  onComplete: (data: Omit<Checkin, 'date'>) => void
}

const ENERGY_LABELS = ['', 'Esgotado', 'Cansado', 'Ok', 'Bem', 'No pico']

export function CheckinFlow({ onComplete }: CheckinFlowProps) {
  const [step, setStep] = useState(1)
  const [energy, setEnergy] = useState(0)
  const [focusArea, setFocusArea] = useState('')
  const [externalContext, setExternalContext] = useState('')

  const complete = () => {
    onComplete({ energy, focusArea, externalContext: externalContext || null })
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">

        {/* Progress bar */}
        <div className="flex gap-1.5">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={cn(
                'h-0.5 flex-1 rounded-full transition-colors duration-300',
                s <= step
                  ? 'bg-[hsl(var(--accent-direcionador))]'
                  : 'bg-border'
              )}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium mb-0.5">Como está sua energia hoje?</p>
              <p className="text-xs text-muted-foreground">1 = esgotado · 5 = no pico</p>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => { setEnergy(n); setStep(2) }}
                  className={cn(
                    'flex-1 h-11 rounded-lg border text-sm font-mono font-semibold transition-all',
                    energy === n
                      ? 'border-[hsl(var(--accent-direcionador))] bg-[hsl(var(--accent-direcionador)/0.12)] text-[hsl(var(--accent-direcionador))]'
                      : 'border-border hover:border-[hsl(var(--accent-direcionador)/0.5)] hover:bg-[hsl(var(--accent-direcionador)/0.05)] text-foreground'
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            {energy > 0 && (
              <p className="text-xs text-muted-foreground text-center">{ENERGY_LABELS[energy]}</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-0.5">Em que você quer focar?</p>
              <p className="text-xs text-muted-foreground">Energia {energy}/5 — {ENERGY_LABELS[energy]}</p>
            </div>
            <Textarea
              value={focusArea}
              onChange={e => setFocusArea(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && focusArea.trim()) {
                  e.preventDefault()
                  setStep(3)
                }
              }}
              placeholder="Ex: arquitetura do módulo X, bug crítico no auth, planejamento Q2..."
              className="resize-none text-sm"
              rows={2}
              autoFocus
            />
            <Button
              onClick={() => setStep(3)}
              disabled={!focusArea.trim()}
              className="w-full bg-[hsl(var(--accent-direcionador))] text-white hover:bg-[hsl(var(--accent-direcionador))]/90"
              size="sm"
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-0.5">Algo externo afetando hoje?</p>
              <p className="text-xs text-muted-foreground">Opcional — pode pular</p>
            </div>
            <Textarea
              value={externalContext}
              onChange={e => setExternalContext(e.target.value)}
              placeholder="Reunião pesada de manhã, dormiu mal, prazo apertado..."
              className="resize-none text-sm"
              rows={2}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                onClick={complete}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Pular
              </Button>
              <Button
                onClick={complete}
                size="sm"
                className="flex-1 bg-[hsl(var(--accent-direcionador))] text-white hover:bg-[hsl(var(--accent-direcionador))]/90"
              >
                Começar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
