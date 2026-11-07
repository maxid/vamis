import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  checkboxClearValue,
  checkboxFalseValue,
  checkboxIsChecked,
  checkboxResetValue,
  checkboxSetDataValue,
  checkboxTrueValue,
  checkboxWriteValue,
} from '../src/utils/checkbox'

const here = dirname(fileURLToPath(import.meta.url))

describe('checkbox values', () => {
  it('defaults trueValue/falseValue to boolean', () => {
    expect(checkboxTrueValue({})).toBe(true)
    expect(checkboxFalseValue({})).toBe(false)
    expect(checkboxTrueValue({ trueValue: 1 })).toBe(1)
    expect(checkboxFalseValue({ falseValue: 0 })).toBe(0)
  })

  it('uses loose equality against trueValue', () => {
    expect(checkboxIsChecked(true, {})).toBe(true)
    expect(checkboxIsChecked(false, {})).toBe(false)
    expect(checkboxIsChecked(1, { trueValue: 1, falseValue: 0 })).toBe(true)
    expect(checkboxIsChecked(0, { trueValue: 1, falseValue: 0 })).toBe(false)
    expect(checkboxIsChecked(true, { trueValue: 1 })).toBe(true)
    expect(checkboxIsChecked('', {})).toBe(false)
    expect(checkboxIsChecked(undefined, {})).toBe(false)
  })

  it('honors forced checked', () => {
    expect(checkboxIsChecked(false, { checked: true })).toBe(true)
    expect(checkboxIsChecked(true, { checked: false })).toBe(false)
  })

  it('writes trueValue or falseValue', () => {
    expect(checkboxWriteValue(true, { trueValue: 1, falseValue: 0 })).toBe(1)
    expect(checkboxWriteValue(false, { trueValue: 1, falseValue: 0 })).toBe(0)
    expect(checkboxWriteValue(true, {})).toBe(true)
    expect(checkboxWriteValue(false, {})).toBe(false)
  })

  it('clears to empty string', () => {
    expect(checkboxClearValue()).toBe('')
  })

  it('resets to pristine then resetValue then empty', () => {
    expect(checkboxResetValue({ resetValue: 0 }, true)).toBe(true)
    expect(checkboxResetValue({ resetValue: 0 }, undefined)).toBe(0)
    expect(checkboxResetValue({}, undefined)).toBe('')
  })

  it('reads setData payload from value or name', () => {
    expect(checkboxSetDataValue({ value: false })).toBe(false)
    expect(checkboxSetDataValue({ type: 1 }, 'type')).toBe(1)
    expect(checkboxSetDataValue({ other: 1 }, 'type')).toBeUndefined()
  })
})

describe('checkbox chrome', () => {
  it('tokens follow Amis cxd 16×16 / 2px / dark menu surface', () => {
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(css).toContain('--checkbox-size: 16px')
    expect(css).toContain('--checkbox-radius: 2px')
    expect(css).toContain('--checkbox-icon-size: 14px')
    expect(css).toContain('--checkbox-bg: #fff')
    expect(css).toContain('--checkbox-bg: #17202d')
    expect(css).toContain('--checkbox-button-min-w: 80px')
    expect(css).toContain('--checkbox-button-h: 32px')
    expect(css).toContain('opacity: 1')
    expect(css).toContain('.vamis-checkbox--button')
    expect(css).toContain('background-color: transparent')
    expect(css).toContain('display: inline-block')
    expect(css).toMatch(/\.vamis-checkbox-option \{[^}]*display: inline-block/)
    expect(css).toContain('vertical-align: text-bottom')
    expect(css).not.toMatch(/\.vamis-checkbox-option \{[^}]*display: inline-flex/)
    expect(css).toContain('--checkbox-checked-hover: oklch(from var(--primary) calc(l + 0.16) c h)')
    expect(css).toContain('--checkbox-checked-hover: oklch(from var(--primary) calc(l - 0.08) c h)')
    expect(css).toContain('--checkbox-checked-hover-bg: var(--checkbox-checked-hover)')
    expect(css).toContain('color: var(--checkbox-checked-hover)')
    expect(css).toContain('.vamis-checkbox__mark.is-checked:hover:not(.is-disabled)')
    expect(css).toContain('.vamis-select__check.is-checked:hover')
    expect(css).not.toContain('.vamis-checkbox-option:hover:not(.is-disabled).is-checked .vamis-checkbox__mark')
    expect(css).not.toContain('.vamis-select__item:hover .vamis-select__check:not(.is-checked)')
    expect(css).not.toContain('--checkbox-checked-hover-bg: var(--primary-hover)')
    expect(css).not.toMatch(
      /\.vamis-checkbox--button\.is-checked:hover[^{]*\{[^}]*var\(--primary-hover\)/,
    )
  })

  it('form checkbox keeps native name, BadgeHost, and button chrome', () => {
    const vue = readFileSync(resolve(here, '../../vamis/src/renderers/form/Checkbox.vue'), 'utf8')
    expect(vue).toContain('BadgeHost')
    expect(vue).toContain('vamis-checkbox__native')
    expect(vue).not.toContain(':name="fieldName')
    expect(vue).toContain('vamis-checkbox--button')
    expect(vue).toContain('<label')
    expect(vue).not.toContain('<button')
    expect(vue).toContain('vamis-checkbox__mark')
    expect(vue).toContain('@click.prevent="onToggle(!checked)"')
    expect(vue).toContain('data-slot="checkbox"')
    expect(vue).not.toMatch(/import \{[^}]*\bCheckbox\b/)
    expect(vue).not.toMatch(/import \{[^}]*\bButton\b/)
  })
})
