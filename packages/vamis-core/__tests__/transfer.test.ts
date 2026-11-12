import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('transfer', () => {
  it('supports search/titles and doc chapters', () => {
    const vue = read('../../vamis/src/renderers/form/Transfer.vue')
    for (const t of ['searchable', 'searchPlaceholder', 'leftTitle', 'rightTitle', 'leftShown', 'loadSource', 'remoteOptions']) expect(vue).toContain(t)
    const doc = read('../../../website/src/components/form/transfer.md')
    for (const h of ['## 基本用法','## 远程选项','## 展示模式','## 搜索','## 属性表','## 和 Amis 文档的差异']) expect(doc).toContain(h)
  })
})
