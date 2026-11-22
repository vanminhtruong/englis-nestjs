import { ref } from "vue";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
}

const toasts = ref<ToastItem[]>([]);
let seed = 0;

// Only one confirmation can be open or executing at a time across the app.
// Keep this outside useToast() because every caller shares the same toast store.
let confirmationInProgress = false;

function removeToast(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

function pushToast(
  type: ToastType,
  message: string,
  duration = 3000,
  actionLabel?: string,
  onAction?: () => void | Promise<void>,
) {
  // Confirmation toasts have an action and no auto-dismissal. Ignore repeated
  // requests (including rapid clicks on different delete buttons) while one
  // is open or its asynchronous action has not finished.
  if (onAction && (confirmationInProgress || toasts.value.some((toast) => !!toast.onAction))) {
    return;
  }

  const id = ++seed;
  toasts.value.push({ id, type, message, actionLabel, onAction });

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }
}

async function triggerAction(id: number) {
  if (confirmationInProgress) return;
  const toast = toasts.value.find((t) => t.id === id);
  if (!toast?.onAction) return;

  // Set the guard before removing the toast so another click cannot create
  // a second confirmation while the delete request is still running.
  confirmationInProgress = true;
  removeToast(id);
  try {
    await toast.onAction();
  } catch (error) {
    console.error("Confirmation action failed:", error);
  } finally {
    confirmationInProgress = false;
  }
}

export function useToast() {
  return {
    toasts,
    show(message: string, type: ToastType = "info", duration?: number) {
      pushToast(type, message, duration);
    },
    showSuccess(message: string, duration?: number) {
      pushToast("success", message, duration);
    },
    showError(message: string, duration?: number) {
      pushToast("error", message, duration);
    },
    showInfo(message: string, duration?: number) {
      pushToast("info", message, duration);
    },
    showWarning(message: string, duration?: number) {
      pushToast("warning", message, duration);
    },
    confirm(
      message: string,
      onConfirm: () => void | Promise<void>,
      options?: { label?: string; type?: ToastType },
    ) {
      const label = options?.label ?? "Delete";
      const type = options?.type ?? "info";
      pushToast(type, message, 0, label, onConfirm);
    },
    removeToast,
    triggerAction,
  };
}
