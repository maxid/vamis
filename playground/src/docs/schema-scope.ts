import { formatSchemaAs, parseSchemaText } from '@vamis/core'

/** Amis ```schema: scope="body|page|form|form-item"``` 包装。文档片段不是完整 page 时，套一层再交给运行时。 */

const wrapPage = (inner: unknown) => ({ type: 'page', body: inner })

const SCOPES: Record<string, (inner: unknown) => unknown> = {
  body: wrapPage,
  /** Amis each.md 等写 `scope="page"`；Play.jsx 漏了这档，语义等同 `body`。 */
  page: wrapPage,
  form: (inner) => ({
    type: 'page',
    body: {
      type: 'form',
      title: '',
      autoFocus: false,
      api: '/api/mock2/form/saveForm',
      mode: 'horizontal',
      body: inner,
      submitText: null,
      actions: [],
    },
  }),
  form2: (inner) => SCOPES.form(inner),
  'form-item': (inner) => ({
    type: 'page',
    body: {
      type: 'form',
      title: '',
      mode: 'horizontal',
      autoFocus: false,
      body: Array.isArray(inner) ? inner : [inner],
      submitText: null,
      actions: [],
    },
  }),
  'form-item2': (inner) => SCOPES['form-item'](inner),
}

function isPageLike(node: unknown): boolean {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return false
  const rec = node as Record<string, unknown>
  if (rec.type === 'page' || rec.type === 'app') return true
  if (typeof rec.apiVersion === 'string' && rec.spec) return true
  return false
}

export function applySchemaScope(node: unknown, scope?: string): unknown {
  if (scope === 'none') return node
  if (isPageLike(node)) return node
  const wrap = SCOPES[scope || 'body']
  return wrap ? wrap(node) : node
}

function looksJson(text: string) {
  const trimmed = text.trim()
  return trimmed.startsWith('{') || trimmed.startsWith('[')
}

/**
 * Amis Play.jsx：`buildSchema` 把围栏套进 `scopes[scope]` 后再
 * `JSON.stringify` 进 `schemaCode`。编辑器看到的是包装后的树，不是围栏原文。
 * Markdown 围栏仍是片段；只有编辑缓冲 / 预览吃这份。
 */
export function scopeAuthoringText(text: string, scope?: string): string {
  const trimmed = text.trim()
  if (!trimmed) return trimmed
  try {
    const wrapped = applySchemaScope(parseSchemaText(trimmed), scope)
    return formatSchemaAs(wrapped, looksJson(trimmed) ? 'json' : 'yaml')
  } catch {
    return trimmed
  }
}

export function parseSchemaFenceMeta(info: string): { scope?: string; height?: number } {
  const raw = info.replace(/^schema/i, '').replace(/^:/, '').trim()
  const result: { scope?: string; height?: number } = {}
  if (!raw) return result

  const attrRe = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g
  let matched = false
  let match: RegExpExecArray | null
  while ((match = attrRe.exec(raw))) {
    matched = true
    const key = match[1]
    const value = match[2] ?? match[3] ?? match[4] ?? ''
    if (key === 'scope' && value) result.scope = value
    if (key === 'height') {
      const height = Number.parseInt(value, 10)
      if (Number.isFinite(height)) result.height = height
    }
  }
  if (!matched) {
    const token = raw.replace(/['"]/g, '').trim()
    if (token) result.scope = token.replace(/^scope=/i, '')
  }
  return result
}
