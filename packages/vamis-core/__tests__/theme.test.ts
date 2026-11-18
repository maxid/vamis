import { describe, expect, it } from 'vitest'
import { registerTheme, themeTokens } from '../src/theme'

describe('registerTheme', () => {
  it('registers CSS variable tokens by theme name', () => {
    registerTheme('brand-test', {
      '--primary': '#123456',
      '--colors-brand-5': '#123456',
      'color': 'red',
    })
    expect(themeTokens('brand-test')).toEqual({
      '--primary': '#123456',
      '--colors-brand-5': '#123456',
    })
    expect(themeTokens('missing')).toEqual({})
  })
})
