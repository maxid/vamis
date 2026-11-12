import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('status', () => {
  it('supports defaults/map/labelMap/source and docs', () => {
    const vue = read('../../vamis/src/renderers/Status.vue')
    for (const t of ['DEFAULTS', 'labelMap', 'source', 'placeholder', 'resolveIcon']) expect(vue).toContain(t)
    const doc = read('../../../website/src/components/status.md')
    for (const h of ['## 基本用法','## 默认状态列表','## 自定义状态图标、文本、颜色','## 使用 map / labelMap','## 动态数据','## 属性表']) expect(doc).toContain(h)
  })
})
