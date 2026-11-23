import { describe, expect, it } from 'vitest'
import { normalizeOptions } from '../src/utils/options'
import {
  collectOptionDescendants,
  dumpTreeValue,
  findOptionPath,
  hasTreeAbility,
  isTreeItemCheckDisabled,
  isTreeItemChecked,
  isTreeNodeDefaultExpanded,
  normalizeNodePath,
  toggleTreeSelection,
  treeItemPartial,
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

describe('tree node path values', () => {
  const pathTree = normalizeOptions([
    {
      label: 'A',
      value: 'a',
      children: [
        {
          label: 'B',
          value: 'b',
          children: [{ label: 'C', value: 'c' }],
        },
        { label: 'D', value: 'd' },
      ],
    },
  ])

  it.each([
    {
      name: 'single joined',
      selected: ['c'],
      config: { multiple: false, joinValues: true },
      expected: 'a/b/c',
    },
    {
      name: 'single extracted',
      selected: ['c'],
      config: { multiple: false, joinValues: false, extractValue: true },
      expected: 'a/b/c',
    },
    {
      name: 'single object',
      selected: ['c'],
      config: { multiple: false, joinValues: false, extractValue: false },
      expected: { label: 'A/B/C', value: 'a/b/c' },
    },
    {
      name: 'multiple joined',
      selected: ['c', 'd'],
      config: { multiple: true, joinValues: true },
      expected: 'a/b/c,a/d',
    },
    {
      name: 'multiple extracted',
      selected: ['c', 'd'],
      config: { multiple: true, joinValues: false, extractValue: true },
      expected: ['a/b/c', 'a/d'],
    },
    {
      name: 'multiple objects',
      selected: ['c', 'd'],
      config: { multiple: true, joinValues: false, extractValue: false },
      expected: [
        { label: 'A/B/C', value: 'a/b/c' },
        { label: 'A/D', value: 'a/d' },
      ],
    },
  ])('dumps the Amis $name matrix', ({ selected, config, expected }) => {
    expect(
      dumpTreeValue(selected, pathTree, {
        ...config,
        enableNodePath: true,
        pathSeparator: '/',
      }),
    ).toEqual(expected)
  })

  it('normalizes string and object paths to leaf values', () => {
    expect(
      normalizeNodePath('a/b/c,a/d', true, 'label', 'value', '/', ','),
    ).toEqual({
      nodeValueArray: ['c', 'd'],
      nodePathArray: ['a/b/c', 'a/d'],
    })
    expect(
      normalizeNodePath(
        { label: 'A/B/C', value: 'a/b/c', meta: 'kept' },
        true,
        'label',
        'value',
        '/',
        ',',
      ),
    ).toEqual({
      nodeValueArray: [{ label: 'C', value: 'c', meta: 'kept' }],
      nodePathArray: ['a/b/c'],
    })
  })

  it('uses pathSeparator and custom valueField for path output', () => {
    const customTree = normalizeOptions(
      [
        {
          label: 'Root',
          id: 'r',
          children: [{ label: 'Leaf', id: 'l', meta: 'leaf-meta' }],
        },
      ],
      'label',
      'id',
    )
    expect(
      dumpTreeValue(['l'], customTree, {
        enableNodePath: true,
        labelField: 'label',
        valueField: 'id',
        pathSeparator: '::',
        joinValues: false,
        extractValue: false,
      }),
    ).toEqual({
      label: 'Root::Leaf',
      value: 'l',
      id: 'r::l',
      meta: 'leaf-meta',
    })
  })

  it('keeps leaf values when node path mode is disabled', () => {
    expect(
      dumpTreeValue(['c'], pathTree, {
        enableNodePath: false,
        multiple: false,
        joinValues: false,
      }),
    ).toEqual({ label: 'C', value: 'c' })
  })

  it('clears path mode to resetValue instead of an empty path option', () => {
    expect(
      dumpTreeValue([], pathTree, {
        enableNodePath: true,
        multiple: false,
        joinValues: false,
      }),
    ).toBe('')
    expect(
      dumpTreeValue([], pathTree, {
        enableNodePath: true,
        multiple: true,
        joinValues: false,
        resetValue: null,
      }),
    ).toBeNull()
  })
})

describe('tree toggle', () => {
  const cascadeOff = { multiple: true as const, options: tree }

  it('keeps only the parent in value when autoCheckChildren is the default', () => {
    expect(toggleTreeSelection([], tree[0], cascadeOff)).toEqual([1])
    expect(isTreeItemChecked(tree[0].children![0], [1], cascadeOff)).toBe(true)
    expect(isTreeItemCheckDisabled(tree[0].children![0], [1], cascadeOff)).toBe(true)
    expect(toggleTreeSelection([1], tree[0], cascadeOff)).toEqual([])
    expect(toggleTreeSelection([2], tree[0], { ...cascadeOff, autoCheckChildren: false })).toEqual([2, 1])
  })

  it('puts descendants in the value when cascade or withChildren is on', () => {
    expect(toggleTreeSelection([], tree[0], { ...cascadeOff, cascade: true })).toEqual([1, 2, 3])
    expect(toggleTreeSelection([], tree[0], { ...cascadeOff, withChildren: true })).toEqual([1, 2, 3])
    expect(isTreeItemCheckDisabled(tree[0].children![0], [1, 2, 3], { ...cascadeOff, cascade: true })).toBe(false)
  })

  it('keeps only leaves when onlyChildren is on', () => {
    expect(toggleTreeSelection([], tree[0], { ...cascadeOff, onlyChildren: true })).toEqual([2, 3])
    expect(isTreeItemChecked(tree[0], [2, 3], { ...cascadeOff, onlyChildren: true })).toBe(true)
  })

  it('folds sibling picks back into the parent', () => {
    expect(toggleTreeSelection([2], tree[0].children![1], cascadeOff)).toEqual([1])
  })

  it('drops ancestors when autoCancelParent and cascade are on', () => {
    expect(
      toggleTreeSelection([1, 2, 3], tree[0].children![0], {
        ...cascadeOff,
        cascade: true,
        autoCancelParent: true,
      }),
    ).toEqual([3])
  })

  it('ignores parent picks when onlyLeaf is set', () => {
    expect(toggleTreeSelection([], tree[0], { onlyLeaf: true })).toBeNull()
    expect(toggleTreeSelection([], tree[0].children![0], { onlyLeaf: true })).toEqual([2])
  })

  it('keeps a folder without explicit value unselectable after normalize', () => {
    expect(tree[2].value).toBeUndefined()
    expect(toggleTreeSelection([], tree[2], { multiple: true, options: tree })).toBeNull()
  })
})

describe('tree descendants', () => {
  it('walks nested children without the node itself', () => {
    expect(collectOptionDescendants(tree[0]).map((item) => item.value)).toEqual([2, 3])
  })
})

describe('tree partial and ability', () => {
  it('marks a parent partial when only some children are selected', () => {
    expect(treeItemPartial(tree[0], [])).toBe(false)
    expect(treeItemPartial(tree[0], [2])).toBe(true)
    expect(treeItemPartial(tree[0], [2, 3])).toBe(false)
    expect(treeItemPartial(tree[0], [1], { multiple: true, options: tree })).toBe(false)
    expect(treeItemPartial(tree[1], [4])).toBe(false)
  })

  it('treats missing ability flags as enabled', () => {
    expect(hasTreeAbility(tree[0], 'creatable')).toBe(true)
    expect(hasTreeAbility({ ...tree[0], creatable: false }, 'creatable')).toBe(false)
  })
})
