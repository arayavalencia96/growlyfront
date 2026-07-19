import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Modal } from "@/common/components/Modal";
import { AuthAlert } from "@/modules/auth/components/AuthAlert";
import { PasswordField } from "@/modules/auth/components/PasswordField";
import { getAuthErrorMessage } from "@/modules/auth/utils/auth-error.utils";
import {
  ACCOUNT_DEACTIVATION_OPTIONS,
  type IDeactivateAccountFormValues,
  type IDeactivateAccountModalProps,
} from "@/modules/profile/interfaces/profile.interface";
import { profileService } from "@/modules/profile/services/profile.service";
import { deactivateAccountSchema } from "@/modules/profile/validations/profile.validation";

export function DeactivateAccountModal({
  isOpen,
  onClose,
  onDeactivated,
}: IDeactivateAccountModalProps) {
  const [requestError, setRequestError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<IDeactivateAccountFormValues>({
    resolver: zodResolver(deactivateAccountSchema),
    defaultValues: {
      reason: "no_longer_needed",
      comment: "",
      currentPassword: "",
      confirmation: "",
    },
  });
  const reason = useWatch({ control, name: "reason" });

  if (!isOpen) return null;

  const submit = handleSubmit(async (values) => {
    setRequestError("");
    try {
      await profileService.deactivate({
        reason: values.reason,
        currentPassword: values.currentPassword,
        ...(values.comment.trim() ? { comment: values.comment.trim() } : {}),
      });
      onDeactivated();
    } catch (error: unknown) {
      setRequestError(getAuthErrorMessage(error));
    }
  });

  return (
    <Modal
      eyebrow="Zona sensible"
      title="Desactivar mi cuenta"
      onClose={onClose}
    >
      <div className="mb-6 flex gap-3 rounded-2xl border border-ember/20 bg-ember/8 p-4 text-sm text-ember">
        <AlertTriangle className="mt-0.5 shrink-0" size={18} />
        <p>
          Perderás el acceso inmediatamente. Tus datos no se eliminarán: la
          cuenta quedará desactivada para conservar la trazabilidad financiera.
        </p>
      </div>

      {requestError ? <AuthAlert message={requestError} /> : null}

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="app-label" htmlFor="deactivation-reason">
            ¿Por qué decides irte?
          </label>
          <select
            id="deactivation-reason"
            className="app-field"
            {...register("reason")}
          >
            {ACCOUNT_DEACTIVATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="app-label" htmlFor="deactivation-comment">
            {reason === "other"
              ? "Cuéntanos el motivo"
              : "Comentario adicional"}
          </label>
          <textarea
            id="deactivation-comment"
            rows={3}
            className="app-field resize-none"
            placeholder="Tu opinión nos ayuda a mejorar..."
            {...register("comment")}
          />
          {errors.comment ? (
            <p className="mt-1.5 text-xs text-ember">
              {errors.comment.message}
            </p>
          ) : null}
        </div>

        <PasswordField
          {...register("currentPassword")}
          label="Contraseña actual"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
        />

        <div>
          <label className="app-label" htmlFor="deactivation-confirmation">
            Escribe DESACTIVAR para confirmar
          </label>
          <input
            id="deactivation-confirmation"
            className="app-field uppercase"
            autoComplete="off"
            {...register("confirmation")}
          />
          {errors.confirmation ? (
            <p className="mt-1.5 text-xs text-ember">
              {errors.confirmation.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-outline/12 bg-surface px-5 py-3 text-sm font-bold text-primary"
          >
            Conservar mi cuenta
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-ember px-5 py-3 text-sm font-bold text-white transition hover:brightness-90 disabled:opacity-50"
          >
            {isSubmitting ? "Desactivando..." : "Desactivar cuenta"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
