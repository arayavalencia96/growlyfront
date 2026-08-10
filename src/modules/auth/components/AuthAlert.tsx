import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { IAuthAlertProps } from "@/modules/auth/interfaces/auth.interface";

const variants = {
  error: {
    className: "border-ember/20 bg-ember/8 text-[#883d2b]",
    icon: AlertCircle,
  },
  success: {
    className: "border-secondary/20 bg-brand-hover/8 text-primary",
    icon: CheckCircle2,
  },
  info: {
    className: "border-outline/10 bg-surface text-body/70",
    icon: Info,
  },
} as const;

export function AuthAlert({ message, variant = "error" }: Readonly<IAuthAlertProps>) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={
        "mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm leading-5 " +
        config.className
      }
    >
      <Icon aria-hidden="true" className="mt-0.5 shrink-0" size={17} />
      <p>{message}</p>
    </div>
  );
}
