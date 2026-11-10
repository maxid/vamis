import { computed } from 'vue'
import { describe, expect, it } from 'vitest'
import {
  applyFormItemDefaults,
  applyServerErrors,
  autoFillApi,
  autoFillMapping,
  autoFillRow,
  clearHiddenFormValues,
  collectFormItems,
  formItemHideLabel,
  formItemRequired,
  formItemStatic,
  formItemStaticSchema,
  formItemStaticSelectorNode,
  formItemStaticWords,
  formItemSubmitOnChange,
  formItemValidateOnChange,
  hiddenFieldsToClear,
  validateApiMessage,
} from '../src/utils/form-item'
import { comboChildSchema, comboItemMode, formLayoutSkipCol, groupChildSchema, groupFormMode } from '../src/utils/form-group'
import { resetStatusStore, setStatusStatic, statusStaticOf } from '../src/status-store'
import { getPathValue } from '../src/utils/path-value'
import { validateValue } from '../src/validate'

describe('formItemHideLabel', () => {
  it('only drops the label column when label is false', () => {
    expect(formItemHideLabel({})).toBe(false)
    expect(formItemHideLabel({ label: '数量' })).toBe(false)
    expect(formItemHideLabel({ label: '' })).toBe(false)
    expect(formItemHideLabel({ label: false })).toBe(true)
  })
})

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

  it('lets action override beat schema.static', () => {
    expect(formItemStatic({ static: true }, {}, false, false)).toBe(false)
    expect(formItemStatic({ static: false }, {}, true, true)).toBe(true)
    expect(formItemSubmitOnChange({ submitOnChange: true }, {})).toBe(true)
    expect(formItemSubmitOnChange({}, { submitOnChange: true })).toBe(true)
    expect(formItemSubmitOnChange({ submitOnChange: false }, { submitOnChange: true })).toBe(false)
  })

  it('status store keys by id then name', () => {
    resetStatusStore()
    setStatusStatic('formItemSwitch', true)
    expect(statusStaticOf({ id: 'formItemSwitch', name: 'var1' })).toBe(true)
    setStatusStatic('formItemSwitch', false)
    expect(statusStaticOf({ id: 'formItemSwitch' })).toBe(false)
    resetStatusStore()
    expect(statusStaticOf({ id: 'formItemSwitch' })).toBeUndefined()
  })

  it('status store is reactive for computed readers', () => {
    resetStatusStore()
    const schema = { id: 'formItemSwitch', name: 'var1' }
    const flag = computed(() => statusStaticOf(schema))
    expect(flag.value).toBeUndefined()
    setStatusStatic('formItemSwitch', true)
    expect(flag.value).toBe(true)
    setStatusStatic('formItemSwitch', false)
    expect(flag.value).toBe(false)
    resetStatusStore()
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

  it('turns input-tag staticSchema.limit into tags + words', () => {
    const schema = {
      type: 'input-tag',
      name: 'tags',
      staticSchema: { limit: 3 },
      options: [
        { label: '选项1', value: '选项1' },
        { label: '选项2', value: '选项2' },
      ],
    }
    expect(formItemStaticSchema(schema)).toBeNull()
    expect(formItemStaticWords(schema, '1,2,3,4,5,6,7,8')).toEqual(['1', '2', '3', '4', '5', '6', '7', '8'])
    expect(formItemStaticSelectorNode(schema, '1,2,3,4,5,6,7,8')).toEqual({
      type: 'tags',
      words: ['1', '2', '3', '4', '5', '6', '7', '8'],
      limit: 3,
    })
  })

  it('maps select values to option labels for words static', () => {
    const schema = {
      type: 'select',
      multiple: true,
      options: [
        { label: '苹果', value: 'a' },
        { label: '梨', value: 'b' },
      ],
    }
    expect(formItemStaticSelectorNode(schema, 'a,b')).toEqual({
      type: 'words',
      words: ['苹果', '梨'],
    })
  })
})

describe('validateValue requiredOn', () => {
  it('treats requiredOn as required when the expression is true', () => {
    const schema = { name: 'text', label: '文本', type: 'input-text', requiredOn: 'this.number > 1' }
    expect(validateValue(schema, '', { number: 0 })).toBeNull()
    expect(validateValue(schema, '', { number: 2 })).toBe('这是必填项')
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

describe('groupChildSchema', () => {
  it('lets group mode:inline flow to children that did not set mode', () => {
    const group = { type: 'group', mode: 'inline' }
    expect(groupFormMode(group, 'horizontal')).toBe('inline')
    expect(groupChildSchema({ type: 'input-text', name: 'a' }, group, 'normal')).toEqual({
      type: 'input-text',
      name: 'a',
      mode: 'inline',
    })
    expect(
      groupChildSchema({ type: 'input-text', name: 'b', mode: 'horizontal' }, group, 'normal'),
    ).toEqual({ type: 'input-text', name: 'b', mode: 'horizontal' })
    expect(groupChildSchema({ type: 'input-text', name: 'c', inline: true }, group, 'normal')).toEqual(
      { type: 'input-text', name: 'c', inline: true },
    )
  })

  it('does not stamp normal onto children', () => {
    expect(groupChildSchema({ type: 'input-text', name: 'a' }, { type: 'group' }, 'normal')).toEqual({
      type: 'input-text',
      name: 'a',
    })
  })
})

describe('form row / combo layout', () => {
  it('skips col wrap for inline hidden formula', () => {
    expect(formLayoutSkipCol({ type: 'input-text', name: 'a' })).toBe(false)
    expect(formLayoutSkipCol({ type: 'input-text', inline: true })).toBe(true)
    expect(formLayoutSkipCol({ type: 'hidden', name: 'h' })).toBe(true)
    expect(formLayoutSkipCol({ type: 'formula', name: 'f' })).toBe(true)
    expect(formLayoutSkipCol({ type: 'input-text', mode: 'inline' })).toBe(true)
  })

  it('combo default is row; multiLine uses subFormMode', () => {
    expect(comboItemMode({ type: 'combo' })).toBe('row')
    expect(comboItemMode({ type: 'combo', multiLine: true })).toBe('normal')
    expect(comboItemMode({ type: 'combo', multiLine: true, subFormMode: 'horizontal' })).toBe('horizontal')
    expect(comboChildSchema({ type: 'input-text', name: 'age' }, 'row')).toEqual({
      type: 'input-text',
      name: 'age',
      mode: 'row',
    })
    expect(comboChildSchema({ type: 'input-text', name: 'age', mode: 'inline' }, 'row')).toEqual({
      type: 'input-text',
      name: 'age',
      mode: 'inline',
    })
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

  it('walks grid columns so nested defaults still apply', () => {
    const items = collectFormItems([
      {
        type: 'grid',
        columns: [{ body: [{ type: 'input-text', name: 'name', value: 'amis' }] }],
      },
    ])
    expect(items.map((item) => item.name)).toEqual(['name'])
    expect(applyFormItemDefaults(items, {})).toEqual({ name: 'amis' })
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
