import { describe, expect, it } from 'vitest'
import { evalTemplate, filterTpl } from '../src/formula'

describe('D2 evalTemplate', () => {
  it('keeps interpolations as text unless |raw', () => {
    const result = evalTemplate('你好，${name}', { name: '<b>Ada</b>' })
    expect(result.text).toBe('你好，<b>Ada</b>')
    expect(result.html).toBeUndefined()
    expect(result.usedFilters).not.toContain('raw')
  })

  it('exposes html when |raw is used', () => {
    const result = evalTemplate('你好，${name|raw}', { name: '<b>Ada</b>' })
    expect(result.html).toBe('你好，<b>Ada</b>')
    expect(result.usedFilters).toContain('raw')
  })

  it('escapes other interpolations when mixed with |raw', () => {
    const result = evalTemplate('${plain} ${html|raw}', { plain: '<x>', html: '<b>ok</b>' })
    expect(result.html).toBe('&lt;x&gt; <b>ok</b>')
  })
})

describe('D2 runtime filters', () => {
  it('|json stringifies objects', () => {
    expect(filterTpl('${obj|json}', { obj: { a: 1 } })).toBe('{"a":1}')
  })

  it('|date formats with a moment pattern', () => {
    expect(filterTpl("${d|date:'YYYY/MM/DD':'YYYY-MM-DD'}", { d: '2021-06-15' })).toBe('2021/06/15')
  })

  it('|datetime formats a datetime string', () => {
    expect(filterTpl("${t|datetime:'YYYY-MM-DD HH:mm'}", { t: '2021-01-01 15:04:05' })).toBe(
      '2021-01-01 15:04',
    )
  })

  it('|number adds thousands separators', () => {
    expect(filterTpl('${n|number}', { n: 1234567.89 })).toBe('1,234,567.89')
  })

  it('|percent multiplies by 100', () => {
    expect(filterTpl('${n|percent}', { n: 0.12 })).toBe('12%')
    expect(filterTpl('${n|percent:2}', { n: 0.1234 })).toBe('12.34%')
  })

  it('|truncate shortens long text', () => {
    expect(filterTpl('${s|truncate:5}', { s: 'hello world' })).toBe('hello...')
  })

  it('|default still fills empty values', () => {
    expect(filterTpl("${age|default:'-'}", {})).toBe('-')
  })
})
