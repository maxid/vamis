import { describe, expect, it } from 'vitest'
import {
  avatarAlt,
  avatarFit,
  avatarGap,
  avatarIcon,
  avatarIconKind,
  avatarIconSizePx,
  avatarKeepImageAfterError,
  avatarKind,
  avatarShape,
  avatarSizePx,
  avatarSrc,
  avatarText,
  avatarTextScale,
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

  it('prefers src, then text, then icon, and resolves $var', () => {
    expect(avatarKind({ src: '/a.png' })).toBe('src')
    expect(avatarKind({ src: '/a.png', text: 'AM' })).toBe('src')
    expect(avatarKind({ text: 'AM', icon: 'fa fa-user' })).toBe('text')
    expect(avatarKind({ icon: 'fa fa-user' })).toBe('icon')
    expect(avatarKind({})).toBe('icon')
    expect(avatarSrc({ src: 'https://x/${who}.png' }, { who: 'a' })).toBe('https://x/a.png')
    expect(avatarSrc({ src: '$myAvatar' }, { myAvatar: 'https://img/a.jpg' })).toBe('https://img/a.jpg')
    expect(avatarSrc({ src: '$other' }, { myAvatar: 'https://img/a.jpg' })).toBe('')
    expect(avatarKind({ src: '$other', icon: 'fa fa-user' }, {})).toBe('icon')
    expect(avatarKind({ src: '$other', text: 'avatar', icon: 'fa fa-user' }, {})).toBe('text')
    expect(avatarSrc({ defaultAvatar: '/fallback.png' })).toBe('/fallback.png')
    expect(avatarText({ text: 'AM${who}' }, { who: 'A' })).toBe('AMA')
    expect(avatarText({})).toBe('')
    expect(avatarAlt({ alt: '头像' })).toBe('头像')
  })

  it('defaults icon to fa fa-user and treats a dot as image', () => {
    expect(avatarIcon({})).toBe('fa fa-user')
    expect(avatarIcon({ icon: 'fa fa-user' })).toBe('fa fa-user')
    expect(avatarIconKind('fa fa-user')).toBe('class')
    expect(avatarIconKind('https://img/u.svg')).toBe('url')
    expect(avatarIconKind('user.png')).toBe('url')
    expect(avatarIconSizePx({})).toBe(18)
    expect(avatarIconSizePx({ size: 'small' })).toBe(12)
    expect(avatarIconSizePx({ size: 'large' })).toBe(20)
    expect(avatarIconSizePx({ size: 60 })).toBe(18)
  })

  it('scales text so gap px stays on both sides', () => {
    expect(avatarTextScale(40, 20, 4)).toBe(1)
    expect(avatarTextScale(40, 40, 4)).toBeCloseTo(32 / 40)
    expect(avatarTextScale(40, 40, 2)).toBeCloseTo(36 / 40)
    expect(avatarTextScale(40, 40, 7)).toBeCloseTo(26 / 40)
    expect(avatarTextScale(0, 20, 4)).toBe(1)
  })

  it('onError return true swaps to text/icon; default keeps the broken image', () => {
    expect(avatarKeepImageAfterError({}, true)).toBe(true)
    expect(avatarKeepImageAfterError({ onError: 'return true;' }, true)).toBe(false)
    expect(avatarKeepImageAfterError({ onError: 'return false;' }, true)).toBe(true)
    expect(avatarKeepImageAfterError({ onError: 'return true;' }, false)).toBe(true)
    expect(avatarKeepImageAfterError({ onError: () => true }, false)).toBe(false)
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
