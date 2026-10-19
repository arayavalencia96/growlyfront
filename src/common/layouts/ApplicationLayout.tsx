import {
  Eye,
  EyeOff,
  LogOut,
  Menu,
  Moon,
  Sprout,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  SESSION_EXPIRED_EVENT,
  sessionService,
} from "@/common/services/session.service";
import { BalancePrivacyProvider } from "@/common/components/BalancePrivacy";
import { useBalancePrivacy } from "@/common/components/balance-privacy.context";
import { ThemeProvider } from "@/common/components/ThemeProvider";
import { useTheme } from "@/common/components/theme.context";
import { SidebarGoals } from "./SidebarGoals";
import { RealizedProfitStoreProvider } from "@/modules/summaries/stores/realized-profit.store";

const SIDEBAR_STORAGE_KEY = "growly.sidebarCollapsed";

function readSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function ApplicationShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(readSidebarCollapsed);
  const compact = isCollapsed && !isMenuOpen;
  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
    } catch {
      return;
    }
  };
  const navigate = useNavigate();
  const { areBalancesVisible, toggleBalancesVisibility } = useBalancePrivacy();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleSessionExpired = () => {
      navigate("/login", {
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
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-page text-body">
      <aside
        className={
          "fixed inset-y-0 left-0 z-40 flex h-dvh flex-col overflow-hidden bg-brand py-6 text-white transition-[width,transform] duration-300 lg:translate-x-0 " +
          (compact ? "w-20 px-3 " : "w-72 px-5 ") +
          (isMenuOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div
          className={
            "flex items-center justify-between gap-3 " +
            (compact ? "flex-col" : "px-2")
          }
        >
          <NavLink to="/objectives" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-accent text-primary">
              <Sprout size={22} strokeWidth={2} />
            </span>
            <span className={compact ? "sr-only" : "font-display text-3xl"}>
              Growly
            </span>
          </NavLink>
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={
              isCollapsed ? "Expandir barra lateral" : "Retraer barra lateral"
            }
            title={
              isCollapsed ? "Expandir barra lateral" : "Retraer barra lateral"
            }
            aria-expanded={!isCollapsed}
            className="hidden shrink-0 rounded-xl p-2 text-white/70 transition hover:bg-white/10 lg:block"
          >
            {isCollapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <PanelLeftClose size={20} />
            )}
          </button>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-xl p-2 text-white/70 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
        <p
          className={
            compact
              ? "sr-only"
              : "mt-3 text-xs font-bold tracking-[0.16em] text-accent-text uppercase"
          }
        >
          Finanzas con propósito
        </p>

        <nav className="mt-12 min-h-0 flex-1 space-y-2 overflow-y-auto">
          <SidebarGoals
            compact={compact}
            onNavigate={() => setIsMenuOpen(false)}
          />
          <NavLink
            to="/profile"
            onClick={() => setIsMenuOpen(false)}
            title={compact ? "Mi perfil" : undefined}
            className={({ isActive }) =>
              "flex items-center rounded-2xl py-3 text-sm font-bold transition " +
              (compact ? "justify-center px-2 " : "gap-3 px-4 ") +
              (isActive
                ? "bg-accent text-primary"
                : "text-white/65 hover:bg-white/8 hover:text-white")
            }
          >
            <UserRound size={19} strokeWidth={1.9} className="shrink-0" />
            <span className={compact ? "sr-only" : ""}>Mi perfil</span>
          </NavLink>
        </nav>

        <div className="shrink-0 pt-6">
          <button
            type="button"
            onClick={logout}
            title={compact ? "Cerrar sesión" : undefined}
            className={
              "mt-4 flex w-full items-center rounded-2xl py-3 text-sm font-bold text-white/60 transition hover:bg-white/8 hover:text-white " +
              (compact ? "justify-center px-2" : "gap-3 px-4")
            }
          >
            <LogOut size={18} />
            <span className={compact ? "sr-only" : ""}>Cerrar sesión</span>
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

      <div
        className={
          "transition-[padding] duration-300 " +
          (isCollapsed ? "lg:pl-20" : "lg:pl-72")
        }
      >
        <header className="sticky top-0 z-20 flex h-20 items-center border-b border-outline/8 bg-page/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setIsMenuOpen(true)}
            className="rounded-xl border border-outline/10 bg-surface p-2.5 text-primary shadow-sm lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={toggleBalancesVisibility}
              aria-label={
                areBalancesVisible ? "Ocultar saldos" : "Mostrar saldos"
              }
              title={areBalancesVisible ? "Ocultar saldos" : "Mostrar saldos"}
              className="grid size-10 place-items-center rounded-xl border border-outline/10 bg-surface text-primary shadow-sm transition hover:bg-accent"
            >
              {areBalancesVisible ? <Eye size={19} /> : <EyeOff size={19} />}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "light" ? "Activar tema oscuro" : "Activar tema claro"
              }
              title={
                theme === "light" ? "Activar tema oscuro" : "Activar tema claro"
              }
              className="grid size-10 place-items-center rounded-xl border border-outline/10 bg-surface text-primary shadow-sm transition hover:bg-accent"
            >
              {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
            </button>
          </div>
        </header>
        <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function ApplicationLayout() {
  return (
    <ThemeProvider>
      <BalancePrivacyProvider>
        <RealizedProfitStoreProvider>
          <ApplicationShell />
        </RealizedProfitStoreProvider>
      </BalancePrivacyProvider>
    </ThemeProvider>
  );
}
