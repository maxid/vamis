import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('tag', () => {
  it('supports close/check events and doc chapters', () => {
    const vue = read('../../vamis/src/renderers/rest/Tag.vue')
    for (const t of ['closable', 'checkable', "emitTagEvent('close'", "emitTagEvent('click'", 'VamisClose']) expect(vue).toContain(t)
    const doc = read('../../../website/src/components/tag.md')
    for (const h of ['## 基本用法','## 不同的模式','## 标签颜色','## 自定义样式','## 可关闭 / 可选','## 属性表','## 事件表']) expect(doc).toContain(h)
  })
})
