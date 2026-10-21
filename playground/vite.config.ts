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

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [vue(), tailwindcss(), mockApiPlugin(), staticSite()],
  resolve: {
    alias: [
      { find: '@vamis/ui', replacement: pkg('vamis-ui') },
      { find: '@vamis/core', replacement: pkg('vamis-core') },
      { find: '@vamis/editor', replacement: pkg('vamis-editor') },
      { find: 'vamis', replacement: path.join(pkg('vamis'), 'index.ts') },
    ],
  },
  server: {
    port: 5173,
    fs: {
      allow: [repo],
    },
  },
})
