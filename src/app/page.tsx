import SummaryView from '@/components/dashboard/SummaryView'
import { PageHeader, PageSection, PageShell } from '@/components/ui/PageShell'
import PageActions from '@/components/layout/PageActions'

export default function Page() {
  return (
    <PageShell>
      <PageHeader
        title="Resumen"
        subtitle="KPIs y evolución. El export CSV solo funciona desde Lotes o Prendas."
        right={<PageActions context="summary" />}
      />
      <PageSection>
        <SummaryView />
      </PageSection>
    </PageShell>
  )
}
