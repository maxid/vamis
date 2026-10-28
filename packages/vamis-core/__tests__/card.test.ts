import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  cardActions,
  cardActionsCount,
  cardAvatarTextBackground,
  cardBlank,
  cardBodyNodes,
  cardClickable,
  cardFieldLabel,
  cardFieldValueSchema,
  cardHashCode,
  cardHref,
  cardItemAction,
  cardMediaPosition,
  cardPadActions,
  cardTitle,
  cardUseCardLabel,
  cardsCardSchema,
  cardsColumnsCount,
  cardsMasonry,
  cardsPlaceholder,
  cardsSource,
} from '../src/utils/card'

const rows = [
  { engine: 'Trident', browser: 'IE' },
  { engine: 'Gecko', browser: 'Firefox' },
]

describe('card header / body', () => {
  it('reads title from header and interpolates', () => {
    expect(cardTitle({ header: { title: '${engine}' } }, { engine: 'Trident' })).toBe('Trident')
    expect(cardTitle({ title: '标题' }, {})).toBe('标题')
  })

  it('useCardLabel defaults true; body string becomes tpl', () => {
    expect(cardUseCardLabel({})).toBe(true)
    expect(cardUseCardLabel({ useCardLabel: false })).toBe(false)
    expect(cardBodyNodes({ body: '这里是内容' })).toEqual([{ type: 'tpl', tpl: '这里是内容' }])
    expect(cardBodyNodes({ body: [{ name: 'engine', label: 'Engine' }] })).toHaveLength(1)
  })

  it('field without type uses ${name}; label is kept', () => {
    expect(cardFieldLabel({ name: 'engine', label: 'Engine' })).toBe('Engine')
    expect(cardFieldValueSchema({ name: 'engine', label: 'Engine' })).toEqual({
      type: 'tpl',
      tpl: '${engine}',
    })
    expect(cardFieldValueSchema({ type: 'static', name: 'browser', value: 'IE' }).type).toBe('static')
  })
})

describe('card avatarTextBackground', () => {
  it('picks color by Amis hashCode', () => {
    const colors = ['#FFB900', '#D83B01', '#B50E0E']
    const text = 'Trident'
    expect(cardAvatarTextBackground(text, colors)).toBe(
      colors[Math.abs(cardHashCode(text)) % colors.length],
    )
    expect(cardAvatarTextBackground('', colors)).toBe('')
    expect(cardAvatarTextBackground(text, [])).toBe('')
  })
})

describe('card href / itemAction / media', () => {
  it('href wins over itemAction; blank defaults true', () => {
    const schema = {
      href: 'https://github.com/baidu/amis',
      itemAction: { actionType: 'dialog' },
    }
    expect(cardHref(schema, {})).toBe('https://github.com/baidu/amis')
    expect(cardItemAction(schema)?.actionType).toBe('dialog')
    expect(cardClickable(schema, {})).toBe(true)
    expect(cardBlank({})).toBe(true)
    expect(cardBlank({ blank: false })).toBe(false)
    expect(cardClickable({ header: { title: 'x' } }, {})).toBe(false)
  })

  it('mediaPosition defaults left', () => {
    expect(cardMediaPosition({})).toBe('left')
    expect(cardMediaPosition({ media: { type: 'image', url: 'a.png' } })).toBe('left')
    expect(cardMediaPosition({ mediaPosition: 'right', media: { url: 'a.png' } })).toBe('right')
    expect(cardMediaPosition({ media: { position: 'top', url: 'a.png' } })).toBe('top')
  })

  it('pads actions by actionsCount default 4; filters hidden', () => {
    expect(cardActionsCount({})).toBe(4)
    const visible = cardActions(
      {
        actions: [
          { type: 'button', label: '编辑' },
          { type: 'button', label: '隐藏', visible: false },
        ],
      },
      {},
    )
    expect(visible.map((a) => a.label)).toEqual(['编辑'])
    expect(cardPadActions([{ type: 'button' }, { type: 'button' }, { type: 'button' }], 2)).toHaveLength(2)
  })
})

describe('cards source / layout', () => {
  it('defaults to $items, and reads ${items} like docs', () => {
    expect(cardsSource({}, { items: rows })).toEqual(rows)
    expect(cardsSource({ source: '${items}' }, { items: rows })).toEqual(rows)
    expect(cardsSource({ source: '$rows' }, { rows })).toEqual(rows)
    expect(cardsSource({}, {})).toEqual([])
    expect(cardsSource({ source: '$rows' }, { rows: [] }, rows)).toEqual(rows)
  })

  it('placeholder 暂无数据; masonry / columnsCount; default card title ${name}', () => {
    expect(cardsPlaceholder({})).toBe('暂无数据')
    expect(cardsPlaceholder({ placeholder: 'placeholder.noData' })).toBe('暂无数据')
    expect(cardsPlaceholder({ placeholder: '空空' })).toBe('空空')
    expect(cardsMasonry({})).toBe(false)
    expect(cardsMasonry({ masonryLayout: true })).toBe(true)
    expect(cardsColumnsCount({})).toBe(0)
    expect(cardsColumnsCount({ columnsCount: 3 })).toBe(3)
    expect(cardsCardSchema({}).header).toEqual({ title: '${name}' })
    expect(cardsCardSchema({ card: { body: [{ name: 'engine' }] } }).body).toEqual([{ name: 'engine' }])
  })
})

describe('card vue wiring', () => {
  it('uses card helpers, heading/actions/media, cards masonry columns', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const card = readFileSync(resolve(here, '../../vamis/src/renderers/Card.vue'), 'utf8')
    const cards = readFileSync(resolve(here, '../../vamis/src/renderers/Cards.vue'), 'utf8')
    expect(card).toContain('cardTitle')
    expect(card).toContain('cardHref')
    expect(card).toContain('cardItemAction')
    expect(card).toContain('cardAvatarTextBackground')
    expect(card).toContain('vamis-card')
    expect(card).toContain('vamis-card-actions')
    expect(card).toContain('vamis-card-media')
    expect(card).toContain('max-width: 200px')
    expect(card).toContain('.vamis-card-avatar img')
    expect(card).not.toMatch(/\.vamis-card-avatar \{[^}]*width: 50px/)
    expect(card).toContain('#f7f8fa')
    expect(card).toContain("[data-slot='button']")
    expect(card).not.toContain(':deep(')
    expect(card).toContain('height: 40px')
    expect(card).toContain('vamis-card-media-img')
    expect(card).toContain('mediaClass')
    expect(card).not.toMatch(/\.vamis-card-media-img \{[^}]*max-width: 180px/)
    expect(card).not.toMatch(/\.vamis-card-media-img \{[^}]*width: auto/)
    expect(card).toContain('flex-wrap: nowrap')
    expect(card).toContain('min-width: 48px')
    expect(card).toContain('window.open')
    expect(card).toContain('label: false')
    expect(card).not.toMatch(/\.vamis-card-avatar-text \{[^}]*text-transform: uppercase/)
    expect(card).toContain('inline-flex')
    expect(card).toContain('gap: 4px')
    expect(cards).toContain(':not(.is-masonry) .vamis-card')
    expect(cards).toContain('height: 100%')
    expect(cards).toContain('.vamis-cards.is-masonry .vamis-cards-item')
    const register = readFileSync(resolve(here, '../../vamis/src/register.ts'), 'utf8')
    expect(register).toContain("type: 'card', component: Card, scope: 'self'")
    expect(cards).toContain('cardsSource')
    expect(cards).toContain('cardsMasonry')
    expect(cards).toContain('cardsPlaceholder')
    expect(cards).toContain('vamis-cards-placeholder')
    expect(cards).toContain('height: 100px')
    expect(cards).toContain('column-count')
    expect(cards).toContain('@media (min-width: 576px)')
    expect(cards).toContain('repeat(3, minmax(0, 1fr))')
    expect(cards).toContain('@media (min-width: 768px)')
    expect(cards).toContain('@media (min-width: 992px)')
    expect(cards).not.toContain('@media (min-width: 1200px)')
  })
})
