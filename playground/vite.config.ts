import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { mockApiPlugin } from './src/mock/plugin'

const playground = fileURLToPath(new URL('.', import.meta.url))
const repo = path.resolve(playground, '..')
const pkg = (name: string) => path.join(repo, 'packages', name, 'src')

export default defineConfig({
  plugins: [vue(), tailwindcss(), mockApiPlugin()],
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
