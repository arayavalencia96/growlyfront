import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

interface IModalProps {
  title: string;
  eyebrow: string;
  children: ReactNode;
  size?: "md" | "lg" | "xl";
  onClose(): void;
}

const modalWidthClasses = {
  md: "sm:max-w-2xl",
  lg: "sm:max-w-4xl",
  xl: "sm:max-w-6xl",
} as const;

export function Modal({
  title,
  eyebrow,
  children,
  size = "md",
  onClose,
}: IModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocusedElement =
      document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    const focusableElements = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    focusableElements()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const elements = focusableElements();
      if (!elements.length) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedElement?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-ink/45 backdrop-blur-sm sm:place-items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={
          "modal-scrollbar-hidden max-h-[calc(100dvh-1rem)] w-full overflow-x-hidden overflow-y-auto rounded-t-[2rem] bg-surface-soft p-6 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-[2rem] sm:p-8 " +
          modalWidthClasses[size]
        }
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-7 flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-secondary uppercase">
              {eyebrow}
            </p>
            <h2
              id={titleId}
              className="mt-2 font-display text-4xl text-primary"
            >
              {title}
            </h2>
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
    </div>,
    document.body,
  );
}
