import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'
import { mockApiPlugin } from './src/mock/plugin'
import { collectPlaygroundRoutes, writeStaticPages } from './static-pages'
import { copyFontAwesomeWebfonts, fontAwesomeCss, resolveFontAwesome } from '../packages/vamis-ui/fontawesome-build.mjs'

const playground = fileURLToPath(new URL('.', import.meta.url))
const repo = path.resolve(playground, '..')
const websiteSrc = path.join(repo, 'website', 'src')
const formulaDoc = path.join(repo, 'packages', 'vamis-formula', 'src', 'doc.md')
const pkg = (name: string) => path.join(repo, 'packages', name, 'src')

function siteBase() {
  const raw = process.env.VITE_BASE || '/'
  return raw.endsWith('/') ? raw : `${raw}/`
}

function fontAwesome(): Plugin {
  const types: Record<string, string> = {
    woff2: 'font/woff2',
    woff: 'font/woff',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject',
    svg: 'image/svg+xml',
  }
  return {
    name: 'vamis-fontawesome',
    transformIndexHtml(html) {
      if (!resolveFontAwesome() || html.includes('fontawesome.css')) return html
      return html.replace('</head>', `    <link rel="stylesheet" href="${siteBase()}fontawesome.css" />\n  </head>`)
    },
    configureServer(server) {
      const fa = resolveFontAwesome()
      if (!fa) {
        console.warn('[vamis-fontawesome] @fortawesome/fontawesome-free missing; run pnpm install')
        return
      }
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0]
        const prefix = siteBase().replace(/\/$/, '')
        if (url === `${prefix}/fontawesome.css` || url === '/fontawesome.css') {
          res.setHeader('Content-Type', 'text/css; charset=utf-8')
          res.end(fontAwesomeCss('./assets/'))
          return
        }
        const match = url.match(/(?:^|\/)assets\/(fa-[^/]+\.(?:woff2?|ttf|eot|svg))$/)
        if (match) {
          const file = path.join(fa, 'webfonts', match[1])
          if (fs.existsSync(file)) {
            const ext = match[1].split('.').pop() || ''
            res.setHeader('Content-Type', types[ext] || 'application/octet-stream')
            fs.createReadStream(file).pipe(res)
            return
          }
        }
        next()
      })
    },
    closeBundle() {
      const dest = path.join(playground, 'dist')
      if (!fs.existsSync(dest) || !resolveFontAwesome()) return
      copyFontAwesomeWebfonts(path.join(dest, 'assets'))
      fs.writeFileSync(path.join(dest, 'fontawesome.css'), fontAwesomeCss('./assets/'))
    },
  }
}

function staticSite(): Plugin {
  return {
    name: 'vamis-static-pages',
    configureServer(server) {
      // website/src 与公式手册在 playground 根目录外；不加入 watcher 时 glob ?raw 不会随 md 失效。
      server.watcher.add(websiteSrc)
      server.watcher.add(formulaDoc)
    },
    closeBundle() {
      const dist = path.join(playground, 'dist')
      const index = path.join(dist, 'index.html')
      if (!fs.existsSync(index)) return
      const html = fs.readFileSync(index, 'utf8')
      const routes = collectPlaygroundRoutes(websiteSrc)
      const written = writeStaticPages(dist, html, routes)
      console.log(`[vamis-static-pages] wrote ${written} routes (+ 404.html)`)
    },
  }
}

const SDK_MISSING_HTML = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>SDK 未构建</title>
  </head>
  <body style="font:14px/1.5 system-ui;padding:24px;color:#334155">
    <p>没有 SDK 产物，iframe 无法演示。请先运行：</p>
    <pre style="background:#f1f5f9;padding:12px;border-radius:8px">pnpm --filter @vamis/sdk build</pre>
    <p>完整站点构建用 <code>pnpm build</code>，会先打 SDK 再拷到 <code>/sdk/hello.html</code>。</p>
  </body>
</html>
`

function serveSdk(): Plugin {
  const sdkRoot = path.join(repo, 'packages', 'vamis-sdk')
  const dir = path.join(sdkRoot, 'dist')
  const fromRoot = new Set(['hello.html', 'compare.html', 'embed-case.html', 'compare-cases.js'])
  const types: Record<string, string> = {
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
  }
  function resolveSdkFile(file: string) {
    if (fromRoot.has(file)) {
      const src = path.normalize(path.join(sdkRoot, file))
      if (src.startsWith(sdkRoot) && fs.existsSync(src) && fs.statSync(src).isFile()) return src
    }
    return path.normalize(path.join(dir, file))
  }
  return {
    name: 'vamis-sdk-assets',
    configureServer(server) {
      server.middlewares.use('/sdk', (req, res, next) => {
        const url = (req.url || '/').split('?')[0]
        const file = !url || url === '/' ? 'hello.html' : url.replace(/^\//, '')
        const full = resolveSdkFile(file)
        const allowed = full.startsWith(dir) || (fromRoot.has(file) && full.startsWith(sdkRoot))
        if (!allowed || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
          if (file.endsWith('.html') || file === 'hello.html' || !file) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(SDK_MISSING_HTML)
            return
          }
          next()
          return
        }
        res.setHeader('Content-Type', types[path.extname(full)] || 'application/octet-stream')
        fs.createReadStream(full).pipe(res)
      })
    },
    closeBundle() {
      const dest = path.join(playground, 'dist', 'sdk')
      if (fs.existsSync(path.join(dir, 'sdk.js'))) {
        fs.cpSync(dir, dest, { recursive: true })
        return
      }
      console.warn('[vamis-sdk-assets] packages/vamis-sdk/dist/sdk.js missing; run pnpm --filter @vamis/sdk build')
      fs.mkdirSync(dest, { recursive: true })
      fs.writeFileSync(path.join(dest, 'hello.html'), SDK_MISSING_HTML)
    },
  }
}

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [vue(), tailwindcss(), mockApiPlugin(), fontAwesome(), serveSdk(), staticSite()],
  resolve: {
    alias: [
      { find: '@vamis/ui', replacement: pkg('vamis-ui') },
      { find: '@vamis/core', replacement: pkg('vamis-core') },
      { find: '@vamis/formula', replacement: pkg('vamis-formula') },
      { find: '@vamis/editor', replacement: pkg('vamis-editor') },
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
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          const path = id.replace(/\\/g, '/')
          if (!path.includes('/node_modules/')) return
          // monaco / echarts 必须靠动态 import 拆，不要进 manualChunks，否则入口会静态预加载 4MB+。
          if (path.includes('/node_modules/yaml/')) return 'yaml'
          if (path.includes('/node_modules/markdown-it/')) return 'markdown'
          if (
            path.includes('/vue/') ||
            path.includes('/@vue/') ||
            path.includes('/vue-router/') ||
            path.includes('/pinia/') ||
            path.includes('/vue-sonner/')
          ) {
            return 'vue'
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ['monaco-editor'],
  },
  server: {
    port: 5173,
    fs: {
      allow: [repo],
    },
  },
})
