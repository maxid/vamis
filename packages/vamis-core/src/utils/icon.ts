/** 图标识别。对齐 Amis `generateIcon` / `amis-ui` Icon：含 `.` 当图片；`<svg` 当内联；否则 class。 */

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

export type ResolvedIcon =
  | { kind: 'empty' }
  | { kind: 'url'; src: string }
  | { kind: 'svg'; html: string }
  | { kind: 'symbol'; id: string }
  | { kind: 'class'; className: string }
  | { kind: 'missing'; raw: unknown }

export function iconVendor(schema: unknown, fallback?: string): string | undefined {
  const rec = asRecord(schema)
  if (!Object.prototype.hasOwnProperty.call(rec, 'vendor')) return fallback
  if (rec.vendor == null) return fallback
  return String(rec.vendor)
}

function classNameFor(icon: string, vendor?: string): string {
  let effective = vendor
  if (vendor === 'fa' && /(^|\s)fa[srb]?(?:-|\s)/.test(icon)) effective = undefined
  let prefix = icon
  if (effective === 'iconfont') prefix = `iconfont icon-${icon}`
  else if (effective === 'fa') prefix = `fa fa-${icon}`
  return prefix && prefix !== icon ? `${icon} ${prefix}` : icon
}

/** Amis `amis-ui` `registerIcon('plus')`。`type: icon` 先走注册 SVG，不要 `vendor: fa` 编成 `fa fa-plus`。Action 的 `fa fa-plus` 仍走 class。 */
const ICON_PLUS_SVG =
  '<svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" class="icon-plus" aria-hidden="true"><path d="M6.6 6.6V12H5.4V6.6H0V5.4h5.4V0h1.2v5.4H12v1.2z" fill="currentColor"/></svg>'

const BUILTIN_ICON_SVG: Record<string, string> = {
  plus: ICON_PLUS_SVG,
  add: ICON_PLUS_SVG,
}

export function iconBuiltinSvg(icon: unknown): string {
  return typeof icon === 'string' ? BUILTIN_ICON_SVG[icon] || '' : ''
}

export function resolveIcon(icon: unknown, options: { vendor?: string } = {}): ResolvedIcon {
  if (icon == null || icon === false || icon === '') return { kind: 'empty' }

  if (typeof icon === 'object' && !Array.isArray(icon)) {
    const rec = icon as Record<string, unknown>
    if (rec.type === 'icon' && rec.icon) return resolveIcon(rec.icon, options)
    if (typeof rec.id === 'string' && rec.id.startsWith('svg-')) {
      return { kind: 'symbol', id: rec.id.replace(/^svg-/, '') }
    }
    return { kind: 'missing', raw: icon }
  }

  if (typeof icon !== 'string') return { kind: 'missing', raw: icon }
  if (icon.startsWith('<svg')) return { kind: 'svg', html: icon }
  if (icon.includes('.')) return { kind: 'url', src: icon }
  return { kind: 'class', className: classNameFor(icon, options.vendor) }
}
