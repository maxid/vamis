/** SwitchContainer。对齐 Amis：只显示首个 visibleOn 命中的状态。 */

import { isVisible } from '../formula'
import type { SchemaNode, SchemaObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function toNodes(node: unknown): SchemaNode[] {
  if (node == null || node === false || node === '') return []
  return Array.isArray(node) ? (node as SchemaNode[]) : [node as SchemaNode]
}

export function switchContainerItems(schema: unknown): SchemaObject[] {
  const items = asRecord(schema).items
  if (!Array.isArray(items)) return []
  const out: SchemaObject[] = []
  for (const item of items) {
    if (item && typeof item === 'object' && !Array.isArray(item)) out.push(item as SchemaObject)
  }
  return out
}

/** `activeIndex >= 0` 时优先该项（对齐 Amis `switchTo`）；否则取首个 `isVisible`。 */
export function switchContainerActive(
  schema: unknown,
  data: Record<string, unknown> = {},
  activeIndex = -1,
): SchemaObject | undefined {
  const items = switchContainerItems(schema)
  if (Number.isInteger(activeIndex) && activeIndex >= 0 && items[activeIndex]) {
    return items[activeIndex]
  }
  return items.find((item) => isVisible(item, data))
}

export function switchContainerBody(item: unknown): SchemaNode[] {
  return toNodes(asRecord(item).body)
}
