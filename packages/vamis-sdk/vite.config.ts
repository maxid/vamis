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

function copySdkStatic(): Plugin {
  const files = ['hello.html', 'compare.html', 'embed-case.html', 'compare-cases.js']
  return {
    name: 'vamis-sdk-static',
    closeBundle() {
      const dest = path.join(sdk, 'dist')
      if (!fs.existsSync(dest)) return
      const loader = path.join(sdk, 'sdk-loader.js')
      if (fs.existsSync(loader)) fs.copyFileSync(loader, path.join(dest, 'sdk.js'))
      for (const file of files) {
        const from = path.join(sdk, file)
        if (fs.existsSync(from)) fs.copyFileSync(from, path.join(dest, file))
      }
      const score = path.join(sdk, 'compare', 'score.mjs')
      if (fs.existsSync(score)) {
        const dir = path.join(dest, 'compare')
        fs.mkdirSync(dir, { recursive: true })
        fs.copyFileSync(score, path.join(dir, 'score.mjs'))
      }
    },
  }
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), copySdkStatic()],
  resolve: {
    alias: [
      { find: '@vamis/ui', replacement: pkg('vamis-ui') },
      { find: '@vamis/core', replacement: pkg('vamis-core') },
      { find: '@vamis/formula', replacement: pkg('vamis-formula') },
      { find: 'vamis', replacement: path.join(pkg('vamis'), 'index.ts') },
      {
        find: 'monaco-editor/min/vs/editor/editor.main.css',
        replacement: path.join(repo, 'packages/vamis/node_modules/monaco-editor/min/vs/editor/editor.main.css'),
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
    target: 'es2022',
    lib: {
      entry: path.join(sdk, 'src/index.ts'),
      name: 'vamis',
      formats: ['es'],
      fileName: () => 'sdk.esm.js',
      cssFileName: 'sdk',
    },
    cssCodeSplit: false,
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: false,
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (info) => {
          const name = info.names?.[0] || info.name || ''
          if (name === 'sdk.css' || name.endsWith('sdk.css')) return 'sdk.css'
          return 'assets/[name]-[hash][extname]'
        },
        manualChunks(id) {
          const path = id.replace(/\\/g, '/')
          if (!path.includes('/node_modules/')) return
          // monaco / echarts 走动态 import，不要 manualChunks，否则 sdk.esm 会静态拉 6MB。
          if (path.includes('/node_modules/yaml/')) return 'yaml'
          if (
            path.includes('/vue/') ||
            path.includes('/@vue/') ||
            path.includes('/pinia/')
          ) {
            return 'vue'
          }
        },
      },
    },
  },
  test: {
    environment: 'happy-dom',
    css: false,
  },
})
