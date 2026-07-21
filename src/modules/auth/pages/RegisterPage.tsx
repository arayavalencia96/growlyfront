import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { getAuthErrorMessage } from "@/modules/auth/utils/auth-error.utils";

import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema } from "@/modules/auth/validations/auth.validation";

import { authService } from "@/modules/auth/services/auth.service";

import { AuthAlert } from "@/modules/auth/components/AuthAlert";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { FormField } from "@/modules/auth/components/FormField";
import { PasswordField } from "@/modules/auth/components/PasswordField";
import { PasswordRequirements } from "@/modules/auth/components/PasswordRequirements";
import { SubmitButton } from "@/modules/auth/components/SubmitButton";
import { TermsAndConditionsModal } from "@/modules/auth/components/TermsAndConditionsModal";

import type { IRegisterForm } from "@/modules/auth/interfaces/auth.interface";

import { ArrowRight, Mail, UserRound } from "lucide-react";

export function RegisterPage() {
  const navigate = useNavigate();
  const [requestError, setRequestError] = useState("");
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IRegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setRequestError("");

    try {
      const email = data.email.trim().toLowerCase();
      await authService.register({
        name: data.name.trim(),
        email,
        password: data.password,
        termsAccepted: data.termsAccepted,
      });
      const params = new URLSearchParams({
        email,
        purpose: "registration",
      });
      navigate("/verify-code?" + params.toString(), {
        replace: true,
        state: {
          message:
            "Te enviamos un código de seis dígitos. Revisa tu correo para continuar.",
        },
      });
    } catch (error: unknown) {
      setRequestError(getAuthErrorMessage(error));
    }
  });

  return (
    <AuthLayout
      eyebrow="Crea tu espacio"
      title="Dale un destino a tu dinero."
      description="Empezá creando tu cuenta y después convertí cada ahorro o inversión en un progreso visible."
      step="Paso 1 de 2"
    >
      {requestError ? <AuthAlert message={requestError} /> : null}

      <form onSubmit={onSubmit} noValidate className="grid gap-5">
        <FormField
          {...register("name")}
          label="Nombre"
          autoComplete="name"
          placeholder="¿Cómo te llamas?"
          icon={<UserRound aria-hidden="true" size={18} />}
          error={errors.name?.message}
        />
        <FormField
          {...register("email")}
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="nombre@correo.com"
          icon={<Mail aria-hidden="true" size={18} />}
          error={errors.email?.message}
        />
        <PasswordField
          {...register("password")}
          label="Contraseña"
          autoComplete="new-password"
          placeholder="Contraseña"
          error={errors.password?.message}
        />
        <PasswordField
          {...register("confirmPassword")}
          label="Confirmar contraseña"
          autoComplete="new-password"
          placeholder="Repetí tu contraseña"
          error={errors.confirmPassword?.message}
        />
        <PasswordRequirements />
        <div>
          <div className="flex items-start gap-3 rounded-2xl border border-outline/10 bg-surface/65 p-4">
            <input
              id="terms-accepted"
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 cursor-pointer accent-forest"
              {...register("termsAccepted")}
            />
            <div className="text-sm leading-5 text-body/60">
              <label htmlFor="terms-accepted">Leí y acepto los </label>
              <button
                type="button"
                onClick={() => setIsTermsOpen(true)}
                className="font-bold text-primary underline decoration-accent decoration-4 underline-offset-4"
              >
                Términos y Condiciones y la Política de Privacidad
              </button>.
            
            </div>
          </div>
          {errors.termsAccepted ? (
            <p className="mt-1.5 text-xs font-medium text-ember">
              {errors.termsAccepted.message}
            </p>
          ) : null}
        </div>
        <SubmitButton isLoading={isSubmitting} loadingText="Creando cuenta...">
          Crear mi cuenta
          <ArrowRight aria-hidden="true" size={18} />
        </SubmitButton>
      </form>

      <p className="mt-7 text-center text-sm text-body/55">
        ¿Ya tienes cuenta?{" "}
        <Link
          to="/login"
          className="font-extrabold text-primary underline decoration-accent decoration-4 underline-offset-4"
        >
          Ingresar
        </Link>
      </p>
      <TermsAndConditionsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </AuthLayout>
  );
}
