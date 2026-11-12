import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('chart', () => {
  it('has click/reload/setValue/source', () => {
    const vue = read('../../vamis/src/renderers/Chart.vue')
    for (const t of ["createVamisEvent('click'", "action?.actionType === 'reload'", "action?.actionType === 'setValue'", 'replaceChartOption', 'schema.source']) expect(vue).toContain(t)
  })
})
