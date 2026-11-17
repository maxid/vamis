import { describe, expect, it } from 'vitest'
import { normalizeOptions } from '../src/utils/options'
import {
  collectOptionDescendants,
  findOptionPath,
  isTreeNodeDefaultExpanded,
  toggleTreeSelection,
  treeNodeLabel,
} from '../src/utils/tree'

const tree = normalizeOptions([
  {
    label: 'Folder A',
    value: 1,
    children: [
      { label: 'file A', value: 2 },
      { label: 'file B', value: 3 },
    ],
  },
  { label: 'file C', value: 4 },
  {
    label: 'Folder E',
    children: [{ label: 'file H', value: 6 }],
  },
])

describe('tree expand defaults', () => {
  it('opens every node when initiallyOpen is the default', () => {
    expect(isTreeNodeDefaultExpanded(0)).toBe(true)
    expect(isTreeNodeDefaultExpanded(3, { initiallyOpen: true, unfoldedLevel: 1 })).toBe(true)
  })

  it('uses unfoldedLevel when initiallyOpen is false', () => {
    expect(isTreeNodeDefaultExpanded(0, { initiallyOpen: false, unfoldedLevel: 1 })).toBe(false)
    expect(isTreeNodeDefaultExpanded(0, { initiallyOpen: false, unfoldedLevel: 2 })).toBe(true)
    expect(isTreeNodeDefaultExpanded(1, { initiallyOpen: false, unfoldedLevel: 2 })).toBe(false)
  })
})

describe('tree path labels', () => {
  it('joins ancestors unless hideNodePathLabel is set', () => {
    expect(findOptionPath(tree, 2).map((item) => item.label)).toEqual(['Folder A', 'file A'])
    expect(treeNodeLabel(tree, 2)).toBe('Folder A/file A')
    expect(treeNodeLabel(tree, 2, { hideNodePathLabel: true })).toBe('file A')
    expect(treeNodeLabel(tree, 2, { pathSeparator: ' / ' })).toBe('Folder A / file A')
  })
})

describe('tree toggle', () => {
  it('checks descendants when autoCheckChildren is on', () => {
    expect(toggleTreeSelection([], tree[0], { multiple: true })).toEqual([1, 2, 3])
    expect(toggleTreeSelection([1, 2, 3], tree[0], { multiple: true })).toEqual([])
    expect(toggleTreeSelection([2], tree[0], { multiple: true, autoCheckChildren: false })).toEqual([2, 1])
  })

  it('ignores parent picks when onlyLeaf is set', () => {
    expect(toggleTreeSelection([], tree[0], { onlyLeaf: true })).toBeNull()
    expect(toggleTreeSelection([], tree[0].children![0], { onlyLeaf: true })).toEqual([2])
  })

  it('uses the folder label as value after normalize', () => {
    expect(tree[2].value).toBe('Folder E')
    expect(toggleTreeSelection([], tree[2], { multiple: true })).toEqual(['Folder E', 6])
  })
})

describe('tree descendants', () => {
  it('walks nested children without the node itself', () => {
    expect(collectOptionDescendants(tree[0]).map((item) => item.value)).toEqual([2, 3])
  })
})
