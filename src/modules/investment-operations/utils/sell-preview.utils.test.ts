import { describe, expect, it } from "vitest";
import { calculateSellPreview } from "@/modules/investment-operations/utils/sell-preview.utils";
import type { IInvestmentOperation } from "@/modules/investment-operations/interfaces/investment-operations.interface";

const operation = (
  id: string,
  type: IInvestmentOperation["type"],
  quantity: number,
  totalAmount: number,
): IInvestmentOperation => ({
  id,
  goalId: "goal",
  userId: "user",
  platform: "IOL",
  ticker: "AAPL",
  type,
  operationDate: "2026-09-01T00:00:00.000Z",
  quantity,
  unitPrice: totalAmount / quantity,
  totalAmount,
  currency: "ARS",
  exchangeRateArsPerUsd: null,
  notes: null,
  createdAt: `2026-09-0${id}T00:00:00.000Z`,
  updatedAt: "2026-09-01T00:00:00.000Z",
});

describe("calculateSellPreview", () => {
  it("calcula el costo promedio ponderado y la pérdida de una venta", () => {
    const preview = calculateSellPreview({
      operations: [
        operation("1", "buy", 3, 30000),
        operation("2", "buy", 2, 21000),
      ],
      openingPositions: [],
      platform: "IOL",
      ticker: "AAPL",
      operationDate: "2026-09-05",
      quantity: 4,
      totalAmount: 37000,
      currency: "ARS",
    });

    expect(preview).toMatchObject({
      availableQuantity: 5,
      averageCost: 10200,
      costBasis: 40800,
      profitOrLoss: -3800,
    });
  });

  it("descuenta al costo promedio las ventas que ya fueron registradas", () => {
    const preview = calculateSellPreview({
      operations: [
        operation("1", "buy", 5, 50000),
        operation("2", "sell", 2, 24000),
      ],
      openingPositions: [],
      platform: "IOL",
      ticker: "AAPL",
      operationDate: "2026-09-05",
      quantity: 3,
      totalAmount: 33000,
      currency: "ARS",
    });

    expect(preview).toMatchObject({
      availableQuantity: 3,
      averageCost: 10000,
      profitOrLoss: 3000,
    });
  });
});
