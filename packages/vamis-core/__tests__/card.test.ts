import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { filterTpl } from '../src/formula'
import {
  cardActionIsDropdown,
  cardActionSchema,
  cardBlank,
  cardBodyNodes,
  cardBodyPlain,
  cardChildIsLayout,
  cardFieldClassName,
  cardHighlight,
  cardToolbarItemSchema,
} from '../src/utils/card'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')

describe('card docs', () => {
  it('covers Amis main-path chapters', () => {
    const doc = read('../../../website/src/components/card.md')
    for (const h of [
      '## 设置标签卡片',
      '## 设置按钮卡片',
      '## 设置文本卡片',
      '## 设置单元格卡片',
      '## 配置工具栏',
      '## 属性表',
    ])
      expect(doc).toContain(h)
  })

  it('transcribes avatar utilities used by card examples', () => {
    const util = read('../../vamis-ui/src/helpers-utility.css')
    for (const cls of ['.pull-left', '.thumb-md', '.avatar', '.b-3x', '.b-3x:not(.b)']) expect(util).toContain(cls)
  })
})

describe('card helpers', () => {
  it('treats string body as plain, not a field node', () => {
    expect(cardBodyPlain({ body: '这里是内容' })).toBe('这里是内容')
    expect(cardBodyNodes({ body: '这里是内容' })).toEqual([])
    expect(cardBodyNodes({ body: [{ type: 'tpl', tpl: 'a' }] })).toHaveLength(1)
  })

  it('skips Card-field wrap for hbox/grid; wrapper className goes to fieldValue', () => {
    expect(cardChildIsLayout({ type: 'hbox' })).toBe(true)
    expect(cardChildIsLayout({ type: 'grid' })).toBe(true)
    expect(cardChildIsLayout({ type: 'wrapper' })).toBe(false)
    expect(cardFieldClassName({ type: 'wrapper', className: 'h-32 flex items-center justify-center' })).toBe(
      'h-32 flex items-center justify-center',
    )
  })

  it('evals highlight expressions and header.blank', () => {
    expect(cardHighlight({ header: { highlight: true } })).toBe(true)
    expect(cardHighlight({ header: { highlight: '${ok}' } }, { ok: true })).toBe(true)
    expect(cardHighlight({ header: { highlight: '${ok}' } }, { ok: false })).toBe(false)
    expect(cardBlank({ header: { blank: false } })).toBe(false)
    expect(cardBlank({})).toBe(true)
  })

  it('defaults toolbar items to link sm buttons', () => {
    expect(cardToolbarItemSchema({ label: '编辑' })).toMatchObject({
      type: 'button',
      level: 'link',
      size: 'sm',
      label: '编辑',
    })
  })

  it('marks Card-action buttons for <a> chrome; dropdown-button stays Button--link', () => {
    expect(cardActionIsDropdown({ type: 'dropdown-button' })).toBe(true)
    expect(cardActionSchema({ type: 'button', label: '操作', className: 'mr-4' })).toMatchObject({
      level: 'link',
      size: 'sm',
      __cardAction: true,
      className: 'mr-4',
    })
    expect(cardActionSchema({ type: 'dropdown-button', level: 'link', hideCaret: true }).__cardAction).toBeUndefined()
  })
})

describe('tpl substring/upperCase', () => {
  it('matches Amis avatarText `${engine|substring:0:2|upperCase}`', () => {
    expect(filterTpl('${engine|substring:0:2|upperCase}', { engine: 'Trident' })).toBe('TR')
  })
})
