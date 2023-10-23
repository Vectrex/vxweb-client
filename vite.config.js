import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import EnvCaster from '@niku/vite-env-caster'

export default defineConfig({
  plugins: [
      vue(),
      EnvCaster()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
        manualChunks: {
        }
      }
    },
  },
  define: {
    /* __VUE_OPTIONS_API__: false */
  }
})