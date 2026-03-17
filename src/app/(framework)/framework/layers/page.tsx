import { PageLayout } from '@/components/shared/page-layout'
import { LayersView } from '@/components/framework/layers-view'

export default function LayersPage() {
  return (
    <PageLayout title="Camadas" subtitle="Adicione capacidades sem quebrar nada" space="framework">
      <LayersView />
    </PageLayout>
  )
}
