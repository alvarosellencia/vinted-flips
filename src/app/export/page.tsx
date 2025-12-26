import ExportPage from '@/components/dashboard/ExportPage'
import { PageHeader, PageSection, PageShell } from '@/components/ui/PageShell'
import PageActions from '@/components/layout/PageActions'

export default function Page() {
  return (
    <PageShell>
      <PageHeader title="Export" description="Descarga tus datos en CSV." />
      <PageActions />

      <PageSection>
        <ExportPage />
      </PageSection>
    </PageShell>
  )
}
