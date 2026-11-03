import { describe, expect, it } from 'vitest'
import {
  applyFormItemDefaults,
  applyServerErrors,
  autoFillApi,
  autoFillMapping,
  autoFillRow,
  clearHiddenFormValues,
  collectFormItems,
  formItemRequired,
  formItemStatic,
  formItemStaticSchema,
  formItemValidateOnChange,
  hiddenFieldsToClear,
  validateApiMessage,
} from '../src/utils/form-item'
import { getPathValue } from '../src/utils/path-value'
import { validateValue } from '../src/validate'

describe('formItemRequired', () => {
  it('honors required and requiredOn', () => {
    expect(formItemRequired({ required: true }, {})).toBe(true)
    expect(formItemRequired({ requiredOn: 'this.number > 1' }, { number: 0 })).toBe(false)
    expect(formItemRequired({ requiredOn: 'this.number > 1' }, { number: 2 })).toBe(true)
  })
})

describe('formItemStatic', () => {
  it('honors static, staticOn, and form-level static', () => {
    expect(formItemStatic({ static: true }, {})).toBe(true)
    expect(formItemStatic({ static: false }, {}, true)).toBe(false)
    expect(formItemStatic({ staticOn: 'this.number > 1' }, { number: 0 })).toBe(false)
    expect(formItemStatic({ staticOn: 'this.number > 1' }, { number: 2 })).toBe(true)
    expect(formItemStatic({}, {}, true)).toBe(true)
  })

  it('wraps staticSchema strings and typed nodes', () => {
    expect(formItemStaticSchema({ staticSchema: { limit: 3 } })).toBeNull()
    expect(formItemStaticSchema({ staticSchema: '前缀' })).toEqual([
      { type: 'tpl', tpl: '前缀', inline: true },
    ])
    const nodes = formItemStaticSchema({
      staticSchema: ['自定义前缀 | ', { type: 'tpl', tpl: '${var3}' }, ' | 自定义后缀'],
    })
    expect(nodes).toHaveLength(3)
    expect(nodes?.[0]).toEqual({ type: 'tpl', tpl: '自定义前缀 | ', inline: true })
    expect(nodes?.[1]).toEqual({ type: 'tpl', tpl: '${var3}' })
  })
})

describe('validateValue requiredOn', () => {
  it('treats requiredOn as required when the expression is true', () => {
    const schema = { name: 'text', label: '文本', type: 'input-text', requiredOn: 'this.number > 1' }
    expect(validateValue(schema, '', { number: 0 })).toBeNull()
    expect(validateValue(schema, '', { number: 2 })).toContain('不能为空')
  })
})

describe('applyFormItemDefaults', () => {
  it('prefers value expressions, then name mapping, then plain value', () => {
    const data = { item1: 'hello world!', item2: 'hello amis!', item3: 'hello amis-editor!' }
    applyFormItemDefaults(
      [
        { name: 'test1', value: '123' },
        { name: 'item1' },
        { name: 'item2', value: '345' },
        { name: 'test4', value: '${item3}' },
        { name: 'person.name', value: 'Ada' },
      ],
      data,
    )
    expect(data.test1).toBe('123')
    expect(data.item1).toBe('hello world!')
    expect(data.item2).toBe('hello amis!')
    expect(data.test4).toBe('hello amis-editor!')
    expect(getPathValue(data, 'person.name')).toBe('Ada')
  })
})

describe('clearValueOnHidden', () => {
  it('lists hidden fields with clearValueOnHidden', () => {
    const items = [
      { name: 'number', value: 0 },
      { name: 'text', hiddenOn: 'this.number > 1', clearValueOnHidden: true },
      { name: 'keep', hiddenOn: 'this.number > 1' },
    ]
    const shown = { number: 0, text: 'hi', keep: 'x' }
    expect(hiddenFieldsToClear(items, shown)).toEqual([])
    const hidden = { number: 2, text: 'hi', keep: 'x' }
    expect(hiddenFieldsToClear(items, hidden)).toEqual(['text'])
    clearHiddenFormValues(items, hidden)
    expect(hidden).toEqual({ number: 2, keep: 'x' })
  })
})

describe('collectFormItems / validateOnChange', () => {
  it('walks group body and reads validateOnChange from item then form', () => {
    const items = collectFormItems([
      { type: 'input-text', name: 'a' },
      { type: 'group', body: [{ type: 'input-text', name: 'b' }] },
    ])
    expect(items.map((item) => item.name)).toEqual(['a', 'b'])
    expect(formItemValidateOnChange({ name: 'a' }, { validateOnChange: true })).toBe(true)
    expect(formItemValidateOnChange({ name: 'a', validateOnChange: false }, { validateOnChange: true })).toBe(false)
    expect(formItemValidateOnChange({ name: 'a', validateOnChange: true }, {})).toBe(true)
  })
})

describe('server errors / autoFill', () => {
  it('writes field errors from an errors object', () => {
    const target: Record<string, string> = {}
    expect(applyServerErrors({ test2: '服务器端说，这个有错误。' }, target)).toBe(true)
    expect(target.test2).toBe('服务器端说，这个有错误。')
    expect(applyServerErrors('当前用户已存在', {})).toBe(false)
  })

  it('reads validateApi string errors', () => {
    expect(validateApiMessage({ status: 422, errors: '当前用户已存在' }, '失败')).toBe('当前用户已存在')
    expect(validateApiMessage({ status: 422, msg: '不行' }, '失败')).toBe('不行')
  })

  it('picks a single autoFill row and mapping', () => {
    expect(autoFillRow({ rows: [{ browser: 'chrome', version: '1' }] })).toEqual({
      browser: 'chrome',
      version: '1',
    })
    expect(autoFillRow({ rows: [{ a: 1 }, { a: 2 }] })).toBeNull()
    expect(autoFillRow({ browser: 'chrome' })).toEqual({ browser: 'chrome' })
    expect(autoFillApi({ autoFill: { api: '/api/x', fillMapping: { v: '${version}' } } })).toBe('/api/x')
    expect(autoFillMapping({ autoFill: { showSuggestion: true, api: '/api/x' } })).toBeNull()
    expect(autoFillMapping({ autoFill: { api: '/api/x', fillMapping: { v: '${version}' } } })).toEqual({
      v: '${version}',
    })
    expect(autoFillMapping({ autoFill: { type: '${type}' } })).toEqual({ type: '${type}' })
  })
})
