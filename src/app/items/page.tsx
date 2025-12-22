import ItemsView from '@/components/dashboard/ItemsView'

export default function Page() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Prendas</h1>
      <ItemsView />
    </div>
  )
}
