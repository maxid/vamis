export const SCHEMA_PROPERTY_KEYS = [
  'type',
  'name',
  'label',
  'title',
  'body',
  'data',
  'api',
  'initApi',
  'source',
  'value',
  'placeholder',
  'className',
  'style',
  'size',
  'mode',
  'disabled',
  'disabledOn',
  'visible',
  'visibleOn',
  'hidden',
  'hiddenOn',
  'required',
  'description',
  'options',
  'actions',
  'toolbar',
  'aside',
  'header',
  'footer',
  'columns',
  'items',
  'tabs',
  'onEvent',
  'id',
  'language',
  'editorTheme',
  'allowFullscreen',
  'hideButtons',
  'intellisense',
  'diffValue',
  'wrapWithPanel',
  'submitText',
  'debug',
] as const

export type SchemaCompletion = { label: string; kind: 'type' | 'key' }

function prefixed(items: readonly string[], prefix: string): string[] {
  if (!prefix) return [...items]
  return items.filter((item) => item.startsWith(prefix))
}

export function yamlCompletionsForLine(until: string, types: readonly string[]): SchemaCompletion[] {
  const typeValue = until.match(/^(\s*(?:-\s+)?type:\s*)(.*)$/)
  if (typeValue) {
    return prefixed(types, typeValue[2]).map((label) => ({ label, kind: 'type' }))
  }
  const keyPos = until.match(/^(\s*(?:-\s+)?)([\w-]*)$/)
  if (keyPos) {
    return prefixed(SCHEMA_PROPERTY_KEYS, keyPos[2]).map((label) => ({ label, kind: 'key' }))
  }
  return []
}

export function jsonCompletionsForLine(until: string, types: readonly string[]): SchemaCompletion[] {
  const typeValue = until.match(/"type"\s*:\s*"([^"]*)$/)
  if (typeValue) {
    return prefixed(types, typeValue[1]).map((label) => ({ label, kind: 'type' }))
  }
  const keyPos = until.match(/^\s*"([\w-]*)$/) || until.match(/[\{,]\s*"([\w-]*)$/)
  if (keyPos) {
    return prefixed(SCHEMA_PROPERTY_KEYS, keyPos[1]).map((label) => ({ label, kind: 'key' }))
  }
  return []
}

export function componentJsonSchema(types: readonly string[]): Record<string, unknown> {
  const item = { $ref: '#' }
  const properties: Record<string, unknown> = {
    type: { type: 'string', enum: [...types], description: '组件 type' },
    name: { type: 'string' },
    label: { oneOf: [{ type: 'string' }, { type: 'boolean' }] },
    title: { type: 'string' },
    body: { oneOf: [item, { type: 'array', items: item }] },
    data: { type: 'object' },
    value: {},
    options: { type: 'object' },
    actions: { type: 'array' },
    hideButtons: { type: 'boolean', description: '隐藏按钮区（全屏工具条；作为表单唯一项时也隐藏默认提交/重置）' },
    intellisense: {
      description: '代码感知。true 用语言默认；false 关闭；schema 按 Vamis 组件 schema 补全 YAML/JSON',
      oneOf: [{ type: 'boolean' }, { const: 'schema' }],
    },
    language: { type: 'string' },
    size: { type: 'string' },
    allowFullscreen: { type: 'boolean' },
    editorTheme: { type: 'string' },
    placeholder: { type: 'string' },
    className: { type: 'string' },
    disabled: { type: 'boolean' },
    onEvent: { type: 'object' },
  }
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Vamis Schema',
    type: 'object',
    additionalProperties: true,
    properties,
  }
}
