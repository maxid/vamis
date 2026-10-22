import { describe, expect, it } from 'vitest'
import { evalExpression, evalTemplate, filterTpl } from '../src/formula'

describe('D2 template string main path', () => {
  it('leaves plain text unchanged', () => {
    expect(filterTpl('Hello World!', {})).toBe('Hello World!')
  })

  it('interpolates ${text} from the data domain', () => {
    expect(filterTpl('Hello ${text}', { text: 'World!' })).toBe('Hello World!')
    expect(filterTpl('Hello ${text}', {})).toBe('Hello ')
  })

  it('evaluates a ternary inside ${}', () => {
    expect(filterTpl("${xxx == 1 ? 'One' : 'Others'}", { xxx: 1 })).toBe('One')
    expect(filterTpl("${xxx == 1 ? 'One' : 'Others'}", { xxx: 0 })).toBe('Others')
  })

  it('reads ${xxx} from the domain, not ${data.xxx}', () => {
    expect(filterTpl("${xxx === 'a'}", { xxx: 'a' })).toBe('true')
    expect(filterTpl("${data.xxx === 'a'}", { xxx: 'a' })).not.toBe('true')
  })

  it('matches Amis Tpl: static tags stay, interpolations default to |html', () => {
    const plain = evalTemplate('<h1>Hello</h1> <span>${text}</span>', { text: 'World!' }, { asHtml: true })
    expect(plain.html).toBe('<h1>Hello</h1> <span>World!</span>')
    const escaped = evalTemplate(
      '<h1>Hello</h1> <span>${text}</span>',
      { text: '<b>World!</b>' },
      { asHtml: true },
    )
    expect(escaped.html).toBe('<h1>Hello</h1> <span>&lt;b&gt;World!&lt;&#x2F;b&gt;</span>')
  })

  it('lets |raw keep markup inside asHtml', () => {
    const result = evalTemplate(
      '<h1>Hello</h1> <span>${text|raw}</span>',
      { text: '<b>World!</b>' },
      { asHtml: true },
    )
    expect(result.html).toBe('<h1>Hello</h1> <span><b>World!</b></span>')
  })
})

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

describe('D2 expression main path', () => {
  it('reads members, index expressions and computed keys', () => {
    const data = { a: 1, key: 'y', obj: { x: 2, y: 3 }, arr: [1, 2, 3] }
    expect(filterTpl('${a + 1}', data)).toBe('2')
    expect(filterTpl('${obj.x}', data)).toBe('2')
    expect(filterTpl("${obj['x']}", data)).toBe('2')
    expect(filterTpl('${obj[key]}', data)).toBe('3')
    expect(filterTpl('${arr[0]}', data)).toBe('1')
    expect(filterTpl('${arr[a]}', data)).toBe('2')
    expect(filterTpl('${arr[a + 1]}', data)).toBe('3')
  })

  it('reads a variable whose name contains dots via backslash escape', () => {
    expect(filterTpl('${com\\.xxx\\.xx}', { 'com.xxx.xx': 'abc' })).toBe('abc')
  })

  it('runs formula functions and single-expression arrows', () => {
    expect(filterTpl('${AVG(1, 2, 3, 4)}', {})).toBe('2.5')
    expect(filterTpl("${IF(score > 80, '优秀', '继续努力')}", { score: 81 })).toBe('优秀')
    expect(filterTpl('${ARRAYMAP(arr, item => item * 2)}', { arr: [1, 2, 3] })).toBe('2,4,6')
  })
})

describe('evalExpression visibleOn', () => {
  it('treats missing fields as undefined without typeof', () => {
    expect(evalExpression('${id !== undefined}', {})).toBe(false)
    expect(evalExpression('${id !== undefined}', { id: 1 })).toBe(true)
  })

  it('does not parse JS typeof as a unary operator', () => {
    expect(evalExpression("${typeof id !== 'undefined'}", { id: 1 })).toBe(false)
    expect(evalExpression("typeof data.id !== 'undefined'", { id: 1 })).toBe(false)
  })
})
