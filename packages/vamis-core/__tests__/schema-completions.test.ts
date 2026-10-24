import { describe, expect, it } from 'vitest'
import { registerRenderer, unRegisterRenderer } from '../src/factory'
import {
  catalogFor,
  componentJsonSchema,
  registerSchemaTypeDoc,
  resolveSchemaFieldDoc,
  resolveSchemaTypeDoc,
  resolveTypeAlias,
  schemaCompletionsAt,
  schemaHoverAt,
  SCHEMA_TYPE_DOCS,
  TYPE_CATALOGS,
} from '../src/schema-completions'

const dummy = { name: 'Dummy', render: () => null }

const types = ['page', 'form', 'editor', 'tpl', 'input-text', 'select']

function at(text: string, needle: string, language: 'yaml' | 'json' = 'yaml') {
  const offset = text.lastIndexOf(needle)
  if (offset < 0) throw new Error(`needle not found: ${needle}`)
  return {
    completions: schemaCompletionsAt(text, offset + needle.length, language, types),
    hover: schemaHoverAt(text, offset + Math.floor(needle.length / 2), language),
  }
}

describe('schemaCompletionsAt type values', () => {
  it('suggests types after type: with documentation', () => {
    const items = schemaCompletionsAt('type: ', 6, 'yaml', types)
    expect(items.map((item) => item.label)).toEqual(types)
    const page = items.find((item) => item.label === 'page')
    expect(page?.kind).toBe('type')
    expect(page?.title).toContain('页面')
    expect(page?.documentation).toMatch(/独立|顶级|Scope/)
    expect(schemaCompletionsAt('  type: pa', 10, 'yaml', types).map((item) => item.label)).toEqual(['page'])
    expect(
      schemaCompletionsAt('  - type: ed', 12, 'yaml', types).map((item) => item.label),
    ).toEqual(['editor'])
  })

  it('suggests types after JSON "type": "', () => {
    const items = schemaCompletionsAt('{ "type": "pa', 13, 'json', types)
    expect(items.map((item) => item.label)).toEqual(['page'])
    expect(items[0].documentation).toContain('页面')
  })
})

describe('component tree fields', () => {
  it('documents editor size as height, not form-item width', () => {
    const yaml = `type: page
body:
  - type: editor
    si`
    const { completions, hover } = at(yaml, 'si')
    const size = completions.find((item) => item.label === 'size')
    expect(size?.kind).toBe('key')
    expect(size?.documentation).toMatch(/高度/)
    expect(size?.documentation).toMatch(/不是表单项宽度/)
    expect(hover?.label).toBe('size')
    expect(hover?.documentation).toMatch(/高度/)
  })

  it('documents input-text size as width', () => {
    const yaml = `type: form
body:
  - type: input-text
    si`
    const size = at(yaml, 'si').completions.find((item) => item.label === 'size')
    expect(size?.documentation).toMatch(/宽度/)
    expect(size?.documentation).not.toMatch(/编辑器\*\*高度/)
  })

  it('documents editor options as Monaco, select options as 选项', () => {
    const editor = at(
      `type: editor
op`,
      'op',
    ).completions.find((item) => item.label === 'options')
    const select = at(
      `type: select
op`,
      'op',
    ).completions.find((item) => item.label === 'options')
    expect(editor?.documentation).toMatch(/Monaco|IEditorOptions/)
    expect(select?.documentation).toMatch(/选项/)
    expect(select?.documentation).toMatch(/不是 Monaco/)
  })

  it('does not suggest in scalar values', () => {
    expect(schemaCompletionsAt('  title: Hello', 14, 'yaml', types)).toEqual([])
  })

  it('nested body uses the inner type, not the page', () => {
    const yaml = `type: page
title: 首页
body:
  - type: editor
    hideBu`
    const items = at(yaml, 'hideBu').completions
    expect(items.map((item) => item.label)).toContain('hideButtons')
    expect(items.find((item) => item.label === 'aside')).toBeUndefined()
  })
})

describe('component tree events and actions', () => {
  it('suggests editor events under onEvent, not page init', () => {
    const yaml = `type: editor
onEvent:
  ch`
    const items = at(yaml, 'ch').completions
    expect(items.map((item) => item.label)).toContain('change')
    expect(items.find((item) => item.label === 'change')?.kind).toBe('event')
    expect(items.find((item) => item.label === 'change')?.documentation).toMatch(/代码变化|变化/)
    expect(items.find((item) => item.label === 'init')).toBeUndefined()
  })

  it('suggests page events on page, not editor blur', () => {
    const yaml = `type: page
onEvent:
  in`
    const items = at(yaml, 'in').completions
    expect(items.map((item) => item.label)).toEqual(expect.arrayContaining(['init', 'inited']))
    expect(items.find((item) => item.label === 'init')?.documentation).toMatch(/插入|DOM/)
    expect(items.find((item) => item.label === 'blur')).toBeUndefined()
  })

  it('setValue action docs follow the enclosing component', () => {
    const page = at(
      `type: page
onEvent:
  init:
    actions:
      - actionType: set`,
      'set',
    ).completions.find((item) => item.label === 'setValue')
    const editor = at(
      `type: editor
onEvent:
  change:
    actions:
      - actionType: set`,
      'set',
    ).completions.find((item) => item.label === 'setValue')
    expect(page?.kind).toBe('action')
    expect(page?.documentation).toMatch(/overlay|合并/)
    expect(editor?.documentation).toMatch(/代码|string|未齐/)
    expect(editor?.documentation).not.toMatch(/overlay/)
  })
})

describe('all registered type catalogs', () => {
  const skip = new Set([
    'button',
    'submit',
    'reset',
    'html',
    'js-editor',
    'ts-editor',
    'json-editor',
    'yaml-editor',
  ])

  it('flex / chart / dialog / input-text unique fields complete', () => {
    expect(at('type: flex\nju', 'ju').completions.find((item) => item.label === 'justify')?.documentation).toMatch(
      /主轴/,
    )
    expect(at('type: chart\nco', 'co').completions.find((item) => item.label === 'config')?.documentation).toMatch(
      /ECharts/,
    )
    const size = at('type: dialog\nsi', 'si').completions.find((item) => item.label === 'size')
    expect(size?.documentation).toMatch(/对话框/)
    expect(size?.documentation).not.toMatch(/表单项\*\*宽度/)
    expect(at('type: input-text\nad', 'ad').completions.find((item) => item.label === 'addOn')?.documentation).toMatch(
      /附加/,
    )
    expect(at('type: popover\npo', 'po').completions.find((item) => item.label === 'popOver')?.documentation).toMatch(
      /弹出/,
    )
  })

  it('every documented type has a catalog (or alias of one)', () => {
    const missing: string[] = []
    for (const type of Object.keys(SCHEMA_TYPE_DOCS)) {
      if (skip.has(type)) continue
      const resolved = resolveTypeAlias(type)
      if (!TYPE_CATALOGS[type] && !(resolved && TYPE_CATALOGS[resolved])) missing.push(type)
    }
    expect(missing).toEqual([])
  })

  it('covers every builtin TYPE_CATALOGS key', () => {
    expect(Object.keys(TYPE_CATALOGS).length).toBeGreaterThan(150)
    expect(TYPE_CATALOGS.flex?.properties?.justify).toBeTruthy()
    expect(TYPE_CATALOGS.service?.properties?.schemaApi).toBeTruthy()
  })
})

describe('componentJsonSchema tree', () => {
  it('branches on type with $defs / if-then so same keys do not share one description', () => {
    const schema = componentJsonSchema(types) as {
      $defs: Record<string, { properties?: Record<string, { markdownDescription?: string }>; allOf?: unknown[] }>
    }
    expect(schema.$defs.node).toBeTruthy()
    expect(schema.$defs.node.allOf?.length).toBeGreaterThan(0)
    expect(schema.$defs.type_editor?.properties?.size?.markdownDescription).toMatch(/高度/)
    expect(schema.$defs['type_input-text']?.properties?.size?.markdownDescription).toMatch(/宽度/)
    expect(schema.$defs.type_editor?.properties?.options?.markdownDescription).toMatch(/Monaco/)
    expect(schema.$defs.type_select?.properties?.options?.markdownDescription).toMatch(/选项/)
  })
})

describe('schema docs registry', () => {
  it('lets apps register extra type docs for reuse', () => {
    registerSchemaTypeDoc('acme-chart', {
      title: 'Acme Chart',
      category: '扩展',
      description: '低码应用自定义图表。',
    })
    expect(resolveSchemaTypeDoc('acme-chart').title).toBe('Acme Chart')
    expect(resolveSchemaFieldDoc('page', 'type')?.description).toMatch(/Page|页面/)
  })

  it('picks up registerRenderer name/description', () => {
    registerRenderer({
      type: 'acme-grid',
      component: dummy,
      name: 'Acme Grid',
      description: '低码应用自定义栅格。',
    })
    expect(resolveSchemaTypeDoc('acme-grid').title).toBe('Acme Grid')
    unRegisterRenderer('acme-grid')
  })

  it('registerRenderer.schema auto-feeds intellisense including aliases', () => {
    registerRenderer({
      type: 'acme-gauge',
      alias: ['acme-meter'],
      component: dummy,
      name: 'Acme Gauge',
      description: '自定义仪表。',
      isFormItem: true,
      schema: {
        category: '扩展',
        properties: {
          needle: '指针颜色。',
          size: '仪表直径，不是表单项宽度。',
        },
        events: { spin: '指针转动。' },
        actions: { resetNeedle: '指针归零。' },
      },
    })
    const gauge = `type: acme-gauge
ne`
    const needle = schemaCompletionsAt(gauge, gauge.length, 'yaml', ['acme-gauge']).find(
      (item) => item.label === 'needle',
    )
    expect(needle?.documentation).toMatch(/指针颜色/)
    const sizeYaml = `type: acme-gauge
si`
    expect(
      schemaCompletionsAt(sizeYaml, sizeYaml.length, 'yaml', ['acme-gauge']).find((item) => item.label === 'size')
        ?.documentation,
    ).toMatch(/直径/)
    const eventYaml = `type: acme-gauge
onEvent:
  sp`
    expect(
      schemaCompletionsAt(eventYaml, eventYaml.length, 'yaml', ['acme-gauge']).map((item) => item.label),
    ).toContain('spin')
    const aliasYaml = `type: acme-meter
ne`
    expect(
      schemaCompletionsAt(aliasYaml, aliasYaml.length, 'yaml', ['acme-meter']).find((item) => item.label === 'needle'),
    ).toBeTruthy()
    const input = `type: acme-plain-input
la`
    registerRenderer({ type: 'acme-plain-input', component: dummy, isFormItem: true })
    expect(
      schemaCompletionsAt(input, input.length, 'yaml', ['acme-plain-input']).find((item) => item.label === 'label')
        ?.kind,
    ).toBe('key')
    unRegisterRenderer('acme-gauge')
    unRegisterRenderer('acme-plain-input')
    expect(
      schemaCompletionsAt(gauge, gauge.length, 'yaml', ['acme-gauge']).find((item) => item.label === 'needle'),
    ).toBeUndefined()
  })

  it('hover on a type value still explains the component', () => {
    const hover = schemaHoverAt('  type: page', 11, 'yaml')
    expect(hover?.label).toBe('page')
    expect(hover?.documentation).toContain('页面')
  })

  it('hover on JSON type key or value of a nested form explains Form, not editor aliases', () => {
    const json = `{
  "type": "button",
  "dialog": {
    "body": {
      "type": "form",
      "api": "/api/mock2/sample/bulkUpdate2",
      "body": [{ "type": "hidden", "name": "ids" }]
    }
  }
}`
    const valueOffset = json.indexOf('"form"') + 2
    const keyOffset = json.lastIndexOf('"type"', json.indexOf('"form"')) + 2
    const onValue = schemaHoverAt(json, valueOffset, 'json')
    const onKey = schemaHoverAt(json, keyOffset, 'json')
    expect(onValue?.label).toBe('form')
    expect(onValue?.documentation).toMatch(/表单/)
    expect(onValue?.documentation).not.toMatch(/json-editor/)
    expect(onKey?.documentation).toMatch(/表单/)
    expect(onKey?.documentation).not.toMatch(/json-editor/)
    expect(onKey?.label).toBe('form')
  })
})
