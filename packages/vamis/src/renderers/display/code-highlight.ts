import type * as Monaco from 'monaco-editor'

export type CodeToken = {
  regex: string
  regexFlags?: string
  name: string
  color?: string
  background?: string
  fontStyle?: string
}

export type CustomLang = {
  name: string
  tokens: CodeToken[]
  colors?: Record<string, string>
}

type MonacoNS = typeof Monaco

let monacoLoading: Promise<MonacoNS> | null = null

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function hexColor(value?: string): string | undefined {
  if (!value) return undefined
  return value.startsWith('#') ? value.slice(1) : value
}

async function setupMonacoEnvironment() {
  if (typeof window === 'undefined') return
  const env = globalThis as typeof globalThis & { MonacoEnvironment?: { getWorker: (id: string, label: string) => Worker } }
  if (env.MonacoEnvironment) return
  const [editorWorker, jsonWorker, cssWorker, htmlWorker, tsWorker] = await Promise.all([
    import('monaco-editor/editor/editor.worker.js?worker'),
    import('monaco-editor/language/json/json.worker.js?worker'),
    import('monaco-editor/language/css/css.worker.js?worker'),
    import('monaco-editor/language/html/html.worker.js?worker'),
    import('monaco-editor/language/typescript/ts.worker.js?worker'),
  ])
  env.MonacoEnvironment = {
    getWorker(_id: string, label: string) {
      if (label === 'json') return new jsonWorker.default()
      if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker.default()
      if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker.default()
      if (label === 'typescript' || label === 'javascript') return new tsWorker.default()
      return new editorWorker.default()
    },
  }
}

function ensureJsonMonarch(monaco: MonacoNS) {
  monaco.languages.setMonarchTokensProvider('json', {
    defaultToken: '',
    tokenPostfix: '.json',
    tokenizer: {
      root: [
        [/"([^"\\]|\\.)*"(?=\s*:)/, 'string.key.json'],
        [/"([^"\\]|\\.)*"/, 'string.value.json'],
        [/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/, 'number'],
        [/\b(?:true|false|null)\b/, 'keyword'],
        [/[{}[\]]/, 'delimiter.bracket'],
        [/[;,:]/, 'delimiter'],
      ],
    },
  })
}

export async function loadMonaco(): Promise<MonacoNS> {
  if (!monacoLoading) {
    monacoLoading = (async () => {
      await setupMonacoEnvironment()
      const monaco = await import('monaco-editor')
      // monaco 0.57 的 json 只在 worker 语言服务里挂 tokenizer，colorize 等不到。
      ensureJsonMonarch(monaco)
      return monaco
    })()
  }
  return monacoLoading
}

/** Amis customLang：注册 monarch tokenizer，主题名用 language name。 */
export function registerCustomLang(monaco: MonacoNS, lang?: CustomLang): string | undefined {
  if (!lang?.name || !Array.isArray(lang.tokens) || !lang.tokens.length) return undefined
  const langName = lang.name
  monaco.languages.register({ id: langName })
  const tokenizers: Array<[RegExp, string]> = []
  const rules: Monaco.editor.ITokenThemeRule[] = []
  for (const token of lang.tokens) {
    try {
      tokenizers.push([new RegExp(token.regex, token.regexFlags || undefined), token.name])
    } catch {
      continue
    }
    rules.push({
      token: token.name,
      foreground: hexColor(token.color),
      background: hexColor(token.background),
      fontStyle: token.fontStyle,
    })
  }
  monaco.languages.setMonarchTokensProvider(langName, {
    tokenizer: { root: tokenizers },
  })
  monaco.editor.defineTheme(langName, {
    base: 'vs',
    inherit: false,
    rules,
    colors: lang.colors && typeof lang.colors === 'object' ? lang.colors : {},
  })
  return langName
}

export async function colorize(
  source: string,
  language = 'plaintext',
  tabSize = 4,
  customLang?: CustomLang,
  editorTheme = 'vs',
): Promise<string> {
  const text = source ?? ''
  if (typeof window === 'undefined') return escapeHtml(text)
  try {
    const monaco = await loadMonaco()
    const customTheme = registerCustomLang(monaco, customLang)
    const lang = customLang?.name || language || 'plaintext'
    const theme = customTheme || editorTheme || 'vs'
    monaco.editor.setTheme(theme)
    return await monaco.editor.colorize(text, lang, { tabSize })
  } catch {
    return escapeHtml(text)
  }
}
