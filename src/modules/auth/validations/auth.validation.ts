import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Ingresa tu correo electrónico")
  .email("Ingresa un correo electrónico válido");

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/\d/, "Debe contener al menos un número")
  .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Ingresa un nombre de al menos 2 caracteres")
      .max(120, "El nombre no puede superar los 120 caracteres"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    termsAccepted: z.boolean().refine((accepted) => accepted, {
      message: "Debes aceptar los Términos y Condiciones para continuar",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const verificationCodeSchema = z.object({
  email: emailSchema,
  code: z
    .string()
    .regex(/^\d{6}$/, "El código debe contener exactamente 6 números"),
});

export const newPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const changeBlockedPasswordSchema = newPasswordSchema;
