import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('cards', () => {
  it('exposes select actions and doc table', () => {
    const vue = read('../../vamis/src/renderers/Cards.vue')
    for (const t of [
      "type === 'selectAll'",
      "type === 'clearAll'",
      "type === 'select'",
      "type === 'initDrag'",
      "type === 'setValue'",
      'index?: unknown',
      '修改了内容',
      'selectedItems',
      'showFooterCheckAll',
      'gap: 12px',
      "runOnEvent(props.schema, 'selectedChange'",
      "runOnEvent(props.schema, 'rowClick'",
      'is-unsaved',
      '--cards-unsaved-heading-bg',
      '--cards-toolbar-margin-x',
      "padding: var(--gap-xs) 0",
    ])
      expect(vue).toContain(t)
    const card = read('../../vamis/src/renderers/Card.vue')
    expect(card).toContain('--card-checked-fieldLabel')
    expect(card).toContain('is-modified')
    expect(card).toContain('stroke="currentColor"')
    const theme = read('../../vamis-ui/src/styles.css')
    expect(theme).toContain('--card-modified-bg: var(--colors-neutral-fill-8)')
    expect(theme).toContain('--cards-unsaved-heading-bg: #e8f0fe')
    expect(theme).toContain('--card-checked-bg: var(--colors-neutral-fill-11)')
    expect(theme).toContain('.vamis-node:has(> .vamis-form-item--normal)')
    expect(theme).toContain('.vamis-node.m-b > .vamis-form-item')
    const doc = read('../../../website/src/components/cards.md')
    for (const h of [
      '## 基本用法',
      '## 当 cards 在 crud 中且配置了批量操作按钮时可点选',
      '## 瀑布流布局',
      '## 属性表',
      '## 事件表',
      '## 动作表',
      '### select',
      '### initDrag & cancelDrag',
      '### setValue',
      '### selectedChange',
      '更新version=4的行记录',
      'h-stretch',
    ])
      expect(doc).toContain(h)
  })
})
