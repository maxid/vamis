import { describe, expect, it } from 'vitest'
import { registerRenderer, unRegisterRenderer } from '../src/factory'
import {
  SCHEMA_PROPERTY_DOCS,
  SCHEMA_PROPERTY_KEYS,
  componentJsonSchema,
  jsonCompletionsForLine,
  registerSchemaTypeDoc,
  resolveSchemaPropertyDoc,
  resolveSchemaTypeDoc,
  schemaHoverForLine,
  yamlCompletionsForLine,
} from '../src/schema-completions'

const dummy = { name: 'Dummy', render: () => null }

const types = ['page', 'form', 'editor', 'tpl']

describe('yamlCompletionsForLine', () => {
  it('suggests types after type: with documentation', () => {
    const all = yamlCompletionsForLine('type: ', types)
    expect(all.map((item) => item.label)).toEqual(types)
    const page = all.find((item) => item.label === 'page')
    expect(page?.kind).toBe('type')
    expect(page?.title).toContain('页面')
    expect(page?.documentation).toContain('page')
    expect(page?.documentation).toMatch(/独立|顶级|Scope/)
    expect(yamlCompletionsForLine('  type: pa', types).map((item) => item.label)).toEqual(['page'])
    expect(yamlCompletionsForLine('  - type: ed', types).map((item) => item.label)).toEqual(['editor'])
  })

  it('suggests schema keys with property docs', () => {
    const items = yamlCompletionsForLine('  lab', types)
    const label = items.find((item) => item.label === 'label')
    expect(label).toBeTruthy()
    expect(label?.kind).toBe('key')
    expect(label?.documentation).toMatch(/标签|表单项/)
    expect(items.every((item) => item.label.startsWith('lab'))).toBe(true)
  })

  it('does not suggest in scalar values', () => {
    expect(yamlCompletionsForLine('  title: Hello', types)).toEqual([])
  })
})

describe('jsonCompletionsForLine', () => {
  it('suggests types after "type": "', () => {
    const items = jsonCompletionsForLine('  "type": "pa', types)
    expect(items.map((item) => item.label)).toEqual(['page'])
    expect(items[0].documentation).toContain('页面')
  })

  it('suggests keys after opening quote', () => {
    const items = jsonCompletionsForLine('{ "lab', types)
    expect(items.map((item) => item.label)).toContain('label')
    expect(items.find((item) => item.label === 'label')?.documentation).toBeTruthy()
  })
})

describe('componentJsonSchema', () => {
  it('enums registered types and documents properties', () => {
    const schema = componentJsonSchema(types) as {
      additionalProperties: boolean
      properties: Record<string, { description?: string; enum?: string[] }>
    }
    expect(schema.properties.type.enum).toEqual(types)
    expect(schema.properties.type.description).toMatch(/组件/)
    expect(schema.additionalProperties).toBe(true)
    expect(schema.properties.hideButtons?.description).toMatch(/按钮/)
    expect(schema.properties.intellisense?.description).toMatch(/感知/)
    expect(schema.properties.body?.description).toMatch(/子节点|内容/)
    expect(SCHEMA_PROPERTY_KEYS).toContain('hideButtons')
    expect(SCHEMA_PROPERTY_KEYS).toContain('intellisense')
    expect(SCHEMA_PROPERTY_DOCS.label.description).toBeTruthy()
  })
})

describe('schema docs registry', () => {
  it('lets apps register extra type docs for reuse', () => {
    registerSchemaTypeDoc('acme-chart', {
      title: 'Acme Chart',
      category: '扩展',
      description: '低码应用自定义图表。',
    })
    const doc = resolveSchemaTypeDoc('acme-chart')
    expect(doc.title).toBe('Acme Chart')
    expect(doc.description).toContain('自定义图表')
    expect(resolveSchemaPropertyDoc('type')?.description).toMatch(/组件/)
  })

  it('picks up registerRenderer name/description', () => {
    registerRenderer({
      type: 'acme-grid',
      component: dummy,
      name: 'Acme Grid',
      description: '低码应用自定义栅格。',
    })
    expect(resolveSchemaTypeDoc('acme-grid').title).toBe('Acme Grid')
    expect(resolveSchemaTypeDoc('acme-grid').description).toContain('自定义栅格')
    unRegisterRenderer('acme-grid')
  })

  it('hover explains the token on a yaml type line', () => {
    const hover = schemaHoverForLine('  type: page', 'page', 'yaml')
    expect(hover?.label).toBe('page')
    expect(hover?.documentation).toContain('页面')
    expect(schemaHoverForLine('  label: 名称', 'label', 'yaml')?.kind).toBe('key')
  })
})
