export default function Card({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-4 shadow-sm ${className}`}>
      {children}
    </div>
  )
}
