/** Amis Group：把 `mode` / `subFormMode` 传给未写 mode 的子项。 */

import type { SchemaObject } from '../types'

export function groupFormMode(group: SchemaObject, formMode?: string): string {
  return String(group.subFormMode || group.mode || formMode || 'normal')
}

/** 子项已写 `mode` / `inline: true` 则不覆盖；否则继承 group 的 formMode。 */
export function groupChildSchema(
  node: SchemaObject,
  group: SchemaObject,
  formMode?: string,
): SchemaObject {
  if (!node || typeof node !== 'object') return node
  if (node.mode || node.inline === true) return node
  const mode = groupFormMode(group, formMode)
  if (!mode || mode === 'normal') return node
  return { ...node, mode }
}
