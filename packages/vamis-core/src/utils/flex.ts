/** Flex 布局语义。对齐 Amis defaultProps：justify center、alignItems stretch、alignContent center、direction row。 */

function asRecord(schema: unknown): Record<string, unknown> {
  return schema && typeof schema === 'object' ? (schema as Record<string, unknown>) : {}
}

function pick(schema: unknown, key: string, fallback: string): string {
  const value = asRecord(schema)[key]
  return typeof value === 'string' && value ? value : fallback
}

export function flexJustify(schema: unknown): string {
  return pick(schema, 'justify', 'center')
}

export function flexAlignItems(schema: unknown): string {
  return pick(schema, 'alignItems', 'stretch')
}

export function flexAlignContent(schema: unknown): string {
  return pick(schema, 'alignContent', 'center')
}

export function flexDirection(schema: unknown): string {
  return pick(schema, 'direction', 'row')
}

export function flexResolvedSchema(schema: unknown, isMobile: boolean): Record<string, unknown> {
  const rec = asRecord(schema)
  const mobile = rec.mobile
  if (!isMobile || !mobile || typeof mobile !== 'object' || Array.isArray(mobile)) return rec
  const next = { ...rec, ...(mobile as Record<string, unknown>) }
  delete next.mobile
  return next
}

export function flexLayoutStyle(schema: unknown): Record<string, string> {
  return {
    display: 'flex',
    flexDirection: flexDirection(schema),
    justifyContent: flexJustify(schema),
    alignItems: flexAlignItems(schema),
    alignContent: flexAlignContent(schema),
    width: '100%',
    height: '100%',
  }
}

export function flexItemStyle(schema: unknown): Record<string, string> {
  const rec = asRecord(schema)
  if (rec.flex != null && rec.flex !== '') return { flex: String(rec.flex) }
  if (rec.grow != null && rec.grow !== '') return { flexGrow: String(rec.grow) }
  return {}
}
