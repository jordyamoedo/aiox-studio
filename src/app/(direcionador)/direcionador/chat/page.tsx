import { PageLayout } from '@/components/shared/page-layout'
import { DiretorChat } from '@/components/direcionador/diretor-chat'

export default function DireciondorChatPage() {
  return (
    <PageLayout title="O Direcionador" subtitle="Transforme capacidade em resultado" space="direcionador">
      <DiretorChat />
    </PageLayout>
  )
}
