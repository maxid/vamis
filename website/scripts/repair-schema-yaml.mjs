/**
 * 修活示例 YAML：service 包 table 后 columns 等字段掉到根上、缩进错乱。
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(path.resolve(fileURLToPath(new URL('../../packages/vamis-core/package.json', import.meta.url))))
const YAML = require('yaml')

const TABLE_KEYS = new Set([
  'columns',
  'placeholder',
  'itemAction',
  'itemActions',
  'affixRow',
  'prefixRow',
  'footable',
  'tableLayout',
  'combineNum',
  'combineFromIndex',
  'columnsTogglable',
  'resizable',
  'selectable',
  'title',
  'source',
  'header',
  'footer',
  'actions',
  'affixHeader',
  'affixFooter',
  'autoFillHeight',
  'lazyRenderAfter',
  'checkOnItemClick',
  'itemCheckableOn',
  'rowClassName',
  'rowClassNameExpr',
  'tableClassName',
  'headerClassName',
  'footerClassName',
  'toolbarClassName',
  'columnsTogglable',
])

function parseYaml(text) {
  return YAML.parse(text, { prettyErrors: true, schema: 'core', version: '1.2' })
}

function stringifyYaml(value) {
  return `${YAML.stringify(value, { indent: 2, lineWidth: 0, nullStr: 'null' }).trimEnd()}\n`
}

function indentOf(line) {
  return (line.match(/^ */) || [''])[0].length
}

function bumpZeroKeys(text, propIndent) {
  const pad = ' '.repeat(propIndent)
  const lines = text.split('\n')
  const start = lines.findIndex((line) => /^\s+- type: table\b/.test(line))
  if (start < 0) return text
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    if (indentOf(line) === 0 && /^[\w]+:/.test(line)) {
      lines[i] = pad + line
    }
  }
  return lines.join('\n')
}

function bumpShallowLines(text, fromIndent, delta, afterTable) {
  const lines = text.split('\n')
  const start = afterTable ? lines.findIndex((line) => /^\s+- type: table\b/.test(line)) : 0
  if (start < 0) return text
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    if (indentOf(line) === fromIndent) lines[i] = ' '.repeat(delta) + line
  }
  return lines.join('\n')
}

function nestTableKeys(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { value, moved: false }
  if (value.type !== 'service') return { value, moved: false }
  const body = value.body
  const table = Array.isArray(body)
    ? body.find((item) => item && item.type === 'table')
    : body && body.type === 'table'
      ? body
      : null
  if (!table || typeof table !== 'object') return { value, moved: false }
  let moved = false
  for (const key of Object.keys(value)) {
    if (!TABLE_KEYS.has(key) || key in table) continue
    table[key] = value[key]
    delete value[key]
    moved = true
  }
  return { value, moved }
}

function tryParse(text) {
  try {
    return { value: parseYaml(text) }
  } catch (error) {
    return { error }
  }
}

function repairYaml(text) {
  const first = tryParse(text)
  if (first.value) {
    const nested = nestTableKeys(first.value)
    if (!nested.moved) return { text, changed: false, ok: true }
    return { text: stringifyYaml(nested.value), changed: true, ok: true }
  }
  const attempts = []
  if (/^\s+- type: table\b/m.test(text)) {
    const bumped = bumpZeroKeys(text, 4)
    attempts.push(bumped)
    attempts.push(bumpShallowLines(bumped, 2, 4, true))
  }
  for (const candidate of attempts) {
    const parsed = tryParse(candidate)
    if (!parsed.value) continue
    const nested = nestTableKeys(parsed.value)
    return { text: stringifyYaml(nested.value), changed: true, ok: true }
  }
  return { text, changed: false, ok: false }
}

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) walk(full, acc)
    else if (name.endsWith('.md')) acc.push(full)
  }
  return acc
}

const srcDir = path.resolve(fileURLToPath(new URL('../src', import.meta.url)))
let files = 0
let fences = 0
let repaired = 0
const stillBad = []

for (const file of walk(srcDir)) {
  const original = fs.readFileSync(file, 'utf8')
  let next = original
  next = next.replace(/```(schema[^\n]*)\n([\s\S]*?)```/g, (full, meta, body) => {
    const trimmed = body.replace(/^\n+/, '').replace(/\n+$/, '')
    if (!trimmed.trim() || trimmed.trim().startsWith('{') || trimmed.trim().startsWith('[')) return full
    fences += 1
    const result = repairYaml(trimmed.endsWith('\n') ? trimmed : `${trimmed}\n`)
    if (!result.ok) {
      stillBad.push({ file: path.relative(srcDir, file) })
      return full
    }
    if (!result.changed) return full
    repaired += 1
    return `\`\`\`${meta}\n${result.text.trimEnd()}\n\`\`\``
  })
  if (next !== original) {
    fs.writeFileSync(file, next)
    files += 1
  }
}

console.log(JSON.stringify({ files, yamlFences: fences, repaired, stillBad: stillBad.length }, null, 2))
for (const item of stillBad) console.log(`  ${item.file}`)
