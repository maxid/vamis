import { mdRelToPaths, parseDocProgress } from './doc-progress'

const files = import.meta.glob('../../../website/src/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const byLink = new Map<string, number>()

for (const [key, raw] of Object.entries(files)) {
  const i = key.indexOf('/website/src/')
  if (i < 0) continue
  const rel = key.slice(i + '/website/src'.length)
  const n = parseDocProgress(raw)
  if (n == null) continue
  for (const path of mdRelToPaths(rel)) byLink.set(path, n)
}

function normalizeLink(link: string): string {
  const path = (link.split(/[?#]/)[0] || '').replace(/\/+$/, '') || '/'
  return path
}

export function progressForLink(link: string): number | undefined {
  const path = normalizeLink(link)
  return byLink.get(path) ?? byLink.get(`${path}/`)
}
