import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseValidations } from '../src/validate'
import {
  NUMBER_STEP_DELAY,
  NUMBER_STEP_INTERVAL,
  decimalAdd,
  filterNumberProp,
  formatNumberValue,
  getNumberPrecision,
  normalizeNumberPrecision,
  normalizeNumberValue,
  numberAttachUnit,
  numberFormatter,
  numberIsNumeric,
  numberReverter,
  numberStepValue,
  numberStripUnit,
  numberUnitFromValue,
  numberUnitOptions,
} from '../src/utils/input-number'

const here = dirname(fileURLToPath(import.meta.url))

describe('input-number math', () => {
  it('isNumeric matches Amis helper', () => {
    expect(numberIsNumeric(0)).toBe(true)
    expect(numberIsNumeric(1.2)).toBe(true)
    expect(numberIsNumeric('1.2')).toBe(true)
    expect(numberIsNumeric('.5')).toBe(true)
    expect(numberIsNumeric('1.')).toBe(false)
    expect(numberIsNumeric('')).toBe(false)
    expect(numberIsNumeric('10px')).toBe(false)
  })

  it('precision follows step when higher', () => {
    expect(normalizeNumberPrecision(2, 0.01)).toBe(2)
    expect(normalizeNumberPrecision(undefined, 0.001)).toBe(3)
    expect(normalizeNumberPrecision(-1, 1)).toBe(0)
    expect(getNumberPrecision(1.234)).toBe(3)
  })

  it('normalizeValue clamps and truncates extra digits', () => {
    expect(normalizeNumberValue(3.129, undefined, undefined, 2, '', false, false)).toBe(3.12)
    expect(normalizeNumberValue(5, 10, 20, 0, '', false, false)).toBe(10)
    expect(normalizeNumberValue(50, 0, 20, 0, '', false, false)).toBe(20)
    expect(normalizeNumberValue('abc', undefined, undefined, 0, 0, false, false)).toBe(0)
    expect(normalizeNumberValue('abc', undefined, undefined, 0, 'x', true, false)).toBeUndefined()
  })

  it('formatNumberValue rounds like toFixed', () => {
    expect(formatNumberValue(2.98786, 2, false)).toBe(2.99)
  })

  it('kilobit formatter / reverter', () => {
    expect(numberFormatter(111111, 0)).toBe('111,111')
    expect(numberReverter('111,111')).toBe('111111')
    expect(numberFormatter(1234.5, 2)).toBe('1,234.50')
  })

  it('decimalAdd avoids 0.1 + 0.2 drift', () => {
    expect(decimalAdd(0.1, 0.2)).toBe('0.3')
    expect(numberStepValue(1, 0.1, 1, 1, false)).toBe(1.1)
  })

  it('unit parse prefers longer suffix', () => {
    const options = numberUnitOptions(['px', '%', 'em'])
    expect(numberUnitFromValue('12px', options)).toBe('px')
    expect(numberStripUnit('12px', 'px')).toBe('12')
    expect(numberAttachUnit(12, 'px')).toBe('12px')
  })

  it('filterNumberProp reads templates', () => {
    expect(filterNumberProp('${min}', { min: 8 })).toBe(8)
    expect(filterNumberProp(3, {})).toBe(3)
    expect(filterNumberProp('nope', {})).toBeUndefined()
  })

  it('input-number defaults to isNumeric validation', () => {
    expect(parseValidations({ type: 'input-number', name: 'n' }).isNumeric).toBe(true)
  })
})

describe('input-number chrome', () => {
  it('tokens follow Amis handler 24 / unit 56 / pad 12', () => {
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(css).toContain('--number-handler-w: 24px')
    expect(css).toContain('--number-unit-min: 56px')
    expect(css).toContain('--number-pad-x: 10px')
  })

  it('focus glow wraps the whole Number group; enhance stays shrink-to-fit', () => {
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(css).toContain(
      '.vamis-number-control:has(> .vamis-number.is-focused:not(.is-disabled):not(.vamis-number--border-none):not(.is-mobile))',
    )
    expect(css).toContain('.vamis-number-control:has(> .vamis-number.is-enhance):not(.is-with-unit)')
    expect(css).toContain('.vamis-number.is-enhance {\n  display: inline-flex')
    expect(css).toContain('.vamis-number.is-enhance .vamis-number__native {\n  /* block + width:auto')
  })

  it('right-side handlers long-press like rc-input-number StepHandler', () => {
    expect(NUMBER_STEP_DELAY).toBe(600)
    expect(NUMBER_STEP_INTERVAL).toBe(200)
    const vue = readFileSync(resolve(here, '../../vamis/src/renderers/form/InputNumber.vue'), 'utf8')
    expect(vue).toContain('startHold')
    expect(vue).toContain('@mouseleave="stopHold"')
    expect(vue).not.toMatch(/enhance-btn[\s\S]{0,200}startHold/)
  })
})
