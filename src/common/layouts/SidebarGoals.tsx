import { ChevronDown, ChevronRight, Target } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import {
  goalsService,
  GOALS_CHANGED_EVENT,
} from "@/modules/goals/services/goals.service";
import { getErrorMessage } from "@/utils/error.utils";

interface NavigationGoal {
  id: string;
  name: string;
}
const alphabetical = new Intl.Collator("es", {
  sensitivity: "base",
  numeric: true,
});

export function SidebarGoals({
  compact,
  onNavigate,
}: {
  readonly compact: boolean;
  readonly onNavigate: () => void;
}) {
  const [goals, setGoals] = useState<NavigationGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadRevision, setReloadRevision] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const [flyout, setFlyout] = useState(false);
  const [top, setTop] = useState(120);
  const anchor = useRef<HTMLButtonElement>(null);
  const contentId = useId();
  const { pathname } = useLocation();
  const opened = compact ? flyout : expanded;

  useEffect(() => {
    let active = true;
    let revision = 0;
    const reload = () => {
      const requestRevision = ++revision;
      void goalsService
        .getAll()
        .then(({ result }) => {
          if (!active || revision !== requestRevision) return;
          setGoals(
            result
              .map(({ id, name }) => ({ id, name }))
              .sort((a, b) => alphabetical.compare(a.name, b.name)),
          );
          setError("");
        })
        .catch((failure: unknown) => {
          if (active && revision === requestRevision)
            setError(getErrorMessage(failure));
        })
        .finally(() => {
          if (active && revision === requestRevision) setLoading(false);
        });
    };
    reload();
    window.addEventListener(GOALS_CHANGED_EVENT, reload);
    return () => {
      active = false;
      window.removeEventListener(GOALS_CHANGED_EVENT, reload);
    };
  }, [reloadRevision]);

  useEffect(() => {
    if (!flyout) return;
    const close = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setFlyout(false);
      anchor.current?.focus();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [flyout]);

  const navigate = () => {
    setFlyout(false);
    onNavigate();
  };
  const content = (
    <div id={contentId} className="space-y-1">
      <NavLink
        to="/objectives"
        end
        onClick={navigate}
        className={({ isActive }) =>
          "block rounded-xl px-3 py-2 text-xs font-bold transition " +
          (isActive
            ? "bg-white/15 text-white"
            : "text-white/65 hover:bg-white/8 hover:text-white")
        }
      >
        Todos los objetivos
      </NavLink>
      {loading ? (
        <div
          aria-label="Cargando accesos a objetivos"
          className="space-y-2 p-3"
        >
          {[1, 2, 3].map((key) => (
            <div key={key} className="h-4 animate-pulse rounded bg-white/10" />
          ))}
        </div>
      ) : error ? (
        <div className="px-3 py-2 text-xs text-white/70">
          <p role="alert">No pudimos cargar los objetivos. {error}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setReloadRevision((current) => current + 1);
            }}
            className="mt-2 rounded-lg border border-white/20 px-3 py-2"
          >
            Reintentar carga
          </button>
        </div>
      ) : goals.length ? (
        goals.map((goal) => (
          <NavLink
            key={goal.id}
            to={"/objectives/" + goal.id}
            onClick={navigate}
            title={goal.name}
            className={({ isActive }) =>
              "block truncate rounded-xl px-3 py-2 text-sm transition " +
              (isActive
                ? "bg-accent font-bold text-primary"
                : "text-white/65 hover:bg-white/8 hover:text-white")
            }
          >
            {goal.name}
          </NavLink>
        ))
      ) : (
        <p className="px-3 py-2 text-xs text-white/55">
          Todavía no hay objetivos.
        </p>
      )}
    </div>
  );

  return (
    <>
      <button
        ref={anchor}
        type="button"
        aria-label="Objetivos"
        title={compact ? "Objetivos" : undefined}
        aria-expanded={opened}
        aria-controls={opened ? contentId : undefined}
        onClick={() => {
          if (!compact) {
            setExpanded((current) => !current);
            return;
          }
          const rect = anchor.current?.getBoundingClientRect();
          setTop(
            Math.max(16, Math.min(rect?.top ?? 120, window.innerHeight - 260)),
          );
          setFlyout((current) => !current);
        }}
        className={
          "flex w-full items-center rounded-2xl py-3 text-sm font-bold transition " +
          (compact ? "justify-center px-2 " : "gap-3 px-4 ") +
          (pathname.startsWith("/objectives")
            ? "bg-accent text-primary"
            : "text-white/65 hover:bg-white/8 hover:text-white")
        }
      >
        <Target size={19} strokeWidth={1.9} className="shrink-0" />
        {!compact ? (
          <>
            <span className="flex-1 text-left">Objetivos</span>
            {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </>
        ) : null}
      </button>
      {!compact && expanded ? (
        <div className="ml-5 border-l border-white/15 pl-2">{content}</div>
      ) : null}
      {compact && flyout
        ? createPortal(
            <>
              <button
                type="button"
                aria-label="Cerrar accesos a objetivos"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => {
                  setFlyout(false);
                  anchor.current?.focus();
                }}
              />
              <nav
                aria-label="Acceso directo a objetivos"
                className="fixed left-20 z-50 ml-2 w-72 max-w-[calc(100vw-6rem)] overflow-y-auto rounded-2xl border border-white/15 bg-brand p-3 text-white shadow-2xl"
                style={{ top, maxHeight: `calc(100dvh - ${top + 16}px)` }}
              >
                <p className="mb-3 px-3 pt-1 text-xs font-bold tracking-widest text-accent-text uppercase">
                  Objetivos
                </p>
                {content}
              </nav>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
