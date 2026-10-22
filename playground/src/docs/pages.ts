const files = import.meta.glob('../../../website/src/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const formulaFiles = import.meta.glob('../../../packages/vamis-formula/src/doc.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const formulaHandbook = Object.values(formulaFiles)[0] || ''

const byRel = new Map<string, string>()
for (const [key, raw] of Object.entries(files)) {
  const i = key.indexOf('/website/src/')
  if (i < 0) continue
  byRel.set(key.slice(i + '/website/src'.length), raw)
}

/** Amis `!!!include(amis-formula/lib/doc.md)!!!` — 手册真源是仓内 `@vamis/formula`。 */
export function expandDocIncludes(raw: string): string {
  if (!raw.includes('!!!include(@vamis/formula)!!!')) return raw
  return raw.replaceAll('!!!include(@vamis/formula)!!!', formulaHandbook)
}

export function resolveDoc(pathname: string): { rel: string; raw: string } | null {
  let rel = pathname.replace(/\/+$/, '') || '/'
  if (rel === '/' || rel === '/docs') rel = '/index'
  else if (rel.startsWith('/docs/')) rel = rel.slice('/docs'.length)
  if (!rel.startsWith('/')) rel = `/${rel}`
  const candidates = [`${rel}.md`, `${rel}/index.md`, `${rel}.md`.replace(/\.md$/, '/index.md')]
  for (const candidate of candidates) {
    const raw = byRel.get(candidate)
    if (raw != null) return { rel: candidate, raw: expandDocIncludes(raw) }
  }
  return null
}

function trimSlash(link: string): string {
  if (link === '/') return link
  return link.replace(/\/+$/, '') || '/'
}

/** 站点根路径加上 Vite `base`（GitHub Pages 是 `/vamis/`）。相对路径不动。 */
export function withBase(url: string, base = import.meta.env.BASE_URL || '/'): string {
  if (!url || /^(https?:|data:|blob:|mailto:|#|\/\/)/i.test(url)) return url
  if (!url.startsWith('/')) return url
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${url.slice(1)}`
}

export function playgroundHref(link: string): string {
  if (!link || link.startsWith('http') || link.startsWith('#')) return link
  if (
    link.startsWith('/components') ||
    link.startsWith('/docs') ||
    link.startsWith('/editor') ||
    link.startsWith('/examples') ||
    link.startsWith('/sdk')
  ) {
    return trimSlash(link)
  }
  if (link === '/') return '/'
  return trimSlash(`/docs${link}`)
}
