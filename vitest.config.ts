import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@pug-canvas-ui/types': path.resolve(__dirname, 'packages/types/src/index.ts'),
      '@pug-canvas-ui/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
      '@pug-canvas-ui/theme': path.resolve(__dirname, 'packages/theme/src/index.ts'),
      '@pug-canvas-ui/render': path.resolve(__dirname, 'packages/render/src/index.ts'),
      '@pug-canvas-ui/layout': path.resolve(__dirname, 'packages/layout/src/index.ts'),
      '@pug-canvas-ui/input': path.resolve(__dirname, 'packages/input/src/index.ts'),
      '@pug-canvas-ui/animation': path.resolve(__dirname, 'packages/animation/src/index.ts'),
      '@pug-canvas-ui/platform': path.resolve(__dirname, 'packages/platform/src/index.ts'),
      '@pug-canvas-ui/components': path.resolve(__dirname, 'packages/components/src/index.ts'),
      'pug-canvas-ui': path.resolve(__dirname, 'packages/app/src/index.ts'),
    },
  },
  test: {
    globals: true,
    include: ['packages/*/src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.ts'],
      exclude: ['packages/*/src/**/*.test.ts', 'packages/*/src/**/index.ts'],
    },
  },
})
