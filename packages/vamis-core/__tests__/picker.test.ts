import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('picker', () => {
  it('supports embed/maxTagCount and doc chapters', () => {
    const vue = read('../../vamis/src/renderers/form/Picker.vue')
    for (const t of ['embed', 'maxTagCount', 'hiddenCount', 'commitInline', 'loadSource', 'remoteOptions', 'pagedOptions', 'lastPage', 'pickerSchema', 'getComponentById', 'nestedData']) expect(vue).toContain(t)
    const doc = read('../../../website/src/components/form/picker.md')
    for (const h of ['## 基本用法','## 多选','## 内嵌模式','## 自定义弹层（pickerSchema）','## 分页','## 远程选项','## 限制标签最大展示数量','## 属性表']) expect(doc).toContain(h)
  })
})
