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
      { find: '@varmis/ui', replacement: pkg('varmis-ui') },
      { find: '@varmis/core', replacement: pkg('varmis-core') },
      { find: '@varmis/editor', replacement: pkg('varmis-editor') },
      { find: 'varmis', replacement: path.join(pkg('varmis'), 'index.ts') },
    ],
  },
  server: {
    port: 5173,
    fs: {
      allow: [repo],
    },
  },
})
