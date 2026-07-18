import { LogOut, Menu, Sprout, Target, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  SESSION_EXPIRED_EVENT,
  sessionService,
} from "@/common/services/session.service";

const navigation = [
  { label: "Objetivos", path: "/objetivos", icon: Target },
  { label: "Mi perfil", path: "/mi-perfil", icon: UserRound },
] as const;

export function ApplicationLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpired = () => {
      navigate("/iniciar-sesion", {
        replace: true,
        state: {
          message: "Tu sesión venció. Ingresa nuevamente para continuar.",
          alertVariant: "info",
        },
      });
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [navigate]);

  const logout = () => {
    sessionService.clear();
    navigate("/iniciar-sesion", { replace: true });
  };

  return (
    <div className="min-h-screen bg-linen text-ink">
      <aside
        className={
          "fixed inset-y-0 left-0 z-40 flex h-dvh w-72 flex-col overflow-hidden bg-forest px-5 py-6 text-white transition-transform duration-300 lg:translate-x-0 " +
          (isMenuOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="flex items-center justify-between px-2">
          <NavLink to="/objetivos" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-lime text-forest">
              <Sprout size={22} strokeWidth={2} />
            </span>
            <span className="font-display text-3xl">Growly</span>
          </NavLink>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-xl p-2 text-white/70 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-12 min-h-0 flex-1 space-y-2 overflow-y-auto">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition " +
                (isActive
                  ? "bg-lime text-forest"
                  : "text-white/65 hover:bg-white/8 hover:text-white")
              }
            >
              <Icon size={19} strokeWidth={1.9} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 pt-6">
          <div className="rounded-3xl border border-white/10 bg-white/6 p-4">
            <p className="text-xs font-bold tracking-[0.18em] text-lime uppercase">
              Tu patrimonio
            </p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Cada movimiento cuenta una parte de tu progreso.
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-4 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white/60 transition hover:bg-white/8 hover:text-white"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {isMenuOpen ? (
        <button
          type="button"
          aria-label="Cerrar navegación"
          className="fixed inset-0 z-30 bg-ink/45 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center border-b border-forest/8 bg-linen/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setIsMenuOpen(true)}
            className="rounded-xl border border-forest/10 bg-white p-2.5 text-forest shadow-sm lg:hidden"
          >
            <Menu size={20} />
          </button>
          <p className="ml-auto text-xs font-bold tracking-[0.16em] text-moss uppercase">
            Finanzas con propósito
          </p>
        </header>
        <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
