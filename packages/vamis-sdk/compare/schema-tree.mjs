/** schema 树结点：对照 value / 是否画出 / 事件动作，不只看整页 smoke。 */

export const CHILD_KEYS = [
  'aside',
  'header',
  'toolbar',
  'headerToolbar',
  'body',
  'controls',
  'columns',
  'items',
  'grids',
  'tabs',
  'filter',
  'footer',
  'footerToolbar',
  'buttons',
  'actions',
  'bulkActions',
  'itemActions',
]

export const LAYOUT_TYPES = new Set([
  'page',
  'container',
  'wrapper',
  'service',
  'form',
  'grid',
  'grid-2d',
  'hbox',
  'vbox',
  'flex',
  'panel',
  'collapse',
  'collapse-group',
  'tabs',
  'tab',
  'fieldset',
  'group',
  'card',
  'portlet',
  'switch-container',
  'wizard',
  'each',
])

const SKIP_PROBE = new Set(['ajax', 'link', 'url', 'email', 'download', 'copy', 'reload', 'submit'])

function isNode(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value) && typeof value.type === 'string')
}

export function collectActions(node) {
  const out = []
  if (!node || typeof node !== 'object') return out
  if (typeof node.actionType === 'string') out.push(node.actionType)
  if (node.action && typeof node.action.actionType === 'string') out.push(node.action.actionType)
  const events = node.onEvent && typeof node.onEvent === 'object' ? node.onEvent : {}
  for (const event of Object.keys(events)) {
    const list = events[event]?.actions
    const actions = Array.isArray(list) ? list : list ? [list] : []
    for (const action of actions) {
      if (action && typeof action.actionType === 'string') out.push(`${event}:${action.actionType}`)
    }
  }
  return out
}

export function collectEvents(node) {
  const events = node?.onEvent && typeof node.onEvent === 'object' ? Object.keys(node.onEvent) : []
  return events
}

function childPath(parent, key, index, node) {
  const slot = `${key}/${index}:${node.type}`
  return parent ? `${parent}/${slot}` : slot
}

export function walkSchemaTree(schema, options = {}) {
  const limit = options.limit || 80
  const out = []

  function visit(node, path) {
    if (!isNode(node) || out.length >= limit) return
    const name = node.name != null && node.name !== '' ? String(node.name) : ''
    const id = node.id != null && node.id !== '' ? String(node.id) : ''
    const actions = collectActions(node)
    const events = collectEvents(node)
    out.push({
      path,
      type: node.type,
      name,
      id,
      label: node.label != null ? String(node.label) : '',
      schemaValue: node.value !== undefined ? node.value : node.defaultValue,
      events,
      actions,
      probe: actions.some((item) => {
        const action = item.includes(':') ? item.split(':').pop() : item
        return !SKIP_PROBE.has(action)
      }),
    })
    for (const key of CHILD_KEYS) {
      const child = node[key]
      if (child == null) continue
      const list = Array.isArray(child) ? child : [child]
      list.forEach((item, index) => {
        if (isNode(item)) visit(item, childPath(path, key, index, item))
      })
    }
  }

  const root = schema?.apiVersion && schema.spec ? schema.spec : schema
  if (Array.isArray(root)) {
    root.forEach((item, index) => {
      if (isNode(item)) visit(item, `${index}:${item.type}`)
    })
  } else if (isNode(root)) {
    visit(root, root.type)
  }
  return out
}

export function isEmptyValue(value) {
  if (value == null) return true
  if (value === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return true
  return false
}

export function dumpValue(value) {
  if (isEmptyValue(value)) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export function valuesEqual(left, right) {
  if (isEmptyValue(left) && isEmptyValue(right)) return true
  if (typeof left === 'number' || typeof right === 'number') {
    return Number(left) === Number(right)
  }
  if (typeof left === 'boolean' || typeof right === 'boolean') {
    return Boolean(left) === Boolean(right)
  }
  return dumpValue(left) === dumpValue(right)
}

function skipUuid(node) {
  return node?.type === 'uuid' || node?.type === 'input-uuid'
}

export function scoreTree(amisTree = [], vamisTree = []) {
  const diffs = []
  const aMap = new Map(amisTree.map((node) => [node.path, node]))
  const bMap = new Map(vamisTree.map((node) => [node.path, node]))
  const paths = [...new Set([...aMap.keys(), ...bMap.keys()])]
  for (const path of paths) {
    const a = aMap.get(path)
    const b = bMap.get(path)
    if (!a || !b) {
      diffs.push({ prop: `${path}.node`, amis: a ? a.type : '缺', vamis: b ? b.type : '缺' })
      continue
    }
    if (a.type !== b.type) {
      diffs.push({ prop: `${path}.type`, amis: a.type, vamis: b.type })
    }
    if (Boolean(a.rendered) !== Boolean(b.rendered)) {
      diffs.push({ prop: `${path}.rendered`, amis: Boolean(a.rendered), vamis: Boolean(b.rendered) })
    }
    if ((a.name || b.name) && Boolean(a.named) !== Boolean(b.named)) {
      diffs.push({ prop: `${path}.named`, amis: Boolean(a.named), vamis: Boolean(b.named) })
    }
    if (!skipUuid(a) && !valuesEqual(a.value, b.value)) {
      diffs.push({ prop: `${path}.value`, amis: dumpValue(a.value), vamis: dumpValue(b.value) })
    }
    if (a.valueAfter !== undefined || b.valueAfter !== undefined) {
      if (!skipUuid(a) && !valuesEqual(a.valueAfter, b.valueAfter)) {
        diffs.push({ prop: `${path}.valueAfter`, amis: dumpValue(a.valueAfter), vamis: dumpValue(b.valueAfter) })
      }
    }
    const ad = a.effect?.dialog
    const bd = b.effect?.dialog
    if (ad !== undefined || bd !== undefined) {
      if (Boolean(ad) !== Boolean(bd)) diffs.push({ prop: `${path}.dialog`, amis: Boolean(ad), vamis: Boolean(bd) })
    }
    const at = a.effect?.toast
    const bt = b.effect?.toast
    if (at !== undefined || bt !== undefined) {
      if (Boolean(at) !== Boolean(bt)) diffs.push({ prop: `${path}.toast`, amis: Boolean(at), vamis: Boolean(bt) })
    }
  }
  return { pass: diffs.length === 0, diffs }
}

export function treeSummary(tree = []) {
  const nodes = tree.length
  const rendered = tree.filter((node) => node.rendered).length
  const named = tree.filter((node) => node.named).length
  const valued = tree.filter((node) => !isEmptyValue(node.value)).length
  const probed = tree.filter((node) => node.effect).length
  return { nodes, rendered, named, valued, probed }
}
