import LotsView from '@/components/dashboard/LotsView'
import { PageHeader, PageSection, PageShell } from '@/components/ui/PageShell'
import PageActions from '@/components/layout/PageActions'

export default function Page() {
  return (
    <PageShell>
      <PageHeader
        title="Lotes"
        description="Gestiona compras por lote, coste total, coste unitario y proveedor."
        actions={<PageActions context="lots" />}
      />

      <PageSection>
        <LotsView />
      </PageSection>
    </PageShell>
  )
}
