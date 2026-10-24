// @vitest-environment node
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { p0Cases } from '../compare/p0-cases.mjs'
import { applySchemaScope, parseSchemaFenceMeta } from '../compare/scope.mjs'
import { harvestMarkdown, harvestSource, isRenderableSchema } from '../compare/harvest.mjs'
import { measureLabel, resultColumns, scoreCase } from '../compare/score.mjs'
import { adviseIssue, classifyIssue } from '../compare/classify.mjs'
import { decorateCase, groupFromPath, groupP0 } from '../compare/nav-group.mjs'
import {
  iframeLayoutWidth,
  iframeScale,
  loadCatalog,
  matchSelf,
  parseViewportArg,
  rerunCommands,
} from '../compare/catalog.mjs'
import { scoreTree, valuesEqual, walkSchemaTree } from '../compare/schema-tree.mjs'

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

  it('skips empty fences, inline ```schema in prose, and code samples', () => {
    const rows = harvestSource(
      [
        '文档 ` ```schema ` 外包了这一层：',
        '',
        '```schema',
        '',
        '```',
        '',
        '```schema',
        'type: page',
        'body: Hello',
        '```',
        '',
        '```schema',
        'type: page',
        'title: hbox',
        'body:',
        '  - type: hbox',
        '```',
        '',
        '```schema',
        'type: code',
        'language: html',
        'value: skip',
        '```',
      ].join('\n'),
      'website/src/concepts/schema.md',
    )
    expect(rows.map((row) => row.schema)).toEqual([{ type: 'page', body: 'Hello' }])
  })
})

describe('isRenderableSchema', () => {
  it('rejects empty objects and layout shells with no children', () => {
    expect(isRenderableSchema({})).toBe(false)
    expect(isRenderableSchema({ type: 'page', title: 'hbox', body: [{ type: 'hbox' }] })).toBe(false)
    expect(isRenderableSchema({ type: 'page', body: [{ type: 'chart' }] })).toBe(false)
    expect(isRenderableSchema({ type: 'page', body: 'Hello' })).toBe(true)
    expect(
      isRenderableSchema({
        type: 'page',
        body: [{ type: 'crud', api: '/x', columns: [{ name: 'id', label: 'ID' }] }],
      }),
    ).toBe(true)
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

  it('tree fails when a node value does not match Amis', () => {
    const item = { measure: { type: 'tree' } }
    const tree = (value: unknown, named: boolean) => [
      { path: 'page/body/0:input-text', type: 'input-text', name: 'name', rendered: true, named, value },
    ]
    const result = scoreCase(item, { measure: { tree: tree('Ada', true) } }, { measure: { tree: tree('', false) } })
    expect(result.pass).toBe(false)
    expect(result.diffs.map((row) => row.prop)).toEqual([
      'page/body/0:input-text.named',
      'page/body/0:input-text.value',
    ])
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

  it('uses tree columns for component cases', () => {
    expect(resultColumns({ type: 'tree' }).map((col) => col.key)).toEqual([
      'nodes',
      'rendered',
      'value',
      'named',
      'actions',
      'fontSize',
      'lineHeight',
      'fontFamily',
      'pass',
    ])
    expect(measureLabel({ type: 'tree' })).toContain('结点')
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

describe('nav-group', () => {
  it('maps Amis-aligned paths to 文档 / 组件 / 样式', () => {
    expect(groupFromPath('website/src/style/grid/auto-columns.md')).toMatchObject({
      bucket: 'style',
      section: 'Grid',
      page: 'Grid Auto Columns',
      extra: false,
      group: '样式 / Grid',
    })
    expect(groupFromPath('website/src/concepts/schema.md')).toMatchObject({
      bucket: 'docs',
      section: '概念',
      extra: false,
      group: '文档 / 概念',
    })
    expect(groupFromPath('website/src/components/button.md')).toMatchObject({
      bucket: 'components',
      section: '功能',
      extra: false,
      group: '组件 / 功能',
    })
  })

  it('keeps Vamis extras that Amis nav does not have', () => {
    expect(groupFromPath('website/src/style/unknown/extra.md')).toMatchObject({
      bucket: 'style',
      extra: true,
      group: '样式 / unknown',
    })
  })

  it('maps P0 helpers to 样式 / Spacing and form to 组件', () => {
    expect(groupP0('helper-m-l')).toMatchObject({ bucket: 'style', section: 'Spacing', extra: false })
    expect(groupP0('form-default')).toMatchObject({ bucket: 'components', section: '数据输入' })
    expect(decorateCase({ id: 'helper-m-l', layer: 'p0', title: 'className: m-l', schema: {}, measure: {} }).group).toBe(
      '样式 / Spacing',
    )
  })

  it('loadCatalog groups default cases by Amis nav buckets', () => {
    const cases = loadCatalog()
    expect(cases.length).toBeGreaterThan(100)
    expect(cases.some((row) => row.bucket === 'docs')).toBe(true)
    expect(cases.some((row) => row.bucket === 'components')).toBe(true)
    expect(cases.some((row) => row.bucket === 'style')).toBe(true)
    const grid = loadCatalog({ bucket: 'style', section: 'Grid' })
    expect(grid.length).toBeGreaterThan(0)
    expect(grid.every((row) => row.group === '样式 / Grid')).toBe(true)
  })

  it('does not mix Amis docs into default groups or keep empty/duplicate titles', () => {
    const cases = loadCatalog()
    expect(cases.every((row) => row.origin !== 'amis')).toBe(true)
    expect(cases.every((row) => isRenderableSchema(row.schema))).toBe(true)
    const titles = cases.map((row) => `${row.group}|${row.title}`)
    expect(titles.length).toBe(new Set(titles).size)
    const mapping = cases.filter((row) => row.page === '数据映射').map((row) => row.title)
    expect(mapping).toEqual(mapping.map((_, i) => `数据映射 #${i + 1}`))
  })

  it('component cases use schema-tree measure instead of smoke', () => {
    const form = decorateCase({
      id: 'form-default',
      layer: 'p0',
      title: '默认 Form',
      schema: { type: 'page', body: { type: 'form', body: [{ type: 'input-text', name: 'name' }] } },
      measure: { type: 'smoke' },
    })
    expect(form.bucket).toBe('components')
    expect(form.measure.type).toBe('tree')
    const helpers = decorateCase({
      id: 'helper-m-l',
      layer: 'p0',
      title: 'className: m-l',
      schema: {},
      measure: { type: 'pair' },
    })
    expect(helpers.measure.type).toBe('pair')
  })
})

describe('schema-tree', () => {
  const schema = {
    type: 'page',
    body: {
      type: 'form',
      body: [
        { type: 'input-text', name: 'name', label: '姓名', value: 'Ada' },
        {
          type: 'button',
          label: '开',
          actionType: 'dialog',
          dialog: { title: 'Hi' },
        },
      ],
    },
  }

  it('walks schema nodes with stable paths and actions', () => {
    const nodes = walkSchemaTree(schema)
    expect(nodes.map((row) => row.path)).toEqual([
      'page',
      'page/body/0:form',
      'page/body/0:form/body/0:input-text',
      'page/body/0:form/body/1:button',
    ])
    const input = nodes.find((row) => row.type === 'input-text')
    expect(input).toMatchObject({ name: 'name', schemaValue: 'Ada' })
    const button = nodes.find((row) => row.type === 'button')
    expect(button?.actions).toContain('dialog')
  })

  it('scores runtime value / rendered / named / dialog per node', () => {
    expect(valuesEqual('', undefined)).toBe(true)
    const amis = [
      { path: 'page/body/0:form/body/0:input-text', type: 'input-text', name: 'name', rendered: true, named: true, value: 'Ada' },
      {
        path: 'page/body/0:form/body/1:button',
        type: 'button',
        rendered: true,
        effect: { dialog: true },
      },
    ]
    const aligned = scoreTree(amis, amis)
    expect(aligned.pass).toBe(true)
    const vamis = [
      { path: 'page/body/0:form/body/0:input-text', type: 'input-text', name: 'name', rendered: true, named: false, value: '' },
      {
        path: 'page/body/0:form/body/1:button',
        type: 'button',
        rendered: true,
        effect: { dialog: false },
      },
    ]
    const result = scoreTree(amis, vamis)
    expect(result.pass).toBe(false)
    expect(result.diffs.map((item) => item.prop)).toEqual([
      'page/body/0:form/body/0:input-text.named',
      'page/body/0:form/body/0:input-text.value',
      'page/body/0:form/body/1:button.dialog',
    ])
  })
})

describe('rerun slice', () => {
  it('matches a component page without neighbors', () => {
    expect(
      matchSelf(
        { page: 'Button 按钮', id: 'src-components-button-0', source: 'website/src/components/button.md' },
        'button',
      ),
    ).toBe(true)
    expect(
      matchSelf(
        {
          page: 'DropDownButton 下拉按钮',
          id: 'src-components-dropdown-button-0',
          source: 'website/src/components/dropdown-button.md',
        },
        'button',
      ),
    ).toBe(false)
  })

  it('loadCatalog --page button stays on Button 自身', () => {
    const cases = loadCatalog({ page: 'button' })
    expect(cases.length).toBeGreaterThan(0)
    expect(cases.every((row) => matchSelf(row, 'button'))).toBe(true)
    expect(cases.some((row) => /dropdown/i.test(String(row.id)))).toBe(false)
  })

  it('rerunCommands asks for full compare after global fixes', () => {
    const cmds = rerunCommands([
      {
        parity: { pass: false },
        page: 'Button 按钮',
        id: 'src-components-button-0',
        findings: [{ scope: 'global' }, { scope: 'component' }],
      },
    ])
    expect(cmds.some((item) => item.cmd === 'pnpm compare')).toBe(true)
    expect(cmds.some((item) => item.cmd.includes('--page'))).toBe(true)
  })

  it('rerunCommands keeps --mobile on the same viewport', () => {
    const cmds = rerunCommands(
      [
        {
          parity: { pass: false },
          page: 'Form 表单',
          id: 'form-default',
          findings: [{ scope: 'global' }],
        },
      ],
      { mobile: true },
    )
    expect(cmds.some((item) => item.cmd === 'pnpm compare --mobile')).toBe(true)
  })

  it('iframe layout is 768 desktop / 375 mobile', () => {
    expect(parseViewportArg('mobile')).toBe('mobile')
    expect(parseViewportArg('')).toBe('desktop')
    expect(iframeLayoutWidth('desktop', 500)).toBe(768)
    expect(iframeLayoutWidth('desktop', 900)).toBe(900)
    expect(iframeLayoutWidth('mobile', 500)).toBe(375)
    expect(iframeScale('mobile', 500, 375)).toBe(1)
    expect(iframeScale('desktop', 500, 768)).toBeCloseTo(500 / 768)
  })
})
