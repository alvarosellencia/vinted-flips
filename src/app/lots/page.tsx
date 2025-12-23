import LotsView from '@/components/dashboard/LotsView'
import { PageHeader, PageSection, PageShell } from '@/components/ui/PageShell'
import PageActions from '@/components/layout/PageActions'

export default function Page() {
  return (
    <PageShell>
      <PageHeader
        title="Lotes"
        subtitle="Gestiona compras por lote, coste total, coste unitario y proveedor."
        right={<PageActions context="lots" />}
      />
      <PageSection>
        <LotsView />
      </PageSection>
    </PageShell>
  )
}
