import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('cards', () => {
  it('exposes select actions and doc table', () => {
    const vue = read('../../vamis/src/renderers/Cards.vue')
    for (const t of ["type === 'selectAll'", "type === 'clearAll'", "type === 'select'", 'selectedItems']) expect(vue).toContain(t)
    const doc = read('../../../website/src/components/cards.md')
    for (const h of ['## 基本用法','## 当 cards 在 crud 中且配置了批量操作按钮时可点选','## 瀑布流布局','## 属性表','## 动作表']) expect(doc).toContain(h)
  })
})
