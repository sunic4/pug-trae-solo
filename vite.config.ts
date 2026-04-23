import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@canvas-compose/reactivity': path.resolve(__dirname, './packages/reactivity/src'),
      '@canvas-compose/composer': path.resolve(__dirname, './packages/composer/src'),
      '@canvas-compose/layout': path.resolve(__dirname, './packages/layout/src'),
      '@canvas-compose/renderer': path.resolve(__dirname, './packages/renderer/src'),
      '@canvas-compose/event': path.resolve(__dirname, './packages/event/src'),
      '@canvas-compose/theme': path.resolve(__dirname, './packages/theme/src'),
      '@canvas-compose/components': path.resolve(__dirname, './packages/components/src'),
      '@canvas-compose': path.resolve(__dirname, './packages/canvas-compose/src'),
    },
  },
})