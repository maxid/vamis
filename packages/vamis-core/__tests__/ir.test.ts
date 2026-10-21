import { describe, expect, it } from 'vitest'
import {
  compileIrToWidget,
  formatSchemaAs,
  IR_API_VERSION,
  jsonToIr,
  parseSchemaText,
  parseToIr,
  syncAuthoringText,
  yamlFromIr,
} from '../src/ir'
import { registerRenderer, resolveRenderer, unRegisterRenderer } from '../src/factory'
import { evalExpression, filterTpl, isVisible } from '../src/formula'

describe('IR envelope', () => {
  it('wraps Amis JSON into lcdp.ir/v1 UiPage', () => {
    const ir = jsonToIr({
      type: 'page',
      title: '表单页面',
      body: [{ type: 'form', body: [{ type: 'input-text', name: 'name' }] }],
    })
    expect(ir.apiVersion).toBe(IR_API_VERSION)
    expect(ir.kind).toBe('UiPage')
    expect(ir.metadata.name).toBeTruthy()
    expect((ir.spec as any).type).toBe('page')
  })

  it('round-trips YAML', () => {
    const yaml = yamlFromIr(
      jsonToIr({ type: 'page', title: 'Hello', body: [{ type: 'tpl', tpl: 'hi' }] }),
    )
    const ir = parseToIr(yaml)
    expect(ir.kind).toBe('UiPage')
    expect(compileIrToWidget(ir).type).toBe('page')
  })

  it('treats YAML and JSON strings as equal authoring input', () => {
    const yaml = parseSchemaText('type: page\ntitle: Hello\n')
    const json = parseSchemaText('{"type":"page","title":"Hello"}')
    expect(yaml).toEqual({ type: 'page', title: 'Hello' })
    expect(json).toEqual({ type: 'page', title: 'Hello' })
    expect(parseToIr(JSON.stringify(json)).kind).toBe('UiPage')
  })

  it('syncs YAML and JSON drafts from the same object', () => {
    const widget = { type: 'page', title: 'Hello' }
    const fromYaml = syncAuthoringText('yaml', 'type: page\ntitle: Hello\n# keep comment\n')
    expect(fromYaml.value).toEqual(widget)
    expect(fromYaml.yaml).toContain('# keep comment')
    expect(JSON.parse(fromYaml.json)).toEqual(widget)
    const fromJson = syncAuthoringText('json', '{\n  "type": "page",\n  "title": "Hello"\n}\n')
    expect(fromJson.value).toEqual(widget)
    expect(fromJson.json).toContain('"type": "page"')
    expect(parseSchemaText(fromJson.yaml)).toEqual(widget)
    expect(parseSchemaText(formatSchemaAs(widget, 'json'))).toEqual(widget)
  })

  it('throws when JSON draft is invalid and does not invent YAML', () => {
    expect(() => syncAuthoringText('json', '{')).toThrow()
  })

  it('compiles FormDef fields to form widgets', () => {
    const widget = compileIrToWidget({
      apiVersion: IR_API_VERSION,
      kind: 'FormDef',
      metadata: { name: 'demo-form', description: 'demo' },
      spec: {
        fields: [
          { name: 'title', label: '标题', controlType: 'INPUT', required: true },
          { name: 'status', label: '状态', controlType: 'SELECT' },
        ],
      },
    })
    const form = (widget.body as any[])[0]
    expect(form.type).toBe('form')
    expect(form.body[0].type).toBe('input-text')
    expect(form.body[1].type).toBe('select')
  })

  it('compiles FormDef TREE_SELECT to tree-select, not a flat select alias', () => {
    const widget = compileIrToWidget({
      apiVersion: IR_API_VERSION,
      kind: 'FormDef',
      metadata: { name: 'tree-form' },
      spec: {
        fields: [{ name: 'dept', label: '部门', controlType: 'TREE_SELECT' }],
      },
    })
    const form = (widget.body as any[])[0]
    expect(form.body[0].type).toBe('tree-select')
    expect(form.body[0].jdbcType).toBeUndefined()
  })
})

describe('factory', () => {
  it('registers and resolves type aliases', () => {
    const dummy = { name: 'Dummy' } as any
    registerRenderer({ type: 'input-text', alias: ['input-email'], component: dummy })
    expect(resolveRenderer('input-email')?.component).toBe(dummy)
    unRegisterRenderer('input-text')
  })

  it('returns null for unknown types', () => {
    expect(resolveRenderer('definitely-missing-xyz')).toBeNull()
  })
})

describe('formula', () => {
  it('filters templates', () => {
    expect(filterTpl('hi ${name}', { name: 'Ada' })).toBe('hi Ada')
    expect(filterTpl('${name|raw}', { name: '<b>Ada</b>' })).toBe('<b>Ada</b>')
    expect(filterTpl('${name|html}', { name: '<b>Ada</b>' })).toBe('&lt;b&gt;Ada&lt;&#x2F;b&gt;')
    expect(filterTpl("${age|default:'-'}", {})).toBe('-')
    expect(filterTpl('${event.data.responseData|json}', { event: { data: { responseData: { date: '1' } } } })).toBe(
      '{"date":"1"}',
    )
  })

  it('resolves this.xxx like Amis expressions', () => {
    expect(evalExpression('this.time % 5', { time: 10 })).toBe(false)
    expect(evalExpression('this.time % 5', { time: 11 })).toBe(true)
  })

  it('evaluates visibleOn', () => {
    expect(isVisible({ visibleOn: '${show}' }, { show: true })).toBe(true)
    expect(isVisible({ visibleOn: '${show}' }, { show: false })).toBe(false)
    expect(evalExpression('${1 + 1 == 2}', {})).toBe(true)
  })
})
