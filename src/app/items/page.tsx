import ItemsView from '@/components/dashboard/ItemsView'

export default function Page() {
  return (
    <div className="py-6">
      <div className="px-4 md:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Prendas</h1>
        <p className="text-sm text-gray-500 mt-1">Estados, márgenes y seguimiento de ventas.</p>
      </div>
      <div className="mt-4 px-4 md:px-0">
        <ItemsView />
      </div>
    </div>
  )
}
