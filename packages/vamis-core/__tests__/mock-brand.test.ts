import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

// Mock 响应文案用 Vamis 品牌。口径见 .cursor/rules/site.mdc「Mock API 品牌」。
const here = dirname(fileURLToPath(import.meta.url))
const mockDir = resolve(here, '../../../playground/src/mock')

const ALLOW = [
  /\/api\/amis-mock/,
  /internal-amis-res\.cdn\.bcebos\.com/,
  /suda\.cdn\.bcebos\.com\/amis\//,
]

function mockFiles(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...mockFiles(full))
    else if (/\.(ts|js|mjs)$/.test(name)) out.push(full)
  }
  return out
}

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function quotedStrings(src: string): string[] {
  const out: string[] = []
  for (const match of stripComments(src).matchAll(/(['"`])(?:\\.|(?!\1)[\s\S])*\1/g)) {
    out.push(match[0].slice(1, -1))
  }
  return out
}

function isAllowed(value: string): boolean {
  return ALLOW.some(pattern => pattern.test(value))
}

describe('mock API brand', () => {
  it('payload strings do not keep Amis product copy', () => {
    const hits: string[] = []
    for (const file of mockFiles(mockDir)) {
      const rel = relative(mockDir, file).split('\\').join('/')
      for (const value of quotedStrings(readFileSync(file, 'utf8'))) {
        if (isAllowed(value)) continue
        if (/\bamis\b/i.test(value) || value === 'fex') {
          hits.push(`${rel}: ${value}`)
        }
      }
    }
    expect(hits).toEqual([])
  })

  it('keeps the Amis sample base rows and IDs', () => {
    const seed = JSON.parse(
      readFileSync(join(mockDir, 'sample-seed.json'), 'utf8'),
    ) as {
      source: string
      rows: Array<Record<string, unknown>>
    }
    expect(seed.source).toContain('sample.db.js')
    expect(seed.rows).toHaveLength(57)
    expect(seed.rows[49]).toMatchObject({
      engine: 'Misc',
      grade: 'C',
      browser: 'NetFront 3.1',
    })
    expect(seed.rows[52]).toMatchObject({
      engine: 'Misc',
      grade: 'X',
      browser: 'Links',
    })
  })

  it('builds 1710 sample rows with the Amis IDs 50 / 53', async () => {
    const { createSampleRows } = await import('../../../playground/src/mock/sample')
    const rows = createSampleRows()
    expect(rows).toHaveLength(1710)
    expect(rows[49]).toMatchObject({
      id: 50,
      engine: 'Misc',
      grade: 'C',
      browser: 'NetFront 3.1',
    })
    expect(rows[52]).toMatchObject({
      id: 53,
      engine: 'Misc',
      grade: 'X',
      browser: 'Links',
    })
  })
})
