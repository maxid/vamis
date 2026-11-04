import { describe, expect, it } from 'vitest'
import { addRule, parseValidations, validateValue } from '../src/validate'

describe('form validations', () => {
  it('parses string rules and reports minLength / maximum / matchRegexp', () => {
    const schema = {
      type: 'input-text',
      name: 'reg',
      label: '正则',
      validations: 'minLength:2,maximum:10,matchRegexp:/^abc/',
    }
    expect(parseValidations(schema)).toMatchObject({
      minLength: 2,
      maximum: 10,
      matchRegexp: '/^abc/',
    })
    expect(validateValue(schema, 'a')).toBe('请输入更多的内容，至少输入 2 个字符。')
    expect(validateValue(schema, 'abcd')).toBeNull()
    expect(validateValue({ ...schema, validationErrors: { matchRegexp: '请输入 abc 开头' } }, 'xyz')).toBe(
      '请输入 abc 开头',
    )
  })

  it('keeps required empty-check with Amis default copy', () => {
    expect(validateValue({ name: 'n', label: '名称', required: true, type: 'input-text' }, '')).toBe('这是必填项')
    expect(validateValue({ name: 'n', label: '名称', required: true, type: 'input-text' }, 'Ada')).toBeNull()
  })

  it('stops at the first failing object rule', () => {
    const schema = {
      type: 'input-text',
      name: 'text',
      validations: { isNumeric: true, minimum: 10 },
    }
    expect(validateValue(schema, 'abc')).toBe('请输入数字')
    expect(validateValue(schema, '3')).toBe('当前输入值低于最小值 10')
    expect(validateValue(schema, '12')).toBeNull()
  })

  it('substitutes $1 in validationErrors', () => {
    const schema = {
      type: 'input-text',
      name: 'text',
      validations: { isNumeric: true, minimum: 10 },
      validationErrors: { minimum: '同学，最少输入$1以上的数字哈' },
    }
    expect(validateValue(schema, '3')).toBe('同学，最少输入10以上的数字哈')
  })

  it('validates isUrl schemes object', () => {
    const schema = {
      type: 'input-text',
      name: 'url',
      validations: { isUrl: { schemes: ['https'] } },
    }
    expect(validateValue(schema, 'http://example.com')).toBe('URL 格式不正确')
    expect(validateValue(schema, 'https://example.com')).toBeNull()
  })

  it('resolves validationErrors locale keys like validate.isNumeric', () => {
    const schema = {
      type: 'input-text',
      name: 'text',
      validations: { isNumeric: true },
      validationErrors: { isNumeric: 'validate.isNumeric' },
    }
    expect(validateValue(schema, 'abc')).toBe('请输入数字')
  })

  it('lets addRule return { error, msg } like Amis', () => {
    addRule('isZXS', (_values, value) => {
      if (value === '北京') return true
      if (value === '新加坡') return { error: true, msg: '该地区不在国内' }
      return { error: true, msg: '输入的不是直辖市' }
    })
    expect(validateValue({ type: 'input-text', name: 'city', validations: { isZXS: true } }, '北京')).toBeNull()
    expect(validateValue({ type: 'input-text', name: 'city', validations: { isZXS: true } }, '新加坡')).toBe(
      '该地区不在国内',
    )
    expect(validateValue({ type: 'input-text', name: 'city', validations: { isZXS: true } }, '杭州')).toBe(
      '输入的不是直辖市',
    )
  })
})
