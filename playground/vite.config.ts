import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'
import { mockApiPlugin } from './src/mock/plugin'
import { collectPlaygroundRoutes, writeStaticPages } from './static-pages'
import { copyFontAwesomeWebfonts, fontAwesomeCss, resolveFontAwesome } from '../packages/vamis-ui/fontawesome-build.mjs'
import { workspaceBareResolve } from '../scripts/vite-workspace-bare-resolve.mjs'
import { applySdkStamp, sdkCacheStamp } from '../packages/vamis-sdk/compare/sdk-stamp.mjs'

const playground = fileURLToPath(new URL('.', import.meta.url))
const repo = path.resolve(playground, '..')
const websiteSrc = path.join(repo, 'website', 'src')
const formulaDoc = path.join(repo, 'packages', 'vamis-formula', 'src', 'doc.md')
const pkg = (name: string) => path.join(repo, 'packages', name, 'src')

/** `pnpm dev -- --host` / `--host 0.0.0.0` 绑所有网卡，方便手机连局域网。默认仍只听 localhost。 */
function lanHost(argv = process.argv): true | string | undefined {
  const eq = argv.find((a) => a.startsWith('--host='))
  if (eq) {
    const value = eq.slice('--host='.length)
    return !value || value === 'true' || value === '0.0.0.0' ? true : value
  }
  const i = argv.indexOf('--host')
  if (i >= 0) {
    const next = argv[i + 1]
    if (next && !next.startsWith('-')) {
      return next === 'true' || next === '0.0.0.0' ? true : next
    }
    return true
  }
  const env = process.env.VAMIS_HOST
  if (env === '0.0.0.0' || env === 'true' || env === '1' || env === '*') return true
  if (env) return env
  return undefined
}

const host = lanHost()
const lan = host != null ? { host, allowedHosts: true as const } : {}

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
  /** 按 mtime 缓存 gzip。流式 gzip 没有 Content-Length，部分手机 WebView 会一直等到连接结束才算 css load（对照里像卡 40s）。 */
  const gzipCache = new Map<string, { mtimeMs: number; buf: Buffer }>()
  function gzipFile(full: string, mtimeMs: number) {
    const hit = gzipCache.get(full)
    if (hit && hit.mtimeMs === mtimeMs) return hit.buf
    const buf = zlib.gzipSync(fs.readFileSync(full), { level: 6 })
    gzipCache.set(full, { mtimeMs, buf })
    return buf
  }
  function gzipBuffer(key: string, body: Buffer) {
    const mtimeMs = body.length
    const hit = gzipCache.get(key)
    if (hit && hit.mtimeMs === mtimeMs) return hit.buf
    const buf = zlib.gzipSync(body, { level: 6 })
    gzipCache.set(key, { mtimeMs, buf })
    return buf
  }
  function sendSdkFile(req: { headers: { [key: string]: unknown }; url?: string }, res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (b?: Buffer | string) => void }, full: string, file: string) {
    const ext = path.extname(full)
    const stat = fs.statSync(full)
    const hashed = file.startsWith('assets/')
    const stampHtml = file === 'compare.html' || file === 'embed-case.html'
    const stamp = stampHtml ? sdkCacheStamp(sdkRoot) : ''
    const stamped = stampHtml ? Buffer.from(applySdkStamp(fs.readFileSync(full, 'utf8'), stamp)) : null
    const etag = stamped
      ? `"${stamped.length.toString(16)}-${stamp}"`
      : `"${stat.size.toString(16)}-${Math.trunc(stat.mtimeMs).toString(16)}"`
    res.setHeader('ETag', etag)
    // 开发机：sdk.css / sdk.js 无版本号，不能一年 immutable，否则 sdk:build 后手机仍吃旧包。
    // no-cache = 每次用 ETag 校验，没改 304（不重下 2MB），改了才拉新。带 hash 的 assets/ 才可长期缓存。
    res.setHeader(
      'Cache-Control',
      hashed ? 'public, max-age=31536000, immutable' : 'no-cache',
    )
    if (req.headers['if-none-match'] === etag) {
      res.statusCode = 304
      res.end()
      return
    }
    res.setHeader('Content-Type', types[ext] || 'application/octet-stream')
    const gzipOk =
      /\.(?:css|js|mjs|html|map)$/i.test(ext) &&
      /gzip/i.test(String(req.headers['accept-encoding'] || ''))
    if (gzipOk) {
      const buf = stamped ? gzipBuffer(file + ':' + stamp, stamped) : gzipFile(full, stat.mtimeMs)
      res.setHeader('Content-Encoding', 'gzip')
      res.setHeader('Vary', 'Accept-Encoding')
      res.setHeader('Content-Length', String(buf.length))
      res.end(buf)
      return
    }
    if (stamped) {
      res.setHeader('Content-Length', String(stamped.length))
      res.end(stamped)
      return
    }
    res.setHeader('Content-Length', String(stat.size))
    fs.createReadStream(full).pipe(res as unknown as NodeJS.WritableStream)
  }
  return {
    name: 'vamis-sdk-assets',
    configureServer(server) {
      // 手机 WebView 会把 `./sdk.css` 解析成站点根 `/sdk.css`（对照 iframe 报 css …/sdk.css）。
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0]
        if (url === '/sdk.css' || url === '/sdk.js' || url === '/sdk.esm.js') {
          res.statusCode = 302
          res.setHeader('Location', '/sdk' + url)
          res.end()
          return
        }
        next()
      })
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
        sendSdkFile(req, res, full, file)
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
  plugins: [vue(), tailwindcss(), workspaceBareResolve(repo, [playground]), mockApiPlugin(), fontAwesome(), serveSdk(), staticSite()],
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
      input: {
        main: path.join(playground, 'index.html'),
        previewFrame: path.join(playground, 'preview-frame.html'),
      },
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
    ...lan,
    fs: {
      allow: [repo],
    },
  },
  preview: {
    ...lan,
  },
})
