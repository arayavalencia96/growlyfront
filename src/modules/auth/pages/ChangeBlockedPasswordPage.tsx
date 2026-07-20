import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { sessionService } from "@/common/services/session.service";
import { AuthAlert } from "@/modules/auth/components/AuthAlert";
import { AuthLayout } from "@/modules/auth/components/AuthLayout";
import { NewPasswordForm } from "@/modules/auth/components/NewPasswordForm";
import type { IAuthNavigationState } from "@/modules/auth/interfaces/auth.interface";
import { authService } from "@/modules/auth/services/auth.service";
import { getAuthErrorMessage } from "@/modules/auth/utils/auth-error.utils";

export function ChangeBlockedPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigationState = location.state as IAuthNavigationState | undefined;
  const passwordChangeToken =
    navigationState?.passwordChangeToken || searchParams.get("token") || "";
  const [requestError, setRequestError] = useState("");

  const handleSave = async (newPassword: string) => {
    if (!passwordChangeToken) {
      return;
    }

    setRequestError("");

    try {
      await authService.changeBlockedPassword({
        passwordChangeToken,
        newPassword,
      });
      sessionService.clear();
      navigate("/login", {
        replace: true,
        state: {
          message:
            "Tu contraseña fue actualizada. Inicia sesión nuevamente con tus credenciales.",
        },
      });
    } catch (error: unknown) {
      setRequestError(getAuthErrorMessage(error));
    }
  };

  return (
    <AuthLayout
      eyebrow="Último paso"
      title="Crea una nueva contraseña."
      description="Por seguridad, debe ser distinta y cumplir las mismas reglas de protección de tu cuenta."
      step="Desbloqueo 2 de 2"
    >
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-secondary/15 bg-surface/65 p-4 text-sm leading-6 text-body/62">
        <ShieldCheck
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-secondary"
          size={19}
        />
        Al guardar la contraseña, se cerrarán las sesiones anteriores y tendrás
        que iniciar sesión nuevamente.
      </div>

      {!passwordChangeToken ? (
        <AuthAlert message="El enlace no contiene un token válido. Vuelve a abrir el enlace que recibiste por correo." />
      ) : null}
      {requestError ? <AuthAlert message={requestError} /> : null}

      <NewPasswordForm
        hasToken={Boolean(passwordChangeToken)}
        onSave={handleSave}
        submitText="Guardar y continuar"
        loadingText="Actualizando contraseña..."
      />

      {!passwordChangeToken ? (
        <p className="mt-6 text-center text-sm">
          <Link
            to="/login"
            className="font-extrabold text-primary underline decoration-accent decoration-4 underline-offset-4"
          >
            Volver al inicio de sesión
          </Link>
        </p>
      ) : null}
    </AuthLayout>
  );
}
