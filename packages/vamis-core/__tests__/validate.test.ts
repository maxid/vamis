import { describe, expect, it } from 'vitest'
import { parseValidations, validateValue } from '../src/validate'

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
    expect(validateValue(schema, 'a')).toContain('长度')
    expect(validateValue(schema, 'abcd')).toBeNull()
    expect(validateValue({ ...schema, validationErrors: { matchRegexp: '请输入 abc 开头' } }, 'xyz')).toBe(
      '请输入 abc 开头',
    )
  })

  it('keeps required empty-check', () => {
    expect(validateValue({ name: 'n', label: '名称', required: true, type: 'input-text' }, '')).toContain('不能为空')
    expect(validateValue({ name: 'n', label: '名称', required: true, type: 'input-text' }, 'Ada')).toBeNull()
  })
})
