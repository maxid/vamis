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
const extraRulesByLang = new Map<string, Monaco.editor.ITokenThemeRule[]>()

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

function extraRules(): Monaco.editor.ITokenThemeRule[] {
  return [...extraRulesByLang.values()].flat()
}

function syncSharedTheme(monaco: MonacoNS) {
  const rules = extraRules()
  monaco.editor.defineTheme('vamis-vs', { base: 'vs', inherit: true, rules, colors: {} })
  monaco.editor.defineTheme('vamis-vs-dark', { base: 'vs-dark', inherit: true, rules, colors: {} })
  monaco.editor.defineTheme('vamis-hc-black', { base: 'hc-black', inherit: true, rules, colors: {} })
}

export function applyEditorTheme(monaco: MonacoNS, editorTheme: string): string {
  syncSharedTheme(monaco)
  const id =
    editorTheme === 'vs-dark' ? 'vamis-vs-dark' : editorTheme === 'hc-black' ? 'vamis-hc-black' : 'vamis-vs'
  monaco.editor.setTheme(id)
  return id
}

export async function loadMonaco(): Promise<MonacoNS> {
  if (!monacoLoading) {
    monacoLoading = (async () => {
      await setupMonacoEnvironment()
      const monaco = await import('monaco-editor')
      await import('monaco-editor/min/vs/editor/editor.main.css')
      ensureJsonMonarch(monaco)
      syncSharedTheme(monaco)
      return monaco
    })()
  }
  return monacoLoading
}

/** Amis customLang：注册 monarch。主题 inherit 共享 vs，避免 setTheme 冲掉同页其它块。 */
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
  extraRulesByLang.set(langName, rules)
  syncSharedTheme(monaco)
  return langName
}

export type MountCodeEditorOpts = {
  source: string
  language: string
  tabSize: number
  wordWrap: boolean
  theme: string
  customLang?: CustomLang
  lineNumbers: 'on' | 'off' | 'relative'
  folding: boolean
  maxHeight?: number
}

export function editorChrome(opts: { lineNumbers: 'on' | 'off' | 'relative'; folding: boolean }) {
  return {
    lineNumbers: opts.lineNumbers,
    folding: opts.folding,
    foldingStrategy: 'auto' as const,
    showFoldingControls: (opts.folding ? 'mouseover' : 'never') as 'mouseover' | 'never',
    glyphMargin: false,
    lineDecorationsWidth: opts.folding ? 12 : 0,
    lineNumbersMinChars: opts.lineNumbers === 'off' ? 0 : 3,
  }
}

export async function mountCodeEditor(el: HTMLElement, opts: MountCodeEditorOpts) {
  const monaco = await loadMonaco()
  registerCustomLang(monaco, opts.customLang)
  const theme = applyEditorTheme(monaco, opts.theme)
  const language = opts.customLang?.name || opts.language || 'plaintext'
  const editor = monaco.editor.create(el, {
    value: opts.source ?? '',
    language,
    theme,
    readOnly: true,
    domReadOnly: true,
    ...editorChrome(opts),
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: false,
    wordWrap: opts.wordWrap ? 'on' : 'off',
    wrappingStrategy: 'advanced',
    tabSize: opts.tabSize,
    renderLineHighlight: 'none',
    renderLineHighlightOnlyWhenFocus: true,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    cursorWidth: 0,
    mouseStyle: 'text',
    matchBrackets: 'never',
    selectionHighlight: false,
    guides: {
      indentation: false,
      highlightActiveIndentation: false,
      bracketPairs: false,
      bracketPairsHorizontal: false,
      highlightActiveBracketPair: false,
    },
    quickSuggestions: false,
    suggestOnTriggerCharacters: false,
    snippetSuggestions: 'none',
    wordBasedSuggestions: 'off',
    parameterHints: { enabled: false },
    hover: { enabled: false },
    occurrencesHighlight: 'off',
    renderValidationDecorations: 'off',
    contextmenu: false,
    links: false,
    fontSize: 13,
    lineHeight: 20,
    padding: { top: 8, bottom: 8 },
    scrollbar: {
      alwaysConsumeMouseWheel: false,
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
      horizontal: opts.wordWrap ? 'hidden' : 'visible',
    },
  })

  const textarea = el.querySelector('textarea.inputarea') as HTMLTextAreaElement | null
  if (textarea) {
    textarea.tabIndex = -1
    textarea.setAttribute('aria-hidden', 'true')
    textarea.style.pointerEvents = 'none'
    textarea.style.caretColor = 'transparent'
  }
  const blurCaret = () => {
    textarea?.blur()
    const active = el.ownerDocument.activeElement
    if (active instanceof HTMLElement && el.contains(active)) active.blur()
  }
  const focusSub = editor.onDidFocusEditorText(blurCaret)
  const widgetSub = editor.onDidFocusEditorWidget(blurCaret)

  let fitting = false
  const fit = () => {
    if (fitting) return
    fitting = true
    try {
      const width = Math.max(1, el.clientWidth)
      editor.layout({ width, height: Math.max(24, editor.getLayoutInfo().height || 24) })
      const wrapOff = editor.getRawOptions().wordWrap === 'off'
      const content = editor.getContentHeight() + (wrapOff ? editor.getLayoutInfo().horizontalScrollbarHeight || 0 : 0)
      const height = opts.maxHeight ? Math.min(content, opts.maxHeight) : content
      const next = Math.max(24, height)
      el.style.height = `${next}px`
      editor.layout({ width, height: next })
    } finally {
      fitting = false
    }
  }
  const sub = editor.onDidContentSizeChange(fit)
  const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => fit())
  ro?.observe(el)
  fit()

  return {
    monaco,
    editor,
    fit,
    dispose() {
      ro?.disconnect()
      focusSub.dispose()
      widgetSub.dispose()
      sub.dispose()
      editor.dispose()
    },
  }
}

export const EDITOR_HEIGHT: Record<string, number> = {
  sm: 100,
  md: 250,
  lg: 300,
  xl: 400,
  xxl: 500,
}

export function editorHeight(size?: unknown): number {
  if (typeof size === 'string' && size in EDITOR_HEIGHT) return EDITOR_HEIGHT[size]
  return EDITOR_HEIGHT.md
}

export function normalizeEditorValue(value: unknown, language?: string): string {
  let next: unknown = value
  if (next && typeof next !== 'string') {
    try {
      next = JSON.stringify(next, null, 2)
    } catch {
      next = String(next)
    }
  }
  let text = next == null ? '' : String(next)
  if (language === 'json' && text) {
    try {
      text = JSON.stringify(JSON.parse(text), null, 2)
    } catch {
      /* keep raw */
    }
  }
  return text
}

const FORM_EDITOR_DEFAULTS = {
  autoIndent: 'advanced' as const,
  formatOnType: true,
  formatOnPaste: true,
  selectOnLineNumbers: true,
  scrollBeyondLastLine: false,
  folding: true,
  minimap: { enabled: false },
  scrollbar: { alwaysConsumeMouseWheel: false },
  automaticLayout: true,
}

export type MountFormEditorOpts = {
  value: string
  language: string
  theme: string
  readOnly: boolean
  extra?: Record<string, unknown>
}

export async function mountFormEditor(el: HTMLElement, opts: MountFormEditorOpts) {
  const monaco = await loadMonaco()
  const theme = applyEditorTheme(monaco, opts.theme)
  const editor = monaco.editor.create(el, {
    value: opts.value ?? '',
    language: opts.language || 'javascript',
    theme,
    ...FORM_EDITOR_DEFAULTS,
    ...(opts.extra || {}),
    readOnly: opts.readOnly,
  })
  monaco.languages.json?.jsonDefaults.setDiagnosticsOptions({
    enableSchemaRequest: true,
    validate: true,
    allowComments: true,
    ...monaco.languages.json?.jsonDefaults.diagnosticsOptions,
  })
  return {
    monaco,
    editor,
    dispose() {
      editor.dispose()
    },
  }
}

export type MountDiffEditorOpts = {
  original: string
  modified: string
  language: string
  theme: string
  readOnly: boolean
  extra?: Record<string, unknown>
}

export async function mountDiffEditor(el: HTMLElement, opts: MountDiffEditorOpts) {
  const monaco = await loadMonaco()
  const theme = applyEditorTheme(monaco, opts.theme)
  const language = opts.language || 'javascript'
  const editor = monaco.editor.createDiffEditor(el, {
    ...FORM_EDITOR_DEFAULTS,
    automaticLayout: true,
    originalEditable: false,
    renderSideBySide: true,
    ...(opts.extra || {}),
    readOnly: opts.readOnly,
    theme,
  })
  const original = monaco.editor.createModel(opts.original ?? '', language)
  const modified = monaco.editor.createModel(opts.modified ?? '', language)
  editor.setModel({ original, modified })
  return {
    monaco,
    editor,
    original,
    modified,
    dispose() {
      editor.setModel(null)
      original.dispose()
      modified.dispose()
      editor.dispose()
    },
  }
}
