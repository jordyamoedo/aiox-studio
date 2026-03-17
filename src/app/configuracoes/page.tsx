import { Sidebar } from '@/components/shared/sidebar'
import { ConfiguracoesView } from '@/components/sistema/configuracoes-view'

export default function ConfiguracoesPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-12 items-center border-b border-border px-4 shrink-0">
          <div>
            <span className="text-sm font-medium">Configurações</span>
            <span className="ml-2 text-xs text-muted-foreground">Preferências e conexões</span>
          </div>
        </header>
        <ConfiguracoesView />
      </div>
    </div>
  )
}
