import { PageLayout } from '@/components/shared/page-layout'
import { AgentMap } from '@/components/framework/agent-map'

export default function MapaPage() {
  return (
    <PageLayout title="Mapa" subtitle="Agentes, conexões e fluxos do AIOX" space="framework">
      <AgentMap />
    </PageLayout>
  )
}
