/** 树选择纯函数：对齐 Amis Tree / InputTree / TreeSelect 主路径。 */

import { matchOptionValue, optionValuesEqual, type OptionItem } from './options'
import type { PlainObject } from '../types'

export function isTreeInitiallyOpen(schema?: PlainObject | null): boolean {
  return schema?.initiallyOpen !== false
}

export function treeUnfoldedLevel(schema?: PlainObject | null): number {
  const n = Number(schema?.unfoldedLevel)
  return Number.isFinite(n) && n >= 1 ? n : 1
}

/** Amis `eachTree` 的 level 从 1 起；depth 0 = 根。`initiallyOpen: false` 时 `depth < unfoldedLevel - 1`。 */
export function isTreeNodeDefaultExpanded(
  depth: number,
  opts: { initiallyOpen?: boolean; unfoldedLevel?: number } = {},
): boolean {
  if (opts.initiallyOpen !== false) return true
  const level = opts.unfoldedLevel != null && Number.isFinite(opts.unfoldedLevel) && opts.unfoldedLevel >= 1
    ? opts.unfoldedLevel
    : 1
  return depth < level - 1
}

export function collectOptionDescendants(item: OptionItem): OptionItem[] {
  const out: OptionItem[] = []
  const walk = (nodes: OptionItem[] | undefined) => {
    if (!nodes?.length) return
    for (const child of nodes) {
      out.push(child)
      walk(child.children)
    }
  }
  walk(item.children)
  return out
}

export function findOptionPath(
  options: OptionItem[],
  value: unknown,
  valueField = 'value',
): OptionItem[] {
  for (const item of options) {
    if (matchOptionValue(value, item, valueField)) return [item]
    if (item.children?.length) {
      const rest = findOptionPath(item.children, value, valueField)
      if (rest.length) return [item, ...rest]
    }
  }
  return []
}

export function treeNodeLabel(
  options: OptionItem[],
  value: unknown,
  opts: { hideNodePathLabel?: boolean; pathSeparator?: string; valueField?: string } = {},
): string {
  const path = findOptionPath(options, value, opts.valueField || 'value')
  if (!path.length) return value == null ? '' : String(value)
  if (opts.hideNodePathLabel) return path[path.length - 1]?.label ?? ''
  const sep = opts.pathSeparator == null ? '/' : String(opts.pathSeparator)
  return path.map((node) => node.label).join(sep)
}

function hasSelectableValue(item: OptionItem): boolean {
  return item.value != null && item.value !== ''
}

/** 子节点部分勾选时父节点走 Amis Checkbox `partial`。 */
export function treeItemPartial(item: OptionItem, selected: unknown[]): boolean {
  if (!item.children?.length) return false
  const descendants = collectOptionDescendants(item).filter(hasSelectableValue)
  if (!descendants.length) return false
  let n = 0
  for (const node of descendants) {
    if (selected.some((value) => optionValuesEqual(value, node.value))) n++
  }
  return n > 0 && n < descendants.length
}

/** 对齐 Amis `hasAbility`：节点上 `false` 才关掉该项能力。 */
export function hasTreeAbility(item: OptionItem, ability: string): boolean {
  return item[ability] !== false
}

export function toggleTreeSelection(
  selected: unknown[],
  item: OptionItem,
  opts: {
    multiple?: boolean
    onlyLeaf?: boolean
    autoCheckChildren?: boolean
    cascade?: boolean
  } = {},
): unknown[] | null {
  if (opts.onlyLeaf && item.children?.length) return null
  if (!hasSelectableValue(item) && item.children?.length) return null
  if (!opts.multiple) return [item.value]
  const withChildren = !opts.cascade && opts.autoCheckChildren !== false
  const targets = withChildren ? [item, ...collectOptionDescendants(item)] : [item]
  const values = targets.filter(hasSelectableValue).map((node) => node.value)
  if (!values.length) return selected
  const hasAll = values.every((value) => selected.some((cur) => optionValuesEqual(cur, value)))
  if (hasAll) return selected.filter((cur) => !values.some((value) => optionValuesEqual(cur, value)))
  const next = [...selected]
  for (const value of values) {
    if (!next.some((cur) => optionValuesEqual(cur, value))) next.push(value)
  }
  return next
}
