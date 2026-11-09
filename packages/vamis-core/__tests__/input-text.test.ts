import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  appendCreatableOption,
  filterTextOptions,
  highlightTextMatches,
  inputNativeType,
  showPasswordReveal,
  showTextSelectedMarks,
  TEXT_MATCH_RANK,
  rankTextOption,
} from '../src/utils/input-text'

const here = dirname(fileURLToPath(import.meta.url))

describe('input-text match ranking', () => {
  const options = [
    { label: 'pineapple', value: 'pineapple' },
    { label: 'apple pie', value: 'pie' },
    { label: 'apple', value: 'apple' },
    { label: 'banana', value: 'banana' },
  ]

  it('ranks EQUAL / STARTS_WITH ahead of CONTAINS, drops non-matches', () => {
    expect(rankTextOption(options[2], 'apple')).toBe(TEXT_MATCH_RANK.EQUAL)
    expect(rankTextOption(options[1], 'apple')).toBe(TEXT_MATCH_RANK.STARTS_WITH)
    expect(rankTextOption(options[0], 'apple')).toBe(TEXT_MATCH_RANK.CONTAINS)
    expect(rankTextOption(options[3], 'apple')).toBe(TEXT_MATCH_RANK.NONE)
    const filtered = filterTextOptions(options, 'apple', [])
    expect(filtered.map((item) => item.value)).toEqual(['apple', 'pie', 'pineapple'])
  })

  it('skips local ranking when autoComplete drives the list', () => {
    expect(filterTextOptions(options, 'apple', [], { skipLocal: true }).map((item) => item.value)).toEqual([
      'pineapple',
      'pie',
      'apple',
      'banana',
    ])
  })

  it('hides already selected values and can append a creatable row', () => {
    expect(filterTextOptions(options, '', ['apple']).map((item) => item.value)).toEqual(['pineapple', 'pie', 'banana'])
    const next = appendCreatableOption([{ label: 'apple', value: 'apple' }], 'kiwi', [], true, true)
    expect(next[next.length - 1]).toMatchObject({ label: 'kiwi', value: 'kiwi', isNew: true })
    expect(appendCreatableOption(next, 'kiwi', [], true, true)).toHaveLength(next.length)
  })

  it('splits matched spans like Amis highlight()', () => {
    expect(highlightTextMatches('pineapple', 'apple')).toEqual([
      { text: 'pine', matched: false },
      { text: 'apple', matched: true },
    ])
    expect(highlightTextMatches('AA', 'a')).toEqual([
      { text: 'A', matched: true },
      { text: 'A', matched: true },
    ])
    expect(highlightTextMatches('plain', '')).toEqual([{ text: 'plain', matched: false }])
  })
})

describe('input-text selected marks', () => {
  it('keeps creatable:false label visible while focused until the user types', () => {
    expect(
      showTextSelectedMarks({ multiple: false, creatable: false, draft: '', open: true, selectedCount: 1 }),
    ).toBe(true)
    expect(
      showTextSelectedMarks({ multiple: false, creatable: false, draft: '', open: false, selectedCount: 1 }),
    ).toBe(true)
    expect(
      showTextSelectedMarks({ multiple: false, creatable: false, draft: 'Opt', open: true, selectedCount: 1 }),
    ).toBe(false)
    expect(
      showTextSelectedMarks({ multiple: false, creatable: true, draft: '', open: true, selectedCount: 1 }),
    ).toBe(false)
    expect(
      showTextSelectedMarks({ multiple: true, creatable: true, draft: '', open: true, selectedCount: 1 }),
    ).toBe(true)
    expect(
      showTextSelectedMarks({ multiple: true, creatable: true, draft: '', open: false, selectedCount: 0 }),
    ).toBe(false)
  })
})

describe('input-password reveal', () => {
  it('defaults on for input-password and off for other types', () => {
    expect(inputNativeType('input-password')).toBe('password')
    expect(showPasswordReveal({ type: 'input-password' })).toBe(true)
    expect(showPasswordReveal({ type: 'input-password', revealPassword: false })).toBe(false)
    expect(showPasswordReveal({ type: 'input-text' })).toBe(false)
  })
})

describe('input-text renderer reuse', () => {
  it('teleports suggestions and wires password reveal', () => {
    const vue = readFileSync(resolve(here, '../../vamis/src/renderers/form/InputText.vue'), 'utf8')
    expect(vue).toContain('VamisOverlay')
    expect(vue).not.toContain('VamisPopUp')
    expect(vue).toContain('overlayContainerFrom')
    expect(vue).toContain(':gap="4"')
    expect(vue).toContain('VamisPasswordToggle')
    expect(vue).toContain('VamisClear')
    expect(vue).toContain('<VamisClose />')
    expect(vue).not.toMatch(/chip-remove[^>]*>\s*×/)
    expect(vue).toContain('../Spinner.vue')
    expect(vue).toContain("icon: 'reload'")
    expect(vue).toContain("size: 'sm'")
    expect(vue).toContain('vamis-text-control__spinner')
    expect(vue).toContain('vamis-select__clear')
    expect(vue).toContain("revealed.value ? 'encrypt' : 'review'")
    expect(vue).toContain('highlightTextMatches')
    expect(vue).toContain('showTextSelectedMarks')
    expect(vue).toContain('vamis-text-control__value')
    expect(vue).toContain(':size="suggest ? 10 : undefined"')
    expect(vue).not.toContain('z-index: 20')
  })

  it('popover uses select-menu tokens instead of absolute z-20', () => {
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    const start = css.indexOf('.vamis-text-control__popover {')
    const block = css.slice(start, css.indexOf('.vamis-text-control__sug {', start))
    expect(block).toContain('var(--select-menu-bg)')
    expect(block).toContain('var(--select-menu-border)')
    expect(block).not.toMatch(/position:\s*absolute/)
    expect(block).not.toMatch(/z-index:\s*20/)
    expect(css).not.toContain('.vamis-text-control__popover.is-sheet')
    expect(css).not.toContain('.vamis-dropdown-menu.is-sheet')
    expect(css).toContain('--input-password-icon-size: 16px')
    expect(css).toContain('.vamis-text-control__native--password')
    expect(css).toContain('.vamis-text-control__sug .is-matched')
    expect(css).toContain('.vamis-text-control__value')
    const multipleStart = css.indexOf('.vamis-text-control__input--multiple {')
    const multipleBlock = css.slice(multipleStart, css.indexOf('}', multipleStart) + 1)
    expect(multipleBlock).toContain('height: auto')
    expect(multipleBlock).toContain('min-height: var(--control-h)')
    expect(multipleBlock).not.toContain('gap:')
    expect(css).toContain(
      '.vamis-text-control__input--suggest .vamis-text-control__native,\n  .vamis-text-control__input--multiple .vamis-text-control__native',
    )
    expect(css).toContain('min-width: 2em')
    expect(css).toContain('--text-chip-label-max: 60px')
    expect(css).toContain('--text-chip-close-size: 10px')
    const chipStart = css.indexOf('.vamis-text-control__chip {')
    const chipBlock = css.slice(chipStart, css.indexOf('}', chipStart) + 1)
    expect(chipBlock).not.toContain('max-width')
    expect(css).toContain('max-width: var(--text-chip-label-max)')
    const close = readFileSync(resolve(here, '../../vamis-ui/src/ui/VamisClose.vue'), 'utf8')
    expect(close).toContain('m13.5 1.44 1.06 1.06L9.06 8l5.5 5.5')
    expect(close).toContain('class="vamis-close"')
  })

  it('hover follows --primary, focus glow wraps the whole control, addOn keeps 1px seam', () => {
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(css).toContain('--control-hover-border: var(--primary)')
    expect(css).toContain('--control-focus-border: var(--ring)')
    expect(css).toContain(
      '--control-focus-glow: 0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent)',
    )
    expect(css).toContain('--control-focus-addon-color: var(--primary)')
    expect(css).not.toContain('color-mix(in oklch, var(--input) 55%, var(--foreground))')
    expect(css).toContain(
      '.vamis-text-control.is-focused:not(.is-disabled):has(> .vamis-text-control__input--full)',
    )
    expect(css).toContain('box-shadow: var(--control-focus-glow)')
    expect(css).toContain(
      '.vamis-text-control.is-focused:not(.is-disabled) .vamis-text-control__addon--text {\n  color: var(--control-focus-addon-color)',
    )
    expect(css).toContain(
      '.vamis-text-control.is-focused:not(.is-disabled) .vamis-text-control__input--none',
    )
    expect(css).not.toContain('.vamis-text-control.is-focused .vamis-text-control__input--full {')
    const halfStart = css.indexOf('.vamis-text-control__input--half {')
    const halfBlock = css.slice(halfStart, css.indexOf('}', halfStart) + 1)
    expect(halfBlock).toContain('border-top-color: transparent')
    expect(halfBlock).not.toContain('border-radius: 0')
    expect(css).not.toContain(
      '.vamis-text-control--with-addon .vamis-text-control__input:not(:last-child)',
    )
    expect(css).toContain('margin-left: -1px')
    expect(css).toContain(
      '.vamis-text-control:hover:not(.is-disabled) .vamis-text-control__addon--button [data-slot=\'button\']',
    )
    expect(css).toContain(
      '.vamis-text-control.is-focused:not(.is-disabled) .vamis-text-control__addon--button [data-slot=\'button\']',
    )
    const inputStart = css.indexOf('.vamis-text-control__input {')
    const inputBlock = css.slice(inputStart, css.indexOf('}', inputStart) + 1)
    expect(inputBlock).toContain('transition: border-color var(--animation-duration) ease-in-out')
    expect(css).toContain('transition: none')
    expect(css).toContain('.vamis-text-control__addon--text,\n.vamis-text-control__addon--button [data-slot=\'button\']')
    expect(css).toContain('appearance: none')
    expect(css).toContain('--overlay-popover-gap: 4px')
    expect(css).toContain('.vamis-text-control .vamis-spinner')
    expect(css).toContain('.vamis-text-control__spinner')
  })
})
