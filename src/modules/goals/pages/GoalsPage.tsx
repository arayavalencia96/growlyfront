import { Filter, Plus, Search, Sprout } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Modal } from "@/common/components/Modal";
import { GoalCard } from "@/modules/goals/components/GoalCard";
import { GoalForm } from "@/modules/goals/components/GoalForm";
import {
  GoalCardsSkeleton,
  PortfolioSummarySkeleton,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    Promise.all([goalsService.getAll(filters), summariesService.getPortfolio()])
      .then(([goalsResponse, summaryResponse]) => {
        if (!isActive) return;
        setGoals(goalsResponse.result);
        setPortfolioSummary(summaryResponse.result);
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

  const applyFilters = (event: FormEvent) => {
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
      setError(getErrorMessage(requestError));
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
      } else {
        const { result } = await goalsService.create(payload);
        setGoals((current) => [result, ...current]);
      }
      setIsFormOpen(false);
      setEditingGoal(null);
      await refreshPortfolioSummary();
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteGoal = async (goal: IGoal) => {
    const confirmed = window.confirm(
      '¿Eliminar "' + goal.name + '"? Esta acción no se puede deshacer.',
    );
    if (!confirmed) return;

    try {
      await goalsService.remove(goal.id);
      setGoals((current) => current.filter(({ id }) => id !== goal.id));
      await refreshPortfolioSummary();
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <section className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-extrabold tracking-[0.2em] text-moss uppercase">
            Tu hoja de ruta
          </p>
          <h1 className="mt-3 font-display text-5xl leading-none text-forest sm:text-6xl">
            Objetivos
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-ink/58">
            Define para qué invertís y lleva cada aporte, extracción e inversión
            dentro de un mismo propósito.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-forest px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_35px_rgba(20,54,44,0.22)] transition hover:-translate-y-0.5 hover:bg-moss"
        >
          <Plus size={18} />
          Nuevo objetivo
        </button>
      </div>

      {portfolioSummary ? (
        <PortfolioSummaryPanel summary={portfolioSummary} />
      ) : isLoading ? (
        <PortfolioSummarySkeleton />
      ) : null}

      <form
        onSubmit={applyFilters}
        className="mt-10 grid gap-3 rounded-[1.5rem] border border-forest/8 bg-white/65 p-3 shadow-sm sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_180px_160px_120px_auto]"
      >
        <label className="relative sm:col-span-2 xl:col-span-1">
          <Search
            className="absolute top-1/2 left-4 -translate-y-1/2 text-moss"
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
          onChange={(event) => setStatus(event.target.value as GoalStatus | "")}
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
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-lime px-5 py-3 text-sm font-bold text-forest"
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

      {isLoading ? (
        <GoalCardsSkeleton />
      ) : goals.length ? (
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
      ) : (
        <div className="mt-8 grid min-h-80 place-items-center rounded-[2rem] border border-dashed border-forest/18 bg-white/45 p-8 text-center">
          <div>
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-lime text-forest">
              <Sprout size={26} />
            </span>
            <h2 className="mt-5 font-display text-3xl text-forest">
              Todavía no hay objetivos
            </h2>
            <p className="mt-2 text-sm text-ink/50">
              Crea el primero y empieza a registrar tu progreso.
            </p>
          </div>
        </div>
      )}

      {isFormOpen ? (
        <Modal
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
    </section>
  );
}
