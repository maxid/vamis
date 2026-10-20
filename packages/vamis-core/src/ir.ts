import type { PlainObject, SchemaObject } from './types'
import { parseYaml, stringifyYaml } from './yaml'

export const IR_API_VERSION = 'lcdp.ir/v1'

/**
 * xdmp LCDP IR kinds (from lcdp.ir/v1) plus vamis extension `UiPage`.
 * UiPage holds an Amis-compatible widget tree in spec; it is the extension
 * point for later embedding into PageDef (pageKind: SCHEMA).
 */
export const LCDP_IR_KINDS = [
  'TableDef',
  'FormDef',
  'ActionDef',
  'PageDef',
  'ViewDef',
  'JobDef',
  'ChartDef',
  'ReportDef',
  'BizDef',
] as const

export type LcdpIrKind = (typeof LCDP_IR_KINDS)[number]
export type VamisIrKind = LcdpIrKind | 'UiPage'

export interface IrMetadata {
  name: string
  description?: string
  businessTerms?: string[]
  useCases?: string[]
  labels?: Record<string, string>
}

export interface IrDocument<T = unknown> {
  apiVersion: string
  kind: string
  metadata: IrMetadata
  spec: T
}

export function isIrDocument(value: unknown): value is IrDocument {
  if (!value || typeof value !== 'object') return false
  const doc = value as IrDocument
  return (
    typeof doc.apiVersion === 'string' &&
    typeof doc.kind === 'string' &&
    !!doc.metadata &&
    typeof doc.metadata === 'object' &&
    typeof doc.metadata.name === 'string' &&
    doc.spec !== undefined
  )
}

function slugify(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'untitled'
}

export function jsonToIr(input: unknown): IrDocument {
  if (isIrDocument(input)) {
    return {
      ...input,
      apiVersion: input.apiVersion || IR_API_VERSION,
    }
  }

  const schema = (input && typeof input === 'object' ? input : {}) as SchemaObject
  const title =
    (typeof schema.title === 'string' && schema.title) ||
    (typeof schema.name === 'string' && schema.name) ||
    'imported-page'
  const widget: SchemaObject =
    schema.type != null
      ? schema
      : { type: 'page', body: schema as unknown as SchemaObject }

  return {
    apiVersion: IR_API_VERSION,
    kind: 'UiPage',
    metadata: {
      name: slugify(title),
      description: title,
      labels: {
        source: 'amis',
        vamisKind: String(widget.type || 'page'),
      },
    },
    spec: widget,
  }
}

export function parseSchemaText(text: string): unknown {
  const trimmed = text.trim()
  if (!trimmed) return {}
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return JSON.parse(trimmed)
  }
  return parseYaml(trimmed)
}

export function parseToIr(text: string): IrDocument {
  return jsonToIr(parseSchemaText(text))
}

export function yamlFromIr(doc: IrDocument): string {
  return stringifyYaml(doc)
}

export function yamlFromUnknown(input: unknown): string {
  return yamlFromIr(jsonToIr(input))
}

const CONTROL_TYPE_MAP: Record<string, string> = {
  INPUT: 'input-text',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  TREE_SELECT: 'tree-select',
  NUMBER: 'input-number',
  INPUT_NUMBER: 'input-number',
  SWITCH: 'switch',
  DATE: 'input-date',
  DATETIME: 'input-date',
  CHECKBOX: 'checkbox',
  RADIO: 'radios',
  RADIOS: 'radios',
}

function compileFormDef(doc: IrDocument): SchemaObject {
  const spec = (doc.spec || {}) as PlainObject
  const fields = Array.isArray(spec.fields) ? spec.fields : []
  return {
    type: 'page',
    title: spec.formComment || doc.metadata.description || doc.metadata.name,
    body: [
      {
        type: 'form',
        name: doc.metadata.name,
        mode: spec.layout?.labelPosition === 'LEFT' ? 'horizontal' : 'normal',
        body: fields.map((field: PlainObject) => ({
          type: CONTROL_TYPE_MAP[String(field.controlType || 'INPUT')] || 'input-text',
          name: field.name,
          label: field.label || field.name,
          required: !!field.required,
          disabled: !!field.readonly,
          visible: field.visible !== false,
          multiple: !!field.multiple,
        })),
      },
    ],
  }
}

function compileTableDef(doc: IrDocument): SchemaObject {
  const spec = (doc.spec || {}) as PlainObject
  const columns = Array.isArray(spec.columns) ? spec.columns : []
  return {
    type: 'page',
    title: spec.tableComment || doc.metadata.description || doc.metadata.name,
    body: [
      {
        type: 'crud',
        name: doc.metadata.name,
        api: spec.runtimeApi || '/api/mock2/sample',
        syncLocation: false,
        columns: columns
          .filter((col: PlainObject) => col.listVisible !== false && !col.pk)
          .map((col: PlainObject) => ({
            name: col.name,
            label: col.comment || col.name,
            sortable: !!col.sortable,
          })),
      },
    ],
  }
}

/**
 * Compile an IR document into an Amis-compatible widget tree.
 * Unknown kinds become a visible placeholder page instead of crashing.
 */
export function compileIrToWidget(doc: IrDocument): SchemaObject {
  const spec = (doc.spec || {}) as PlainObject

  if (doc.kind === 'UiPage') {
    if (spec.type) return spec as SchemaObject
    return { type: 'page', body: spec as SchemaObject }
  }

  if (doc.kind === 'FormDef') return compileFormDef(doc)
  if (doc.kind === 'TableDef') return compileTableDef(doc)

  if (doc.kind === 'PageDef') {
    if (spec.schema) return spec.schema as SchemaObject
    if (spec.type) return spec as SchemaObject
    return {
      type: 'page',
      title: doc.metadata.description || doc.metadata.name,
      body: [
        {
          type: 'tpl',
          tpl: `PageDef「${doc.metadata.name}」尚未声明 schema / pageKind=SCHEMA。`,
        },
      ],
    }
  }

  return {
    type: 'page',
    title: `${doc.kind}: ${doc.metadata.name}`,
    body: [
      {
        type: 'tpl',
        tpl: `kind=${doc.kind} 已解析为 IR，运行时尚未实现该 kind 的编译器。`,
      },
    ],
  }
}

export function documentToWidget(input: unknown): SchemaObject {
  return compileIrToWidget(jsonToIr(input))
}
