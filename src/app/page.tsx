import KpiCards from '@/components/dashboard/KpiCards'

export default function Page() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Resumen</h1>
      <div className="text-sm text-gray-500">
        El export CSV solo funciona desde <b>Lotes</b> o <b>Prendas</b>.
      </div>
      <KpiCards />
    </div>
  )
}
