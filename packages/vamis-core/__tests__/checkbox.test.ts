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
