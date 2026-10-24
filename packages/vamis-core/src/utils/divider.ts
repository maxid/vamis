/** Divider 线条语义。对齐 Amis `lineStyle` / `direction` / `titlePosition` / `color` / `rotate`。 */

export type DividerLineStyle = 'solid' | 'dashed'
export type DividerDirection = 'horizontal' | 'vertical'
export type DividerTitlePosition = 'left' | 'center' | 'right'

function asRecord(schema: unknown): Record<string, unknown> {
  return schema && typeof schema === 'object' ? (schema as Record<string, unknown>) : {}
}

export function dividerLineStyle(schema: unknown): DividerLineStyle {
  return asRecord(schema).lineStyle === 'dashed' ? 'dashed' : 'solid'
}

export function dividerDirection(schema: unknown): DividerDirection {
  return asRecord(schema).direction === 'vertical' ? 'vertical' : 'horizontal'
}

export function dividerTitlePosition(schema: unknown): DividerTitlePosition {
  const pos = asRecord(schema).titlePosition
  return pos === 'left' || pos === 'right' ? pos : 'center'
}

export function dividerHasTitle(schema: unknown): boolean {
  if (dividerDirection(schema) === 'vertical') return false
  const title = asRecord(schema).title
  return title != null && title !== false && title !== ''
}

export function dividerLineColor(color: unknown): Record<string, string> {
  if (typeof color !== 'string' || !color) return {}
  if (color.includes('linear-gradient')) return { borderImage: `${color} 10` }
  return { borderColor: color }
}

export function dividerTransform(style: unknown, rotate: unknown): string {
  const current =
    style && typeof style === 'object' && typeof (style as { transform?: unknown }).transform === 'string'
      ? (style as { transform: string }).transform
      : ''
  if (rotate == null || rotate === false || rotate === '') return current
  return `${current} rotate(${rotate}deg)`
}
