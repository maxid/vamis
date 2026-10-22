import {
  componentJsonSchema,
  jsonCompletionsForLine,
  yamlCompletionsForLine,
  getRenderers,
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

export function registerSchemaIntellisense(monaco: MonacoNS) {
  applyJsonSchema(monaco)
  if (registered === monaco) return
  registered = monaco
  const provideCompletionItems: Monaco.languages.CompletionItemProvider['provideCompletionItems'] = (
    model,
    position,
  ) => {
    if (!isSchemaModel(model)) return { suggestions: [] }
    const until = model.getLineContent(position.lineNumber).slice(0, position.column - 1)
    const types = rendererTypeNames()
    const items =
      model.getLanguageId() === 'json'
        ? jsonCompletionsForLine(until, types)
        : yamlCompletionsForLine(until, types)
    const word = model.getWordUntilPosition(position)
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    }
    return {
      suggestions: items.map((item, index) => ({
        label: item.label,
        kind:
          item.kind === 'type'
            ? monaco.languages.CompletionItemKind.Enum
            : monaco.languages.CompletionItemKind.Property,
        insertText: item.label,
        range,
        sortText: String(index).padStart(4, '0'),
      })),
    }
  }
  const provider: Monaco.languages.CompletionItemProvider = {
    triggerCharacters: [':', ' ', '"', '-', '\n'],
    provideCompletionItems,
  }
  monaco.languages.registerCompletionItemProvider('yaml', provider)
  monaco.languages.registerCompletionItemProvider('json', provider)
}
