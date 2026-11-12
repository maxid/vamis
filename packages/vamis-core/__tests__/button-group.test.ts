import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('button-group', () => {
  it('has seam styles and doc property rows', () => {
    const vue = read('../../vamis/src/renderers/ButtonGroup.vue')
    expect(vue).toContain('margin-left: -1px')
    expect(vue).toContain('border-top-right-radius: 0')
    const doc = read('../../../website/src/components/button-group.md')
    expect(doc).toContain('btnActiveLevel')
    expect(doc).toContain('## 属性表')
  })
})
