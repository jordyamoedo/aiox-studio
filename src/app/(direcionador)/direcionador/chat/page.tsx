import { PageLayout } from '@/components/shared/page-layout'
import { Chat } from '@/components/shared/chat'

export default function DireciondorChatPage() {
  return (
    <PageLayout title="O Direcionador" subtitle="Transforme capacidade em resultado" space="direcionador">
      <Chat
        space="direcionador"
        placeholder="Qual problema você quer resolver?"
        emptyStateTitle="Qual é o norte hoje?"
        emptyStateHint="Descreva um problema, oportunidade ou decisão. Quanto mais contexto você der, mais específica e útil será a direção."
      />
    </PageLayout>
  )
}
