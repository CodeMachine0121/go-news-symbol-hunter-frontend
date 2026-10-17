const backendOrigin = process.env.NUXT_BACKEND_ORIGIN ?? 'http://localhost:8081'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  future: { compatibilityVersion: 4 },
  ssr: false,
  devtools: { enabled: false },
  modules: ['@nuxt/eslint'],
  components: { dirs: [{ path: '~/components', pathPrefix: false }] },
  css: ['~/assets/styles/main.scss'],
  app: {
    head: {
      htmlAttrs: { lang: 'zh-Hant-TW' },
      title: '標的資訊面分析操作台',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
  runtimeConfig: {
    public: { backendBaseUrl: '/api' },
  },
  routeRules: {
    '/api/**': { proxy: `${backendOrigin}/**` },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: { additionalData: '@use "~/assets/styles/abstracts" as *;\n' },
      },
    },
  },
  typescript: { strict: true },
  eslint: { config: { stylistic: false } },
})
