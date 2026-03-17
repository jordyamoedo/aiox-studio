import { Sidebar } from '@/components/shared/sidebar'
import { GitBranch, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function DecisoesPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-12 items-center border-b border-border px-4 shrink-0">
          <div>
            <span className="text-sm font-medium">Decisões</span>
            <span className="ml-2 text-xs text-muted-foreground">Histórico e padrões do Direcionador</span>
          </div>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center py-20 text-center px-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary mb-4">
            <GitBranch className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Nenhuma decisão registrada ainda</p>
          <p className="text-xs text-muted-foreground max-w-xs mb-6">
            Cada conversa no Direcionador vira um registro aqui. Você vai ver padrões, decisões recorrentes e evolução ao longo do tempo.
          </p>
          <Link
            href="/direcionador/chat"
            className="inline-flex items-center gap-2 text-xs font-medium text-[hsl(var(--accent-primary))] hover:underline"
          >
            Começar uma conversa no Direcionador
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
