import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { authService } from "@/modules/auth/services/auth.service";

import { AuthAlert } from "@/modules/auth/components/AuthAlert";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { FormField } from "@/modules/auth/components/FormField";
import { SubmitButton } from "@/modules/auth/components/SubmitButton";

import { forgotPasswordSchema } from "@/modules/auth/validations/auth.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAuthErrorMessage } from "@/modules/auth/utils/auth-error.utils";

import type { IForgotPasswordRequest } from "@/modules/auth/interfaces/auth.interface";

import { ArrowLeft, ArrowRight, Mail } from "lucide-react";

export function ForgotPasswordPage() {
  const [requestError, setRequestError] = useState("");
  const [emailWasSent, setEmailWasSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setRequestError("");

    try {
      await authService.forgotPassword({
        email: data.email.trim().toLowerCase(),
      });
      setEmailWasSent(true);
    } catch (error: unknown) {
      setRequestError(getAuthErrorMessage(error));
    }
  });

  return (
    <AuthLayout
      eyebrow="Recuperá tu acceso"
      title="Recuperar cuenta"
      description="Ingresá tu correo. Si el correo existe, recibirás un enlace para crear una contraseña nueva."
      step="Recuperación 1 de 2"
    >
      {emailWasSent ? (
        <AuthAlert
          variant="success"
          message="Si existe una cuenta habilitada con ese correo, enviamos un enlace válido por 30 minutos."
        />
      ) : null}
      {requestError ? <AuthAlert message={requestError} /> : null}

      {!emailWasSent ? (
        <form onSubmit={onSubmit} noValidate className="grid gap-5">
          <FormField
            {...register("email")}
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="nombre@correo.com"
            icon={<Mail aria-hidden="true" size={18} />}
            error={errors.email?.message}
          />
          <SubmitButton
            isLoading={isSubmitting}
            loadingText="Enviando enlace..."
          >
            Enviar enlace
            <ArrowRight aria-hidden="true" size={18} />
          </SubmitButton>
        </form>
      ) : null}

      <Link
        to="/login"
        className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-body/55 transition hover:text-primary"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Volver al inicio de sesión
      </Link>
    </AuthLayout>
  );
}
