import { describe, expect, it } from 'vitest'
import { buttonGroupButtons, buttonGroupTiled, buttonGroupVertical } from '../src/utils/button-group'

describe('buttonGroupVertical / tiled', () => {
  it('reads layout flags', () => {
    expect(buttonGroupVertical({})).toBe(false)
    expect(buttonGroupVertical({ vertical: true })).toBe(true)
    expect(buttonGroupTiled({})).toBe(false)
    expect(buttonGroupTiled({ tiled: true })).toBe(true)
  })
})

describe('buttonGroupButtons', () => {
  it('reads buttons or body and applies btnLevel unless the button has level', () => {
    expect(buttonGroupButtons({})).toEqual([])
    const buttons = buttonGroupButtons({
      btnLevel: 'light',
      buttons: [
        { type: 'button', label: '按钮1' },
        { type: 'button', label: '按钮3', level: 'primary' },
      ],
    })
    expect(buttons[0].level).toBe('light')
    expect(buttons[1].level).toBe('primary')
    expect(buttonGroupButtons({ body: [{ type: 'button', label: '普通按钮' }] })).toHaveLength(1)
  })
})
