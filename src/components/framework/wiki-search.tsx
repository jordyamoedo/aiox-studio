'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, FileText, BookOpen, Zap, Loader2, X } from 'lucide-react'

interface SearchResult {
  id: string
  file: string
  filePath: string
  type: 'agent' | 'rule' | 'task'
  label: string
  excerpt: string
  matchedLine: string
}

const TYPE_CONFIG = {
  agent: { icon: Zap, label: 'Agente', color: 'text-[hsl(var(--accent-primary))]' },
  rule: { icon: BookOpen, label: 'Regra', color: 'text-[hsl(var(--status-warning))]' },
  task: { icon: FileText, label: 'Task', color: 'text-[hsl(var(--status-success))]' },
}

export function WikiSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [content, setContent] = useState<string | null>(null)
  const [loadingContent, setLoadingContent] = useState(false)
  const [searched, setSearched] = useState(false)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/framework/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    const timer = setTimeout(() => search(val), 300)
    return () => clearTimeout(timer)
  }

  const selectResult = async (result: SearchResult) => {
    setSelected(result)
    setLoadingContent(true)
    setContent(null)
    try {
      const res = await fetch(`/api/framework/search?file=${encodeURIComponent(result.filePath)}`)
      const data = await res.json()
      setContent(data.content || '')
    } catch {
      setContent('Erro ao carregar conteúdo.')
    } finally {
      setLoadingContent(false)
    }
  }

  const clearSelection = () => {
    setSelected(null)
    setContent(null)
  }

  return (
    <div className="flex h-full gap-0">
      {/* Left panel — search */}
      <div className={`flex flex-col border-r border-border transition-all ${selected ? 'w-80 shrink-0' : 'flex-1'}`}>
        {/* Search input */}
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={handleChange}
              placeholder="Buscar agentes, regras, tasks..."
              className="pl-9 text-sm"
            />
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {loading && (
              <div className="flex items-center gap-2 px-3 py-8 text-muted-foreground justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Buscando...</span>
              </div>
            )}

            {!loading && searched && results.length === 0 && (
              <div className="px-3 py-8 text-center">
                <p className="text-sm text-muted-foreground">Nenhum resultado para "{query}"</p>
              </div>
            )}

            {!loading && !searched && (
              <div className="px-3 py-8 text-center">
                <p className="text-sm font-medium text-foreground mb-1">Busca no Framework</p>
                <p className="text-xs text-muted-foreground">
                  Pesquise por agentes, regras, tasks ou qualquer conceito do AIOX
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {['@dev', 'handoff', 'qa-gate', 'story', 'workflow'].map(term => (
                    <button
                      key={term}
                      onClick={() => { setQuery(term); search(term) }}
                      className="text-xs px-2 py-1 rounded border border-border bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!loading && results.map(result => {
              const config = TYPE_CONFIG[result.type]
              const Icon = config.icon
              const isSelected = selected?.id === result.id

              return (
                <button
                  key={result.id}
                  onClick={() => selectResult(result)}
                  className={`w-full text-left rounded-md px-3 py-2.5 mb-1 transition-colors ${
                    isSelected
                      ? 'bg-secondary text-foreground'
                      : 'hover:bg-secondary/50 text-foreground'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${config.color}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{result.label}</p>
                      {result.matchedLine && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          ...{result.matchedLine}...
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="ml-auto shrink-0 text-xs">
                      {config.label}
                    </Badge>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Right panel — content */}
      {selected && (
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              {(() => {
                const config = TYPE_CONFIG[selected.type]
                const Icon = config.icon
                return <Icon className={`h-4 w-4 ${config.color}`} />
              })()}
              <span className="text-sm font-medium">{selected.label}</span>
              <Badge variant="outline" className="text-xs">{selected.filePath}</Badge>
            </div>
            <button
              onClick={clearSelection}
              className="rounded-md p-1 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ScrollArea className="flex-1 p-4">
            {loadingContent ? (
              <div className="flex items-center gap-2 py-8 text-muted-foreground justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Carregando...</span>
              </div>
            ) : (
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed">
                {content}
              </pre>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
