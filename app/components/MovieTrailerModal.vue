<template>
  <div class="trailer-modal-overlay" @click="closeModal">
    <div class="trailer-modal" @click.stop>
      <button @click="closeModal" class="close-btn">
        <Icon name="mdi:close" size="24" />
      </button>

      <!-- ✅ Loading state -->
      <div v-if="isLoading" class="loading-container">
        <Icon name="mdi:loading" class="spin" size="48" />
        <p>Đang tải trailer...</p>
      </div>

      <!-- ✅ Error state -->
      <div v-else-if="hasError" class="error-container">
        <Icon name="mdi:alert-circle" size="48" />
        <h3>Không thể tải trailer</h3>
        <p>{{ errorMessage }}</p>

        <div class="error-actions">
          <button @click="openInNewTab" class="btn btn-primary">
            <Icon name="mdi:open-in-new" />
            Mở YouTube
          </button>
          <button @click="retryLoad" class="btn btn-secondary">
            <Icon name="mdi:refresh" />
            Thử lại
          </button>
          <button @click="copyLink" class="btn btn-outline">
            <Icon name="mdi:content-copy" />
            Sao chép link
          </button>
        </div>
      </div>

      <!-- ✅ Video container - remove @load and @error events -->
      <div v-else class="trailer-container">
        <iframe ref="iframeRef" :src="embedUrl" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen referrerpolicy="strict-origin-when-cross-origin" class="trailer-iframe">
        </iframe>
      </div>
    </div>
  </div>
</template>


<script setup>
const props = defineProps({
  trailerUrl: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])

const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')
const iframeRef = ref(null)
const retryCount = ref(0)
const loadTimeout = ref(null) 

const embedUrl = computed(() => {
  try {
    const url = props.trailerUrl.trim()

    if (!url) {
      return ''
    }


    if (url.includes('youtube.com/embed/') || url.includes('youtube-nocookie.com/embed/')) {
      let finalUrl = url.replace('youtube.com/embed/', 'youtube-nocookie.com/embed/')

      if (finalUrl.includes('?')) {
        if (!finalUrl.includes('autoplay')) {
          finalUrl += '&autoplay=1'
        }
        if (!finalUrl.includes('rel=')) {
          finalUrl += '&rel=0'
        }
      } else {
        finalUrl += '?autoplay=1&rel=0&modestbranding=1'
      }

      return finalUrl
    }

    if (url.includes('youtube.com/watch?v=')) {
      const urlParams = new URLSearchParams(new URL(url).search)
      const videoId = urlParams.get('v')

      if (!videoId) {
        throw new Error('Video ID not found in watch URL')
      }

      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`
    }

    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]

      if (!videoId) {
        throw new Error('Video ID not found in short URL')
      }

      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`
    }

    return url

  } catch (error) {
    return props.trailerUrl
  }
})

const handleIframeLoad = () => {
  if (loadTimeout.value) {
    clearTimeout(loadTimeout.value)
    loadTimeout.value = null
  }

  isLoading.value = false
  hasError.value = false
  retryCount.value = 0
}

const handleIframeError = (error) => {
  if (loadTimeout.value) {
    clearTimeout(loadTimeout.value)
    loadTimeout.value = null
  }

  isLoading.value = false
  hasError.value = true

  if (retryCount.value === 0) {
    errorMessage.value = 'Không thể tải trailer. Có thể do mạng hoặc YouTube bị chặn.'
  } else {
    errorMessage.value = `Đã thử ${retryCount.value + 1} lần. Vui lòng kiểm tra kết nối mạng.`
  }
}

const detectIframeLoad = () => {
  if (loadTimeout.value) {
    clearTimeout(loadTimeout.value)
  }

  loadTimeout.value = setTimeout(() => {
    if (isLoading.value) {
      handleIframeLoad()
    }
  }, 5000)

  const checkIframeReady = () => {
    if (iframeRef.value && iframeRef.value.contentWindow) {
      try {
        setTimeout(() => {
          if (isLoading.value) {
            handleIframeLoad()
          }
        }, 2000)
      } catch (e) {
        if (isLoading.value) {
          handleIframeLoad()
        }
      }
    }
  }

  nextTick(() => {
    if (iframeRef.value) {
      checkIframeReady()
    }
  })
}

const retryLoad = () => {
  retryCount.value++
  isLoading.value = true
  hasError.value = false
  errorMessage.value = ''

  nextTick(() => {
    if (iframeRef.value) {
      const currentSrc = iframeRef.value.src
      iframeRef.value.src = ''

      setTimeout(() => {
        if (iframeRef.value) {
          iframeRef.value.src = currentSrc
          detectIframeLoad()
        }
      }, 500)
    }
  })
}

const openInNewTab = () => {
  window.open(props.trailerUrl, '_blank', 'noopener,noreferrer')
  closeModal()
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.trailerUrl)
    const originalText = errorMessage.value
    errorMessage.value = '✅ Đã sao chép link!'
    setTimeout(() => {
      errorMessage.value = originalText
    }, 2000)
  } catch (error) {
    errorMessage.value = 'Không thể sao chép link.'
  }
}

const closeModal = () => {
  if (loadTimeout.value) {
    clearTimeout(loadTimeout.value)
    loadTimeout.value = null
  }
  emit('close')
}

watch(() => props.trailerUrl, (newUrl) => {
  if (newUrl) {
    isLoading.value = true
    hasError.value = false
    errorMessage.value = ''
    retryCount.value = 0

    nextTick(() => {
      detectIframeLoad()
    })
  } else {
    hasError.value = true
    errorMessage.value = 'URL trailer trống'
    isLoading.value = false
  }
}, { immediate: true })

watch(embedUrl, (newUrl) => {
  if (!newUrl && props.trailerUrl) {
    hasError.value = true
    errorMessage.value = 'Không thể xử lý URL trailer'
    isLoading.value = false
  }
}, { immediate: true })

onMounted(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') closeModal()
  }
  document.addEventListener('keydown', handleEscape)

  detectIframeLoad()

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
    if (loadTimeout.value) {
      clearTimeout(loadTimeout.value)
    }
  })
})
</script>

<style scoped>
.trailer-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 2rem;
  backdrop-filter: blur(5px);
}

.trailer-modal {
  position: relative;
  width: 100%;
  max-width: 1000px;
  background: #000;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  min-height: 400px;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.8);
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10001;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 450px;
  color: white;
  gap: 1.5rem;
}

.loading-container .spin {
  color: #667eea;
}

.loading-container p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 450px;
  color: white;
  text-align: center;
  padding: 3rem;
  gap: 1.5rem;
}

.error-container h3 {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
  color: #ef4444;
}

.error-container p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.6;
  max-width: 400px;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  width: 100%;
  max-width: 300px;
}

.trailer-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
}

.trailer-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  min-height: 48px;
}

.btn-primary {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-outline {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.btn-outline:hover {
  border-color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .trailer-modal-overlay {
    padding: 1rem;
  }

  .trailer-modal {
    min-height: 300px;
    border-radius: 12px;
  }

  .loading-container,
  .error-container {
    height: 350px;
    padding: 2rem;
  }

  .error-container h3 {
    font-size: 1.5rem;
  }

  .error-actions {
    width: 100%;
  }

  .btn {
    padding: 0.875rem 1.25rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .trailer-modal-overlay {
    padding: 0.75rem;
  }

  .error-container {
    padding: 1.5rem;
  }

  .error-container h3 {
    font-size: 1.25rem;
  }

  .close-btn {
    width: 40px;
    height: 40px;
    top: 0.75rem;
    right: 0.75rem;
  }
}
</style>
