import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface IModalProps {
  title: string
  eyebrow: string
  children: ReactNode
  onClose(): void
}

export function Modal({ title, eyebrow, children, onClose }: IModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-ink/45 backdrop-blur-sm sm:place-items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[94vh] w-full overflow-y-auto rounded-t-[2rem] bg-cream p-6 shadow-2xl sm:max-w-2xl sm:rounded-[2rem] sm:p-8"
      >
        <div className="mb-7 flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-moss uppercase">
              {eyebrow}
            </p>
            <h2 className="mt-2 font-display text-4xl text-forest">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-2xl border border-forest/10 bg-white p-2.5 text-forest transition hover:bg-linen"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
