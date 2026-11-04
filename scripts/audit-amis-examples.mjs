#!/usr/bin/env node
/**
 * 收割 Amis 文档 ```schema 与 examples 里的 schema 对象，统计：
 * - 节点 type 嵌套（parent → child type）
 * - chrome 属性（badge / tooltip / remark / popOver / addOn / options / actionType）
 * 用来核对组件 TODO 构建依赖，不是把任意嵌套都写成 Kahn 边。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const amis = path.resolve(root, '../amis')
const docs = path.join(amis, 'docs/zh-CN')
const examples = path.join(amis, 'examples')

const ALIAS = {
  button: 'action',
  submit: 'action',
  reset: 'action',
  tooltip: 'tooltip-wrapper',
  treeselect: 'tree-select',
  'nested-select': 'nested-select',
  nestedselect: 'nested-select',
  'chain-select': 'chained-select',
  chainedselect: 'chained-select',
  'multi-select': 'select',
  pager: 'pagination',
  fieldSet: 'fieldset',
  fieldset: 'fieldset',
  tags: 'tag',
  'qr-code': 'qrcode',
  text: 'input-text',
  password: 'input-password',
  email: 'input-text',
  url: 'input-text',
  'native-date': 'input-date',
  'native-time': 'input-time',
  'native-number': 'input-number',
  'input-email': 'input-text',
  'input-url': 'input-text',
  collapse: 'collapse',
  'collapse-group': 'collapse',
  datetime: 'date',
  time: 'date',
  month: 'date',
  'static-date': 'static',
  'static-json': 'json',
  'static-table': 'table',
}

function canon(t) {
  if (!t || typeof t !== 'string') return ''
  const s = t.trim()
  return ALIAS[s] || s
}

function walkFiles(dir, pred, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) walkFiles(p, pred, out)
    else if (pred(p)) out.push(p)
  }
  return out
}

function extractSchemaFences(md) {
  const blocks = []
  const re = /```schema(?:[^\n]*)\n([\s\S]*?)```/g
  let m
  while ((m = re.exec(md))) blocks.push(m[1].trim())
  return blocks
}

function stripJsComments(t) {
  return t
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:\\])\/\/.*$/gm, '$1')
}

function tryParse(text) {
  const t = text.trim()
  if (!t) return null
  try {
    return JSON.parse(t)
  } catch {
    /* json5-ish: trailing commas */
  }
  try {
    return JSON.parse(t.replace(/,\s*([}\]])/g, '$1'))
  } catch {
    /* Amis 文档大量 `type: 'page'` 对象字面量 */
  }
  try {
    return Function(`"use strict"; return (${stripJsComments(t)})`)()
  } catch {
    return null
  }
}

function subjectFromDoc(file) {
  const rel = path.relative(docs, file).replace(/\\/g, '/')
  if (!rel.startsWith('components/')) return { page: rel, subject: '' }
  let s = rel.slice('components/'.length).replace(/\.md$/, '')
  if (s.startsWith('form/')) s = s.slice(5)
  if (s === 'index') s = 'form'
  if (s === 'tooltip-wrapper') s = 'tooltip-wrapper'
  if (s === 'popover') s = 'popOver'
  if (s === 'formitem') s = 'FormItem'
  if (s === 'options') s = 'Options'
  if (s === 'chain-select') s = 'chained-select'
  if (s === 'treeselect') s = 'tree-select'
  if (s === 'nestedselect') s = 'nested-select'
  return { page: rel, subject: canon(s) }
}

const chrome = new Map() // type -> {badge:n, tooltip:n, remark:n, popOver:n, addOn:n, options:n, toast:n, dialog:n, drawer:n, spinner:n, icon:n, mapping:n}
const nest = new Map() // parent -> Map(child -> n)
const pageChrome = new Map() // subject -> chrome counts on nodes whose type is subject
const pageNest = new Map()
const parseFail = { docs: 0, ok: 0, jsx: 0 }

function bump(map, a, b) {
  if (!map.has(a)) map.set(a, new Map())
  const inner = map.get(a)
  inner.set(b, (inner.get(b) || 0) + 1)
}

function bumpChrome(type, key, n = 1) {
  if (!type) return
  if (!chrome.has(type)) chrome.set(type, {})
  const o = chrome.get(type)
  o[key] = (o[key] || 0) + n
}

function visit(node, parentType, subject) {
  if (node == null) return
  if (Array.isArray(node)) {
    for (const x of node) visit(x, parentType, subject)
    return
  }
  if (typeof node !== 'object') return

  const raw = node.type
  const type = typeof raw === 'string' ? canon(raw) : ''
  const owner = type || parentType

  if (type && parentType) bump(nest, parentType, type)
  if (type && subject) bump(pageNest, `${subject}::${type}`, 'self')

  if (owner) {
    if (node.badge != null || node.itemBadge != null) {
      bumpChrome(owner, 'badge')
      if (subject) bumpChrome(`page:${subject}`, `on:${owner}:badge`)
    }
    if (node.tooltip != null || node.disabledTip != null) {
      bumpChrome(owner, 'tooltip')
    }
    if (node.remark != null || node.labelRemark != null) {
      bumpChrome(owner, 'remark')
    }
    if (node.popOver != null) bumpChrome(owner, 'popOver')
    if (node.addOn != null) bumpChrome(owner, 'addOn')
    if (node.options != null) bumpChrome(owner, 'options')
    if (node.icon != null && type) bumpChrome(owner, 'icon')
    if (node.mapping != null || node.map != null) bumpChrome(owner, 'mapping')
    if (node.actionType === 'toast' || node.toast) bumpChrome(owner, 'toast')
    if (node.actionType === 'dialog' || node.dialog) bumpChrome(owner, 'dialog')
    if (node.actionType === 'drawer' || node.drawer) bumpChrome(owner, 'drawer')
    if (node.loadingConfig != null || node.show === false && type === 'spinner') bumpChrome(owner, 'spinner')
  }

  if (type && subject && type === subject) {
    if (!pageChrome.has(subject)) pageChrome.set(subject, {})
    const o = pageChrome.get(subject)
    o.nodes = (o.nodes || 0) + 1
    if (node.badge != null || node.itemBadge != null) o.badge = (o.badge || 0) + 1
    if (node.tooltip != null || node.disabledTip != null) o.tooltip = (o.tooltip || 0) + 1
    if (node.remark != null || node.labelRemark != null) o.remark = (o.remark || 0) + 1
    if (node.popOver != null) o.popOver = (o.popOver || 0) + 1
    if (node.addOn != null) o.addOn = (o.addOn || 0) + 1
    if (node.options != null) o.options = (o.options || 0) + 1
    if (node.icon != null) o.icon = (o.icon || 0) + 1
    if (node.actionType === 'toast' || node.toast) o.toast = (o.toast || 0) + 1
    if (node.actionType === 'dialog' || node.dialog) o.dialog = (o.dialog || 0) + 1
    if (node.actionType === 'drawer' || node.drawer) o.drawer = (o.drawer || 0) + 1
  }

  for (const [k, v] of Object.entries(node)) {
    if (k === 'type') continue
    visit(v, type || parentType, subject)
  }
}

function harvestMd(file) {
  const { subject } = subjectFromDoc(file)
  const text = fs.readFileSync(file, 'utf8')
  for (const block of extractSchemaFences(text)) {
    const obj = tryParse(block)
    if (!obj) {
      parseFail.docs++
      continue
    }
    parseFail.ok++
    visit(obj, '', subject)
  }
}

function extractJsExport(text) {
  const idx = text.search(/export\s+default\s+/)
  if (idx < 0) return null
  let rest = text.slice(idx).replace(/export\s+default\s+/, '')
  rest = rest.replace(/^[\s\S]*?(?=[{[])/, '')
  // cut trailing imports leftover — take first { ... } balanced
  if (!rest.startsWith('{') && !rest.startsWith('[')) return null
  const open = rest[0]
  const close = open === '{' ? '}' : ']'
  let depth = 0
  let inStr = ''
  let esc = false
  for (let i = 0; i < rest.length; i++) {
    const c = rest[i]
    if (inStr) {
      if (esc) esc = false
      else if (c === '\\') esc = true
      else if (c === inStr) inStr = ''
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      inStr = c
      continue
    }
    if (c === open) depth++
    else if (c === close) {
      depth--
      if (depth === 0) {
        const slice = rest.slice(0, i + 1)
        try {
          return Function(`"use strict"; return (${slice})`)()
        } catch {
          return null
        }
      }
    }
  }
  return null
}

function harvestJs(file) {
  const text = fs.readFileSync(file, 'utf8')
  if (text.includes('<') && /return\s*\(/.test(text)) return
  const obj = extractJsExport(text)
  if (!obj || typeof obj !== 'object') return
  parseFail.jsx++
  visit(obj, '', '')
}

const mdFiles = walkFiles(docs, (p) => p.endsWith('.md'))
for (const f of mdFiles) harvestMd(f)
const jsFiles = walkFiles(examples, (p) => /\.(jsx?|tsx?)$/.test(p))
for (const f of jsFiles) harvestJs(f)

function topMap(m, n = 12) {
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => `${k}:${v}`)
}

const chromeSummary = {}
for (const [t, o] of [...chrome.entries()].sort()) {
  if (t.startsWith('page:')) continue
  chromeSummary[t] = o
}

const nestSummary = {}
for (const [p, inner] of nest) {
  nestSummary[p] = Object.fromEntries([...inner.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15))
}

const pageSummary = {}
for (const [s, o] of pageChrome) pageSummary[s] = o

const report = {
  files: { md: mdFiles.length, js: jsFiles.length, schemaOk: parseFail.ok, schemaFail: parseFail.docs, jsxOk: parseFail.jsx },
  pageChrome: pageSummary,
  chrome: Object.fromEntries(
    Object.entries(chromeSummary)
      .filter(([, o]) => Object.values(o).some((n) => n > 0))
      .sort((a, b) => JSON.stringify(a[0]).localeCompare(b[0])),
  ),
  nestTop: Object.fromEntries(
    Object.entries(nestSummary).sort((a, b) => {
      const sa = Object.values(a[1]).reduce((x, y) => x + y, 0)
      const sb = Object.values(b[1]).reduce((x, y) => x + y, 0)
      return sb - sa
    }),
  ),
}

const out = path.join(root, 'scripts/audit-amis-examples.report.json')
fs.writeFileSync(out, JSON.stringify(report, null, 2))

const interest = [
  'action',
  'button',
  'tpl',
  'icon',
  'link',
  'badge',
  'avatar',
  'checkbox',
  'radio',
  'form',
  'FormItem',
  'remark',
  'tooltip-wrapper',
  'select',
  'input-text',
  'table',
  'table2',
  'nav',
  'card',
  'crud',
  'page',
  'service',
  'dialog',
  'drawer',
  'dropdown-button',
  'calendar',
  'input-date',
  'spinner',
  'panel',
  'alert',
  'breadcrumb',
  'search-box',
  'wizard',
  'list',
  'cards',
  'mapping',
  'popOver',
  'static',
  'image',
  'steps',
  'timeline',
  'grid-nav',
  'pagination',
  'button-group',
  'button-toolbar',
  'combo',
  'input-table',
  'picker',
  'transfer',
  'tree-select',
  'input-tree',
  'checkboxes',
  'radios',
]

console.log(JSON.stringify({ files: report.files, interestChrome: Object.fromEntries(interest.map((t) => [t, chromeSummary[t] || pageSummary[t] || null])), pageHits: Object.fromEntries(interest.map((t) => [t, pageSummary[t] || null])) }, null, 2))
console.log('wrote', out)
