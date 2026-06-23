import toast, { type ToastOptions } from "react-hot-toast";

export function toastSuccessOnce(
  message: string,
  id: string,
  options?: ToastOptions,
) {
  toast.success(message, { ...options, id });
}

export function toastErrorOnce(
  message: string,
  id: string,
  options?: ToastOptions,
) {
  toast.error(message, { ...options, id });
}

export function toastLoadingOnce(
  message: string,
  id: string,
  options?: ToastOptions,
) {
  return toast.loading(message, { ...options, id });
}
