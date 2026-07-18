import { z } from "zod";
import { ACCOUNT_DEACTIVATION_REASONS } from "@/modules/profile/interfaces/profile.interface";

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/\d/, "Debe contener al menos un número")
  .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial");

export const personalDataSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ingresa al menos 2 caracteres")
    .max(120, "Máximo 120 caracteres"),
  email: z.string().trim().email("Ingresa un correo electrónico válido"),
  currentPassword: z.string(),
});

export const profilePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine(
    ({ newPassword, confirmPassword }) => newPassword === confirmPassword,
    {
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    },
  );

export const deactivateAccountSchema = z
  .object({
    reason: z.enum(ACCOUNT_DEACTIVATION_REASONS),
    comment: z.string().trim().max(500, "Máximo 500 caracteres"),
    currentPassword: z.string().min(1, "Ingresa tu contraseña"),
    confirmation: z.string(),
  })
  .superRefine(({ reason, comment, confirmation }, context) => {
    if (
      (reason === "other" && comment.length < 10) ||
      (comment.length > 0 && comment.length < 10)
    ) {
      context.addIssue({
        code: "custom",
        message: "Explica el motivo con al menos 10 caracteres",
        path: ["comment"],
      });
    }

    if (confirmation !== "DESACTIVAR") {
      context.addIssue({
        code: "custom",
        message: "Escribe DESACTIVAR para confirmar",
        path: ["confirmation"],
      });
    }
  });
