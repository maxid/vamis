import hljs from 'highlight.js'

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

const LANG_ALIAS: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  yml: 'yaml',
  sh: 'bash',
  shell: 'bash',
  html: 'xml',
  vue: 'xml',
  'objective-c': 'objectivec',
  'c++': 'cpp',
  'c#': 'csharp',
  vb: 'vbnet',
  plaintext: '',
  text: '',
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function mapLanguage(language: string): string {
  const key = (language || 'plaintext').trim().toLowerCase()
  if (Object.prototype.hasOwnProperty.call(LANG_ALIAS, key)) return LANG_ALIAS[key]
  return key
}

function expandTabs(source: string, tabSize: number): string {
  const size = Number.isFinite(tabSize) && tabSize > 0 ? Math.floor(tabSize) : 4
  if (size === 4 && !source.includes('\t')) return source
  return source.replace(/\t/g, ' '.repeat(size))
}

function tokenStyle(token: CodeToken): string {
  const parts: string[] = []
  if (token.color) parts.push(`color:${token.color}`)
  if (token.background) parts.push(`background-color:${token.background}`)
  if (token.fontStyle === 'bold') parts.push('font-weight:700')
  else if (token.fontStyle === 'italic') parts.push('font-style:italic')
  else if (token.fontStyle === 'underline') parts.push('text-decoration:underline')
  else if (token.fontStyle) parts.push(`font-style:${token.fontStyle}`)
  return parts.join(';')
}

/** Amis customLang：从当前位置按 tokens 顺序匹配（对齐 monaco monarch 的第一命中）。 */
export function colorizeCustom(source: string, lang: CustomLang): string {
  const rules = (lang.tokens || []).flatMap((token) => {
    try {
      return [
        {
          token,
          re: new RegExp(`^(?:${token.regex})`, token.regexFlags || ''),
        },
      ]
    } catch {
      return []
    }
  })
  let i = 0
  let out = ''
  while (i < source.length) {
    const slice = source.slice(i)
    let hit: { len: number; token: CodeToken } | null = null
    for (const rule of rules) {
      const match = slice.match(rule.re)
      if (match?.[0]) {
        hit = { len: match[0].length, token: rule.token }
        break
      }
    }
    if (hit) {
      const text = escapeHtml(source.slice(i, i + hit.len))
      const style = tokenStyle(hit.token)
      out += style ? `<span style="${style}">${text}</span>` : text
      i += hit.len
    } else {
      out += escapeHtml(source[i] ?? '')
      i += 1
    }
  }
  return out
}

export function colorizeSync(source: string, language = 'plaintext', tabSize = 4, customLang?: CustomLang): string {
  const text = expandTabs(source ?? '', tabSize)
  if (customLang?.tokens?.length) return colorizeCustom(text, customLang)
  const lang = mapLanguage(language)
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(text, { language: lang, ignoreIllegals: true }).value
    } catch {
      return escapeHtml(text)
    }
  }
  return escapeHtml(text)
}
