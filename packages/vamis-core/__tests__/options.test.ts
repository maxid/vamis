import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  applyOptionsAutoFill,
  dumpJoined,
  dumpOptionsValue,
  filterOptions,
  firstEnabledOption,
  flattenOptions,
  getSelectedOptions,
  isAllSelected,
  isOptionsEmpty,
  isOptionsVariableSource,
  matchOptionValue,
  normalizeOptions,
  optionValuesEqual,
  optionsAutoFillContext,
  optionsControlConfig,
  optionsCreateBtnLabel,
  optionsEditDialogTitle,
  optionsFromPayload,
  removeOptionFromTree,
  updateOptionInTree,
  optionsValueConfig,
  parseJoined,
  parseOptionsValue,
  resolveOptionsSource,
  toggleAllOptions,
  toggleOption,
} from '../src/utils/options'

const here = dirname(fileURLToPath(import.meta.url))

describe('normalizeOptions', () => {
  it('accepts standard objects, primitives, comma strings and maps', () => {
    expect(normalizeOptions(['A', 'B']).map((item) => item.value)).toEqual(['A', 'B'])
    expect(normalizeOptions('A,B,C').map((item) => item.label)).toEqual(['A', 'B', 'C'])
    expect(normalizeOptions({ a: 'A', b: 'B' })).toEqual([
      expect.objectContaining({ label: 'A', value: 'a' }),
      expect.objectContaining({ label: 'B', value: 'b' }),
    ])
    expect(normalizeOptions([{ label: 'A', value: 'a', extra: 1 }])[0]).toMatchObject({
      label: 'A',
      value: 'a',
      extra: 1,
    })
  })

  it('maps labelField / valueField and keeps disabled / children', () => {
    const list = normalizeOptions(
      [{ text: 'A', val: 'a', disabled: true, children: [{ text: 'A1', val: 'a1' }] }],
      'text',
      'val',
    )
    expect(list[0].label).toBe('A')
    expect(list[0].value).toBe('a')
    expect(list[0].disabled).toBe(true)
    expect(normalizeOptions([{ label: 'A', value: 'a' }])[0].disabled).toBeUndefined()
    expect(list[0].children?.[0]).toMatchObject({ label: 'A1', value: 'a1' })
  })

  it('does not invent a label when labelField is missing', () => {
    const list = normalizeOptions([{ text: 'A', value: 'a' }])
    expect(list[0].label).toBe('')
    expect(list[0].value).toBe('a')
    expect(normalizeOptions([{ text: 'A', value: 'a' }], 'text')[0].label).toBe('A')
  })
})

describe('value join / extract', () => {
  const options = normalizeOptions([
    { label: 'A', value: 'a' },
    { label: 'B', value: 'b' },
    { label: 'C', value: 'c' },
  ])

  it('joins multiple values with delimiter by default', () => {
    const selected = getSelectedOptions('a,c', options, { multiple: true })
    expect(selected.map((item) => item.label)).toEqual(['A', 'C'])
    expect(dumpOptionsValue(selected, { multiple: true })).toBe('a,c')
    expect(dumpOptionsValue(selected, { multiple: true, delimiter: '|' })).toBe('a|c')
    expect(parseJoined('a|c', true, true, '|')).toEqual(['a', 'c'])
  })

  it('returns the option object when joinValues is false', () => {
    const selected = getSelectedOptions({ label: 'B', value: 'b' }, options, { joinValues: false })
    expect(dumpOptionsValue(selected, { joinValues: false })).toMatchObject({ label: 'B', value: 'b' })
    expect(dumpOptionsValue(selected, { multiple: true, joinValues: false })).toEqual([
      expect.objectContaining({ value: 'b' }),
    ])
  })

  it('extracts values when joinValues is false and extractValue is true', () => {
    const selected = getSelectedOptions(['a', 'b'], options, {
      multiple: true,
      joinValues: false,
      extractValue: true,
    })
    expect(dumpOptionsValue(selected, { multiple: true, joinValues: false, extractValue: true })).toEqual(['a', 'b'])
    expect(dumpOptionsValue(selected, { joinValues: false, extractValue: true })).toBe('a')
  })

  it('keeps dumpJoined / parseJoined for existing callers', () => {
    expect(parseJoined('a,b', true)).toEqual(['a', 'b'])
    expect(dumpJoined(['a', 'b'], true)).toBe('a,b')
    expect(dumpJoined(['a'], false)).toBe('a')
    expect(parseOptionsValue('', { multiple: true })).toEqual([])
    expect(isOptionsEmpty('')).toBe(true)
    expect(isOptionsEmpty([])).toBe(true)
    expect(isOptionsEmpty('a')).toBe(false)
  })
})

describe('toggle / checkAll / selectFirst', () => {
  const options = normalizeOptions([
    { label: 'A', value: 'a' },
    { label: 'B', value: 'b', disabled: true },
    { label: 'C', value: 'c' },
  ])

  it('toggles multiple and clears single when clearable', () => {
    const once = toggleOption(options[0], [], { multiple: true })
    const twice = toggleOption(options[0], once, { multiple: true })
    expect(once.map((item) => item.value)).toEqual(['a'])
    expect(twice).toEqual([])
    expect(toggleOption(options[0], [options[0]], { clearable: true })).toEqual([])
    expect(toggleOption(options[2], [options[0]], {})[0].value).toBe('c')
  })

  it('selects enabled options for checkAll and skips disabled', () => {
    const all = toggleAllOptions([], options)
    expect(all.map((item) => item.value)).toEqual(['a', 'c'])
    expect(isAllSelected(all, options)).toBe(true)
    expect(toggleAllOptions(all, options)).toEqual([])
    expect(firstEnabledOption(options)?.value).toBe('a')
  })

  it('filters by label or value', () => {
    expect(filterOptions(options, 'C').map((item) => item.value)).toEqual(['c'])
    expect(filterOptions(options, 'a').map((item) => item.value)).toEqual(['a'])
  })
})

describe('source helpers', () => {
  it('detects data-scope variables versus api urls', () => {
    expect(isOptionsVariableSource('${items}')).toBe(true)
    expect(isOptionsVariableSource('$items')).toBe(true)
    expect(isOptionsVariableSource('/api/mock2/form/getOptions')).toBe(false)
    expect(isOptionsVariableSource('https://example.com/opt')).toBe(false)
    expect(resolveOptionsSource('${items}', { items: [{ label: 'A', value: 'a' }] })).toEqual([
      { label: 'A', value: 'a' },
    ])
  })

  it('reads options / items / value from payload', () => {
    expect(optionsFromPayload([{ label: 'A', value: 'a' }]).list).toHaveLength(1)
    expect(optionsFromPayload({ options: [{ label: 'A', value: 'a' }], value: 'a' })).toEqual({
      list: [{ label: 'A', value: 'a' }],
      value: 'a',
    })
    expect(optionsFromPayload({ items: [{ label: 'B', value: 'b' }] }).list).toEqual([{ label: 'B', value: 'b' }])
  })
})

describe('autoFill from selected options', () => {
  const options = normalizeOptions([
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
  ])

  it('maps single selection fields and respects fillIfNotSet', () => {
    const selected = getSelectedOptions('a', options, {})
    const filled = applyOptionsAutoFill(
      { 'option.instantValidate': '${label}' },
      selected,
      false,
      {},
      'fillIfNotSet',
    )
    expect(filled['option.instantValidate']).toBe('Option A')
    const skipped = applyOptionsAutoFill(
      { 'option.instantValidate': '${label}' },
      selected,
      false,
      { option: { instantValidate: 'kept' } },
      'fillIfNotSet',
    )
    expect(skipped['option.instantValidate']).toBeUndefined()
  })

  it('exposes items for multiple autoFill', () => {
    const ctx = optionsAutoFillContext(
      { type: 'select', multiple: true, options },
      'a,b',
      {},
      options,
    )
    expect(Array.isArray(ctx?.items)).toBe(true)
    expect((ctx?.items as { label: string }[]).map((item) => item.label)).toEqual(['Option A', 'Option B'])
  })
})

describe('schema helpers', () => {
  it('reads value config and create label', () => {
    expect(optionsValueConfig({ type: 'multi-select', delimiter: '|', joinValues: false, extractValue: true })).toMatchObject({
      multiple: true,
      delimiter: '|',
      joinValues: false,
      extractValue: true,
    })
    expect(optionsCreateBtnLabel({ optionLabel: '员工' })).toBe('新增员工')
    expect(optionsCreateBtnLabel({ createBtnLabel: '添加' })).toBe('添加')
    expect(optionsEditDialogTitle({ optionLabel: '员工' })).toBe('编辑员工')
    expect(optionsControlConfig({ editable: true, removable: true })).toMatchObject({
      editable: true,
      removable: true,
    })
    expect(optionsControlConfig({ editApi: '/api/edit' }).editable).toBe(true)
    expect(optionsControlConfig({ deleteApi: '/api/del' }).removable).toBe(true)
    expect(optionsControlConfig({ editable: false, editApi: '/api/edit' }).editable).toBe(false)
    expect(matchOptionValue('a', { label: 'A', value: 'a' })).toBe(true)
    expect(optionValuesEqual('1', 1)).toBe(true)
    expect(flattenOptions([{ label: 'P', value: 'p', children: [{ label: 'C', value: 'c' }] }]).map((item) => item.label)).toEqual([
      'P / C',
    ])
  })
})

describe('edit / delete tree', () => {
  it('updates and removes an option without dropping siblings', () => {
    const tree = normalizeOptions([
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b', children: [{ label: 'B1', value: 'b1' }] },
      { label: 'C', value: 'c' },
    ])
    const edited = updateOptionInTree(tree, tree[0], { label: 'AA' })
    expect(edited[0]).toMatchObject({ label: 'AA', value: 'a' })
    expect(edited[1].children?.[0].value).toBe('b1')
    const nested = updateOptionInTree(tree, tree[1].children![0], { label: 'B1x' })
    expect(nested[1].children?.[0]).toMatchObject({ label: 'B1x', value: 'b1' })
    expect(removeOptionFromTree(tree, tree[2]).map((item) => item.value)).toEqual(['a', 'b'])
    expect(removeOptionFromTree(tree, tree[1].children![0])[1].children).toEqual([])
  })
})

describe('select uses the shared contract', () => {
  it('Select.vue and useOptionsControl consume core helpers', () => {
    const select = readFileSync(resolve(here, '../../vamis/src/renderers/form/Select.vue'), 'utf8')
    const hook = readFileSync(resolve(here, '../../vamis/src/optionsControl.ts'), 'utf8')
    expect(select).toContain('useOptionsControl')
    expect(select).toContain('VamisOverlay')
    expect(select).toContain('ctl.config.value.editable')
    expect(select).toContain('ctl.config.value.removable')
    expect(hook).toContain('loadOptionsFromSource')
    expect(hook).toContain('toggleAllOptions')
    expect(hook).toContain('dumpOptionsValue')
    expect(hook).toContain('isApiOutdated')
    expect(hook).toContain('editOption')
    expect(hook).toContain('deleteOption')
  })
})
