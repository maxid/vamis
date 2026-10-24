/** Amis ```schema: scope="form-item"``` 包装。与 playground 同口径。 */

const SCOPES = {
  body: (inner) => ({ type: 'page', body: inner }),
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

function isPageLike(node) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return false
  if (node.type === 'page') return true
  if (typeof node.apiVersion === 'string' && node.spec) return true
  return false
}

export function applySchemaScope(node, scope) {
  if (!scope || scope === 'none') return node
  if (isPageLike(node)) return node
  const wrap = SCOPES[scope]
  return wrap ? wrap(node) : node
}

export function parseSchemaFenceMeta(info) {
  const raw = String(info || '')
    .replace(/^schema/i, '')
    .replace(/^:/, '')
    .trim()
  const result = {}
  if (!raw) return result

  const attrRe = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g
  let matched = false
  let match
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

export function parseSchemaText(text, parseYaml) {
  const trimmed = String(text || '').trim()
  if (!trimmed) return {}
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return JSON.parse(trimmed)
  if (typeof parseYaml !== 'function') throw new Error('YAML 解析器未注入')
  return parseYaml(trimmed)
}
