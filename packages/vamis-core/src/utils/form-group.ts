/** Amis Group：把 `mode` / `subFormMode` 传给未写 mode 的子项。 */

import type { SchemaObject } from '../types'

export function groupFormMode(group: SchemaObject, formMode?: string): string {
  return String(group.subFormMode || group.mode || formMode || 'normal')
}

/**
 * Amis Form mode=row / Group--hor：hidden、formula、inline 不包列盒。
 * 其余包 Form-col / Form-groupColumn，flex:1 均分。
 */
export function formLayoutSkipCol(node: SchemaObject | undefined): boolean {
  if (!node || typeof node !== 'object') return true
  const type = String(node.type || '')
  return node.inline === true || String(node.mode || '') === 'inline' || type === 'hidden' || type === 'formula'
}

/** Combo 默认 multiLine:false → 内嵌表单 mode:row；多行才走 subFormMode。 */
export function comboItemMode(schema: SchemaObject): string {
  if (schema.multiLine === true) return String(schema.subFormMode || 'normal')
  return 'row'
}

/**
 * Combo `multiple` 里点 `type: radio`：当前行 trueValue，其余行 falseValue。
 * 项数不足 2 或首项不是对象时返回 null，交给 Radio 自己写字段。
 */
export function comboApplyRadio(
  rows: unknown,
  index: number,
  name: string,
  trueValue: unknown,
  falseValue: unknown,
): Record<string, unknown>[] | null {
  if (!name || !Array.isArray(rows) || rows.length < 2) return null
  const first = rows[0]
  if (!first || typeof first !== 'object' || Array.isArray(first)) return null
  return rows.map((item, i) => ({
    ...(item && typeof item === 'object' && !Array.isArray(item) ? (item as Record<string, unknown>) : {}),
    [name]: i === index ? trueValue : falseValue,
  }))
}

export function comboChildSchema(node: SchemaObject, itemMode: string): SchemaObject {
  if (!node || typeof node !== 'object') return node
  if (node.mode || node.inline === true) return node
  if (!itemMode || itemMode === 'normal') return node
  return { ...node, mode: itemMode }
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
