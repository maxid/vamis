import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  eachItemNodes,
  eachList,
  eachPlaceholder,
  eachRowData,
} from '../src/utils/each'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')

describe('each', () => {
  it('value beats source beats name', () => {
    const data = { arr: ['A'], other: ['X'], value: ['V'] }
    expect(eachList({ value: ['V'], source: '${arr}', name: 'other' }, data)).toEqual(['V'])
    expect(eachList({ source: '${arr}', name: 'other' }, data)).toEqual(['A'])
    expect(eachList({ name: 'arr' }, data)).toEqual(['A'])
  })

  it('maps object keys to {key,value} and slices maxLength', () => {
    expect(eachList({ value: { a: 1, b: 2 } }, {})).toEqual([
      { key: 'a', value: 1 },
      { key: 'b', value: 2 },
    ])
    expect(eachList({ value: [1, 2, 3, 4], maxLength: 2 }, {})).toEqual([1, 2])
    expect(eachList({ value: [1, 2, 3, 4], maxLength: '${n}' }, { n: 3 })).toEqual([1, 2, 3])
  })

  it('placeholder defaults to 暂无数据', () => {
    expect(eachPlaceholder({})).toBe('暂无数据')
    expect(eachPlaceholder({ placeholder: 'placeholder.noData' })).toBe('暂无数据')
    expect(eachPlaceholder({ placeholder: '暂无内容' })).toBe('暂无内容')
  })

  it('primitive items expose name field; objects keep index before custom keys', () => {
    expect(eachRowData({ name: 'arr' }, 'A', 0)).toEqual({ arr: 'A', item: 'A', index: 0 })
    const row = eachRowData({ itemKeyName: 'itemOutter', indexKeyName: 'indexOutter' }, { name: 'a' }, 1)
    expect(row.index).toBe(1)
    expect(row.indexOutter).toBe(1)
    expect(row.itemOutter).toEqual({ name: 'a' })
    expect(row.name).toBe('a')
  })

  it('maps name/label in item schema without baking nested each templates', () => {
    const nodes = eachItemNodes(
      {
        source: '${arr}',
        items: { type: 'input-text', label: 'Input${item}', name: 'text${index}' },
      },
      'A',
      0,
    )
    expect(nodes).toEqual([{ type: 'input-text', label: 'InputA', name: 'text0' }])
    const nested = eachItemNodes(
      {
        name: 'arr',
        items: [
          { type: 'tpl', tpl: '${name}:${index}' },
          { type: 'each', name: 'subList', items: [{ type: 'tpl', tpl: '${item}' }] },
        ],
      },
      { name: 'a', subList: ['a1'] },
      0,
    )
    expect((nested[1] as { items: unknown[] }).items).toEqual([{ type: 'tpl', tpl: '${item}' }])
  })

  it('supports maxLength and doc chapters', () => {
    const vue = read('../../vamis/src/renderers/Each.vue')
    expect(vue).toContain('eachList')
    expect(vue).toContain('vamis-each')
    const doc = read('../../../website/src/components/each.md')
    for (const h of [
      '## 基本用法',
      '### 如果是对象数组',
      '### 循环嵌套',
      '## 用作 Field 时',
      '## 使用数据映射',
      '## 动态表单项',
      '## 属性表',
    ]) {
      expect(doc).toContain(h)
    }
    expect(doc).toContain('静态展示each')
    expect(doc).toContain('Input${item}')
  })
})
