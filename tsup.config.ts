import { defineConfig } from 'tsup'
import path from 'path'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  target: 'es2022',
  esbuildOptions(options) {
    options.alias = {
      '@': path.resolve(__dirname, 'src'),
    }
  },
})
