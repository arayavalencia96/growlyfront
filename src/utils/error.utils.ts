import { ApiError } from "@/common/errors/api.error";

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.message.startsWith("Insufficient position for ")) {
      const position = error.message
        .replace("Insufficient position for ", "")
        .replace(" on ", " en ");
      return (
        "No tienes posición suficiente de " +
        position +
        " para realizar esta venta."
      );
    }

    if (error.message.startsWith("Insufficient cash in ")) {
      const balance = error.message
        .replace("Insufficient cash in ", "")
        .replace(" on ", " en ");
      return (
        "No tienes efectivo suficiente en " +
        balance +
        " para realizar esta operación."
      );
    }

    if (error.message === "Fees cannot exceed the gross sale amount") {
      return "Las comisiones no pueden superar el monto bruto de la venta.";
    }

    if (
      error.message ===
      "Ledger entry date cannot be earlier than the goal start date"
    ) {
      return "La fecha no puede ser anterior al inicio del objetivo.";
    }

    if (error.message === "Ledger entry date cannot be in the future") {
      return "La fecha no puede ser posterior al dia de hoy.";
    }

    if (error.message === "Opening cash balances must be unique") {
      return "No puedes repetir un saldo inicial para la misma plataforma y moneda.";
    }

    if (error.message === "Opening positions must be unique") {
      return "No puedes repetir una posicion inicial para la misma plataforma y ticker.";
    }

    if (
      error.message ===
      "A from-scratch goal cannot contain opening balances or positions"
    ) {
      return "Un objetivo que comienza desde cero no admite saldos ni posiciones iniciales.";
    }

    if (
      error.message ===
      "An existing portfolio requires an opening balance or position"
    ) {
      return "Agrega al menos un saldo o una posicion inicial.";
    }

    if (
      error.message === "Goal end date cannot be earlier than its start date"
    ) {
      return "La fecha objetivo no puede ser anterior a la fecha de inicio.";
    }

    return error.message;
  }

  return "Ocurrió un error inesperado. Intenta nuevamente.";
}
