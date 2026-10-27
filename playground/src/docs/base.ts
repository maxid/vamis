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

export function playgroundHref(link: string): string {
  if (!link || link.startsWith('http') || link.startsWith('#')) return link
  if (
    link.startsWith('/components') ||
    link.startsWith('/style') ||
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

/** 文档 `<a href>`：SDK 静态页要带 Vite base，否则 GitHub Pages 会跳到站点根外。 */
export function docHref(link: string, base = import.meta.env.BASE_URL || '/'): string {
  const next = playgroundHref(link)
  if (isStaticAssetHref(next)) return withBase(next, base)
  return next
}
