import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('group', () => {
  it('maps columnRatio to a 12-column flex basis', () => {
    const vue = read('../../vamis/src/renderers/form/Group.vue')
    for (const t of ['columnRatio', 'ratioStyle', 'flex:', 'maxWidth']) expect(vue).toContain(t)
    const doc = read('../../../website/src/components/form/group.md')
    expect(doc).toContain('实现进度 75%')
    expect(doc).toContain('`columnRatio` 按 12 等分')
  })
})
