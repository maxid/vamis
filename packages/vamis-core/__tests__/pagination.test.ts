import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('pagination docs', () => {
  it('covers change event and property rows', () => {
    const doc = read('../../../website/src/components/pagination.md')
    for (const h of ['## 基本用法','## 微型模式','## 简洁模式','## 变更事件','## 事件表','## 属性表']) expect(doc).toContain(h)
    expect(doc).toContain('ellipsisPageGap')
  })

  it('uses the shared field value host outside a form', () => {
    const vue = read('../../vamis/src/renderers/Pagination.vue')
    expect(vue).toContain('useFieldValue')
    expect(vue).toContain('field.getValue(props.schema.name)')
    expect(vue).toContain('field.setValue(props.schema.name, next)')
    expect(vue).not.toContain('useForm()')
  })
})
