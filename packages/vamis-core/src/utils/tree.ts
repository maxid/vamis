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

export interface TreeCheckOpts {
  multiple?: boolean
  onlyLeaf?: boolean
  autoCheckChildren?: boolean
  cascade?: boolean
  withChildren?: boolean
  onlyChildren?: boolean
  autoCancelParent?: boolean
  valueField?: string
  options?: OptionItem[]
}

function selectedHas(selected: unknown[], value: unknown): boolean {
  return selected.some((cur) => optionValuesEqual(cur, value))
}

function selectedAdd(selected: unknown[], value: unknown): unknown[] {
  return selectedHas(selected, value) ? selected : [...selected, value]
}

function selectedRemove(selected: unknown[], value: unknown): unknown[] {
  return selected.filter((cur) => !optionValuesEqual(cur, value))
}

function autoCheckOn(opts: TreeCheckOpts): boolean {
  return opts.autoCheckChildren !== false
}

/** 对齐 Amis Tree `relations`：按 value 找父节点。 */
export function findOptionParent(
  options: OptionItem[],
  item: OptionItem,
  valueField = 'value',
): OptionItem | undefined {
  for (const node of options) {
    if (node.children?.some((child) => child === item || optionValuesEqual(child.value, item.value))) {
      return node
    }
    if (node.children?.length) {
      const found = findOptionParent(node.children, item, valueField)
      if (found) return found
    }
  }
}

/** 对齐 Amis `isParentChecked`：祖先只要有一个在值里，子节点就算勾上。 */
export function isTreeParentChecked(
  item: OptionItem,
  selected: unknown[],
  opts: TreeCheckOpts = {},
): boolean {
  const options = opts.options || []
  const valueField = opts.valueField || 'value'
  let current: OptionItem | undefined = item
  const seen = new Set<OptionItem>()
  while (current && !seen.has(current)) {
    seen.add(current)
    const parent = findOptionParent(options, current, valueField)
    if (!parent) return false
    if (selectedHas(selected, parent.value)) return true
    current = parent
  }
  return false
}

/**
 * 对齐 Amis `isItemChecked`。
 * cascade / withChildren 关着时，子节点不进值，但父节点在值里时 UI 仍勾选。
 */
export function isTreeItemChecked(
  item: OptionItem,
  selected: unknown[],
  opts: TreeCheckOpts = {},
): boolean {
  if (selectedHas(selected, item.value)) return true
  if (opts.onlyChildren && autoCheckOn(opts) && item.children?.length) {
    if (item.children.every((child) => isTreeItemChecked(child, selected, opts))) return true
  }
  if (!opts.multiple || !autoCheckOn(opts) || opts.withChildren || opts.cascade) return false
  return isTreeParentChecked(item, selected, opts)
}

/**
 * 对齐 Amis `isItemDisabled` 的级联分支：cascade 默认 false 时，
 * 被父节点带着勾上的子节点禁止反选。
 */
export function isTreeItemCheckDisabled(
  item: OptionItem,
  selected: unknown[],
  opts: TreeCheckOpts = {},
): boolean {
  if (item.disabled) return true
  if (!opts.multiple || !autoCheckOn(opts)) return false
  const parent = opts.options?.length
    ? findOptionParent(opts.options, item, opts.valueField || 'value')
    : undefined
  if (!parent) return false
  if (!isTreeItemChecked(item, selected, opts)) return false
  if (!isTreeItemChecked(parent, selected, opts)) return false
  if (opts.onlyChildren) return false
  return !opts.cascade
}

/** 子节点部分勾选时父节点走 Amis Checkbox `partial`。 */
export function treeItemPartial(
  item: OptionItem,
  selected: unknown[],
  opts: TreeCheckOpts = {},
): boolean {
  if (!item.children?.length) return false
  if (isTreeItemChecked(item, selected, opts)) return false
  if (opts.options || opts.onlyChildren || opts.cascade || opts.withChildren) {
    return item.children.some(
      (child) => isTreeItemChecked(child, selected, opts) || treeItemPartial(child, selected, opts),
    )
  }
  const descendants = collectOptionDescendants(item).filter(hasSelectableValue)
  if (!descendants.length) return false
  let n = 0
  for (const node of descendants) {
    if (selectedHas(selected, node.value)) n++
  }
  return n > 0 && n < descendants.length
}

/** 对齐 Amis `hasAbility`：节点上 `false` 才关掉该项能力。 */
export function hasTreeAbility(item: OptionItem, ability: string): boolean {
  return item[ability] !== false
}

/**
 * 对齐 Amis Tree `handleCheck`。
 * 默认 autoCheckChildren + cascade false：值只留父节点，子孙从值里拿掉，UI 靠 isTreeItemChecked 勾上。
 */
export function toggleTreeSelection(
  selected: unknown[],
  item: OptionItem,
  opts: TreeCheckOpts = {},
): unknown[] | null {
  if (opts.onlyLeaf && item.children?.length) return null
  if (!hasSelectableValue(item) && item.children?.length) return null
  if (!opts.multiple) return [item.value]
  if (isTreeItemCheckDisabled(item, selected, opts)) return null
  const uiChecked = isTreeItemChecked(item, selected, opts)
  const descendants = collectOptionDescendants(item)
  if (!uiChecked) {
    let next = hasSelectableValue(item) ? selectedAdd(selected, item.value) : [...selected]
    if (!autoCheckOn(opts)) return next
    if (opts.onlyChildren) {
      if (item.children?.length) next = selectedRemove(next, item.value)
      for (const child of descendants) {
        if (child.disabled || child.children?.length || !hasSelectableValue(child)) continue
        next = selectedAdd(next, child.value)
      }
    } else {
      for (const child of descendants) {
        if (child.disabled || !hasSelectableValue(child)) continue
        next = selectedRemove(next, child.value)
        if (opts.withChildren || opts.cascade) next = selectedAdd(next, child.value)
      }
      let toCheck: OptionItem | undefined = item
      const valueField = opts.valueField || 'value'
      const tree = opts.options || []
      while (toCheck) {
        const parent = findOptionParent(tree, toCheck, valueField)
        if (!parent || !hasSelectableValue(parent) || selectedHas(next, parent.value)) break
        if (!parent.children?.every((child) => selectedHas(next, child.value))) break
        if (!opts.cascade && !opts.withChildren) {
          for (const child of parent.children) next = selectedRemove(next, child.value)
        }
        next = selectedAdd(next, parent.value)
        toCheck = parent
      }
    }
    return next
  }
  let next = selectedRemove(selected, item.value)
  if (autoCheckOn(opts) && (opts.cascade || opts.withChildren || opts.onlyChildren)) {
    for (const child of descendants) {
      if (!child.disabled) next = selectedRemove(next, child.value)
    }
  }
  if (opts.autoCancelParent && opts.cascade) {
    let toCheck: OptionItem | undefined = item
    const valueField = opts.valueField || 'value'
    const tree = opts.options || []
    while (toCheck) {
      const parent = findOptionParent(tree, toCheck, valueField)
      if (!parent || !selectedHas(next, parent.value)) break
      next = selectedRemove(next, parent.value)
      toCheck = parent
    }
  }
  return next
}
