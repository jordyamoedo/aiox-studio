'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2, BookmarkPlus, Check, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'
import { useDailyCheckin } from '@/hooks/use-daily-checkin'
import { useLocalDecisions } from '@/hooks/use-local-decisions'
import { CheckinFlow } from './checkin-flow'

// ── Persistência de histórico ─────────────────────────────────────────────────

const HISTORY_KEY = 'aiox-direcionador-history'

function loadHistory(): Message[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as Message[]).slice(-60) : []
  } catch {
    return []
  }
}

function saveHistory(messages: Message[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-60)))
  } catch {}
}

// ── Contexto de energia para o system prompt ──────────────────────────────────

function buildEnergyContext(energy: number, focusArea: string, externalContext: string | null): string {
  const parts: string[] = []

  if (energy <= 2) {
    parts.push(`O usuário está com energia baixa (${energy}/5). Seja conciso, priorize clareza, evite sobrecarregar com opções. Sugira tarefas práticas e incrementais.`)
  } else if (energy >= 4) {
    parts.push(`O usuário está com energia alta (${energy}/5). Pode propor trabalho estratégico, decisões de arquitetura e desafios mais complexos.`)
  }

  if (focusArea) parts.push(`Foco desta sessão: ${focusArea}.`)
  if (externalContext) parts.push(`Contexto externo relevante: ${externalContext}.`)

  return parts.join(' ')
}

// ── Componente principal ──────────────────────────────────────────────────────

export function DiretorChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const bottomRef = useRef<HTMLDivElement>(null)

  const { checkin, setCheckin, reset: resetCheckin, loaded } = useDailyCheckin()
  const { add: addDecision } = useLocalDecisions()

  // Carrega histórico ao montar
  useEffect(() => {
    setMessages(loadHistory())
  }, [])

  // Scroll para o final em novas mensagens
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const saveDecision = useCallback((msg: Message) => {
    const title = msg.content.slice(0, 60).replace(/\n/g, ' ').trim() +
      (msg.content.length > 60 ? '…' : '')
    addDecision({ title, excerpt: msg.content.slice(0, 250), status: 'active' })
    setSavedIds(prev => new Set(prev).add(msg.id))
  }, [addDecision])

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim()
    if (!text || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }

    const withUser = [...messages, userMsg]
    setMessages(withUser)
    saveHistory(withUser)
    setInput('')
    setLoading(true)

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, assistantMsg])

    const energyCtx = checkin
      ? buildEnergyContext(checkin.energy, checkin.focusArea, checkin.externalContext)
      : ''

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: withUser.map(m => ({ role: m.role, content: m.content })),
          space: 'direcionador',
          energyContext: energyCtx,
        }),
      })

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader')
      const decoder = new TextDecoder()

      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        for (const line of text.split('\n').filter(l => l.startsWith('data: '))) {
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const { content } = JSON.parse(data)
            full += content
            setMessages(prev =>
              prev.map(m => m.id === assistantMsg.id ? { ...m, content: m.content + content } : m)
            )
          } catch {}
        }
      }

      const finalMessages = withUser.concat({ ...assistantMsg, content: full })
      saveHistory(finalMessages)
      setMessages(finalMessages)
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsg.id ? { ...m, content: 'Erro ao processar. Tente novamente.' } : m
        )
      )
    } finally {
      setLoading(false)
    }
  }

  // Aguarda localStorage carregar
  if (!loaded) return null

  // Exibe check-in se não feito hoje
  if (!checkin) {
    return <CheckinFlow onComplete={setCheckin} />
  }

  return (
    <div className="flex h-full flex-col">

      {/* Barra de contexto do check-in */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/20 shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full shrink-0',
              checkin.energy >= 4
                ? 'bg-[hsl(var(--status-success))]'
                : checkin.energy <= 2
                ? 'bg-[hsl(var(--status-warning))]'
                : 'bg-[hsl(var(--accent-direcionador))]'
            )}
          />
          <span>Energia {checkin.energy}/5</span>
          <span className="text-border">·</span>
          <span className="truncate max-w-[220px]">{checkin.focusArea}</span>
          {checkin.externalContext && (
            <>
              <span className="text-border">·</span>
              <span className="truncate max-w-[160px] italic">{checkin.externalContext}</span>
            </>
          )}
        </div>
        <button
          onClick={resetCheckin}
          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          title="Refazer check-in"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>

      {/* Mensagens */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-medium text-foreground mb-1">Qual é o norte hoje?</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Descreva um problema, oportunidade ou decisão. Quanto mais contexto, mais específica a direção.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={cn('flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground'
                  )}
                >
                  {msg.content || (loading && msg.role === 'assistant' && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ))}
                </div>

                {/* Salvar como decisão (apenas mensagens completas do assistant) */}
                {msg.role === 'assistant' && msg.content && !loading && (
                  <button
                    onClick={() => saveDecision(msg)}
                    disabled={savedIds.has(msg.id)}
                    className={cn(
                      'flex items-center gap-1 mt-1 text-[10px] transition-colors',
                      savedIds.has(msg.id)
                        ? 'text-[hsl(var(--status-success))] cursor-default'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {savedIds.has(msg.id) ? (
                      <><Check className="h-3 w-3" /> Salvo nas decisões</>
                    ) : (
                      <><BookmarkPlus className="h-3 w-3" /> Salvar como decisão</>
                    )}
                  </button>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4 shrink-0">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Qual problema você quer resolver?"
            className="min-h-[44px] max-h-32 resize-none text-sm"
            rows={1}
          />
          <Button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            size="icon"
            className="h-11 w-11 shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
