import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { AuthAlert } from "@/modules/auth/components/AuthAlert";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { FormField } from "@/modules/auth/components/FormField";
import { SubmitButton } from "@/modules/auth/components/SubmitButton";
import { sessionService } from "@/common/services/session.service";
import type {
  IAuthNavigationState,
  IVerificationCodeRequest,
} from "@/modules/auth/interfaces/auth.interface";
import { authService } from "@/modules/auth/services/auth.service";
import { getAuthErrorMessage } from "@/modules/auth/utils/auth-error.utils";
import { verificationCodeSchema } from "@/modules/auth/validations/auth.validation";

export function VerificationCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const purpose = searchParams.get("purpose") || "registration";
  const isUnblock = purpose === "unblock";
  const isEmailChange = purpose === "email_change";
  const navigationState = location.state as IAuthNavigationState | undefined;
  const [requestError, setRequestError] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    navigationState?.message || "",
  );
  const [isResending, setIsResending] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<IVerificationCodeRequest>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: {
      email: searchParams.get("email") || "",
      code: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setRequestError("");
    setStatusMessage("");

    try {
      const response = await authService.verifyCode({
        email: data.email.trim().toLowerCase(),
        code: data.code,
      });
      const passwordChangeToken = response.result.passwordChangeToken;

      if (passwordChangeToken) {
        navigate("/change-password", {
          replace: true,
          state: { passwordChangeToken },
        });
        return;
      }

      if (isEmailChange) {
        sessionService.clear();
      }

      navigate("/login", {
        replace: true,
        state: {
          message: isEmailChange
            ? "Tu nuevo correo quedó confirmado. Ingresa nuevamente para continuar."
            : "Tu correo quedó validado. Ya puedes ingresar a Growly.",
        },
      });
    } catch (error: unknown) {
      setRequestError(getAuthErrorMessage(error));
    }
  });

  const handleResend = async () => {
    const emailIsValid = await trigger("email");

    if (!emailIsValid) {
      return;
    }

    setIsResending(true);
    setRequestError("");
    setStatusMessage("");

    try {
      await authService.requestVerificationCode({
        email: getValues("email").trim().toLowerCase(),
      });
      setStatusMessage(
        "Enviamos un código nuevo. Recuerda que vence en 30 minutos.",
      );
    } catch (error: unknown) {
      setRequestError(getAuthErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      eyebrow={isUnblock ? "Protegemos tu cuenta" : "Confirma tu correo"}
      title={isUnblock ? "Recupera el acceso." : "Revisa tu bandeja."}
      description={
        isUnblock
          ? "Usa el código que enviamos a tu correo. Después tendrás que elegir una contraseña nueva."
          : "Ingresa el código de seis dígitos que enviamos a tu correo. Tiene una validez de 30 minutos."
      }
      step={isUnblock ? "Desbloqueo 1 de 2" : "Paso 2 de 2"}
    >
      {statusMessage ? (
        <AuthAlert message={statusMessage} variant="success" />
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
        <FormField
          {...register("code")}
          label="Código de verificación"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          maxLength={6}
          className="py-4 text-center font-mono text-2xl font-bold tracking-[0.45em]"
          error={errors.code?.message}
          hint="Si no lo encuentras, revisa también la carpeta de spam."
          onInput={(event) => {
            event.currentTarget.value = event.currentTarget.value
              .replace(/\D/g, "")
              .slice(0, 6);
          }}
        />
        <SubmitButton
          isLoading={isSubmitting}
          loadingText="Validando código..."
        >
          Validar código
          <ArrowRight aria-hidden="true" size={18} />
        </SubmitButton>
      </form>

      <div className="mt-6 flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 font-bold text-body/55 hover:text-primary"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Volver al ingreso
        </Link>
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="font-extrabold text-primary underline decoration-accent decoration-4 underline-offset-4 disabled:opacity-50"
        >
          {isResending ? "Reenviando..." : "Reenviar código"}
        </button>
      </div>
    </AuthLayout>
  );
}
