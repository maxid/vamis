import { describe, expect, it } from 'vitest'
import {
  extendLocale,
  getDefaultLocale,
  localeFormatter,
  makeTranslator,
  normalizeLocale,
  registerLocale,
  removeLocaleData,
  setDefaultLocale,
} from '../src/locale'
import { validateValue } from '../src/validate'
import { applySchemaLocale, replaceSchemaText } from '../src/utils/schema-locale'

describe('locale registry', () => {
  it('normalizes Amis locale aliases and formats translation variables', () => {
    expect(normalizeLocale('en')).toBe('en-US')
    expect(normalizeLocale('zh')).toBe('zh-CN')
    expect(normalizeLocale('de_DE')).toBe('de-DE')
    expect(localeFormatter('Hello {{user.name}}', { user: { name: 'Ada' } })).toBe('Hello Ada')
    expect(localeFormatter('\\{{literal}}')).toBe('{{literal}}')
  })

  it('registers extensions and falls back to the default locale, then the key', () => {
    registerLocale('ja-JP', { 'Form.submit': '送信', 'Custom.greet': 'こんにちは {{name}}' })
    const translate = makeTranslator('ja-JP')
    expect(translate('Form.submit')).toBe('送信')
    expect(translate('Custom.greet', { name: 'Ada' })).toBe('こんにちは Ada')
    expect(translate('Form.title')).toBe('表单')
    expect(translate('missing.key')).toBe('missing.key')

    extendLocale('ja-JP', { 'Form.submit': '更新' }, false)
    expect(translate('Form.submit')).toBe('送信')
    removeLocaleData('ja-JP', 'Custom.greet')
    expect(translate('Custom.greet')).toBe('Custom.greet')
  })

  it('uses a configured default locale as the fallback', () => {
    const previous = getDefaultLocale()
    setDefaultLocale('en')
    expect(makeTranslator('ja-JP')('Form.title')).toBe('Form')
    setDefaultLocale(previous)
  })
})

describe('schema locale and text replacement', () => {
  it('applies nested locale overrides without mutating the source schema', () => {
    const source = {
      type: 'form',
      title: '表单',
      'en-US': { type: 'panel', title: 'Account' },
      body: [{
        type: 'select',
        label: '姓名',
        'en-US': { label: 'Username' },
        options: [{ label: '选项', value: 'a', 'en-US': { label: 'Option' } }],
      }],
    }
    const localized = applySchemaLocale(source, 'en-US')
    expect(localized).toEqual({
      type: 'panel',
      title: 'Account',
      body: [{
        type: 'select',
        label: 'Username',
        options: [{ label: 'Option', value: 'a' }],
      }],
    })
    expect(source.title).toBe('表单')
    expect(source['en-US']).toEqual({ type: 'panel', title: 'Account' })
  })

  it('replaces text recursively while protecting functional schema keys', () => {
    const source = {
      type: 'VAMIS_HOST',
      name: 'VAMIS_HOST',
      reload: 'VAMIS_HOST',
      tpl: 'VAMIS_HOST/docs',
      label: 'custom VAMIS_HOST',
      body: [{ tpl: 'VAMIS_HOST' }],
    }
    const output = replaceSchemaText(source, { VAMIS_HOST: 'https://vamis.example' }, ['label'])
    expect(output).toEqual({
      type: 'VAMIS_HOST',
      name: 'VAMIS_HOST',
      reload: 'VAMIS_HOST',
      tpl: 'https://vamis.example/docs',
      label: 'custom VAMIS_HOST',
      body: [{ tpl: 'https://vamis.example' }],
    })
    expect(source.tpl).toBe('VAMIS_HOST/docs')
  })

  it('supports callback ignores and longest replacement keys first', () => {
    const output = replaceSchemaText(
      { tpl: 'HOST + HOST', url: 'HOST' },
      { HOST: 'short', 'HOST + HOST': 'long' },
      (key) => key === 'url',
    )
    expect(output).toEqual({ tpl: 'long', url: 'HOST' })
  })
})

describe('localized validation messages', () => {
  it('translates built-in and custom locale-key messages', () => {
    const translate = makeTranslator('en-US')
    expect(validateValue({ type: 'input-text', required: true }, '', {}, translate)).toBe('This is required')
    expect(validateValue(
      { type: 'input-text', validations: { isNumeric: true }, validationErrors: { isNumeric: 'validate.isNumeric' } },
      'abc',
      {},
      translate,
    )).toBe('Please enter a number')
    expect(validateValue({ type: 'input-text', validations: { minLength: 2 } }, 'a', {}, translate)).toBe(
      'Please enter more, at least 2 characters.',
    )
  })
})
