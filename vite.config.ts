import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'example',
  publicDir: false,
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: '../dist-example',
    emptyOutDir: true,
  },
})
