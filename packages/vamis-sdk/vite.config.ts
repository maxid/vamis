/// <reference types="vitest/config" />
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'

const sdk = fileURLToPath(new URL('.', import.meta.url))
const repo = path.resolve(sdk, '../..')
const pkg = (name: string) => path.join(repo, 'packages', name, 'src')

function copyHelloHtml(): Plugin {
  return {
    name: 'vamis-sdk-hello',
    closeBundle() {
      const from = path.join(sdk, 'hello.html')
      const to = path.join(sdk, 'dist', 'hello.html')
      if (fs.existsSync(from) && fs.existsSync(path.dirname(to))) {
        fs.copyFileSync(from, to)
      }
    },
  }
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), copyHelloHtml()],
  resolve: {
    alias: [
      { find: '@vamis/ui', replacement: pkg('vamis-ui') },
      { find: '@vamis/core', replacement: pkg('vamis-core') },
      { find: '@vamis/formula', replacement: pkg('vamis-formula') },
      { find: 'vamis', replacement: path.join(pkg('vamis'), 'index.ts') },
      {
        find: 'monaco-editor/min/vs/editor/editor.main.css',
        replacement: path.join(repo, 'node_modules/monaco-editor/min/vs/editor/editor.main.css'),
      },
    ],
  },
  worker: {
    format: 'es',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: path.join(sdk, 'src/index.ts'),
      name: 'vamis',
      formats: ['iife'],
      fileName: () => 'sdk.js',
      cssFileName: 'sdk',
    },
    cssCodeSplit: false,
    emptyOutDir: true,
    sourcemap: false,
  },
  test: {
    environment: 'happy-dom',
    css: false,
  },
})
