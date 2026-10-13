import { RefreshCw } from "lucide-react";

export function RefreshButton({
  onClick,
  loading = false,
  disabled = false,
  label,
}: Readonly<{
  onClick(): void;
  loading?: boolean;
  disabled?: boolean;
  label: string;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      aria-label={label}
      title={label}
      aria-busy={loading}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-outline/15 text-secondary transition-colors hover:bg-secondary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:opacity-50"
    >
      <RefreshCw
        size={20}
        aria-hidden="true"
        className={loading ? "animate-spin motion-reduce:animate-none" : ""}
      />
    </button>
  );
}
