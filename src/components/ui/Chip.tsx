import type { ItemStatusDb } from '@/lib/types'
import { statusLabel } from '@/lib/utils'

const styles: Record<ItemStatusDb, string> = {
  for_sale: 'bg-violet-100 text-violet-700',
  sold: 'bg-green-100 text-green-700',
  reserved: 'bg-yellow-100 text-yellow-700',
  returned: 'bg-red-100 text-red-700'
}

export default function Chip({ status }: { status: ItemStatusDb }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {statusLabel(status)}
    </span>
  )
}
