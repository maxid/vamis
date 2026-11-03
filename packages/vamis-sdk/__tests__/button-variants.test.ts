import { describe, expect, it } from 'vitest'
import { buttonVariants, levelToVariant, sizeToButtonSize } from '@vamis/ui'

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

  it('maps iconOnly onto square sizes matching Amis --button-size-*-height', () => {
    expect(sizeToButtonSize(undefined, true)).toBe('icon')
    expect(sizeToButtonSize('xs', true)).toBe('icon-xs')
    expect(sizeToButtonSize('sm', true)).toBe('icon-sm')
    expect(sizeToButtonSize('md', true)).toBe('icon-md')
    expect(sizeToButtonSize('lg', true)).toBe('icon-lg')
    expect(sizeToButtonSize('lg', false)).toBe('lg')
  })
})

describe('buttonVariants iconOnly', () => {
  it('zeros padding and pins min-width to the size height token', () => {
    const icon = buttonVariants({ size: 'icon' })
    expect(icon).toContain('h-[var(--button-h)]')
    expect(icon).toContain('min-w-[var(--button-h)]')
    expect(icon).toContain('p-0')
    expect(icon).not.toContain('px-3')
    expect(buttonVariants({ size: 'icon-xs' })).toContain('min-w-[var(--button-h-xs)]')
    expect(buttonVariants({ size: 'icon-sm' })).toContain('min-w-[var(--button-h-sm)]')
    expect(buttonVariants({ size: 'icon-md' })).toContain('min-w-[var(--button-h-md)]')
    expect(buttonVariants({ size: 'icon-lg' })).toContain('min-w-[var(--button-h-lg)]')
    expect(buttonVariants({ size: 'default' })).toContain('px-3')
  })
})
