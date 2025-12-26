import ItemsView from '@/components/dashboard/ItemsView'
import { PageHeader, PageSection, PageShell } from '@/components/ui/PageShell'
import PageActions from '@/components/layout/PageActions'

export default function Page() {
  return (
    <PageShell>
      <PageHeader
        title="Prendas"
        description="Inventario, estados, costes, ventas y beneficio."
        actions={<PageActions context="items" />}
      />

      <PageSection>
        <ItemsView />
      </PageSection>
    </PageShell>
  )
}