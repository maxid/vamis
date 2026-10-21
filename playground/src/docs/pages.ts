const files = import.meta.glob('../../../website/src/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const byRel = new Map<string, string>()
for (const [key, raw] of Object.entries(files)) {
  const i = key.indexOf('/website/src/')
  if (i < 0) continue
  byRel.set(key.slice(i + '/website/src'.length), raw)
}

export function resolveDoc(pathname: string): { rel: string; raw: string } | null {
  let rel = pathname.replace(/\/+$/, '') || '/'
  if (rel === '/' || rel === '/docs') rel = '/index'
  else if (rel.startsWith('/docs/')) rel = rel.slice('/docs'.length)
  if (!rel.startsWith('/')) rel = `/${rel}`
  const candidates = [`${rel}.md`, `${rel}/index.md`, `${rel}.md`.replace(/\.md$/, '/index.md')]
  for (const candidate of candidates) {
    const raw = byRel.get(candidate)
    if (raw != null) return { rel: candidate, raw }
  }
  return null
}

function trimSlash(link: string): string {
  if (link === '/') return link
  return link.replace(/\/+$/, '') || '/'
}

export function playgroundHref(link: string): string {
  if (!link || link.startsWith('http') || link.startsWith('#')) return link
  if (
    link.startsWith('/components') ||
    link.startsWith('/docs') ||
    link.startsWith('/editor') ||
    link.startsWith('/examples')
  ) {
    return trimSlash(link)
  }
  if (link === '/') return '/'
  return trimSlash(`/docs${link}`)
}
