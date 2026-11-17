import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('cards', () => {
  it('exposes select actions and doc table', () => {
    // 皮肤在 @vamis/ui 的 styles.css，渲染器不带 <style>
    const vue = read('../../vamis/src/renderers/Cards.vue') + read('../../vamis-ui/src/styles.css')
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
      'vamis-cards-actions',
      'headerToolbar',
      'gap: 12px',
      "runOnEvent(props.schema, 'selectedChange'",
      "runOnEvent(props.schema, 'rowClick'",
      'RowValueHost',
      'setByPathCopy',
      'onRowChange',
      'is-unsaved',
      '--cards-unsaved-heading-bg',
      '--cards-toolbar-margin-x',
      "padding: var(--gap-xs) 0",
    ])
      expect(vue).toContain(t)
    const card = read('../../vamis/src/renderers/Card.vue') + read('../../vamis-ui/src/styles.css')
    expect(card).toContain('--card-checked-fieldLabel')
    expect(card).toContain('is-modified')
    // 拖拽手柄是 @vamis/ui 登记的 drag-bar（Amis 原件是 stroke），渲染器不写 <svg>
    expect(card).toContain('<VamisIcon name="drag-bar"')
    expect(read('../../vamis-ui/src/ui/vamis-icons.ts')).toContain('translate(5 1)')
    const theme = read('../../vamis-ui/src/styles.css')
    expect(theme).toContain('--card-modified-bg: var(--colors-neutral-fill-8)')
    expect(theme).toContain('--cards-unsaved-heading-bg: var(--table-modified-bg)')
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
      '更新version=4',
      'h-stretch',
    ])
      expect(doc).toContain(h)
  })
})
