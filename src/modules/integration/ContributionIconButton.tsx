import type { LucideIcon } from "lucide-react";

interface ContributionIconButtonProps {
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
  destructive?: boolean;
  onClick(): void;
}

export function ContributionIconButton({
  label,
  icon: Icon,
  disabled = false,
  destructive = false,
  onClick,
}: Readonly<ContributionIconButtonProps>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={
        "inline-flex size-9 items-center justify-center rounded-xl transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:opacity-50 " +
        (destructive
          ? "text-ember hover:bg-ember/10"
          : "text-secondary hover:bg-page")
      }
    >
      <Icon size={17} aria-hidden="true" />
    </button>
  );
}
