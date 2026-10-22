import {
  componentJsonSchema,
  getRenderers,
  publishRendererIntellisense,
  schemaCompletionsAt,
  schemaHoverAt,
  type SchemaCompletion,
} from '@vamis/core'
import type * as Monaco from 'monaco-editor'

type MonacoNS = typeof Monaco

export const VAMIS_SCHEMA_JSON_URI = 'inmemory://vamis/component.json'

let schemaModelSeq = 0
let registered: MonacoNS | null = null

export function rendererTypeNames(): string[] {
  const names = new Set<string>()
  for (const renderer of getRenderers()) {
    names.add(renderer.type)
    for (const alias of renderer.alias || []) names.add(alias)
  }
  return [...names].sort()
}

function hydrateRendererDocs() {
  for (const renderer of getRenderers()) publishRendererIntellisense(renderer)
}

export function nextSchemaModelUri(monaco: MonacoNS, language: string) {
  const ext = language === 'json' ? 'json' : 'yaml'
  schemaModelSeq += 1
  return monaco.Uri.parse(`inmemory://model/vamis-schema-${schemaModelSeq}.${ext}`)
}

export function isSchemaModel(model: Monaco.editor.ITextModel) {
  return /vamis-schema/i.test(model.uri.toString())
}

function applyJsonSchema(monaco: MonacoNS) {
  const json = monaco.languages.json?.jsonDefaults
  if (!json) return
  const prev = json.diagnosticsOptions || {}
  const rest = (prev.schemas || []).filter((item) => item.uri !== VAMIS_SCHEMA_JSON_URI)
  json.setDiagnosticsOptions({
    ...prev,
    validate: true,
    allowComments: true,
    enableSchemaRequest: false,
    schemas: [
      ...rest,
      {
        uri: VAMIS_SCHEMA_JSON_URI,
        fileMatch: ['vamis-schema-*.json'],
        schema: componentJsonSchema(rendererTypeNames()),
      },
    ],
  })
}

function toCompletionItem(
  monaco: MonacoNS,
  item: SchemaCompletion,
  index: number,
  range: Monaco.IRange,
): Monaco.languages.CompletionItem {
  return {
    label: item.title ? { label: item.label, description: item.title } : item.label,
    kind:
      item.kind === 'type'
        ? monaco.languages.CompletionItemKind.Enum
        : item.kind === 'event'
          ? monaco.languages.CompletionItemKind.Event
          : item.kind === 'action'
            ? monaco.languages.CompletionItemKind.Method
            : monaco.languages.CompletionItemKind.Property,
    insertText: item.label,
    range,
    sortText: String(index).padStart(4, '0'),
    detail: item.detail,
    documentation: { value: item.documentation, isTrusted: true },
  }
}

/**
 * 给 Monaco 挂上 Vamis schema 补全 / 悬停。低码应用自管编辑器时调用一次即可；
 * `intellisense: schema` 的 Editor 会自动调用。
 */
export function registerSchemaIntellisense(monaco: MonacoNS) {
  hydrateRendererDocs()
  applyJsonSchema(monaco)
  if (registered === monaco) return
  registered = monaco
  const provideCompletionItems: Monaco.languages.CompletionItemProvider['provideCompletionItems'] = (
    model,
    position,
  ) => {
    if (!isSchemaModel(model)) return { suggestions: [] }
    const offset = model.getOffsetAt(position)
    const text = model.getValue()
    const language = model.getLanguageId() === 'json' ? 'json' : 'yaml'
    const items = schemaCompletionsAt(text, offset, language, rendererTypeNames())
    const prefix = text.slice(0, offset).match(/[A-Za-z0-9_-]*$/)?.[0] ?? ''
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: position.column - prefix.length,
      endColumn: position.column,
    }
    return {
      suggestions: items.map((item, index) => toCompletionItem(monaco, item, index, range)),
    }
  }
  const provideHover: Monaco.languages.HoverProvider['provideHover'] = (model, position) => {
    if (!isSchemaModel(model)) return null
    const language = model.getLanguageId() === 'json' ? 'json' : 'yaml'
    const hover = schemaHoverAt(model.getValue(), model.getOffsetAt(position), language)
    if (!hover) return null
    return {
      contents: [{ value: hover.documentation, isTrusted: true }],
    }
  }
  const provider: Monaco.languages.CompletionItemProvider = {
    triggerCharacters: [':', ' ', '"', '-', '\n'],
    provideCompletionItems,
  }
  monaco.languages.registerCompletionItemProvider('yaml', provider)
  monaco.languages.registerCompletionItemProvider('json', provider)
  monaco.languages.registerHoverProvider('yaml', { provideHover })
  monaco.languages.registerHoverProvider('json', { provideHover })
}
