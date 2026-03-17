import { Sidebar } from '@/components/shared/sidebar'
import { Chat } from '@/components/shared/chat'

export default function DireciondorChatPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-12 items-center border-b border-border px-4">
          <div>
            <span className="text-sm font-medium">O Direcionador</span>
            <span className="ml-2 text-xs text-muted-foreground">Transforme capacidade em resultado</span>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <Chat
            space="direcionador"
            placeholder="Qual problema você quer resolver?"
            emptyStateTitle="Qual é o norte hoje?"
            emptyStateHint="Descreva um problema, oportunidade ou decisão. Quanto mais contexto você der, mais específica e útil será a direção."
          />
        </div>
      </div>
    </div>
  )
}
