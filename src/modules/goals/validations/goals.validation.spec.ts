import { describe, expect, it } from "vitest";
import { goalSchema } from "./goals.validation";

const baseGoal = {
  name: "Bitcoin",
  type: "long_term" as const,
  targetAmount: 10000,
  currency: "USD" as const,
  startDate: "2026-10-19",
  endDate: "2027-10-19",
  status: "active" as const,
  trackingMode: "existing_portfolio" as const,
  openingCashBalances: [],
  notes: "",
};

describe("goalSchema opening position PPC", () => {
  it("allows omitting PPC so the backend can derive the average cost", () => {
    const result = goalSchema.safeParse({
      ...baseGoal,
      openingPositions: [
        {
          platform: "NEXO",
          customPlatform: "",
          ticker: "BTC",
          quantity: 0.00858831,
          totalAmount: 705.34,
          currency: "USD",
          exchangeRateArsPerUsd: 1540,
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("accepts a supplied PPC", () => {
    const result = goalSchema.safeParse({
      ...baseGoal,
      openingPositions: [
        {
          platform: "NEXO",
          customPlatform: "",
          ticker: "BTC",
          quantity: 0.00858831,
          unitPrice: 65966,
          totalAmount: 705.34,
          currency: "USD",
          exchangeRateArsPerUsd: 1540,
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
