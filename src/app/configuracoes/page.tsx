import { PageLayout } from '@/components/shared/page-layout'
import { ConfiguracoesView } from '@/components/sistema/configuracoes-view'

export default function ConfiguracoesPage() {
  return (
    <PageLayout title="Configurações" subtitle="Preferências e conexões">
      <ConfiguracoesView />
    </PageLayout>
  )
}
