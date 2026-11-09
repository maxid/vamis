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
  dropdownButtonTooltipConfig,
  dropdownButtonTrigger,
  provideDropdownMenuItem,
  useDropdownMenuItem,
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
    expect(vue).toContain('provideDropdownMenuItem')
    expect(vue).toContain('vamis-dropdown-menu')
    expect(vue).toContain('vamis-dropdown-item')
    expect(vue).toContain('VamisTooltipLayer')
    expect(vue).toContain('dropdownButtonTooltipConfig')
    expect(vue).not.toContain(':title="tooltip')
    expect(vue).not.toContain('bg-popover')
    expect(vue).not.toContain('border-t-[4px]')
    expect(vue).not.toContain('absolute z-40')
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(css).toContain('.vamis-dropdown-menu')
    expect(css).toContain('--dropdown-menu-min-width: 160px')
    expect(css).toContain('.vamis-dropdown-item.is-disabled')
    expect(css).toContain('filter: grayscale(80%)')
    expect(css).not.toMatch(/\.vamis-dropdown-menu[^{]*bg-popover/)
  })
})

describe('dropdownButtonTooltipConfig', () => {
  it('reads tooltip / placement / disabledTip like Amis TooltipWrapper', () => {
    expect(dropdownButtonTooltipConfig({ tooltip: '提示' })?.content).toBe('提示')
    expect(dropdownButtonTooltipConfig({ tooltip: '提示', placement: 'bottom' })?.placement).toBe('bottom')
    expect(dropdownButtonTooltipConfig({ tooltip: '提示' }, {}, true)).toBeNull()
    expect(dropdownButtonTooltipConfig({ tooltip: '提示', disabledTip: '禁用了' }, {}, true)?.content).toBe('禁用了')
  })
})

describe('dropdown menu item inject', () => {
  it('exports menu-item inject for Action isMenuItem', () => {
    expect(typeof provideDropdownMenuItem).toBe('function')
    expect(typeof useDropdownMenuItem).toBe('function')
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
