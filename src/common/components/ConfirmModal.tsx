import { AlertTriangle, CircleHelp } from "lucide-react";
import { Modal } from "@/common/components/Modal";

interface IConfirmModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  eyebrow?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  isLoading?: boolean;
  onConfirm(): void | Promise<void>;
  onClose(): void;
}

export function ConfirmModal({
  title,
  description,
  confirmLabel,
  eyebrow = "Confirmar acción",
  cancelLabel = "Cancelar",
  variant = "default",
  isLoading = false,
  onConfirm,
  onClose,
}: Readonly<IConfirmModalProps>) {
  const Icon = variant === "danger" ? AlertTriangle : CircleHelp;

  return (
    <Modal title={title} eyebrow={eyebrow} onClose={onClose}>
      <div
        className={
          "flex gap-3 rounded-2xl border p-4 text-sm leading-6 " +
          (variant === "danger"
            ? "border-ember/20 bg-ember/8 text-ember"
            : "border-outline/10 bg-page text-body/70")
        }
      >
        <Icon className="mt-0.5 shrink-0" size={19} />
        <p>{description}</p>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-2xl border border-outline/12 bg-surface px-5 py-3 text-sm font-bold text-primary transition hover:bg-page disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={
            "rounded-2xl px-5 py-3 text-sm font-bold text-white transition disabled:cursor-wait disabled:opacity-50 " +
            (variant === "danger"
              ? "bg-ember hover:brightness-90"
              : "bg-brand hover:bg-brand-hover")
          }
        >
          {isLoading ? "Procesando..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
