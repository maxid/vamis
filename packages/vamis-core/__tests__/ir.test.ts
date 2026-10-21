import { describe, expect, it } from 'vitest'
import {
  compileIrToWidget,
  IR_API_VERSION,
  jsonToIr,
  parseSchemaText,
  parseToIr,
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
  })

  it('evaluates visibleOn', () => {
    expect(isVisible({ visibleOn: '${show}' }, { show: true })).toBe(true)
    expect(isVisible({ visibleOn: '${show}' }, { show: false })).toBe(false)
    expect(evalExpression('${1 + 1 == 2}', {})).toBe(true)
  })
})
