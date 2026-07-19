import {
  ArrowLeft,
  CalendarDays,
  Flag,
  Plus,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Modal } from "@/common/components/Modal";
import { SensitiveMoney } from "@/common/components/BalancePrivacy";
import { GoalMovementForm } from "@/modules/goal-movements/components/GoalMovementForm";
import { GoalMovementsList } from "@/modules/goal-movements/components/GoalMovementsList";
import type {
  IGoalMovement,
  IGoalMovementPayload,
} from "@/modules/goal-movements/interfaces/goal-movements.interface";
import { goalMovementsService } from "@/modules/goal-movements/services/goal-movements.service";
import type { IGoal } from "@/modules/goals/interfaces/goals.interface";
import { GoalDetailSkeleton } from "@/modules/goals/components/GoalsSkeletons";
import {
  GoalDetailContent,
  type GoalDetailSelection,
} from "@/modules/goals/components/GoalDetailContent";
import { goalsService } from "@/modules/goals/services/goals.service";
import { InvestmentOperationForm } from "@/modules/investment-operations/components/InvestmentOperationForm";
import { InvestmentOperationsList } from "@/modules/investment-operations/components/InvestmentOperationsList";
import type {
  IInvestmentOperation,
  IInvestmentOperationPayload,
  InvestmentOperationUpdatePayload,
} from "@/modules/investment-operations/interfaces/investment-operations.interface";
import { investmentOperationsService } from "@/modules/investment-operations/services/investment-operations.service";
import { GoalSummaryPanel } from "@/modules/summaries/components/GoalSummaryPanel";
import type { IGoalSummary } from "@/modules/summaries/interfaces/summaries.interface";
import { summariesService } from "@/modules/summaries/services/summaries.service";
import { getErrorMessage } from "@/utils/error.utils";
import { formatDate } from "@/utils/format.utils";

type DetailTab = "movements" | "operations";
type FormMode = DetailTab | null;

export function GoalDetailPage() {
  const { goalId = "" } = useParams();
  const [goal, setGoal] = useState<IGoal | null>(null);
  const [summary, setSummary] = useState<IGoalSummary | null>(null);
  const [movements, setMovements] = useState<IGoalMovement[]>([]);
  const [operations, setOperations] = useState<IInvestmentOperation[]>([]);
  const [editingMovement, setEditingMovement] = useState<IGoalMovement | null>(
    null,
  );
  const [editingOperation, setEditingOperation] =
    useState<IInvestmentOperation | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("operations");
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [detail, setDetail] = useState<GoalDetailSelection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    Promise.all([
      goalsService.getById(goalId),
      goalMovementsService.getByGoal(goalId),
      investmentOperationsService.getByGoal(goalId),
      summariesService.getByGoal(goalId),
    ])
      .then(
        ([
          goalResponse,
          movementsResponse,
          operationsResponse,
          summaryResponse,
        ]) => {
          if (!isActive) return;
          setGoal(goalResponse.result);
          setMovements(movementsResponse.result);
          setOperations(operationsResponse.result);
          setSummary(summaryResponse.result);
        },
      )
      .catch((requestError: unknown) => {
        if (isActive) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [goalId]);

  const refreshSummary = async () => {
    const { result } = await summariesService.getByGoal(goalId);
    setSummary(result);
  };

  const openMovementForm = (movement: IGoalMovement | null = null) => {
    setEditingMovement(movement);
    setFormMode("movements");
  };

  const openOperationForm = (operation: IInvestmentOperation | null = null) => {
    setEditingOperation(operation);
    setFormMode("operations");
  };

  const closeForm = () => {
    setFormMode(null);
    setEditingMovement(null);
    setEditingOperation(null);
  };

  const saveMovement = async (payload: IGoalMovementPayload) => {
    setIsSubmitting(true);
    setError("");
    try {
      if (editingMovement) {
        const updatePayload = {
          type: payload.type,
          amount: payload.amount,
          currency: payload.currency,
          movementDate: payload.movementDate,
          exchangeRateArsPerUsd: payload.exchangeRateArsPerUsd,
          platform: payload.platform,
          notes: payload.notes,
        };
        const { result } = await goalMovementsService.update(
          editingMovement.id,
          updatePayload,
        );
        setMovements((current) =>
          current.map((movement) =>
            movement.id === result.id ? result : movement,
          ),
        );
      } else {
        const { result } = await goalMovementsService.create(payload);
        setMovements((current) => [result, ...current]);
      }
      await refreshSummary();
      closeForm();
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveOperation = async (payload: IInvestmentOperationPayload) => {
    setIsSubmitting(true);
    setError("");
    try {
      if (editingOperation) {
        const updatePayload: InvestmentOperationUpdatePayload = {
          platform: payload.platform,
          ticker: payload.ticker,
          type: payload.type,
          operationDate: payload.operationDate,
          quantity: payload.quantity,
          unitPrice: payload.unitPrice,
          totalAmount: payload.totalAmount,
          currency: payload.currency,
          exchangeRateArsPerUsd: payload.exchangeRateArsPerUsd,
          notes: payload.notes,
        };
        const { result } = await investmentOperationsService.update(
          editingOperation.id,
          updatePayload,
        );
        setOperations((current) =>
          current.map((operation) =>
            operation.id === result.id ? result : operation,
          ),
        );
      } else {
        const { result } = await investmentOperationsService.create(payload);
        setOperations((current) => [result, ...current]);
      }
      await refreshSummary();
      closeForm();
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteMovement = async (movement: IGoalMovement) => {
    if (!window.confirm("¿Eliminar este movimiento?")) return;
    try {
      await goalMovementsService.remove(movement.id);
      setMovements((current) => current.filter(({ id }) => id !== movement.id));
      await refreshSummary();
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError));
    }
  };

  const deleteOperation = async (operation: IInvestmentOperation) => {
    if (!window.confirm("¿Eliminar esta operación?")) return;
    try {
      await investmentOperationsService.remove(operation.id);
      setOperations((current) =>
        current.filter(({ id }) => id !== operation.id),
      );
      await refreshSummary();
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError));
    }
  };

  if (isLoading) {
    return <GoalDetailSkeleton />;
  }

  if (!goal || !summary) {
    return (
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-surface p-10 text-center">
        <h1 className="font-display text-4xl text-primary">
          No encontramos el objetivo
        </h1>
        <p className="mt-3 text-sm text-body/50">{error}</p>
        <Link
          to="/objetivos"
          className="mt-6 inline-block font-bold text-primary"
        >
          Volver a objetivos
        </Link>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl">
      <Link
        to="/objetivos"
        className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary"
      >
        <ArrowLeft size={17} />
        Volver a objetivos
      </Link>

      <div className="mt-6 overflow-hidden rounded-[2rem] bg-brand text-white shadow-[0_24px_70px_rgba(20,54,44,0.18)]">
        <div className="relative p-7 sm:p-10">
          <div className="absolute -top-20 -right-14 size-64 rounded-full border-[45px] border-accent/8" />
          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-accent-text uppercase">
                {goal.type === "long_term"
                  ? "Objetivo de largo plazo"
                  : "Objetivo de corto plazo"}
              </p>
              <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">
                {goal.name}
              </h1>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/55">
                <span className="inline-flex items-center gap-2">
                  <Flag size={15} />
                  Meta{" "}
                  <SensitiveMoney
                    amount={goal.targetAmount}
                    currency={goal.currency}
                  />
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={15} />
                  {goal.endDate ? formatDate(goal.endDate) : "Sin fecha límite"}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => openMovementForm()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-5 py-3.5 text-sm font-bold text-white"
              >
                <Plus size={18} />
                Aporte / extracción
              </button>
              <button
                type="button"
                onClick={() => openOperationForm()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3.5 text-sm font-bold text-primary"
              >
                <TrendingUp size={18} />
                Compra / venta
              </button>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-ember/20 bg-ember/8 px-5 py-4 text-sm font-semibold text-ember">
          {error}
        </div>
      ) : null}

      <div className="mt-6">
        <GoalSummaryPanel
          summary={summary}
          onCashBalanceClick={() => setDetail({ type: "cash", summary })}
        />
      </div>

      <div className="mt-8 rounded-[2rem] border border-outline/8 bg-surface-soft p-5 sm:p-7">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-primary">
              {activeTab === "operations" ? (
                <TrendingUp size={19} />
              ) : (
                <WalletCards size={19} />
              )}
            </span>
            <div>
              <h2 className="font-display text-3xl text-primary">Actividad</h2>
              <p className="text-xs text-body/45">
                {movements.length} movimientos · {operations.length} operaciones
              </p>
            </div>
          </div>
          <div className="flex rounded-2xl bg-page p-1">
            <button
              type="button"
              onClick={() => setActiveTab("operations")}
              className={
                "rounded-xl px-4 py-2 text-xs font-bold transition " +
                (activeTab === "operations"
                  ? "bg-surface text-primary shadow-sm"
                  : "text-secondary")
              }
            >
              Inversiones
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("movements")}
              className={
                "rounded-xl px-4 py-2 text-xs font-bold transition " +
                (activeTab === "movements"
                  ? "bg-surface text-primary shadow-sm"
                  : "text-secondary")
              }
            >
              Caja
            </button>
          </div>
        </div>

        {activeTab === "operations" ? (
          <InvestmentOperationsList
            operations={operations}
            onView={(operation) => setDetail({ type: "operation", operation })}
            onEdit={openOperationForm}
            onDelete={deleteOperation}
          />
        ) : (
          <GoalMovementsList
            movements={movements}
            onView={(movement) => setDetail({ type: "movement", movement })}
            onEdit={openMovementForm}
            onDelete={deleteMovement}
          />
        )}
      </div>

      {detail ? (
        <Modal
          eyebrow={
            detail.type === "cash"
              ? "Caja del objetivo"
              : detail.type === "movement"
                ? "Detalle de caja"
                : "Detalle de inversión"
          }
          title={
            detail.type === "cash"
              ? "Efectivo disponible"
              : detail.type === "movement"
                ? detail.movement.type === "contribution"
                  ? "Aporte"
                  : "Extracción"
                : `${detail.operation.type === "buy" ? "Compra" : "Venta"} de ${detail.operation.ticker}`
          }
          onClose={() => setDetail(null)}
        >
          <GoalDetailContent detail={detail} />
        </Modal>
      ) : null}

      {formMode === "movements" ? (
        <Modal
          eyebrow={editingMovement ? "Editar registro" : "Caja del objetivo"}
          title={editingMovement ? "Modificar movimiento" : "Nuevo movimiento"}
          onClose={closeForm}
        >
          <GoalMovementForm
            goalId={goal.id}
            defaultCurrency={goal.currency}
            movement={editingMovement || undefined}
            isSubmitting={isSubmitting}
            onSubmit={saveMovement}
            onCancel={closeForm}
          />
        </Modal>
      ) : null}

      {formMode === "operations" ? (
        <Modal
          eyebrow={editingOperation ? "Editar inversión" : "Libro de inversión"}
          title={editingOperation ? "Modificar operación" : "Nueva operación"}
          onClose={closeForm}
        >
          <InvestmentOperationForm
            goalId={goal.id}
            defaultCurrency={goal.currency}
            operation={editingOperation || undefined}
            isSubmitting={isSubmitting}
            onSubmit={saveOperation}
            onCancel={closeForm}
          />
        </Modal>
      ) : null}
    </section>
  );
}
