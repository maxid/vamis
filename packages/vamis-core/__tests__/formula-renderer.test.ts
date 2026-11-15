import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('formula renderer', () => {
  it('applies initSet/autoSet/condition and target action', () => {
    const vue = read('../../vamis/src/renderers/form/Formula.vue')
    for (const t of ['initSet', 'autoSet', 'condition', 'doAction', 'apply()', 'Number.isNaN']) expect(vue).toContain(t)
    const doc = read('../../../website/src/components/form/formula.md')
    for (const h of ['## 基本用法','## 自动应用','## 手动应用','## 条件应用','## 使用新表达式语法','## 属性表']) expect(doc).toContain(h)
  })
})
