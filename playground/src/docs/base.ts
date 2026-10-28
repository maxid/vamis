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

/** SDK 静态页（`/sdk/compare.html`）不是 Vue 路由。 */
export function isStaticAssetHref(href: string): boolean {
  if (!href || /^(https?:|data:|blob:|mailto:|#|\/\/)/i.test(href)) return false
  const path = href.split(/[?#]/)[0] || ''
  return /(?:^|\/)sdk\//.test(path)
}

function splitHash(link: string): { path: string; hash: string } {
  const idx = link.indexOf('#')
  if (idx < 0) return { path: link, hash: '' }
  return { path: link.slice(0, idx), hash: link.slice(idx) }
}

/** `fromRel` 是 md 相对 website/src 的路径，如 `/components/cards.md`。`./service` → `/components/service`。 */
export function playgroundHref(link: string, fromRel = ''): string {
  if (!link || link.startsWith('http') || link.startsWith('#') || link.startsWith('mailto:')) return link
  const { path, hash } = splitHash(link)
  if (
    path.startsWith('/components') ||
    path.startsWith('/style') ||
    path.startsWith('/docs') ||
    path.startsWith('/editor') ||
    path.startsWith('/examples') ||
    path.startsWith('/sdk')
  ) {
    return trimSlash(path) + hash
  }
  if (path === '/' || path === '') return `/${hash}`
  const relative = path.startsWith('./') || path.startsWith('../') || (path !== '' && !path.startsWith('/'))
  if (relative && fromRel) {
    const dir = fromRel.replace(/\/[^/]+$/, '') || '/'
    const base = `https://vamis.local${dir.endsWith('/') ? dir : `${dir}/`}`
    try {
      return trimSlash(new URL(path, base).pathname) + hash
    } catch {
      /* fall through */
    }
  }
  if (path.startsWith('./')) return trimSlash(`/${path.slice(2)}`) + hash
  return trimSlash(`/docs${path.startsWith('/') ? path : `/${path}`}`) + hash
}

/** 文档 `<a href>`：SDK 静态页要带 Vite base，否则 GitHub Pages 会跳到站点根外。 */
export function docHref(link: string, base = import.meta.env.BASE_URL || '/', fromRel = ''): string {
  const next = playgroundHref(link, fromRel)
  if (isStaticAssetHref(next)) return withBase(next, base)
  return next
}
