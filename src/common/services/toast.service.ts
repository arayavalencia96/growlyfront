import { toast } from "sonner";

export const toastService = {
  success(message: string, description?: string) {
    return toast.success(message, { description });
  },
  error(message: string, description?: string) {
    return toast.error(message, { description });
  },
  warning(message: string, description?: string) {
    return toast.warning(message, { description });
  },
  info(message: string, description?: string) {
    return toast.info(message, { description });
  },
};
