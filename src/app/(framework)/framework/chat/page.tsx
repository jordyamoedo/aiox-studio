import { PageLayout } from '@/components/shared/page-layout'
import { Chat } from '@/components/shared/chat'

export default function FrameworkChatPage() {
  return (
    <PageLayout title="Chat" subtitle="Aprenda e explore o AIOX" space="framework">
      <Chat
        space="framework"
        placeholder="Pergunte sobre agentes, workflows, regras..."
        emptyStateTitle="Guia do Framework"
        emptyStateHint="Pergunte sobre qualquer agente, comando, workflow ou conceito do AIOX. Use linguagem natural — sem precisar de termos técnicos."
      />
    </PageLayout>
  )
}
