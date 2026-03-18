import { PageLayout } from '@/components/shared/page-layout'
import { DecisoesView } from '@/components/direcionador/decisoes-view'

export default function DecisoesPage() {
  return (
    <PageLayout title="Decisões" subtitle="Histórico e padrões do Direcionador" space="direcionador">
      <DecisoesView />
    </PageLayout>
  )
}
