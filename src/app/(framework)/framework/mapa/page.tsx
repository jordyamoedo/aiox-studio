import { Sidebar } from '@/components/shared/sidebar'
import { AgentMap } from '@/components/framework/agent-map'

export default function MapaPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <AgentMap />
      </main>
    </div>
  )
}
