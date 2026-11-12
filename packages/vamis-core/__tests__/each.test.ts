import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('each', () => {
  it('supports maxLength and doc chapters', () => {
    const vue = read('../../vamis/src/renderers/Each.vue')
    expect(vue).toContain('maxLength')
    expect(vue).toContain('itemKeyName')
    const doc = read('../../../website/src/components/each.md')
    for (const h of ['## 基本用法','## 如果是对象数组','## 循环嵌套','## 用作 Field 时','## 使用数据映射','## 动态表单项','## 属性表']) expect(doc).toContain(h)
  })
})
