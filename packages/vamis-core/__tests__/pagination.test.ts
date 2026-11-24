import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { paginationPagerItems } from '../src/utils/pagination'
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

  it('uses the Vamis select instead of a native per-page select', () => {
    const vue = read('../../vamis/src/renderers/Pagination.vue')
    const adapter = read('../../vamis/src/renderers/PaginationPerPage.vue')
    expect(vue).toContain('<PaginationPerPage')
    expect(vue).not.toContain('<select')
    expect(adapter).toContain("from './form/Select.vue'")
    expect(adapter).toContain(':value="value"')
    expect(adapter).toContain('@value-change')
  })

  it('uses prev, simple input and next for mobile pagination', () => {
    expect(paginationPagerItems({ activePage: 3, lastPage: 12, maxButtons: 7, mobileUI: true })).toEqual([
      { kind: 'prev', disabled: false },
      { kind: 'simple' },
      { kind: 'next', disabled: false },
    ])
    expect(paginationPagerItems({ activePage: 12, lastPage: 12, maxButtons: 7, mobileUI: true }).at(-1)).toEqual({
      kind: 'next',
      disabled: true,
    })
  })
})
