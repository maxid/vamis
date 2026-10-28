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
