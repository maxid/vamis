import { describe, expect, it } from 'vitest'
import {
  SCHEMA_PROPERTY_KEYS,
  componentJsonSchema,
  jsonCompletionsForLine,
  yamlCompletionsForLine,
} from '../src/schema-completions'

const types = ['page', 'form', 'editor', 'tpl']

describe('yamlCompletionsForLine', () => {
  it('suggests types after type:', () => {
    expect(yamlCompletionsForLine('type: ', types).map((item) => item.label)).toEqual(types)
    expect(yamlCompletionsForLine('  type: pa', types).map((item) => item.label)).toEqual(['page'])
    expect(yamlCompletionsForLine('  - type: ed', types).map((item) => item.label)).toEqual(['editor'])
  })

  it('suggests schema keys at indent', () => {
    const labels = yamlCompletionsForLine('  lab', types).map((item) => item.label)
    expect(labels).toContain('label')
    expect(labels.every((label) => label.startsWith('lab'))).toBe(true)
  })

  it('does not suggest in scalar values', () => {
    expect(yamlCompletionsForLine('  title: Hello', types)).toEqual([])
  })
})

describe('jsonCompletionsForLine', () => {
  it('suggests types after "type": "', () => {
    expect(jsonCompletionsForLine('  "type": "pa', types).map((item) => item.label)).toEqual(['page'])
  })

  it('suggests keys after opening quote', () => {
    expect(jsonCompletionsForLine('{ "lab', types).map((item) => item.label)).toContain('label')
  })
})

describe('componentJsonSchema', () => {
  it('enums registered types and keeps extra properties open', () => {
    const schema = componentJsonSchema(types) as {
      additionalProperties: boolean
      properties: { type: { enum: string[] }; hideButtons: unknown; intellisense: unknown }
    }
    expect(schema.properties.type.enum).toEqual(types)
    expect(schema.additionalProperties).toBe(true)
    expect(schema.properties.hideButtons).toBeTruthy()
    expect(schema.properties.intellisense).toBeTruthy()
    expect(SCHEMA_PROPERTY_KEYS).toContain('hideButtons')
    expect(SCHEMA_PROPERTY_KEYS).toContain('intellisense')
  })
})
