import { describe, expect, it } from 'vitest'
import { parseYaml, stringifyYaml } from '../src/yaml'
import { jsonToIr, yamlFromIr } from '../src/ir'

describe('YAML 1.2 Core dump/load', () => {
  it('does not quote numbers, booleans, or null', () => {
    const yaml = stringifyYaml({
      required: true,
      hidden: false,
      perPage: 5,
      ratio: 1.5,
      deleted: null,
    })
    expect(yaml).toContain('required: true')
    expect(yaml).toContain('hidden: false')
    expect(yaml).toContain('perPage: 5')
    expect(yaml).toContain('ratio: 1.5')
    expect(yaml).toContain('deleted: null')
    expect(yaml).not.toMatch(/required: ["']true["']/)
    expect(yaml).not.toMatch(/perPage: ["']5["']/)
  })

  it('quotes strings that look like booleans, numbers, or contain colon', () => {
    const yaml = stringifyYaml({
      flag: 'true',
      classic: 'yes',
      switched: 'On',
      zip: '012',
      clock: '8:00',
    })
    expect(yaml).toContain('flag: "true"')
    expect(yaml).toContain('classic: "yes"')
    expect(yaml).toContain('switched: "On"')
    expect(yaml).toContain('zip: "012"')
    expect(yaml).toContain('clock: "8:00"')
    const parsed = parseYaml(yaml) as Record<string, unknown>
    expect(parsed.flag).toBe('true')
    expect(parsed.classic).toBe('yes')
    expect(parsed.switched).toBe('On')
    expect(parsed.zip).toBe('012')
  })

  it('parses YAML 1.1 bool words as strings under Core schema', () => {
    const parsed = parseYaml('a: yes\nb: On\nc: true\n') as Record<string, unknown>
    expect(parsed.a).toBe('yes')
    expect(parsed.b).toBe('On')
    expect(parsed.c).toBe(true)
  })

  it('round-trips UiPage without inventing field type metadata', () => {
    const yaml = yamlFromIr(
      jsonToIr({
        type: 'form',
        body: [{ type: 'switch', name: 'vip', required: true }],
      }),
    )
    expect(yaml).toContain('required: true')
    expect(yaml).not.toContain('jdbcType')
    expect(yaml).not.toContain('javaType')
    const parsed = parseYaml(yaml) as { spec: { body: Array<{ required: boolean }> } }
    expect(parsed.spec.body[0].required).toBe(true)
  })
})
