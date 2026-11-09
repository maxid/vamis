import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  dropdownButtonAlign,
  dropdownButtonCloseOnClick,
  dropdownButtonCloseOnOutside,
  dropdownButtonHideCaret,
  dropdownButtonItems,
  dropdownButtonTrigger,
} from '../src/utils/dropdown-button'

const here = dirname(fileURLToPath(import.meta.url))

describe('dropdownButtonTrigger / close / caret', () => {
  it('defaults to click, closes outside, keeps menu after click', () => {
    expect(dropdownButtonTrigger({})).toBe('click')
    expect(dropdownButtonTrigger({ trigger: 'hover' })).toBe('hover')
    expect(dropdownButtonCloseOnClick({})).toBe(false)
    expect(dropdownButtonCloseOnClick({ closeOnClick: true })).toBe(true)
    expect(dropdownButtonCloseOnOutside({})).toBe(true)
    expect(dropdownButtonCloseOnOutside({ closeOnOutside: false })).toBe(false)
    expect(dropdownButtonHideCaret({})).toBe(false)
    expect(dropdownButtonHideCaret({ hideCaret: true })).toBe(true)
    expect(dropdownButtonAlign({ align: 'right' })).toBe('right')
  })

  it('DropdownButton.vue uses the shared line caret, not a CSS triangle', () => {
    const vue = readFileSync(resolve(here, '../../vamis/src/renderers/rest/DropdownButton.vue'), 'utf8')
    expect(vue).toContain('VamisCaret')
    expect(vue).toContain('variant="dropdown"')
    expect(vue).toContain('VamisOverlay')
    expect(vue).not.toContain('VamisPopUp')
    expect(vue).toContain(':gap="4"')
    expect(vue).not.toContain('border-t-[4px]')
    expect(vue).not.toContain('absolute z-40')
  })
})

describe('dropdownButtonItems', () => {
  it('reads buttons, groups children, and drops visible:false', () => {
    const items = dropdownButtonItems({
      buttons: [
        { type: 'button', label: '按钮1', disabled: true },
        { label: 'RD', children: [{ type: 'button', label: '前端FE' }] },
        { type: 'divider' },
        { type: 'button', label: '隐藏', visible: false },
      ],
    })
    expect(items.map((item) => item.kind)).toEqual(['item', 'group', 'divider'])
    expect(items[1].label).toBe('RD')
    expect(items[1].children?.[0].label).toBe('前端FE')
  })
})
