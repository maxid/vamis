import { docHref, isStaticAssetHref, playgroundHref, withBase } from './base'

export { docHref, isStaticAssetHref, playgroundHref, withBase }

const files = import.meta.glob('../../../website/src/**/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

const formulaFiles = import.meta.glob('../../../packages/vamis-formula/src/doc.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

let formulaHandbook = ''
let formulaPending: Promise<string> | null = null

async function loadFormulaHandbook(): Promise<string> {
  if (formulaHandbook) return formulaHandbook
  if (!formulaPending) {
    const load = Object.values(formulaFiles)[0]
    formulaPending = (load ? load() : Promise.resolve('')).then((raw) => {
      formulaHandbook = raw
      return raw
    })
  }
  return formulaPending
}

const byRel = new Map<string, () => Promise<string>>()
for (const key of Object.keys(files)) {
  const i = key.indexOf('/website/src/')
  if (i < 0) continue
  byRel.set(key.slice(i + '/website/src'.length), files[key])
}

/** Amis `!!!include(amis-formula/lib/doc.md)!!!` — 手册真源是仓内 `@vamis/formula`。 */
export async function expandDocIncludes(raw: string): Promise<string> {
  if (!raw.includes('!!!include(@vamis/formula)!!!')) return raw
  const handbook = await loadFormulaHandbook()
  return raw.replaceAll('!!!include(@vamis/formula)!!!', handbook)
}

export async function resolveDoc(pathname: string): Promise<{ rel: string; raw: string } | null> {
  let rel = pathname.replace(/\/+$/, '') || '/'
  if (rel === '/' || rel === '/docs') rel = '/index'
  else if (rel.startsWith('/docs/')) rel = rel.slice('/docs'.length)
  if (!rel.startsWith('/')) rel = `/${rel}`
  const candidates = [`${rel}.md`, `${rel}/index.md`, `${rel}.md`.replace(/\.md$/, '/index.md')]
  for (const candidate of candidates) {
    const load = byRel.get(candidate)
    if (!load) continue
    const raw = await load()
    return { rel: candidate, raw: await expandDocIncludes(raw) }
  }
  return null
}
