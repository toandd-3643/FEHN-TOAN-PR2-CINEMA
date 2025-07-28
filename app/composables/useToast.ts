interface ToastOptions {
  title?: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  persistent?: boolean
}

interface Toast extends ToastOptions {
  id: string
  timestamp: number
}

export const useToast = () => {
  const toasts = ref<Toast[]>([])

  const show = (options: ToastOptions) => {
    const toast: Toast = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: 'info',
      duration: 5000,
      ...options
    }

    toasts.value.push(toast)

    // Auto remove
    if (!toast.persistent && toast.duration && toast.duration > 0) {
      setTimeout(() => {
        remove(toast.id)
      }, toast.duration)
    }

    return toast.id
  }

  const remove = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clear = () => {
    toasts.value = []
  }

  const success = (message: string, options?: Partial<ToastOptions>) => {
    return show({ ...options, message, type: 'success' })
  }

  const error = (message: string, options?: Partial<ToastOptions>) => {
    return show({ ...options, message, type: 'error', duration: 7000 })
  }

  const warning = (message: string, options?: Partial<ToastOptions>) => {
    return show({ ...options, message, type: 'warning' })
  }

  const info = (message: string, options?: Partial<ToastOptions>) => {
    return show({ ...options, message, type: 'info' })
  }

  return {
    toasts: readonly(toasts),
    show,
    remove,
    clear,
    success,
    error,
    warning,
    info
  }
}
