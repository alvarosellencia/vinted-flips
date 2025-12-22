import type { ItemStatus } from '@/lib/types'

const styles: Record<ItemStatus, string> = {
  'en venta': 'bg-violet-100 text-violet-700',
  'vendida': 'bg-green-100 text-green-700',
  'reservada': 'bg-yellow-100 text-yellow-700',
  'devuelta': 'bg-red-100 text-red-700'
}

export default function Chip({ status }: { status: ItemStatus }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}
