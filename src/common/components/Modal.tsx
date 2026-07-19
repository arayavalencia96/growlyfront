import { X } from "lucide-react";
import type { ReactNode } from "react";

interface IModalProps {
  title: string;
  eyebrow: string;
  children: ReactNode;
  onClose(): void;
}

export function Modal({ title, eyebrow, children, onClose }: IModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-ink/45 backdrop-blur-sm sm:place-items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[94vh] w-full overflow-y-auto rounded-t-[2rem] bg-surface-soft p-6 shadow-2xl sm:max-w-2xl sm:rounded-[2rem] sm:p-8"
      >
        <div className="mb-7 flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-secondary uppercase">
              {eyebrow}
            </p>
            <h2 className="mt-2 font-display text-4xl text-primary">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-2xl border border-outline/10 bg-surface p-2.5 text-primary transition hover:bg-page"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
