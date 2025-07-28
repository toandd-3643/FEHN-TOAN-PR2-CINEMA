import Toast from '~/components/common/Toast.vue'

export default defineNuxtPlugin(() => {
  // Register toast component globally
  return {
    provide: {
      toast: useToast()
    }
  }
})
