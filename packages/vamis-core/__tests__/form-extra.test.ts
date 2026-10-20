import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { registerRenderer, resolveRenderer, unRegisterRenderer } from '../src/factory'
import {
  DATE_PART_TYPES,
  FORM_EXTRA_TYPES,
  flattenArrayRows,
  formatQuarter,
  inflateArrayRows,
  kvRowsFromValue,
  normalizeConditionValue,
  parseQuarter,
  readRangeValue,
  valueFromKvRows,
  writeRangeValue,
} from '../src/form-extra'
import { compileIrToWidget, parseToIr, yamlFromIr } from '../src/ir'

const dummy = { name: 'Dummy' } as any

function collectTypes(node: unknown, out: string[] = []): string[] {
  if (!node || typeof node !== 'object') return out
  if (Array.isArray(node)) {
    node.forEach((item) => collectTypes(item, out))
    return out
  }
  const obj = node as Record<string, unknown>
  if (typeof obj.type === 'string') out.push(obj.type)
  for (const value of Object.values(obj)) collectTypes(value, out)
  return out
}

describe('form extra helpers', () => {
  it('round-trips kv object <-> rows and skips blank keys', () => {
    const rows = kvRowsFromValue({ env: 'prod', retries: 3 })
    expect(rows).toEqual([
      { key: 'env', value: 'prod' },
      { key: 'retries', value: 3 },
    ])
    expect(valueFromKvRows([...rows, { key: '  ', value: 'x' }])).toEqual({
      env: 'prod',
      retries: 3,
    })
  })

  it('reads and writes range pairs without inventing date aliases', () => {
    expect(readRangeValue({ start: '2026-01', end: '2026-03' })).toEqual({
      start: '2026-01',
      end: '2026-03',
    })
    expect(writeRangeValue({ start: '2024', end: '2026' }, '~')).toBe('2024~2026')
  })

  it('parses quarter literals as YYYY-Qn', () => {
    expect(parseQuarter('2026-Q2')).toEqual({ year: '2026', quarter: '2' })
    expect(formatQuarter('2026', '3')).toBe('2026-Q3')
    expect(parseQuarter('')).toEqual({ year: '', quarter: '' })
  })

  it('normalizes condition-builder to field + op + value children', () => {
    const value = normalizeConditionValue({
      conjunction: 'or',
      children: [{ left: { field: 'status' }, op: 'equal', right: 'enabled' }],
    })
    expect(value.conjunction).toBe('or')
    expect(value.children[0]).toMatchObject({ field: 'status', op: 'equal', value: 'enabled' })
  })

  it('flattens input-array rows to scalars', () => {
    expect(inflateArrayRows(['a', 'b'], 'item')).toEqual([{ item: 'a' }, { item: 'b' }])
    expect(flattenArrayRows([{ item: 'a' }, { item: 'b' }], 'item', true)).toEqual(['a', 'b'])
  })
})

describe('form extra renderer types', () => {
  it('registers month/quarter/year as independent types, not input-date aliases', () => {
    registerRenderer({ type: 'input-date', component: dummy })
    for (const type of DATE_PART_TYPES) {
      registerRenderer({ type, component: dummy })
    }
    expect(resolveRenderer('input-month')?.type).toBe('input-month')
    expect(resolveRenderer('input-quarter')?.type).toBe('input-quarter')
    expect(resolveRenderer('input-year')?.type).toBe('input-year')
    expect(resolveRenderer('input-month-range')?.type).toBe('input-month-range')
    expect(resolveRenderer('input-quarter-range')?.type).toBe('input-quarter-range')
    expect(resolveRenderer('input-year-range')?.type).toBe('input-year-range')
    expect(resolveRenderer('input-month')?.type).not.toBe('input-date')
    expect(resolveRenderer('input-month-range')?.type).not.toBe('input-date-range')
    unRegisterRenderer('input-date')
    for (const type of DATE_PART_TYPES) unRegisterRenderer(type)
  })

  it('keeps editor and input-rich-text as distinct types', () => {
    registerRenderer({ type: 'input-rich-text', component: dummy })
    registerRenderer({ type: 'editor', component: dummy })
    expect(resolveRenderer('editor')?.type).toBe('editor')
    expect(resolveRenderer('input-rich-text')?.type).toBe('input-rich-text')
    expect(resolveRenderer('editor')?.type).not.toBe('input-rich-text')
    unRegisterRenderer('editor')
    unRegisterRenderer('input-rich-text')
  })
})

describe('form-extra YAML', () => {
  it('round-trips playground form-extra.yaml without jdbcType or date aliases', () => {
    const yamlPath = resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../../../playground/src/examples/form-extra.yaml',
    )
    const yaml = readFileSync(yamlPath, 'utf8')
    const ir = parseToIr(yaml)
    const widget = compileIrToWidget(ir)
    const dumped = yamlFromIr(ir)
    expect(dumped).not.toContain('jdbcType')
    expect(dumped).not.toContain('javaType')
    expect(dumped).toContain('required: true')
    expect(dumped).toContain('multiple: true')
    expect(dumped).toContain('collapsed: false')
    expect(dumped).not.toMatch(/multiple: ["']true["']/)
    const types = collectTypes(widget)
    for (const type of FORM_EXTRA_TYPES) {
      expect(types).toContain(type)
    }
    expect(types).not.toContain('input-date')
    expect(types.filter((type) => type === 'input-month')).toHaveLength(1)
    expect(types.filter((type) => type === 'input-month-range')).toHaveLength(1)
  })
})
