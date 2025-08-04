// nuxt.config.ts - Full improved version
export default defineNuxtConfig({
  // ✅ Nuxt 4 configuration
  future: {
    compatibilityVersion: 4
  },
  compatibilityDate: '2024-07-28',
  devtools: { enabled: true },
  
  modules: [
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/eslint',
    '@nuxt/content',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],
  
  css: ['~/assets/css/main.css'],
  
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
    
    public: {
      appName: 'MovieBooking'
    }
  },
  
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
  
  pinia: {
    storesDirs: ['./stores/**'],
  },
  
  alias: {
    '@server': './server',
    '#server': './server'
  },
  
  typescript: {
    strict: false,
    typeCheck: false
  },
  
  ssr: true,
  
  app: {
    head: {
      viewport: 'width=device-width,initial-scale=1',
      charset: 'utf-8',
      link: [
        { rel: 'preconnect', href: 'https://www.youtube.com', crossorigin: '' },
        { rel: 'preconnect', href: 'https://www.youtube-nocookie.com', crossorigin: '' },
        { rel: 'dns-prefetch', href: 'https://img.youtube.com' },
        { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' }
      ],
      meta: [
        { name: 'referrer', content: 'strict-origin-when-cross-origin' }
      ]
    }
  },
  
  routeRules: {
    '/movies/**': {
      headers: {
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    }
  },
  
  experimental: {
    payloadExtraction: false,
    viewTransition: false,
    asyncContext: true
  },
  
  nitro: {
    experimental: {
      wasm: true
    },
    routeRules: {
      '/**': {
        headers: {
          'Cross-Origin-Embedder-Policy': 'unsafe-none',
          'Cross-Origin-Opener-Policy': 'unsafe-none'
        }
      }
    },
    prerender: {
      crawlLinks: true,
      failOnError: false 
    }
  },
  
  vite: {
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true
      }
    },
    optimizeDeps: {
      include: ['pinia', '@vueuse/core', '@vueuse/nuxt'],
      exclude: ['youtube-player', 'video.js'] 
    },
    server: {
      cors: true,
      headers: {
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
        'Cross-Origin-Opener-Policy': 'unsafe-none'
      }
    },
    build: {
      rollupOptions: {
        external: ['youtube-player']
      }
    }
  },
})
