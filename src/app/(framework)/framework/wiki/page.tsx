import { PageLayout } from '@/components/shared/page-layout'
import { WikiSearch } from '@/components/framework/wiki-search'

export default function WikiPage() {
  return (
    <PageLayout title="Wiki" subtitle="Busca no framework local" space="framework">
      <WikiSearch />
    </PageLayout>
  )
}
