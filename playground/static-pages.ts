import fs from 'node:fs'
import path from 'node:path'

function walkMarkdown(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkMarkdown(full, files)
    else if (entry.name.endsWith('.md')) files.push(full)
  }
  return files
}

/** website/src 的 md 路径 → playground 路由（与 `pages.ts` / `playgroundHref` 一致）。 */
export function routeFromMarkdown(websiteSrc: string, file: string): string {
  let rel = file.slice(websiteSrc.length).replaceAll('\\', '/')
  if (!rel.startsWith('/')) rel = `/${rel}`
  rel = rel.replace(/\.md$/, '').replace(/\/index$/, '') || '/'
  if (rel === '/') return '/'
  if (rel === '/components' || rel.startsWith('/components/')) return rel
  if (rel === '/style' || rel.startsWith('/style/')) return rel
  return `/docs${rel}`
}

export function collectPlaygroundRoutes(websiteSrc: string): string[] {
  const routes = new Set<string>(['/', '/editor', '/docs', '/components', '/style', '/examples'])
  for (const file of walkMarkdown(websiteSrc)) {
    routes.add(routeFromMarkdown(websiteSrc, file))
  }
  return [...routes].sort()
}

/** 每个路由写成目录下的 index.html，GitHub Pages 可直接按路径提供文件。 */
export function writeStaticPages(dist: string, html: string, routes: string[]): number {
  let written = 0
  for (const route of routes) {
    if (route === '/') continue
    const dir = path.join(dist, route.replace(/^\//, ''))
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'index.html'), html)
    written += 1
  }
  fs.writeFileSync(path.join(dist, '404.html'), html)
  fs.writeFileSync(path.join(dist, '.nojekyll'), '')
  return written
}
