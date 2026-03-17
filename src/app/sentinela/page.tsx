import { Sidebar } from '@/components/shared/sidebar'
import { SentinelaView } from '@/components/sistema/sentinela-view'

export default function SentinelaPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-12 items-center border-b border-border px-4 shrink-0">
          <div>
            <span className="text-sm font-medium">Sentinela</span>
            <span className="ml-2 text-xs text-muted-foreground">Atualizações do AIOX upstream</span>
          </div>
        </header>
        <SentinelaView />
      </div>
    </div>
  )
}
