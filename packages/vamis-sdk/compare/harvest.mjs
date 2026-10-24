import fs from 'node:fs'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { applySchemaScope, parseSchemaFenceMeta, parseSchemaText } from './scope.mjs'

/** 只认行首围栏，避免正文里写「```schema」被收成空用例。 */
const FENCE_RE = /^```schema([^\n]*)\r?\n([\s\S]*?)^```/gm
const SKIP_TYPES = new Set([
  'code',
  'editor',
  'diff-editor',
  'json-editor',
  'yaml-editor',
  'js-editor',
  'ts-editor',
  'chart',
  'office-viewer',
  'office-viewer-excel',
  'pdf-viewer',
  'map',
  'iframe',
  'log',
  'custom',
  'web-component',
  'audio',
  'video',
])

const LAYOUT_NEEDS_CHILDREN = new Set([
  'page',
  'container',
  'wrapper',
  'hbox',
  'grid',
  'grid-2d',
  'flex',
  'panel',
  'form',
  'tabs',
  'wizard',
  'button-group',
  'app',
  'service',
  'crud',
  'portlet',
  'switch-container',
  'pagination-wrapper',
  'tooltip-wrapper',
  'table',
  'table2',
  'cards',
  'list',
  'nav',
  'anchor-nav',
  'dropdown-button',
  'button-toolbar',
])

const CHILD_KEYS = [
  'body',
  'columns',
  'items',
  'controls',
  'buttons',
  'actions',
  'steps',
  'tabs',
  'links',
  'spec',
  'tab',
  'toolbar',
  'header',
  'aside',
  'footer',
]

const TEXT_KEYS = ['tpl', 'html', 'value', 'label', 'text', 'msg', 'title']

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name.endsWith('.md')) out.push(full)
  }
  return out
}

export function isRenderableSchema(node) {
  let hasText = false
  let hasField = false
  const types = []
  walkSchema(node, (hit) => {
    if (hit.text) hasText = true
    if (hit.field) hasField = true
    if (hit.type) types.push(hit.type)
  })
  if (hasText || hasField) return true
  const visible = types.filter((type) => !SKIP_TYPES.has(type))
  if (!visible.length) return false
  return !visible.every((type) => LAYOUT_NEEDS_CHILDREN.has(type))
}

function walkSchema(node, visit) {
  if (node == null) return
  if (typeof node === 'string' || typeof node === 'number') {
    if (String(node).trim()) visit({ text: true })
    return
  }
  if (Array.isArray(node)) {
    node.forEach((item) => walkSchema(item, visit))
    return
  }
  if (typeof node !== 'object') return
  const type = String(node.type || '').toLowerCase()
  if (type) visit({ type })
  if (SKIP_TYPES.has(type)) return
  if (!type && (node.name || node.label)) visit({ field: true })
  for (const key of TEXT_KEYS) {
    if (typeof node[key] === 'string' && node[key].trim() && key !== 'title') visit({ text: true })
  }
  if (typeof node.title === 'string' && node.title.trim() && type && type !== 'page' && type !== 'form') {
    visit({ text: true })
  }
  for (const key of CHILD_KEYS) walkSchema(node[key], visit)
}

function slug(file, index) {
  const base = file
    .replace(/\\/g, '/')
    .replace(/\.md$/i, '')
    .split('/')
    .slice(-3)
    .join('-')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return `${base}-${index}`
}

function parseFence(body) {
  return parseSchemaText(body, (text) => parseYaml(text, { prettyErrors: true, schema: 'core', version: '1.2' }))
}

function schemaNeedsPage(node) {
  if (!node || typeof node !== 'object') return true
  if (Array.isArray(node)) return true
  if (node.type === 'page' || node.apiVersion) return false
  return true
}

export function harvestSource(source, rel, options = {}) {
  const group = options.group || 'docs'
  const seen = options.seen || new Set()
  const rows = []
  let index = 0
  for (const match of String(source || '').matchAll(FENCE_RE)) {
    let parsed
    try {
      parsed = parseFence(match[2])
    } catch {
      continue
    }
    if (!parsed || typeof parsed !== 'object' || (parsed && !Array.isArray(parsed) && Object.keys(parsed).length === 0)) {
      continue
    }
    const meta = parseSchemaFenceMeta(match[1] || '')
    const schema = applySchemaScope(parsed, meta.scope || (schemaNeedsPage(parsed) ? 'body' : undefined))
    if (!isRenderableSchema(schema)) continue
    const key = JSON.stringify(schema)
    if (seen.has(key)) continue
    seen.add(key)
    rows.push({
      id: slug(rel, index),
      group,
      title: `${rel} #${index + 1}`,
      source: rel,
      layer: 'docs',
      index,
      schema,
      measure: { type: 'smoke' },
    })
    index += 1
  }
  return rows
}

export function harvestMarkdown(dir, options = {}) {
  const group = options.group || 'docs'
  const relFrom = options.relFrom || dir
  const files = walk(dir)
  const rows = []
  const seen = new Set()
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8')
    const rel = path.relative(relFrom, file).replace(/\\/g, '/')
    rows.push(...harvestSource(source, rel, { group, seen }))
  }
  return rows
}
