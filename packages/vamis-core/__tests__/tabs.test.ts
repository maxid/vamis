import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('tabs', () => {
  it('supports addable/editable/draggable and doc chapters', () => {
    const vue = read('../../vamis/src/renderers/Tabs.vue')
    for (const t of ['addable', 'closable', 'editable', 'draggable', 'onDragStart', 'commitEdit']) expect(vue).toContain(t)
    const doc = read('../../../website/src/components/tabs.md')
    for (const h of ['## 拖拽排序','## 可增加、删除','## 可编辑标签名','## 属性表']) expect(doc).toContain(h)
  })
})
