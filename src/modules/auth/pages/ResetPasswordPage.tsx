import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { sessionService } from "@/common/services/session.service";
import { AuthAlert } from "@/modules/auth/components/AuthAlert";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { NewPasswordForm } from "@/modules/auth/components/NewPasswordForm";
import { authService } from "@/modules/auth/services/auth.service";
import { getAuthErrorMessage } from "@/modules/auth/utils/auth-error.utils";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token") || "";
  const [requestError, setRequestError] = useState("");

  const handleSave = async (newPassword: string) => {
    setRequestError("");

    try {
      await authService.resetPassword({
        resetToken,
        newPassword,
      });
      sessionService.clear();
      navigate("/iniciar-sesion", {
        replace: true,
        state: {
          message:
            "Tu contraseña fue restablecida. Inicia sesión nuevamente con tus credenciales.",
        },
      });
    } catch (error: unknown) {
      setRequestError(getAuthErrorMessage(error));
    }
  };

  return (
    <AuthLayout
      eyebrow="Enlace verificado"
      title="Elige una contraseña nueva."
      description="El enlace solo puede utilizarse una vez y vence 30 minutos después de haber sido solicitado."
      step="Recuperación 2 de 2"
    >
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-moss/15 bg-white/65 p-4 text-sm leading-6 text-ink/62">
        <ShieldCheck
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-moss"
          size={19}
        />
        Al guardar, cerraremos tus sesiones anteriores y tendrás que iniciar
        sesión nuevamente.
      </div>

      {!resetToken ? (
        <AuthAlert message="El enlace no contiene un token válido. Solicita un enlace nuevo desde el inicio de sesión." />
      ) : null}
      {requestError ? <AuthAlert message={requestError} /> : null}

      <NewPasswordForm
        hasToken={Boolean(resetToken)}
        onSave={handleSave}
        submitText="Guardar y continuar"
        loadingText="Restableciendo contraseña..."
      />

      {!resetToken ? (
        <p className="mt-6 text-center text-sm">
          <Link
            to="/recuperar-contrasena"
            className="font-extrabold text-forest underline decoration-lime decoration-4 underline-offset-4"
          >
            Solicitar otro enlace
          </Link>
        </p>
      ) : null}
    </AuthLayout>
  );
}
