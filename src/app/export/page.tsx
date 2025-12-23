import ExportPage from '@/components/dashboard/ExportPage'
import { PageHeader, PageSection, PageShell } from '@/components/ui/PageShell'
import PageActions from '@/components/layout/PageActions'

export default function Page() {
  return (
    <PageShell>
      <PageHeader
        title="Export"
        subtitle="Exporta CSV desde la pestaña actual (Lotes o Prendas)."
        right={<PageActions context="export" showAdd={false} />}
      />
      <PageSection>
        <ExportPage />
      </PageSection>
    </PageShell>
  )
}
