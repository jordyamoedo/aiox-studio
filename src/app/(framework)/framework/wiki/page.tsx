import { Sidebar } from '@/components/shared/sidebar'
import { WikiSearch } from '@/components/framework/wiki-search'

export default function WikiPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-12 items-center border-b border-border px-4 shrink-0">
          <div>
            <span className="text-sm font-medium">Wiki</span>
            <span className="ml-2 text-xs text-muted-foreground">Busca no framework local</span>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <WikiSearch />
        </div>
      </div>
    </div>
  )
}
