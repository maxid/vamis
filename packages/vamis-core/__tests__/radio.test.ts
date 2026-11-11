import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))

describe('radio chrome', () => {
  it('tokens follow Amis 18 circle / 10 filled-dot / solid button', () => {
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(css).toContain('--radio-size: 18px')
    expect(css).toContain('--radio-dot: 10px')
    expect(css).toContain('--radio-gap: 10px')
    expect(css).toContain('--radio-bg: var(--checkbox-bg)')
    expect(css).toContain('border-radius: 50%')
    expect(css).toContain('.vamis-radio--button')
    expect(css).toContain('background-color: var(--primary)')
    expect(css).toContain('color: var(--radio-button-checked-fg)')
    expect(css).toContain('.no-grow')
    expect(css).not.toMatch(/\.vamis-radio-option \{[^}]*display: inline-flex/)
    expect(css).toMatch(/\.vamis-radio-option \{[^}]*display: inline-block/)
  })

  it('form radio keeps native radio, no name, combo inject, no RadioGroup', () => {
    const vue = readFileSync(resolve(here, '../../vamis/src/renderers/form/Radio.vue'), 'utf8')
    expect(vue).toContain('BadgeHost')
    expect(vue).toContain('useComboRadio')
    expect(vue).toContain('type="radio"')
    expect(vue).toContain('vamis-radio__mark')
    expect(vue).toContain('vamis-radio--button')
    expect(vue).not.toContain(':name="fieldName')
    expect(vue).not.toContain('RadioGroup')
    expect(vue).not.toContain("|| '选项'")
    expect(vue).not.toMatch(/import \{[^}]*\bRadioGroup\b/)
  })
})
