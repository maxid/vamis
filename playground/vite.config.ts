import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'
import { mockApiPlugin } from './src/mock/plugin'

const playground = fileURLToPath(new URL('.', import.meta.url))
const repo = path.resolve(playground, '..')
const pkg = (name: string) => path.join(repo, 'packages', name, 'src')

function pagesSpaFallback(): Plugin {
  return {
    name: 'pages-spa-fallback',
    closeBundle() {
      const dist = path.join(playground, 'dist')
      const index = path.join(dist, 'index.html')
      if (!fs.existsSync(index)) return
      fs.copyFileSync(index, path.join(dist, '404.html'))
      fs.writeFileSync(path.join(dist, '.nojekyll'), '')
    },
  }
}

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [vue(), tailwindcss(), mockApiPlugin(), pagesSpaFallback()],
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
