import { describe, expect, it } from "vitest";
import {
  changeBlockedPasswordSchema,
  registerSchema,
  verificationCodeSchema,
} from "@/modules/auth/validations/auth.validation";

describe("auth validations", () => {
  it("accepts a password that satisfies the backend rules", () => {
    const result = registerSchema.safeParse({
      name: "Ana",
      email: "ana@growly.com",
      password: "Growly#2026",
      confirmPassword: "Growly#2026",
      termsAccepted: true,
    });

    expect(result.success).toBe(true);
  });

  it("requires accepting the terms and conditions", () => {
    const result = registerSchema.safeParse({
      name: "Ana",
      email: "ana@growly.com",
      password: "Growly#2026",
      confirmPassword: "Growly#2026",
      termsAccepted: false,
    });

    expect(result.success).toBe(false);
  });

  it("rejects weak passwords", () => {
    const result = changeBlockedPasswordSchema.safeParse({
      newPassword: "password",
      confirmPassword: "password",
    });

    expect(result.success).toBe(false);
  });

  it("requires a six-digit verification code", () => {
    const result = verificationCodeSchema.safeParse({
      email: "ana@growly.com",
      code: "12345",
    });

    expect(result.success).toBe(false);
  });
});
