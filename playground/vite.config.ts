import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'
import { mockApiPlugin } from './src/mock/plugin'
import { collectPlaygroundRoutes, writeStaticPages } from './static-pages'

const playground = fileURLToPath(new URL('.', import.meta.url))
const repo = path.resolve(playground, '..')
const websiteSrc = path.join(repo, 'website', 'src')
const pkg = (name: string) => path.join(repo, 'packages', name, 'src')

function staticSite(): Plugin {
  return {
    name: 'vamis-static-pages',
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
  const dir = path.join(repo, 'packages', 'vamis-sdk', 'dist')
  const types: Record<string, string> = {
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
  }
  return {
    name: 'vamis-sdk-assets',
    configureServer(server) {
      server.middlewares.use('/sdk', (req, res, next) => {
        const url = (req.url || '/').split('?')[0]
        const file = !url || url === '/' ? 'hello.html' : url.replace(/^\//, '')
        const full = path.normalize(path.join(dir, file))
        if (!full.startsWith(dir) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
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
  plugins: [vue(), tailwindcss(), mockApiPlugin(), serveSdk(), staticSite()],
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
