import LotsView from '@/components/dashboard/LotsView'

export default function Page() {
  return (
    <div className="py-6">
      <div className="px-4 md:px-0">
        <h1 className="text-2xl font-semibold tracking-tight">Lotes</h1>
        <p className="text-sm text-gray-500 mt-1">Costes, unidades y control de compras.</p>
      </div>
      <div className="mt-4 px-4 md:px-0">
        <LotsView />
      </div>
    </div>
  )
}
