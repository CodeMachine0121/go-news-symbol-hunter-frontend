import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

const appDirectory = fileURLToPath(new URL('./app', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '~': appDirectory },
  },
  css: {
    preprocessorOptions: {
      scss: { additionalData: '@use "~/assets/styles/abstracts" as *;\n' },
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.spec.ts'],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'app/domain/**',
        'app/application/**',
        'app/infrastructure/**',
        'app/composables/**',
        'app/components/**',
      ],
      exclude: ['app/domain/interface/**'],
      reporter: ['text', 'json-summary'],
    },
  },
})
