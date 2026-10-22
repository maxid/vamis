import {
  componentJsonSchema,
  jsonCompletionsForLine,
  yamlCompletionsForLine,
  getRenderers,
  registerSchemaTypeDoc,
  resolveSchemaTypeDoc,
  schemaHoverForLine,
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
  for (const renderer of getRenderers()) {
    if (!renderer.name && !renderer.description) continue
    const base = resolveSchemaTypeDoc(renderer.type)
    const doc = {
      title: renderer.name || base.title,
      category: base.category || '扩展',
      description: renderer.description || base.description,
      detail: base.detail,
    }
    registerSchemaTypeDoc(renderer.type, doc)
    for (const alias of renderer.alias || []) registerSchemaTypeDoc(alias, doc)
  }
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

function tokenAt(model: Monaco.editor.ITextModel, position: Monaco.Position): string {
  const line = model.getLineContent(position.lineNumber)
  const col = Math.min(Math.max(position.column - 1, 0), line.length)
  const isWord = (ch: string | undefined) => !!ch && /[A-Za-z0-9_-]/.test(ch)
  let start = col
  let end = col
  while (start > 0 && isWord(line[start - 1])) start -= 1
  while (end < line.length && isWord(line[end])) end += 1
  return line.slice(start, end)
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
    hydrateRendererDocs()
    const until = model.getLineContent(position.lineNumber).slice(0, position.column - 1)
    const types = rendererTypeNames()
    const items =
      model.getLanguageId() === 'json'
        ? jsonCompletionsForLine(until, types)
        : yamlCompletionsForLine(until, types)
    const prefix = until.match(/[A-Za-z0-9_-]*$/)?.[0] ?? ''
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
    hydrateRendererDocs()
    const language = model.getLanguageId() === 'json' ? 'json' : 'yaml'
    const word = tokenAt(model, position)
    const hover = schemaHoverForLine(model.getLineContent(position.lineNumber), word, language)
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
