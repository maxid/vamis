import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('crud', () => {
  it('supports loadDataOnce local pagination', () => {
    const vue = read('../../vamis/src/renderers/CRUD.vue')
    for (const t of ['loadDataOnce', 'allItems', 'paginateLocal', 'syncFromLocation', 'syncToLocation']) expect(vue).toContain(t)
    const doc = read('../../../website/src/components/crud.md')
    expect(doc).toContain('## 只请求一次')
    expect(doc).toContain('## 同步地址栏')
  })
})
