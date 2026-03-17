'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2 } from 'lucide-react'
import type { Space, Message } from '@/types'

interface ChatProps {
  space: Space
  placeholder?: string
  emptyStateTitle?: string
  emptyStateHint?: string
}

export function Chat({ space, placeholder, emptyStateTitle, emptyStateHint }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, assistantMsg])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          space,
        }),
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          const data = line.replace('data: ', '')
          if (data === '[DONE]') break

          try {
            const { content } = JSON.parse(data)
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMsg.id
                  ? { ...m, content: m.content + content }
                  : m
              )
            )
          } catch {}
        }
      }
    } catch (error) {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsg.id
            ? { ...m, content: 'Erro ao processar. Tente novamente.' }
            : m
        )
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-medium text-foreground mb-1">
              {emptyStateTitle || 'Como posso ajudar?'}
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {emptyStateHint || 'Faça uma pergunta para começar.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] rounded-lg px-3 py-2 text-sm
                    ${msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground'
                    }
                  `}
                >
                  {msg.content || (loading && msg.role === 'assistant' && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ))}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4">
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
            placeholder={placeholder || 'Digite sua mensagem...'}
            className="min-h-[44px] max-h-32 resize-none text-sm"
            rows={1}
          />
          <Button
            onClick={send}
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
