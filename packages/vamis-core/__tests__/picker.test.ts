import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('picker', () => {
  it('supports embed/maxTagCount and doc chapters', () => {
    const vue = read('../../vamis/src/renderers/form/Picker.vue')
    for (const t of ['embed', 'maxTagCount', 'hiddenCount', 'loadSource', 'remoteOptions', 'effectivePickerSchema', "type: 'crud'", 'pickerMode', 'pickerSchema', 'getComponentById', 'nestedData', '__pickerOnSelect', 'value: embed.value ? selected.value : draft.value']) expect(vue).toContain(t)
    const doc = read('../../../website/src/components/form/picker.md')
    for (const h of ['## 基本用法','## 配置 pickerSchema','## 内嵌模式','## 限制标签最大展示数量','## 属性表','### OverflowConfig','## 事件表','### change','### itemClick','### staticItemClick','## 和 Amis 文档的差异']) expect(doc).toContain(h)
  })
})
