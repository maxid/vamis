// @vitest-environment node
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { p0Cases } from '../compare/p0-cases.mjs'
import { applySchemaScope, parseSchemaFenceMeta } from '../compare/scope.mjs'
import { harvestMarkdown } from '../compare/harvest.mjs'
import { measureLabel, resultColumns, scoreCase } from '../compare/score.mjs'
import { adviseIssue, classifyIssue } from '../compare/classify.mjs'

describe('applySchemaScope', () => {
  it('wraps body fragments in page', () => {
    expect(applySchemaScope({ type: 'button', label: 'Go' }, 'body')).toEqual({
      type: 'page',
      body: { type: 'button', label: 'Go' },
    })
  })

  it('keeps a page as-is', () => {
    const page = { type: 'page', body: 'x' }
    expect(applySchemaScope(page, 'body')).toBe(page)
  })
})

describe('parseSchemaFenceMeta', () => {
  it('reads scope from fence info', () => {
    expect(parseSchemaFenceMeta('schema: scope="body"')).toEqual({ scope: 'body' })
  })
})

describe('harvestMarkdown', () => {
  it('extracts YAML and JSON schema fences', () => {
    const dir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures')
    const rows = harvestMarkdown(dir, { group: 'docs-concepts' })
    expect(rows.map((row) => row.schema)).toEqual([
      { type: 'page', body: { type: 'button', label: '按钮1' } },
      { type: 'page', body: { type: 'button', label: '按钮2' } },
    ])
    expect(rows.every((row) => row.measure.type === 'smoke')).toBe(true)
  })
})

describe('scoreCase', () => {
  it('passes when pair geometry matches Amis', () => {
    const item = { measure: { type: 'pair' } }
    const result = scoreCase(item, { measure: { sameRow: true, gap: 0 } }, { measure: { sameRow: true, gap: 0 } })
    expect(result.pass).toBe(true)
  })

  it('fails when Vamis gap does not match Amis', () => {
    const item = { measure: { type: 'pair' } }
    const result = scoreCase(
      item,
      { measure: { sameRow: true, gap: 15 } },
      { measure: { sameRow: true, gap: 12 } },
    )
    expect(result.pass).toBe(false)
    expect(result.diffs).toEqual([{ prop: 'gap', amis: 15, vamis: 12 }])
  })

  it('smoke fails if Vamis render errors', () => {
    const result = scoreCase({ measure: { type: 'smoke' } }, { measure: { smoke: true } }, { error: 'boom' })
    expect(result.pass).toBe(false)
  })
})

describe('resultColumns', () => {
  it('uses pair geometry columns for two-button cases', () => {
    expect(resultColumns({ type: 'pair' }).map((col) => col.key)).toEqual([
      'sameRow',
      'gap',
      'box',
      'fontSize',
      'lineHeight',
      'fontFamily',
      'pass',
    ])
    expect(measureLabel({ type: 'pair' })).toContain('盒模型')
  })

  it('uses status columns for smoke cases', () => {
    expect(resultColumns({ type: 'smoke' }).map((col) => col.key)).toEqual([
      'status',
      'text',
      'fontSize',
      'lineHeight',
      'fontFamily',
      'pass',
    ])
    expect(measureLabel({ type: 'smoke' })).toContain('smoke')
  })

  it('uses computed style props as columns', () => {
    expect(resultColumns({ type: 'style', props: ['marginLeft', 'display'] }).map((col) => col.key)).toEqual([
      'style:marginLeft',
      'style:display',
      'fontSize',
      'lineHeight',
      'fontFamily',
      'pass',
    ])
  })
})

describe('classifyIssue', () => {
  it('treats compact m-l ladder as global token scale', () => {
    const item = p0Cases.find((row) => row.id === 'helper-m-l')
    expect(classifyIssue({ prop: 'gap', amis: 15, vamis: 12 }, item)).toBe('global')
    expect(adviseIssue({ prop: 'gap', amis: 15, vamis: 12 }, item, 'global')).toContain('--gap-')
  })

  it('treats missing m-l-xxl as helper', () => {
    const item = p0Cases.find((row) => row.id === 'helper-m-l-xxl')
    expect(classifyIssue({ prop: 'gap', amis: 50, vamis: 0 }, item)).toBe('helper')
  })

  it('treats body font as global and text-sm size as helper', () => {
    expect(classifyIssue({ prop: 'bodyFont', amis: 'PingFang SC', vamis: 'Helvetica Neue' }, { schema: {} })).toBe(
      'global',
    )
    const tpl = {
      schema: {
        type: 'page',
        body: { type: 'tpl', tpl: '<div class="text-sm">短</div>' },
      },
    }
    expect(classifyIssue({ prop: 'fontSize', amis: '12px', vamis: '14px' }, tpl)).toBe('helper')
  })

  it('treats button font-weight as component', () => {
    const item = p0Cases.find((row) => row.id === 'style-two-buttons')
    expect(classifyIssue({ prop: 'fontWeight', amis: '400', vamis: '500' }, item)).toBe('component')
  })
})

describe('p0Cases', () => {
  it('includes two-button layout and m-l ladder', () => {
    const ids = p0Cases.map((row) => row.id)
    expect(ids).toContain('style-two-buttons')
    expect(ids).toContain('style-two-buttons-ml')
    expect(ids).toContain('helper-m-l')
    expect(ids).toContain('helper-m-l-xs')
    expect(p0Cases.every((row) => row.schema && row.measure)).toBe(true)
  })
})
