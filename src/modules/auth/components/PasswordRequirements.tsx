import { Check } from "lucide-react";

const requirements = [
  "8 caracteres como mínimo",
  "Una mayúscula y un número",
  "Al menos un carácter especial",
] as const;

export function PasswordRequirements() {
  return (
    <ul className="grid gap-2 rounded-2xl border border-outline/8 bg-surface/55 p-4 sm:grid-cols-2">
      {requirements.map((requirement) => (
        <li
          key={requirement}
          className="flex items-center gap-2 text-xs text-body/55"
        >
          <Check aria-hidden="true" className="text-secondary" size={14} />
          {requirement}
        </li>
      ))}
    </ul>
  );
}
