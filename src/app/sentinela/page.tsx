import { PageLayout } from '@/components/shared/page-layout'
import { SentinelaView } from '@/components/sistema/sentinela-view'

export default function SentinelaPage() {
  return (
    <PageLayout title="Sentinela" subtitle="Atualizações do AIOX upstream">
      <SentinelaView />
    </PageLayout>
  )
}
