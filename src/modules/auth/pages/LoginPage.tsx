import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { sessionService } from "@/common/services/session.service";
import { authService } from "@/modules/auth/services/auth.service";

import {
  getAuthErrorMessage,
  getSessionTokens,
  isAuthError,
} from "@/modules/auth/utils/auth-error.utils";

import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/modules/auth/validations/auth.validation";

import { AuthAlert } from "@/modules/auth/components/AuthAlert";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { FormField } from "@/modules/auth/components/FormField";
import { PasswordField } from "@/modules/auth/components/PasswordField";
import { SubmitButton } from "@/modules/auth/components/SubmitButton";

import type {
  IAuthNavigationState,
  ILoginRequest,
} from "@/modules/auth/interfaces/auth.interface";

import { ArrowRight, Mail } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = location.state as IAuthNavigationState | undefined;
  const [requestError, setRequestError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ILoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setRequestError("");

    try {
      const response = await authService.login({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });
      sessionService.save(getSessionTokens(response.result));
      navigate("/home", { replace: true });
    } catch (error: unknown) {
      const requiresVerification =
        isAuthError(error, "Email is not validated") ||
        isAuthError(error, "User is blocked") ||
        isAuthError(error, "User was blocked after three failed attempts");

      if (requiresVerification) {
        const params = new URLSearchParams({
          email: data.email.trim().toLowerCase(),
          purpose: isAuthError(error, "Email is not validated")
            ? "registration"
            : "unblock",
        });
        navigate("/verify-code?" + params.toString(), {
          state: { message: getAuthErrorMessage(error) },
        });
        return;
      }

      setRequestError(getAuthErrorMessage(error));
    }
  });

  return (
    <AuthLayout
      eyebrow="Bienvenido"
      title="Volvé a tus objetivos."
      description="Ingresá para revisar tus posiciones, movimientos y el progreso de cada meta."
      step="Acceso"
    >
      {navigationState?.message ? (
        <AuthAlert
          message={navigationState.message}
          variant={navigationState.alertVariant || "success"}
        />
      ) : null}
      {requestError ? <AuthAlert message={requestError} /> : null}

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
        <div>
          <PasswordField
            {...register("password")}
            label="Contraseña"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            error={errors.password?.message}
          />
          <div className="mt-2 text-right">
            <Link
              to="/recover-password"
              className="text-sm font-extrabold text-primary underline decoration-accent decoration-4 underline-offset-4"
            >
              Recuperá tu contraseña
            </Link>
          </div>
        </div>
        <SubmitButton isLoading={isSubmitting} loadingText="Ingresando...">
          Ingresar
          <ArrowRight aria-hidden="true" size={18} />
        </SubmitButton>
      </form>

      <p className="mt-7 text-center text-sm text-body/55">
        ¿Todavía no tenés una cuenta?{" "}
        <Link
          to="/register"
          className="font-extrabold text-primary underline decoration-accent decoration-4 underline-offset-4"
        >
          Crear cuenta
        </Link>
      </p>
    </AuthLayout>
  );
}
