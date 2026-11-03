import { describe, expect, it } from 'vitest'
import { levelToVariant, sizeToButtonSize } from '@vamis/ui'

describe('levelToVariant', () => {
  it('maps Amis button levels onto cxd-like variants', () => {
    expect(levelToVariant()).toBe('outline')
    expect(levelToVariant('primary')).toBe('default')
    expect(levelToVariant(undefined, 'submit')).toBe('default')
    expect(levelToVariant('secondary')).toBe('secondary')
    expect(levelToVariant('enhance')).toBe('enhance')
    expect(levelToVariant('info')).toBe('info')
    expect(levelToVariant('success')).toBe('success')
    expect(levelToVariant('warning')).toBe('warning')
    expect(levelToVariant('danger')).toBe('destructive')
    expect(levelToVariant('light')).toBe('light')
    expect(levelToVariant('dark')).toBe('dark')
    expect(levelToVariant('link')).toBe('link')
  })
})

describe('sizeToButtonSize', () => {
  it('keeps the xs/sm/md/lg ladder instead of collapsing xs into sm', () => {
    expect(sizeToButtonSize()).toBe('default')
    expect(sizeToButtonSize('xs')).toBe('xs')
    expect(sizeToButtonSize('sm')).toBe('sm')
    expect(sizeToButtonSize('md')).toBe('md')
    expect(sizeToButtonSize('lg')).toBe('lg')
  })
})
