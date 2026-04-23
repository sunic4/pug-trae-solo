import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: path.resolve(__dirname),
  resolve: {
    alias: {
      '@pug/reactivity': path.resolve(__dirname, '../../packages/reactivity/src'),
      '@pug/composer': path.resolve(__dirname, '../../packages/composer/src'),
      '@pug/layout': path.resolve(__dirname, '../../packages/layout/src'),
      '@pug/renderer': path.resolve(__dirname, '../../packages/renderer/src'),
      '@pug/event': path.resolve(__dirname, '../../packages/event/src'),
      '@pug/theme': path.resolve(__dirname, '../../packages/theme/src'),
      '@pug/components': path.resolve(__dirname, '../../packages/components/src'),
      '@pug': path.resolve(__dirname, '../../packages/canvas-compose/src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: path.resolve(__dirname, '../../dist/demo'),
  },
})