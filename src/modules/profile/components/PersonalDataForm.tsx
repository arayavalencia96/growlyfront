import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Pencil, Save, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { AuthAlert } from "@/modules/auth/components/AuthAlert";
import { PasswordField } from "@/modules/auth/components/PasswordField";
import type {
  IPersonalDataFormProps,
  IPersonalDataFormValues,
} from "@/modules/profile/interfaces/profile.interface";
import { profileService } from "@/modules/profile/services/profile.service";
import { personalDataSchema } from "@/modules/profile/validations/profile.validation";
import { getAuthErrorMessage } from "@/modules/auth/utils/auth-error.utils";

export function PersonalDataForm({
  user,
  onUpdated,
  onEmailChangeRequested,
}: IPersonalDataFormProps) {
  const [message, setMessage] = useState("");
  const [requestError, setRequestError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<IPersonalDataFormValues>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      currentPassword: "",
    },
  });
  const email = useWatch({ control, name: "email" });
  const normalizedEmail = email.trim().toLowerCase();
  const emailChanged = normalizedEmail !== user.email;

  const startEditing = () => {
    setMessage("");
    setRequestError("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    reset({
      name: user.name,
      email: user.email,
      currentPassword: "",
    });
    clearErrors();
    setMessage("");
    setRequestError("");
    setIsEditing(false);
  };

  const submit = handleSubmit(async (values) => {
    setMessage("");
    setRequestError("");

    if (emailChanged && !values.currentPassword) {
      setError("currentPassword", {
        message: "Ingresa tu contraseña para cambiar el correo",
      });
      return;
    }

    try {
      const { result } = await profileService.updatePersonalData({
        name: values.name.trim(),
        ...(emailChanged
          ? {
              email: normalizedEmail,
              currentPassword: values.currentPassword,
            }
          : {}),
      });

      if (emailChanged) {
        onEmailChangeRequested(normalizedEmail);
        return;
      }

      onUpdated(result.user);
      reset({
        name: result.user.name,
        email: result.user.email,
        currentPassword: "",
      });
      setIsEditing(false);
      setMessage("Tus datos personales fueron actualizados.");
    } catch (error: unknown) {
      setRequestError(getAuthErrorMessage(error));
    }
  });

  return (
    <section className="rounded-[1.75rem] border border-outline/8 bg-surface-soft p-6 sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-accent text-primary">
          <UserRound size={19} />
        </span>
        <div>
          <h2 className="font-display text-3xl text-primary">
            Datos personales
          </h2>
          <p className="text-xs text-body/45">Tu identidad dentro de Growly</p>
        </div>
      </div>

      {message ? <AuthAlert message={message} variant="success" /> : null}
      {requestError ? <AuthAlert message={requestError} /> : null}

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="app-label" htmlFor="profile-name">
            Nombre
          </label>
          <div className="relative">
            <UserRound
              className="absolute top-1/2 left-4 -translate-y-1/2 text-secondary"
              size={17}
            />
            <input
              id="profile-name"
              className="app-field pl-11 disabled:cursor-not-allowed disabled:border-ink/8 disabled:bg-ink/[0.04] disabled:text-body/45"
              autoComplete="name"
              disabled={!isEditing}
              {...register("name")}
            />
          </div>
          {errors.name ? (
            <p className="mt-1.5 text-xs text-ember">{errors.name.message}</p>
          ) : null}
        </div>

        <div>
          <label className="app-label" htmlFor="profile-email">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail
              className="absolute top-1/2 left-4 -translate-y-1/2 text-secondary"
              size={17}
            />
            <input
              id="profile-email"
              type="email"
              className="app-field pl-11 disabled:cursor-not-allowed disabled:border-ink/8 disabled:bg-ink/[0.04] disabled:text-body/45"
              autoComplete="email"
              disabled={!isEditing}
              {...register("email")}
            />
          </div>
          {errors.email ? (
            <p className="mt-1.5 text-xs text-ember">{errors.email.message}</p>
          ) : null}
          {isEditing && emailChanged ? (
            <p className="mt-2 text-xs text-secondary">
              Te enviaremos un código para verificar el nuevo correo.
            </p>
          ) : null}
        </div>

        {isEditing && emailChanged ? (
          <PasswordField
            {...register("currentPassword")}
            label="Contraseña actual"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
          />
        ) : null}

        {isEditing ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-hover disabled:opacity-50"
            >
              <Save size={17} />
              {isSubmitting ? "Actualizando..." : "Actualizar"}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-outline/12 bg-surface px-5 py-3 text-sm font-bold text-primary transition hover:bg-page disabled:opacity-50"
            >
              <X size={17} />
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-hover"
          >
            <Pencil size={17} />
            Actualizar datos
          </button>
        )}
      </form>
    </section>
  );
}
