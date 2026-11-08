/// <reference types="vitest/config" />
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'
import { copyFontAwesomeWebfonts, fontAwesomeCss, resolveFontAwesome } from '../vamis-ui/fontawesome-build.mjs'
import { workspaceBareResolve } from '../../scripts/vite-workspace-bare-resolve.mjs'

const sdk = fileURLToPath(new URL('.', import.meta.url))
const repo = path.resolve(sdk, '../..')
const pkg = (name: string) => path.join(repo, 'packages', name, 'src')

function appendFontAwesome(dest: string) {
  if (!resolveFontAwesome()) return
  copyFontAwesomeWebfonts(path.join(dest, 'assets'))
  const extra = fontAwesomeCss('./assets/')
  if (extra) fs.appendFileSync(path.join(dest, 'sdk.css'), `\n${extra}`)
}

/** lightningcss 可能把 @supports 拆掉，旧 WebView 只剩 oklch，提交钮掉成描边。打包后再垫一层 hex。 */
function appendLegacyPrimary(dest: string) {
  const css = `/* old WebView: oklch(--primary) invalid → 云舍蓝 hex */
@supports not (color: oklch(0 0 0)) {
  :root {
    --primary: #2468f2;
    --primary-foreground: #ffffff;
    --primary-hover: #1c5bd6;
    --primary-active: #144bcc;
    --ring: #2468f2;
  }
  .dark {
    --primary: #528eff;
    --primary-foreground: #151b26;
    --primary-hover: #7dadff;
    --primary-active: #2468f2;
    --ring: #528eff;
  }
}
`
  const file = path.join(dest, 'sdk.css')
  if (fs.existsSync(file)) fs.appendFileSync(file, `\n${css}`)
}

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
      appendFontAwesome(dest)
      appendLegacyPrimary(dest)
    },
  }
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), workspaceBareResolve(repo), copySdkStatic()],
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
    assetsInlineLimit: 0,
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
