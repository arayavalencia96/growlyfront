import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthAlert } from "@/modules/auth/components/AuthAlert";
import { PasswordField } from "@/modules/auth/components/PasswordField";
import { PasswordRequirements } from "@/modules/auth/components/PasswordRequirements";
import { getAuthErrorMessage } from "@/modules/auth/utils/auth-error.utils";
import type {
  IChangePasswordFormProps,
  IChangePasswordFormValues,
} from "@/modules/profile/interfaces/profile.interface";
import { profileService } from "@/modules/profile/services/profile.service";
import { profilePasswordSchema } from "@/modules/profile/validations/profile.validation";

export function ChangePasswordForm({
  onPasswordChanged,
}: IChangePasswordFormProps) {
  const [requestError, setRequestError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<IChangePasswordFormValues>({
    resolver: zodResolver(profilePasswordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const submit = handleSubmit(async ({ currentPassword, newPassword }) => {
    setRequestError("");
    try {
      await profileService.changePassword({ currentPassword, newPassword });
      onPasswordChanged();
    } catch (error: unknown) {
      setRequestError(getAuthErrorMessage(error));
    }
  });

  return (
    <section className="rounded-[1.75rem] border border-forest/8 bg-cream p-6 sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-forest text-lime">
          <KeyRound size={19} />
        </span>
        <div>
          <h2 className="font-display text-3xl text-forest">Contraseña</h2>
          <p className="text-xs text-ink/45">
            Actualiza tus credenciales de acceso
          </p>
        </div>
      </div>

      {requestError ? <AuthAlert message={requestError} /> : null}

      <form onSubmit={submit} className="space-y-5">
        <PasswordField
          {...register("currentPassword")}
          label="Contraseña actual"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
        />
        <PasswordField
          {...register("newPassword")}
          label="Nueva contraseña"
          autoComplete="new-password"
          error={errors.newPassword?.message}
        />
        <PasswordField
          {...register("confirmPassword")}
          label="Confirmar nueva contraseña"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
        />
        <PasswordRequirements />
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-forest px-5 py-3 text-sm font-bold text-white transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-forest"
        >
          <KeyRound size={17} />
          {isSubmitting ? "Actualizando..." : "Cambiar contraseña"}
        </button>
      </form>
    </section>
  );
}
