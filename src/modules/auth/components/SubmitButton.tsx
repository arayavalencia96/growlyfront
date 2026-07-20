import { LoaderCircle } from "lucide-react";
import type { ISubmitButtonProps } from "@/modules/auth/interfaces/auth.interface";

export function SubmitButton({
  children,
  isLoading,
  loadingText,
  disabled = false,
}: Readonly<ISubmitButtonProps>) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-sm font-extrabold text-white shadow-[0_14px_35px_rgba(20,54,44,0.2)] transition hover:-translate-y-0.5 hover:bg-[#1c493b] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
    >
      {isLoading ? (
        <>
          <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
