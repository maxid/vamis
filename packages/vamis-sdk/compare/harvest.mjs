import fs from 'node:fs'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { applySchemaScope, parseSchemaFenceMeta, parseSchemaText } from './scope.mjs'

const FENCE_RE = /```schema([^\n]*)\n([\s\S]*?)```/g
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

function rootType(node) {
  if (!node || typeof node !== 'object') return ''
  if (Array.isArray(node)) return rootType(node[0])
  if (node.type) return String(node.type)
  if (node.spec) return rootType(node.spec)
  if (node.body) return rootType(node.body)
  return ''
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

export function harvestMarkdown(dir, options = {}) {
  const group = options.group || 'docs'
  const relFrom = options.relFrom || dir
  const files = walk(dir)
  const rows = []
  const seen = new Set()
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8')
    let index = 0
    for (const match of source.matchAll(FENCE_RE)) {
      const meta = parseSchemaFenceMeta(match[1] || '')
      let parsed
      try {
        parsed = parseSchemaText(match[2], (text) =>
          parseYaml(text, { prettyErrors: true, schema: 'core', version: '1.2' }),
        )
      } catch {
        continue
      }
      const type = rootType(parsed)
      if (SKIP_TYPES.has(type)) continue
      const schema = applySchemaScope(parsed, meta.scope || (schemaNeedsPage(parsed) ? 'body' : undefined))
      const key = JSON.stringify(schema)
      if (seen.has(key)) continue
      seen.add(key)
      const rel = path.relative(relFrom, file).replace(/\\/g, '/')
      rows.push({
        id: slug(rel, index),
        group,
        title: `${rel} #${index + 1}`,
        source: rel,
        layer: 'docs',
        schema,
        measure: { type: 'smoke' },
      })
      index += 1
    }
  }
  return rows
}

function schemaNeedsPage(node) {
  if (!node || typeof node !== 'object') return true
  if (Array.isArray(node)) return true
  if (node.type === 'page' || node.apiVersion) return false
  return true
}
