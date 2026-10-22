import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'
import { mockApiPlugin } from '../../playground/src/mock/plugin'
import {
  componentNav,
  conceptNav,
  extendNav,
  isCompGroup,
  sidebar,
  startNav,
  styleNav,
  typeNav,
} from '../nav.mjs'

const website = fileURLToPath(new URL('..', import.meta.url))
const repo = path.resolve(website, '..')
const pkg = (name: string) => path.join(repo, 'packages', name, 'src')

export default defineConfig({
  srcDir: 'src',
  title: 'Vamis',
  description: 'Vue 3 低代码运行时：YAML 作者态，对齐 Amis schema 语义',
  lang: 'zh-CN',
  lastUpdated: true,
  ignoreDeadLinks: true,
  themeConfig: {
    logo: undefined,
    siteTitle: 'Vamis',
    nav: [
      { text: '开始', items: startNav },
      { text: '概念', items: conceptNav },
      { text: '样式', items: styleNav },
      {
        text: '组件',
        items: componentNav.map((entry) =>
          isCompGroup(entry)
            ? { text: entry.text, link: entry.items[0].link }
            : { text: entry.text, link: entry.link },
        ),
      },
      { text: '类型', items: typeNav },
      { text: '扩展', items: extendNav },
      { text: 'Playground', link: 'http://127.0.0.1:5173' },
    ],
    sidebar: sidebar(),
    outline: { label: '本页大纲', level: [2, 3] },
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/maxid/vamis' }],
    footer: {
      message: '对齐 Amis 组件语义 · UI 使用 shadcn-vue token · 作者态 YAML / JSON',
      copyright: 'Apache-2.0',
    },
    docFooter: { prev: '上一页', next: '下一页' },
  },
  markdown: {
    config(md) {
      const defaultFence = md.renderer.rules.fence
      md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx]
        const info = token.info.trim()
        if (info === 'schema' || info.startsWith('schema')) {
          const attrs = info.replace(/^schema:?/, '').trim()
          const height = /height\s*=\s*"?(\d+)/.exec(attrs)?.[1]
          const scope = /scope\s*=\s*"?([^"\s]+)"?/.exec(attrs)?.[1]
          const extra = [
            height ? `height="${height}"` : '',
            scope ? `scope="${scope}"` : '',
          ]
            .filter(Boolean)
            .join(' ')
          return `<SchemaPreview yaml="${encodeURIComponent(token.content)}" ${extra} />\n`
        }
        const lang = info.split(/\s+/, 1)[0] || 'plaintext'
        return `<CodeFence language="${lang}" code="${encodeURIComponent(token.content)}" />\n`
      }
    },
  },
  vite: {
    plugins: [tailwindcss(), mockApiPlugin()],
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
      port: 5176,
      fs: { allow: [repo] },
    },
  },
})
