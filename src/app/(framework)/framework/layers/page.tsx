import { Sidebar } from '@/components/shared/sidebar'
import { LayersView } from '@/components/framework/layers-view'

export default function LayersPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-12 items-center border-b border-border px-4 shrink-0">
          <div>
            <span className="text-sm font-medium">Camadas</span>
            <span className="ml-2 text-xs text-muted-foreground">Adicione capacidades sem quebrar nada</span>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <LayersView />
        </div>
      </div>
    </div>
  )
}
