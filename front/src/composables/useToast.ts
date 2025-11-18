import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  type: ToastType
  message: string
  actionLabel?: string
  onAction?: () => void | Promise<void>
}

const toasts = ref<ToastItem[]>([])
let seed = 0

function removeToast(id: number) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

function pushToast(
  type: ToastType,
  message: string,
  duration = 3000,
  actionLabel?: string,
  onAction?: () => void | Promise<void>,
) {
  const id = ++seed
  toasts.value.push({ id, type, message, actionLabel, onAction })

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
}

function triggerAction(id: number) {
  const toast = toasts.value.find(t => t.id === id)
  if (!toast || !toast.onAction) return
  const fn = toast.onAction
  removeToast(id)
  fn()
}

export function useToast() {
  return {
    toasts,
    show(message: string, type: ToastType = 'info', duration?: number) {
      pushToast(type, message, duration)
    },
    showSuccess(message: string, duration?: number) {
      pushToast('success', message, duration)
    },
    showError(message: string, duration?: number) {
      pushToast('error', message, duration)
    },
    showInfo(message: string, duration?: number) {
      pushToast('info', message, duration)
    },
    confirm(message: string, onConfirm: () => void | Promise<void>, options?: { label?: string; type?: ToastType }) {
      const label = options?.label ?? 'Delete'
      const type = options?.type ?? 'info'
      pushToast(type, message, 0, label, onConfirm)
    },
    removeToast,
    triggerAction,
  }
}
