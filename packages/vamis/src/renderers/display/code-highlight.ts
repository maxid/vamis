import type * as Monaco from 'monaco-editor'
import './monaco-host.css'

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
  const overflowHost = monacoOverflowHost(opts.theme)
  const editor = monaco.editor.create(el, {
    value: opts.source ?? '',
    language,
    theme,
    readOnly: true,
    domReadOnly: true,
    ...editorChrome(opts),
    fixedOverflowWidgets: true,
    overflowWidgetsDomNode: overflowHost,
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
    hover: { enabled: 'off' },
    colorDecorators: true,
    colorDecoratorsActivatedOn: 'click',
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
  syncOverflowHostTheme(editor, opts.theme)

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
  syncMonacoHostTypo(monaco, editor)
  const typoSub = editor.onDidChangeConfiguration(() => syncMonacoHostTypo(monaco, editor))
  fit()

  return {
    monaco,
    editor,
    fit,
    dispose() {
      ro?.disconnect()
      focusSub.dispose()
      widgetSub.dispose()
      typoSub.dispose()
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

export function editorHeight(size?: unknown): number | string {
  if (size === 'full') return '100%'
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
  fixedOverflowWidgets: true,
}

const OVERFLOW_HOST_ID = 'vamis-monaco-overflow'

function monacoBaseTheme(theme: string): 'vs' | 'vs-dark' | 'hc-black' {
  if (theme.includes('dark')) return 'vs-dark'
  if (theme.includes('hc')) return 'hc-black'
  return 'vs'
}

export function monacoOverflowHost(theme: string): HTMLElement | undefined {
  if (typeof document === 'undefined') return undefined
  let host = document.getElementById(OVERFLOW_HOST_ID)
  if (!host) {
    host = document.createElement('div')
    host.id = OVERFLOW_HOST_ID
    host.className = 'vamis-monaco-overflow monaco-editor'
    host.setAttribute('aria-hidden', 'true')
    document.body.appendChild(host)
  }
  host.classList.remove('vs', 'vs-dark', 'hc-black')
  host.classList.add(monacoBaseTheme(theme))
  return host
}

export function syncOverflowHostTheme(
  editor: Monaco.editor.IStandaloneCodeEditor | Monaco.editor.IDiffEditor,
  theme: string,
) {
  const host = monacoOverflowHost(theme)
  if (!host) return
  const node =
    'getModifiedEditor' in editor ? editor.getModifiedEditor().getDomNode() : editor.getDomNode()
  if (!node) return
  const cs = getComputedStyle(node)
  for (const prop of Array.from(cs)) {
    if (prop.startsWith('--vscode-')) host.style.setProperty(prop, cs.getPropertyValue(prop))
  }
}

export function syncEditorPlaceholder(
  monaco: MonacoNS,
  editor: Monaco.editor.IStandaloneCodeEditor,
  el: HTMLElement | null,
) {
  if (!el) return
  const info = editor.getLayoutInfo()
  el.style.left = `${info.contentLeft}px`
  el.style.width = `${Math.max(0, info.contentWidth - info.verticalScrollbarWidth)}px`
  el.style.top = `${editor.getTopForLineNumber(1)}px`
  el.style.fontFamily = editor.getOption(monaco.editor.EditorOption.fontFamily)
  el.style.fontSize = `${editor.getOption(monaco.editor.EditorOption.fontSize)}px`
  el.style.lineHeight = `${editor.getOption(monaco.editor.EditorOption.lineHeight)}px`
}

/** Close the inherit chain at the Monaco host so inner `line-height: inherit`
 *  reads the editor's px, not doc-prose / Preflight. */
export function syncMonacoHostTypo(
  monaco: MonacoNS,
  editor: Monaco.editor.IStandaloneCodeEditor | Monaco.editor.IDiffEditor,
) {
  const nodes: HTMLElement[] = []
  if ('getModifiedEditor' in editor) {
    const original = editor.getOriginalEditor().getDomNode()
    const modified = editor.getModifiedEditor().getDomNode()
    if (original) nodes.push(original)
    if (modified) nodes.push(modified)
  } else {
    const node = editor.getDomNode()
    if (node) nodes.push(node)
  }
  const sample = nodes[0]
  if (!sample) return
  const standalone =
    'getModifiedEditor' in editor ? editor.getModifiedEditor() : editor
  const fontSize = standalone.getOption(monaco.editor.EditorOption.fontSize)
  const lineHeight = standalone.getOption(monaco.editor.EditorOption.lineHeight)
  const fontFamily = standalone.getOption(monaco.editor.EditorOption.fontFamily)
  const fontWeight = String(standalone.getOption(monaco.editor.EditorOption.fontWeight) || 'normal')
  const apply = (el: HTMLElement | null) => {
    if (!el) return
    el.style.setProperty('--vscode-editor-font-size', `${fontSize}px`)
    el.style.setProperty('--vscode-editor-line-height', `${lineHeight}px`)
    el.style.setProperty('--vscode-editor-font-family', fontFamily)
    el.style.fontSize = `${fontSize}px`
    el.style.lineHeight = `${lineHeight}px`
    el.style.fontFamily = fontFamily
    el.style.fontWeight = fontWeight
    el.style.letterSpacing = 'normal'
  }
  for (const node of nodes) {
    apply(node)
    apply(node.closest('.vamis-monaco, .vamis-code--editor'))
  }
}

export type EditorIntellisense = boolean | 'schema'

export type MountFormEditorOpts = {
  value: string
  language: string
  theme: string
  readOnly: boolean
  extra?: Record<string, unknown>
  intellisense?: EditorIntellisense
}

function intellisenseExtra(flag: EditorIntellisense | undefined): Record<string, unknown> {
  if (flag === false) {
    return {
      quickSuggestions: false,
      suggestOnTriggerCharacters: false,
      parameterHints: { enabled: false },
      wordBasedSuggestions: 'off',
      hover: { enabled: 'off' },
      snippetSuggestions: 'none',
    }
  }
  return {}
}

export async function mountFormEditor(el: HTMLElement, opts: MountFormEditorOpts) {
  const monaco = await loadMonaco()
  const theme = applyEditorTheme(monaco, opts.theme)
  const overflowHost = monacoOverflowHost(opts.theme)
  const language = opts.language || 'javascript'
  const schemaAware =
    opts.intellisense === 'schema' && (language === 'json' || language === 'yaml')
  let model: Monaco.editor.ITextModel | undefined
  if (schemaAware) {
    const { nextSchemaModelUri, registerSchemaIntellisense } = await import('./schema-intellisense')
    registerSchemaIntellisense(monaco)
    model = monaco.editor.createModel(opts.value ?? '', language, nextSchemaModelUri(monaco, language))
  }
  const editor = monaco.editor.create(el, {
    ...(model ? { model } : { value: opts.value ?? '', language }),
    theme,
    ...FORM_EDITOR_DEFAULTS,
    ...intellisenseExtra(opts.intellisense),
    ...(opts.extra || {}),
    readOnly: opts.readOnly,
    fixedOverflowWidgets: true,
    overflowWidgetsDomNode: overflowHost,
  })
  syncOverflowHostTheme(editor, opts.theme)
  syncMonacoHostTypo(monaco, editor)
  const typoSub = editor.onDidChangeConfiguration(() => syncMonacoHostTypo(monaco, editor))
  const jsonDefaults = monaco.json?.jsonDefaults
  jsonDefaults?.setDiagnosticsOptions({
    enableSchemaRequest: true,
    validate: true,
    allowComments: true,
    ...jsonDefaults.diagnosticsOptions,
  })
  return {
    monaco,
    editor,
    dispose() {
      typoSub.dispose()
      editor.dispose()
      model?.dispose()
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
  const overflowHost = monacoOverflowHost(opts.theme)
  const editor = monaco.editor.createDiffEditor(el, {
    ...FORM_EDITOR_DEFAULTS,
    automaticLayout: true,
    originalEditable: false,
    renderSideBySide: true,
    ...(opts.extra || {}),
    readOnly: opts.readOnly,
    theme,
    fixedOverflowWidgets: true,
    overflowWidgetsDomNode: overflowHost,
  })
  syncOverflowHostTheme(editor, opts.theme)
  const original = monaco.editor.createModel(opts.original ?? '', language)
  const modified = monaco.editor.createModel(opts.modified ?? '', language)
  editor.setModel({ original, modified })
  syncMonacoHostTypo(monaco, editor)
  const typoSubs = [
    editor.getOriginalEditor().onDidChangeConfiguration(() => syncMonacoHostTypo(monaco, editor)),
    editor.getModifiedEditor().onDidChangeConfiguration(() => syncMonacoHostTypo(monaco, editor)),
  ]
  return {
    monaco,
    editor,
    original,
    modified,
    dispose() {
      typoSubs.forEach((sub) => sub.dispose())
      editor.setModel(null)
      original.dispose()
      modified.dispose()
      editor.dispose()
    },
  }
}
