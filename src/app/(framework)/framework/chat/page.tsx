import { Sidebar } from '@/components/shared/sidebar'
import { Chat } from '@/components/shared/chat'

export default function FrameworkChatPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-12 items-center border-b border-border px-4">
          <div>
            <span className="text-sm font-medium">Chat — O Framework</span>
            <span className="ml-2 text-xs text-muted-foreground">Aprenda e explore o AIOX</span>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <Chat
            space="framework"
            placeholder="Pergunte sobre agentes, workflows, regras..."
            emptyStateTitle="Guia do Framework"
            emptyStateHint="Pergunte sobre qualquer agente, comando, workflow ou conceito do AIOX. Use linguagem natural — sem precisar de termos técnicos."
          />
        </div>
      </div>
    </div>
  )
}
