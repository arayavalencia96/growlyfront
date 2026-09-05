import type { GoalCurrency, IOpeningPosition } from "@/modules/goals/interfaces/goals.interface";
import type { IInvestmentOperation } from "@/modules/investment-operations/interfaces/investment-operations.interface";

interface ICostEntry {
  quantity: number;
  totalAmount: number;
  currency: GoalCurrency;
  exchangeRateArsPerUsd?: number | null;
}

export interface ISellPreview {
  availableQuantity: number;
  averageCost: number;
  costBasis: number;
  proceeds: number;
  profitOrLoss: number;
  percentage: number;
  currency: GoalCurrency;
}

interface ICalculateSellPreviewParams {
  operations: IInvestmentOperation[];
  openingPositions: IOpeningPosition[];
  operationId?: string;
  platform: string;
  ticker: string;
  operationDate: string;
  quantity: number;
  totalAmount: number;
  currency: GoalCurrency;
}

function normalize(value: string): string {
  return value.trim().toUpperCase();
}

function convertAmount(
  entry: ICostEntry,
  targetCurrency: GoalCurrency,
): number | null {
  if (entry.currency === targetCurrency) return entry.totalAmount;
  if (!entry.exchangeRateArsPerUsd || entry.exchangeRateArsPerUsd <= 0)
    return null;
  return targetCurrency === "ARS"
    ? entry.totalAmount * entry.exchangeRateArsPerUsd
    : entry.totalAmount / entry.exchangeRateArsPerUsd;
}

export function calculateSellPreview({
  operations,
  openingPositions,
  operationId,
  platform,
  ticker,
  operationDate,
  quantity,
  totalAmount,
  currency,
}: ICalculateSellPreviewParams): ISellPreview | null {
  if (
    !platform.trim() ||
    !ticker.trim() ||
    !operationDate ||
    !Number.isFinite(quantity) ||
    !Number.isFinite(totalAmount) ||
    quantity <= 0 ||
    totalAmount <= 0
  )
    return null;

  const normalizedPlatform = normalize(platform);
  const normalizedTicker = normalize(ticker);
  let availableQuantity = 0;
  let investedAmount = 0;

  for (const position of openingPositions) {
    if (
      normalize(position.platform) !== normalizedPlatform ||
      normalize(position.ticker) !== normalizedTicker
    )
      continue;
    const amount = convertAmount(position, currency);
    if (amount === null) return null;
    availableQuantity += position.quantity;
    investedAmount += amount;
  }

  const priorOperations = operations
    .filter(
      (operation) =>
        operation.id !== operationId &&
        normalize(operation.platform) === normalizedPlatform &&
        normalize(operation.ticker) === normalizedTicker &&
        operation.operationDate.slice(0, 10) <= operationDate,
    )
    .sort(
      (a, b) =>
        a.operationDate.localeCompare(b.operationDate) ||
        a.createdAt.localeCompare(b.createdAt),
    );

  for (const operation of priorOperations) {
    if (operation.type === "buy") {
      const amount = convertAmount(operation, currency);
      if (amount === null) return null;
      availableQuantity += operation.quantity;
      investedAmount += amount;
      continue;
    }

    if (availableQuantity <= 0 || operation.quantity > availableQuantity)
      return null;
    investedAmount -= (investedAmount / availableQuantity) * operation.quantity;
    availableQuantity -= operation.quantity;
  }

  if (quantity > availableQuantity || availableQuantity <= 0) return null;

  const averageCost = investedAmount / availableQuantity;
  const costBasis = averageCost * quantity;
  const profitOrLoss = totalAmount - costBasis;
  return {
    availableQuantity,
    averageCost,
    costBasis,
    proceeds: totalAmount,
    profitOrLoss,
    percentage: (profitOrLoss / costBasis) * 100,
    currency,
  };
}
