/** Collapse / collapse-group 展开态。对齐 Amis `activeKey` + accordion。 */

export function normalizeActiveKeys(activeKey: unknown, accordion = false): string[] {
  const list = Array.isArray(activeKey) ? activeKey : activeKey == null || activeKey === false ? [] : [activeKey]
  const keys = list.filter((item) => item != null && item !== '').map((item) => String(item))
  if (accordion) return keys.slice(0, 1)
  return keys
}

export function collapseItemKey(item: unknown, index: number): string {
  if (item && typeof item === 'object' && 'key' in item) {
    const key = (item as { key?: unknown }).key
    if (key != null && key !== '') return String(key)
  }
  return String(index)
}

export function standaloneCollapsed(schema: unknown): boolean {
  if (!schema || typeof schema !== 'object') return true
  const rec = schema as { collapsed?: unknown; active?: unknown }
  if (rec.collapsed === false || rec.active === true) return false
  return true
}

export function toggleCollapse(
  activeKeys: string[],
  key: string,
  accordion: boolean,
): { activeKeys: string[]; collapsed: boolean } {
  const id = String(key)
  const open = activeKeys.includes(id)
  if (open) {
    const next = accordion ? [] : activeKeys.filter((item) => item !== id)
    return { activeKeys: next, collapsed: true }
  }
  const next = accordion ? [id] : [...activeKeys, id]
  return { activeKeys: next, collapsed: false }
}
