import { describe, expect, it } from "vitest";
import { buildTransfer, decimalUnits, unitsText } from "./transfer-state";

const source = {
  key: "IOL:ARS",
  kind: "cash" as const,
  platform: "IOL",
  unit: "ARS",
  label: "IOL · ARS",
  scale: 2,
  availableUnits: "100000",
};

describe("transfer state", () => {
  it("converts decimal values without floating-point arithmetic", () => {
    expect(decimalUnits("10,25", 2, true)).toBe(1025n);
    expect(unitsText("1025", 2)).toBe("10,25");
  });

  it("builds a normalized record-only transfer", () => {
    const transfer = buildTransfer(
      "aaaaaaaaaaaaaaaaaaaaaaaa",
      source,
      "bbbbbbbbbbbbbbbbbbbbbbbb",
      " bull market ",
      "900",
      "10",
      "  rebalanceo  ",
    );

    expect(transfer).toMatchObject({
      kind: "cash",
      currency: "ARS",
      amount: "900",
      fee: "10",
      notes: "rebalanceo",
      destination: {
        goalId: "bbbbbbbbbbbbbbbbbbbbbbbb",
        platform: "BULL MARKET",
      },
    });
  });

  it("rejects the same endpoint and amounts above the available balance", () => {
    expect(() =>
      buildTransfer(
        "aaaaaaaaaaaaaaaaaaaaaaaa",
        source,
        "aaaaaaaaaaaaaaaaaaaaaaaa",
        "IOL",
        "1",
        "0",
        "",
      ),
    ).toThrow("Elegí un destino distinto del origen.");

    expect(() =>
      buildTransfer(
        "aaaaaaaaaaaaaaaaaaaaaaaa",
        source,
        "bbbbbbbbbbbbbbbbbbbbbbbb",
        "NEXO",
        "1000",
        "1",
        "",
      ),
    ).toThrow("exceden el disponible");
  });
});
