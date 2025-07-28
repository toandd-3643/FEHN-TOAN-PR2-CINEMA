// nuxt.config.ts
export default defineNuxtConfig({
  // ✅ Nuxt 4 configuration
  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2024-07-28',
  devtools: { enabled: true },
  
  // ✅ Modules configuration
  modules: [
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/eslint',
    '@nuxt/content',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],
  
  // ✅ CSS configuration
  css: ['~/assets/css/main.css'],
  
  // ✅ Runtime configuration
  runtimeConfig: {
    // Server-side environment variables
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
    
    // Public environment variables
    public: {
      appName: 'MovieBooking'
    }
  },
  
  // ✅ Auto-imports configuration
  imports: {
    dirs: [
      'stores',
      'composables/**',
      'utils/**'
    ],
    presets: [
      {
        from: 'vue',
        imports: ['ref', 'reactive', 'computed', 'watch', 'onMounted', 'onUnmounted', 'nextTick', 'readonly']
      },
      {
        from: 'pinia',
        imports: ['defineStore', 'storeToRefs', 'acceptHMRUpdate']
      },
      {
        from: '#app',
        imports: ['useCookie', 'useRouter', 'useRoute', 'navigateTo', 'useFetch', 'useLazyFetch']
      }
    ]
  },
  
  // ✅ Pinia configuration
  pinia: {
    storesDirs: ['./stores/**'],
  },
  
  // ✅ Alias configuration (Nuxt 4)
  alias: {
    '@server': './server',
    '#server': './server'
  },
  
  // ✅ TypeScript configuration
  typescript: {
    strict: false,
    typeCheck: false
  },
  
  // ✅ SSR configuration
  ssr: true,
  
  // ✅ App configuration để tránh hydration issues
  app: {
    head: {
      viewport: 'width=device-width,initial-scale=1',
      charset: 'utf-8'
    }
  },
  
  // ✅ Experimental features
  experimental: {
    payloadExtraction: false,
    viewTransition: false
  },
  
  // ✅ Nitro configuration
  nitro: {
    experimental: {
      wasm: true
    }
  },
  
  // ✅ Vite configuration để tránh lỗi
  vite: {
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true
      }
    },
    optimizeDeps: {
      include: ['pinia', '@vueuse/core', '@vueuse/nuxt']
    }
  }
})
