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
          next()
          return
        }
        res.setHeader('Content-Type', types[path.extname(full)] || 'application/octet-stream')
        fs.createReadStream(full).pipe(res)
      })
    },
    closeBundle() {
      if (!fs.existsSync(path.join(dir, 'sdk.js'))) {
        console.warn('[vamis-sdk-assets] packages/vamis-sdk/dist/sdk.js missing; run pnpm --filter @vamis/sdk build')
        return
      }
      const dest = path.join(playground, 'dist', 'sdk')
      fs.mkdirSync(dest, { recursive: true })
      for (const file of fs.readdirSync(dir)) {
        fs.copyFileSync(path.join(dir, file), path.join(dest, file))
      }
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
        replacement: path.join(repo, 'node_modules/monaco-editor/min/vs/editor/editor.main.css'),
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
