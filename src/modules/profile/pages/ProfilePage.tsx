import { BadgeCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sessionService } from "@/common/services/session.service";
import type { IUser } from "@/modules/auth/interfaces/auth.interface";
import { ApplicationInfo } from "@/modules/profile/components/ApplicationInfo";
import { ChangePasswordForm } from "@/modules/profile/components/ChangePasswordForm";
import { DeactivateAccountModal } from "@/modules/profile/components/DeactivateAccountModal";
import { PersonalDataForm } from "@/modules/profile/components/PersonalDataForm";
import { ProfileSkeleton } from "@/modules/profile/components/ProfileSkeleton";
import { profileService } from "@/modules/profile/services/profile.service";
import { getErrorMessage } from "@/utils/error.utils";
import { formatDate } from "@/utils/format.utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    profileService
      .getProfile()
      .then(({ result }) => {
        if (isActive) setUser(result);
      })
      .catch((requestError: unknown) => {
        if (isActive) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleEmailChangeRequested = (email: string) => {
    sessionService.clear();
    navigate(
      "/verificar-codigo?email=" +
        encodeURIComponent(email) +
        "&purpose=email_change",
      {
        replace: true,
        state: {
          message:
            "Enviamos un código al nuevo correo. Confírmalo para completar el cambio.",
        },
      },
    );
  };

  const handlePasswordChanged = () => {
    sessionService.clear();
    navigate("/iniciar-sesion", {
      replace: true,
      state: {
        message:
          "Tu contraseña fue actualizada. Ingresa nuevamente con tus credenciales.",
        alertVariant: "success",
      },
    });
  };

  const handleDeactivated = () => {
    sessionService.clear();
    navigate("/iniciar-sesion", {
      replace: true,
      state: {
        message:
          "Tu cuenta fue desactivada. Gracias por haber utilizado Growly.",
        alertVariant: "info",
      },
    });
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-10 text-center">
        <h1 className="font-display text-4xl text-forest">
          No pudimos cargar tu perfil
        </h1>
        <p className="mt-3 text-sm text-ember">{error}</p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="overflow-hidden rounded-[2rem] bg-forest text-white shadow-[0_24px_70px_rgba(20,54,44,0.18)]">
        <div className="relative flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:p-9">
          <div className="absolute -top-20 -right-12 size-64 rounded-full border-[45px] border-lime/8" />
          <span className="relative grid size-20 shrink-0 place-items-center rounded-[1.75rem] bg-lime font-display text-3xl text-forest">
            {getInitials(user.name)}
          </span>
          <div className="relative min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-5xl leading-none">
                {user.name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-lime/12 px-3 py-1 text-xs font-bold text-lime">
                <BadgeCheck size={14} />
                Verificado
              </span>
            </div>
            <p className="mt-3 text-sm text-white/55">{user.email}</p>
          </div>
          <div className="relative border-t border-white/10 pt-5 sm:ml-auto sm:min-w-48 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8 text-center md:text-left">
            <p className="text-[10px] font-bold tracking-[0.14em] text-lime uppercase">
              Miembro desde
            </p>
            <p className="mt-2 text-sm font-bold text-white">
              {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7 grid items-start gap-6">
        <div className="space-y-6">
          <PersonalDataForm
            user={user}
            onUpdated={setUser}
            onEmailChangeRequested={handleEmailChangeRequested}
          />
          <ChangePasswordForm onPasswordChanged={handlePasswordChanged} />

          <section className="rounded-[1.75rem] border border-ember/18 bg-white p-6 sm:p-7">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-ember uppercase">
                  Zona sensible
                </p>
                <h2 className="mt-2 font-display text-3xl text-forest">
                  Desactivar cuenta
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-ink/50">
                  Se cerrarán todas tus sesiones y no podrás volver a ingresar.
                  Conservaremos los datos financieros sin eliminarlos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDeactivateOpen(true)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-ember/25 px-5 py-3 text-sm font-bold text-ember transition hover:bg-ember hover:text-white"
              >
                <Trash2 size={17} />
                Darme de baja
              </button>
            </div>
          </section>
        </div>
      </div>

      <DeactivateAccountModal
        isOpen={isDeactivateOpen}
        onClose={() => setIsDeactivateOpen(false)}
        onDeactivated={handleDeactivated}
      />
      <ApplicationInfo />
    </section>
  );
}
