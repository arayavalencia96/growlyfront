import { Filter, Plus, Search, Sprout } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import { ConfirmModal } from "@/common/components/ConfirmModal";
import { Modal } from "@/common/components/Modal";
import { toastService } from "@/common/services/toast.service";
import { GoalCard } from "@/modules/goals/components/GoalCard";
import { GoalForm } from "@/modules/goals/components/GoalForm";
import {
  GoalCardsSkeleton,
  PortfolioSummarySkeleton,
  GoalsPageSkeleton,
} from "@/modules/goals/components/GoalsSkeletons";
import type {
  GoalCurrency,
  GoalStatus,
  GoalType,
  IGoal,
  IGoalFilters,
  IGoalPayload,
} from "@/modules/goals/interfaces/goals.interface";
import { goalsService } from "@/modules/goals/services/goals.service";
import { PortfolioSummaryPanel } from "@/modules/summaries/components/PortfolioSummaryPanel";
import { CashyAllocationPanel } from "@/modules/integration/CashyAllocationPanel";
import type { IPortfolioSummary } from "@/modules/summaries/interfaces/summaries.interface";
import { summariesService } from "@/modules/summaries/services/summaries.service";
import { getErrorMessage } from "@/utils/error.utils";

export function GoalsPage() {
  const [goals, setGoals] = useState<IGoal[]>([]);
  const [portfolioSummary, setPortfolioSummary] =
    useState<IPortfolioSummary | null>(null);
  const [filters, setFilters] = useState<IGoalFilters>({});
  const [search, setSearch] = useState("");
  const [type, setType] = useState<GoalType | "">("");
  const [status, setStatus] = useState<GoalStatus | "">("");
  const [currency, setCurrency] = useState<GoalCurrency | "">("");
  const [editingGoal, setEditingGoal] = useState<IGoal | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [budgetReady, setBudgetReady] = useState(false);
  const onBudgetReady = useCallback(() => setBudgetReady(true), []);
  const pageLoading = isLoading || !budgetReady;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [goalPendingDeletion, setGoalPendingDeletion] = useState<IGoal | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    Promise.allSettled([
      goalsService.getAll(filters),
      summariesService.getPortfolio(),
    ])
      .then(([goalsResponse, summaryResponse]) => {
        if (!isActive) return;
        if (goalsResponse.status === "rejected") throw goalsResponse.reason;
        if (summaryResponse.status === "rejected") throw summaryResponse.reason;
        setGoals(goalsResponse.value.result);
        setPortfolioSummary(summaryResponse.value.result);
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
  }, [filters]);

  const applyFilters = (
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setFilters({
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(currency ? { currency } : {}),
    });
  };

  const openCreate = () => {
    setEditingGoal(null);
    setIsFormOpen(true);
  };

  const refreshPortfolioSummary = async () => {
    try {
      const { result } = await summariesService.getPortfolio();
      setPortfolioSummary(result);
    } catch (requestError: unknown) {
      toastService.error(
        "No pudimos actualizar el resumen",
        getErrorMessage(requestError),
      );
    }
  };

  const openEdit = (goal: IGoal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const saveGoal = async (payload: IGoalPayload) => {
    setIsSubmitting(true);
    setError("");
    try {
      if (editingGoal) {
        const { result } = await goalsService.update(editingGoal.id, payload);
        setGoals((current) =>
          current.map((goal) => (goal.id === result.id ? result : goal)),
        );
        toastService.success("Objetivo actualizado correctamente");
      } else {
        const { result } = await goalsService.create(payload);
        setGoals((current) => [result, ...current]);
        toastService.success("Objetivo creado correctamente");
      }
      setIsFormOpen(false);
      setEditingGoal(null);
      await refreshPortfolioSummary();
    } catch (requestError: unknown) {
      toastService.error(
        editingGoal
          ? "No pudimos actualizar el objetivo"
          : "No pudimos crear el objetivo",
        getErrorMessage(requestError),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteGoal = (goal: IGoal) => setGoalPendingDeletion(goal);

  const confirmGoalDeletion = async () => {
    if (!goalPendingDeletion) return;
    setIsDeleting(true);
    try {
      await goalsService.remove(goalPendingDeletion.id);
      setGoals((current) =>
        current.filter(({ id }) => id !== goalPendingDeletion.id),
      );
      await refreshPortfolioSummary();
      toastService.success("Objetivo eliminado correctamente");
      setGoalPendingDeletion(null);
    } catch (requestError: unknown) {
      toastService.error(
        "No pudimos eliminar el objetivo",
        getErrorMessage(requestError),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl" aria-busy={pageLoading}>
      {pageLoading ? <GoalsPageSkeleton /> : null}
      <div hidden={pageLoading}>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-extrabold tracking-[0.2em] text-secondary uppercase">
              Tu hoja de ruta
            </p>
            <h1 className="mt-3 font-display text-5xl leading-none text-primary sm:text-6xl">
              Objetivos
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-body/60">
              Definí tu objetivo y controlá cada aporte, extracción e inversión
              para llevarlo a cabo.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_35px_rgba(20,54,44,0.22)] transition hover:-translate-y-0.5 hover:bg-brand-hover"
          >
            <Plus size={18} />
            Nuevo objetivo
          </button>
        </div>

        {portfolioSummary && (
          <PortfolioSummaryPanel summary={portfolioSummary} />
        )}
        {isLoading && !portfolioSummary && <PortfolioSummarySkeleton />}
        <CashyAllocationPanel onInitialSettled={onBudgetReady} />

        <form
          onSubmit={applyFilters}
          className="mt-10 grid gap-3 rounded-3xl border border-outline/8 bg-surface/65 p-3 shadow-sm sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_180px_160px_120px_auto]"
        >
          <label className="relative sm:col-span-2 xl:col-span-1">
            <Search
              className="absolute top-1/2 left-4 -translate-y-1/2 text-secondary"
              size={17}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar objetivo..."
              className="app-field pl-11"
            />
          </label>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as GoalType | "")}
            className="app-field"
          >
            <option value="">Todos los tipos</option>
            <option value="long_term">Largo plazo</option>
            <option value="medium_term">Mediano plazo</option>
            <option value="short_term">Corto plazo</option>
          </select>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as GoalStatus | "")
            }
            className="app-field"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="paused">Pausado</option>
            <option value="completed">Completado</option>
          </select>
          <select
            value={currency}
            onChange={(event) =>
              setCurrency(event.target.value as GoalCurrency | "")
            }
            className="app-field"
          >
            <option value="">Moneda</option>
            <option value="USD">USD</option>
            <option value="ARS">ARS</option>
          </select>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-primary"
          >
            <Filter size={16} />
            Filtrar
          </button>
        </form>

        {error ? (
          <div className="mt-6 rounded-2xl border border-ember/20 bg-ember/8 px-5 py-4 text-sm font-semibold text-ember">
            {error}
          </div>
        ) : null}

        {isLoading && <GoalCardsSkeleton />}

        {!isLoading && goals.length > 0 && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={openEdit}
                onDelete={deleteGoal}
              />
            ))}
          </div>
        )}

        {!isLoading && goals.length === 0 && (
          <div className="mt-8 grid min-h-80 place-items-center rounded-4xl border border-dashed border-outline/18 bg-surface/45 p-8 text-center">
            <div>
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent text-primary">
                <Sprout size={26} />
              </span>
              <h2 className="mt-5 font-display text-3xl text-primary">
                Todavía no hay objetivos
              </h2>
              <p className="mt-2 text-sm text-body/50">
                Crea el primero y empieza a registrar tu progreso.
              </p>
            </div>
          </div>
        )}

        {isFormOpen ? (
          <Modal
            size="xl"
            eyebrow={editingGoal ? "Editar objetivo" : "Nuevo propósito"}
            title={editingGoal ? editingGoal.name : "¿Qué querés lograr?"}
            onClose={() => setIsFormOpen(false)}
          >
            <GoalForm
              goal={editingGoal || undefined}
              isSubmitting={isSubmitting}
              onSubmit={saveGoal}
              onCancel={() => setIsFormOpen(false)}
            />
          </Modal>
        ) : null}

        {goalPendingDeletion ? (
          <ConfirmModal
            eyebrow="Eliminar objetivo"
            title={`¿Eliminar ${goalPendingDeletion.name}?`}
            description="El objetivo dejará de aparecer en tu lista y su saldo se excluirá de la cartera. Se conservarán los registros necesarios para el historial de aportes y transferencias, identificándolo como eliminado. Esto no devuelve el presupuesto ya utilizado en Cashy. Las operaciones ya aceptadas pueden terminar de procesarse. No se puede deshacer desde la app."
            confirmLabel="Eliminar objetivo"
            variant="danger"
            isLoading={isDeleting}
            onConfirm={confirmGoalDeletion}
            onClose={() => {
              if (!isDeleting) setGoalPendingDeletion(null);
            }}
          />
        ) : null}
      </div>
    </section>
  );
}
