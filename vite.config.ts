import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'example',
  publicDir: false,
  resolve: {
    alias: {
      'pug-canvas-ui': resolve(__dirname, './packages/app/src/index.ts'),
      '@pug-canvas-ui/types': resolve(__dirname, './packages/types/src/index.ts'),
      '@pug-canvas-ui/core': resolve(__dirname, './packages/core/src/index.ts'),
      '@pug-canvas-ui/theme': resolve(__dirname, './packages/theme/src/index.ts'),
      '@pug-canvas-ui/render': resolve(__dirname, './packages/render/src/index.ts'),
      '@pug-canvas-ui/layout': resolve(__dirname, './packages/layout/src/index.ts'),
      '@pug-canvas-ui/input': resolve(__dirname, './packages/input/src/index.ts'),
      '@pug-canvas-ui/animation': resolve(__dirname, './packages/animation/src/index.ts'),
      '@pug-canvas-ui/platform': resolve(__dirname, './packages/platform/src/index.ts'),
      '@pug-canvas-ui/components': resolve(__dirname, './packages/components/src/index.ts'),
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
