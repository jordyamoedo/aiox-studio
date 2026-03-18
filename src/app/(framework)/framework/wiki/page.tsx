import { PageLayout } from '@/components/shared/page-layout'
import { Wiki } from '@/components/framework/wiki'

export default function WikiPage() {
  return (
    <PageLayout title="Wiki" subtitle="Referência completa do framework" space="framework">
      <Wiki />
    </PageLayout>
  )
}
