import { describe, expect, it } from 'vitest'
import {
  avatarAlt,
  avatarFit,
  avatarGap,
  avatarKind,
  avatarShape,
  avatarSizePx,
  avatarSrc,
  avatarText,
} from '../src/utils/avatar'
import { badgeMode, badgeText, badgeVisible } from '../src/utils/badge'

describe('avatar defaults', () => {
  it('defaults shape circle / size 40 / fit cover / gap 4', () => {
    expect(avatarShape({})).toBe('circle')
    expect(avatarShape({ shape: 'square' })).toBe('square')
    expect(avatarShape({ shape: 'rounded' })).toBe('rounded')
    expect(avatarShape({ shape: 'oops' })).toBe('circle')
    expect(avatarSizePx({})).toBe(40)
    expect(avatarSizePx({ size: 'default' })).toBe(40)
    expect(avatarSizePx({ size: 'normal' })).toBe(40)
    expect(avatarSizePx({ size: 'small' })).toBe(32)
    expect(avatarSizePx({ size: 'large' })).toBe(48)
    expect(avatarSizePx({ size: 60 })).toBe(60)
    expect(avatarFit({})).toBe('cover')
    expect(avatarFit({ fit: 'contain' })).toBe('contain')
    expect(avatarGap({})).toBe(4)
    expect(avatarGap({ gap: 7 })).toBe(7)
  })

  it('prefers src, then text, then icon', () => {
    expect(avatarKind({ src: '/a.png' })).toBe('src')
    expect(avatarKind({ src: '/a.png', text: 'AM' })).toBe('src')
    expect(avatarKind({ text: 'AM', icon: 'fa fa-user' })).toBe('text')
    expect(avatarKind({ icon: 'fa fa-user' })).toBe('icon')
    expect(avatarKind({})).toBe('icon')
    expect(avatarSrc({ src: 'https://x/${who}.png' }, { who: 'a' })).toBe('https://x/a.png')
    expect(avatarSrc({ defaultAvatar: '/fallback.png' })).toBe('/fallback.png')
    expect(avatarText({ text: '甲${who}' }, { who: 'A' })).toBe('甲A')
    expect(avatarText({})).toBe('')
    expect(avatarAlt({ alt: '头像甲' })).toBe('头像甲')
  })
})

describe('avatar badge', () => {
  it('reads text / mode from badge object or number', () => {
    expect(badgeVisible({})).toBe(false)
    expect(badgeVisible({ badge: 3 })).toBe(true)
    expect(badgeText({ badge: 3 })).toBe('3')
    expect(badgeText({ badge: { mode: 'text', text: 10 } })).toBe('10')
    expect(badgeMode({ badge: { mode: 'dot' } })).toBe('dot')
    expect(badgeMode({ badge: { text: 1 } })).toBe('dot')
  })
})
