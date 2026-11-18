import { describe, expect, it } from 'vitest'
import { filterTpl, resolveValue } from '../src/formula'

describe('Amis extended filters', () => {
  it('handles serialization, strings, URLs and arithmetic', () => {
    expect(resolveValue('${text|toJson}', { text: '{"a":1}' })).toEqual({ a: 1 })
    expect(resolveValue('${text|toFloat}', { text: '1.5' })).toBe(1.5)
    expect(filterTpl('${text|trim|upperCase}', { text: ' vamis ' })).toBe('VAMIS')
    expect(filterTpl('${n|round:1}', { n: 1.26 })).toBe('1.3')
    expect(filterTpl('${text|url_encode|url_decode}', { text: '中文 值' })).toBe('中文 值')
    expect(resolveValue('${n|plus:2|times:3|minus:1|division:2}', { n: 4 })).toBe(8.5)
    expect(resolveValue('${n|abs}', { n: -2 })).toBe(2)
  })

  it('handles arrays, objects, map and filter', () => {
    const data = {
      items: [{ name: 'a', value: 2 }, { name: 'b', value: 1 }, { name: 'a', value: 2 }],
      text: 'a,b',
      object: { a: 'A' },
    }
    expect(resolveValue('${items|unique:name|sortBy:value:numerical:desc|pick:name}', data)).toEqual(['a', 'b'])
    expect(resolveValue('${text|split|join:-}', data)).toBe('a-b')
    expect(resolveValue('${items|nth:1|pick:name}', data)).toBe('b')
    expect(resolveValue('${object|objectToArray}', data)).toEqual([{ label: 'A', value: 'a' }])
    expect(resolveValue('${items|pick:name|map:upperCase}', data)).toEqual(['A', 'B', 'A'])
    expect(resolveValue('${items|filter:name:match:a|count}', data)).toBe(2)
    expect(resolveValue('${items|asArray|count}', { items: 1 })).toBe(1)
    expect(resolveValue('${items|concat:["c"]|count}', { items: ['a'] })).toBe(2)
  })

  it('handles conditional filters and base64 round trips', () => {
    expect(resolveValue("${ok|isTrue:'yes':'no'}", { ok: true })).toBe('yes')
    expect(resolveValue("${ok|isFalse:'yes':'no'}", { ok: false })).toBe('yes')
    expect(resolveValue("${text|isMatch:'^v':'yes':'no'}", { text: 'vamis' })).toBe('yes')
    expect(resolveValue("${text|notEquals:'other':'yes':'no'}", { text: 'vamis' })).toBe('yes')
    const encoded = resolveValue('${text|base64Encode}', { text: '中文 Vamis' })
    expect(resolveValue('${text|base64Decode}', { text: encoded })).toBe('中文 Vamis')
  })

  it('handles duration, bytes, topAndOther and dates', () => {
    expect(filterTpl('${n|duration}', { n: 3661 })).toBe('1时1分1秒')
    expect(filterTpl('${n|bytes}', { n: 1024 })).toBe('1.02 KB')
    expect(resolveValue('${items|topAndOther:2:name:其他}', {
      items: [{ name: 'A', count: 1 }, { name: 'B', count: 2 }, { name: 'C', count: 3 }],
    })).toEqual([{ name: 'A', count: 1 }, { name: '其他', count: 5 }])
    expect(resolveValue('${d|toDate|dateModify:add:1:day}', { d: '2024-01-01' })).toBeInstanceOf(Date)
    expect(filterTpl('${d|fromNow}', { d: new Date() })).toContain('前')
  })
})
