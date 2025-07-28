<template>
  <!-- ✅ Kiểm tra mounted và target existence -->
  <Teleport to="#toast-container" :disabled="!mounted || !hasTarget">
    <TransitionGroup name="toast" tag="div" class="toast-list">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'toast',
          `toast-${toast.type}`,
          { 'toast-with-title': toast.title }
        ]"
        @click="remove(toast.id)"
      >
        <div class="toast-icon">
          <Icon :name="getToastIcon(toast.type)" size="20" />
        </div>
        
        <div class="toast-content">
          <h4 v-if="toast.title" class="toast-title">{{ toast.title }}</h4>
          <p class="toast-message">{{ toast.message }}</p>
        </div>
        
        <button
          class="toast-close"
          @click.stop="remove(toast.id)"
          aria-label="Đóng thông báo"
        >
          <Icon name="mdi:close" size="16" />
        </button>
        
        <div
          v-if="!toast.persistent && toast.duration"
          class="toast-progress"
          :style="{ animationDuration: `${toast.duration}ms` }"
        ></div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
const { toasts, remove } = useToast()
const mounted = ref(false)
const hasTarget = ref(false)

// ✅ Kiểm tra khi component mounted
onMounted(() => {
  mounted.value = true
  // Kiểm tra target container có tồn tại không
  nextTick(() => {
    hasTarget.value = !!document.querySelector('#toast-container')
  })
})

function getToastIcon(type) {
  const icons = {
    success: 'mdi:check-circle',
    error: 'mdi:alert-circle',
    warning: 'mdi:alert',
    info: 'mdi:information'
  }
  return icons[type] || icons.info
}
</script>

<style scoped>
.toast-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  max-width: 400px;
  word-wrap: break-word;
  pointer-events: auto; /* ✅ Enable pointer events */
}

.toast-success {
  border-left-color: #10b981;
}

.toast-error {
  border-left-color: #ef4444;
}

.toast-warning {
  border-left-color: #f59e0b;
}

.toast-info {
  border-left-color: #3b82f6;
}

.toast-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.toast-message {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.125rem;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.toast-close:hover {
  color: #6b7280;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: currentColor;
  opacity: 0.3;
  animation: toast-progress linear forwards;
}

@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
