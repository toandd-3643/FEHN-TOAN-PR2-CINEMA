// app/composables/useToast.ts
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

    // Auto remove sau duration
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

  // ✅ Enhanced convenience methods với better defaults
  const success = (message: string, options?: Partial<ToastOptions>) => {
    return show({ 
      ...options, 
      message, 
      type: 'success',
      duration: options?.duration || 4000 
    })
  }

  const error = (message: string, options?: Partial<ToastOptions>) => {
    return show({ 
      ...options, 
      message, 
      type: 'error', 
      duration: options?.duration || 6000 
    })
  }

  const warning = (message: string, options?: Partial<ToastOptions>) => {
    return show({ 
      ...options, 
      message, 
      type: 'warning',
      duration: options?.duration || 5000 
    })
  }

  const info = (message: string, options?: Partial<ToastOptions>) => {
    return show({ 
      ...options, 
      message, 
      type: 'info',
      duration: options?.duration || 3000 
    })
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
