/// <reference types="vitest/config" />
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'
import { copyFontAwesomeWebfonts, fontAwesomeCss, resolveFontAwesome } from '../vamis-ui/fontawesome-build.mjs'
import { workspaceBareResolve } from '../../scripts/vite-workspace-bare-resolve.mjs'
import { stampSdkHtmlFiles } from './compare/sdk-stamp.mjs'

const sdk = fileURLToPath(new URL('.', import.meta.url))
const repo = path.resolve(sdk, '../..')
const pkg = (name: string) => path.join(repo, 'packages', name, 'src')

function appendFontAwesome(dest: string) {
  if (!resolveFontAwesome()) return
  copyFontAwesomeWebfonts(path.join(dest, 'assets'))
  const extra = fontAwesomeCss('./assets/')
  if (extra) fs.appendFileSync(path.join(dest, 'sdk.css'), `\n${extra}`)
}

/**
 * lightningcss 可能把源码里的 @supports 拆掉、把 oklch 抬到 :root。
 * 打包后再垫一层 `@supports not`：只 alias 色阶（hex 在 themes.css），不要钉云舍蓝，
 * 否则 6 色包在旧 WebView 会被盖回 #2468f2。
 */
function appendLegacyPrimary(dest: string) {
  const css = `/* old WebView: oklch token invalid → hex 色阶 alias */
@supports not (color: oklch(0 0 0)) {
  :root, [data-theme] {
    --background: var(--colors-neutral-fill-10);
    --secondary: var(--colors-neutral-fill-9);
    --secondary-foreground: var(--colors-neutral-text-3);
    --muted: var(--colors-neutral-fill-10);
    --accent: var(--colors-brand-10);
    --accent-foreground: var(--colors-brand-2);
    --primary: var(--colors-brand-5);
    --primary-foreground: var(--colors-neutral-text-11);
    --primary-hover: var(--colors-brand-4);
    --primary-active: var(--colors-brand-3);
    --link-color: var(--primary);
    --link-hover-color: var(--colors-brand-6);
    --ring: var(--colors-brand-5);
    --select-option-hover-bg: var(--colors-brand-10);
    --select-chip-hover-bg: var(--colors-brand-10);
    --list-item-hover-bg: var(--colors-brand-10);
    --control-focus-glow: 0 0 0 3px var(--colors-brand-8);
    --checkbox-checked-hover: var(--colors-brand-6);
    --checkbox-checked-active: var(--colors-brand-4);
    --success-bg: var(--colors-success-10);
    --warning-bg: var(--colors-warning-10);
    --info-bg: var(--colors-info-10);
    --error-bg: var(--colors-error-10);
  }
  .dark {
    --background: var(--colors-neutral-fill-canvas);
    --primary: var(--colors-brand-5);
    --primary-foreground: var(--white);
    --primary-hover: var(--colors-brand-6);
    --primary-active: var(--colors-brand-4);
    --link-color: var(--primary);
    --link-hover-color: var(--colors-brand-6);
    --ring: var(--primary);
    --destructive: var(--colors-error-5);
    --success: var(--colors-success-5);
    --warning: var(--colors-warning-5);
    --info: var(--colors-info-5);
    --select-option-hover-bg: var(--colors-neutral-fill-9);
    --control-focus-glow: 0 0 0 3px var(--colors-brand-7);
    --checkbox-checked-hover: var(--colors-brand-6);
    --checkbox-checked-active: var(--colors-brand-4);
  }
  .dark[data-theme="dark"] {
    --primary-hover: var(--colors-brand-4);
    --primary-active: var(--colors-brand-6);
    --checkbox-checked-hover: var(--colors-brand-4);
    --checkbox-checked-active: var(--colors-brand-6);
  }
}
`
  const file = path.join(dest, 'sdk.css')
  if (fs.existsSync(file)) fs.appendFileSync(file, `\n${css}`)
}

/** lightningcss 会拆掉源码里的 `@supports (color: oklch)`，现代浏览器也就丢了相对色。从 styles.css 原样垫回。 */
function appendOklchSupports(dest: string) {
  const src = fs.readFileSync(path.join(pkg('vamis-ui'), 'styles.css'), 'utf8')
  const needle = '@supports (color: oklch(0 0 0))'
  const start = src.indexOf(needle)
  if (start < 0) return
  const brace = src.indexOf('{', start)
  if (brace < 0) return
  let depth = 0
  let end = brace
  for (; end < src.length; end++) {
    if (src[end] === '{') depth++
    else if (src[end] === '}') {
      depth--
      if (depth === 0) {
        end++
        break
      }
    }
  }
  const file = path.join(dest, 'sdk.css')
  if (fs.existsSync(file)) fs.appendFileSync(file, `\n${src.slice(start, end)}\n`)
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
      appendOklchSupports(dest)
      stampSdkHtmlFiles(sdk, dest)
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
