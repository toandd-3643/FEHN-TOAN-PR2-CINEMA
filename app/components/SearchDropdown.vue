<template>
  <div class="search-dropdown-container">
    <div class="search-box" ref="searchBoxRef">
      <Icon name="mdi:magnify" class="search-icon" />
      <input
        ref="searchInputRef"
        :value="searchQuery"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        type="text"
        placeholder="Tìm kiếm phim theo tên, thể loại, đạo diễn..."
        class="search-input"
        autocomplete="off"
        spellcheck="false"
      />
      <button 
        v-if="searchQuery" 
        @click="clearSearch" 
        class="clear-button"
        type="button"
        tabindex="-1"
      >
        <Icon name="mdi:close" size="20" />
      </button>
    </div>

    <div 
      v-if="showDropdown && (suggestions.length > 0 || isLoading || searchQuery.length >= 2)"
      class="search-dropdown"
      ref="dropdownRef"
    >
      <div v-if="isLoading" class="dropdown-loading">
        <Icon name="mdi:loading" class="spin" size="20" />
        <span>Đang tìm kiếm...</span>
      </div>

      <div v-else-if="suggestions.length > 0" class="suggestions-list">
        <div
          v-for="(movie, index) in suggestions"
          :key="movie.id"
          @click="selectMovie(movie)"
          @mouseenter="highlightIndex = index"
          class="suggestion-item"
          :class="{ 
            'highlighted': highlightIndex === index,
            'status-now-showing': movie.status === 'NOW_SHOWING',
            'status-coming-soon': movie.status === 'COMING_SOON',
            'status-ended': movie.status === 'ENDED'
          }"
        >
          <div class="suggestion-poster">
            <img 
              v-if="movie.poster" 
              :src="movie.poster" 
              :alt="movie.title"
              @error="handlePosterError"
            />
            <div v-else class="poster-placeholder">
              <Icon name="mdi:movie" size="24" />
            </div>
          </div>

          <div class="suggestion-content">
            <h4 class="suggestion-title" v-html="highlightSearchTerm(movie.title)"></h4>
            <div class="suggestion-meta">
              <span class="suggestion-genre">{{ movie.genre }}</span>
              <span class="suggestion-director">{{ movie.director }}</span>
            </div>
            <div class="suggestion-footer">
              <div class="suggestion-rating" v-if="movie.rating">
                <Icon name="mdi:star" size="14" />
                <span>{{ movie.rating.toFixed(1) }}</span>
              </div>
              <span class="suggestion-status">{{ getStatusText(movie.status) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="searchQuery.length >= 2" class="no-results">
        <Icon name="mdi:movie-off" size="32" />
        <p>Không tìm thấy phim nào với từ khóa "<strong>{{ searchQuery }}</strong>"</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  placeholder: {
    type: String,
    default: 'Tìm kiếm phim...'
  }
})

const emit = defineEmits(['movie-selected', 'search-changed'])

// Reactive state
const searchQuery = ref('')
const suggestions = ref([])
const isLoading = ref(false)
const showDropdown = ref(false)
const highlightIndex = ref(-1)

// Refs
const searchInputRef = ref(null)
const searchBoxRef = ref(null)
const dropdownRef = ref(null)

let searchTimeout = null

// ✅ Handle input với debounce
const handleInput = (event) => {
  const value = event.target.value
  searchQuery.value = value
  highlightIndex.value = -1

  emit('search-changed', value)

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (value.trim().length < 2) {
    suggestions.value = []
    showDropdown.value = false
    return
  }

  showDropdown.value = true
  isLoading.value = true

  // Debounce search sau 300ms
  searchTimeout = setTimeout(async () => {
    await performSearch(value)
  }, 300)
}

// ✅ Perform search API call
const performSearch = async (query) => {
  if (!query || query.trim().length < 2) {
    isLoading.value = false
    return
  }

  try {
    const response = await $fetch('/api/movies/search', {
      query: {
        q: query.trim(),
        limit: 5
      }
    })

    if (response.success) {
      suggestions.value = response.data
    } else {
      suggestions.value = []
    }
  } catch (error) {
    console.error('Search error:', error)
    suggestions.value = []
  } finally {
    isLoading.value = false
  }
}

// ✅ Focus/Blur handlers
const handleFocus = () => {
  if (searchQuery.value.length >= 2) {
    showDropdown.value = true
  }
}

const handleBlur = () => {
  // Delay để cho phép click vào suggestion
  setTimeout(() => {
    showDropdown.value = false
    highlightIndex.value = -1
  }, 200)
}

// ✅ Keyboard navigation
const handleKeydown = (event) => {
  if (!showDropdown.value || suggestions.value.length === 0) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightIndex.value = Math.min(highlightIndex.value + 1, suggestions.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightIndex.value = Math.max(highlightIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (highlightIndex.value >= 0) {
        selectMovie(suggestions.value[highlightIndex.value])
      }
      break
    case 'Escape':
      showDropdown.value = false
      highlightIndex.value = -1
      searchInputRef.value?.blur()
      break
  }
}

// ✅ Select movie
const selectMovie = (movie) => {
  emit('movie-selected', movie)
  searchQuery.value = movie.title
  showDropdown.value = false
  highlightIndex.value = -1
  
  // Navigate to movie detail page
  navigateTo(`/movies/${movie.id}`)
}

// ✅ Clear search
const clearSearch = () => {
  searchQuery.value = ''
  suggestions.value = []
  showDropdown.value = false
  highlightIndex.value = -1
  searchInputRef.value?.focus()
  emit('search-changed', '')
}

// ✅ Highlight search term
const highlightSearchTerm = (text) => {
  if (!searchQuery.value) return text
  
  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return text.replace(regex, '<mark class="highlight">$1</mark>')
}

// ✅ Get status text
const getStatusText = (status) => {
  const statusMap = {
    'NOW_SHOWING': 'Đang chiếu',
    'COMING_SOON': 'Sắp chiếu',
    'ENDED': 'Đã kết thúc'
  }
  return statusMap[status] || status
}

// ✅ Handle poster error
const handlePosterError = (event) => {
  event.target.style.display = 'none'
  event.target.nextElementSibling.style.display = 'flex'
}

// ✅ Cleanup on unmount
onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>

<style scoped>
.search-dropdown-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 1rem 3rem 1rem 3rem;
  font-size: 1.1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  z-index: 2;
  pointer-events: none;
}

.clear-button {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease;
  z-index: 2;
}

.clear-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ✅ Dropdown Styles */
.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
}

.dropdown-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  color: #6b7280;
  justify-content: center;
}

.suggestions-list {
  padding: 0.5rem 0;
}

.suggestion-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-left: 3px solid transparent;
}

.suggestion-item:hover,
.suggestion-item.highlighted {
  background-color: #f8fafc;
  border-left-color: #667eea;
}

.suggestion-item.status-now-showing {
  border-left-color: #10b981;
}

.suggestion-item.status-coming-soon {
  border-left-color: #f59e0b;
}

.suggestion-item.status-ended {
  border-left-color: #6b7280;
}

.suggestion-poster {
  width: 40px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.suggestion-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-placeholder {
  width: 100%;
  height: 100%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.suggestion-content {
  flex: 1;
  min-width: 0;
}

.suggestion-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
  text-align: left;
}

.suggestion-meta {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.suggestion-genre,
.suggestion-director {
  font-size: 0.8rem;
  color: #6b7280;
}

.suggestion-genre::after {
  content: "•";
  margin-left: 0.5rem;
  color: #d1d5db;
}

.suggestion-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.suggestion-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #fbbf24;
  font-size: 0.8rem;
  font-weight: 600;
}

.suggestion-status {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  font-weight: 500;
}

.no-results {
  text-align: center;
  padding: 2rem 1rem;
  color: #6b7280;
}

.no-results p {
  margin: 0.5rem 0 0 0;
}

.highlight {
  background: #fef08a;
  color: #365314;
  padding: 0.1rem 0.2rem;
  border-radius: 3px;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .search-input {
    font-size: 1rem;
    padding: 0.875rem 2.5rem 0.875rem 2.5rem;
  }
  
  .suggestion-item {
    padding: 0.5rem 0.75rem;
  }
  
  .suggestion-poster {
    width: 32px;
    height: 48px;
  }
  
  .suggestion-title {
    font-size: 0.9rem;
  }
  
  .suggestion-genre,
  .suggestion-director {
    font-size: 0.75rem;
  }
}
</style>
