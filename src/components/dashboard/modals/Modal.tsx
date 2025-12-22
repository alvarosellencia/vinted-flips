'use client'

export default function Modal({
  children,
  onClose,
  title
}: {
  children: React.ReactNode
  onClose: () => void
  title?: string
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full max-w-sm rounded-3xl border border-gray-200 shadow-xl p-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {title && <h3 className="text-lg font-semibold tracking-tight pr-8">{title}</h3>}
        {children}
      </div>
    </div>
  )
}
