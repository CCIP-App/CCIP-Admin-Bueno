import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ mode }) => ({
  base: mode === 'production'
    ? '/admin/'
    : '/',
  server: { headers: { 'Cache-Control': 'no-store' } },
  plugins: [
    vue(),
    vuetify({
      autoImport: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
}))
