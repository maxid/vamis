#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { componentNav } from '../nav.mjs'
import {
  SKIP_TYPES,
  buildSyncedPage,
  diffSection,
  extractH2,
  hasH2,
  insertBeforeDiff,
  isDiffHeading,
  moveDiffToEnd,
  replaceH2,
  resolveAmisDoc,
  rewriteAmisBody,
} from './rewrite-amis-doc.mjs'

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)))
const srcDir = path.join(root, 'website/src')
const todoPath = path.join(root, 'docs/superpowers/specs/2026-10-20-vamis-component-todo.md')
const amisComponentsDir = path.resolve(root, '../amis/docs/zh-CN/components')

const OPTION_TYPES = new Set([
  'select',
  'multi-select',
  'checkboxes',
  'radios',
  'radio',
  'nested-select',
  'tree-select',
  'input-tree',
  'list-select',
  'picker',
  'transfer',
  'transfer-picker',
  'tabs-transfer',
  'tabs-transfer-picker',
  'chained-select',
  'button-group-select',
  'input-tag',
  'chart-radios',
])

const TREE_OPTIONS = `- label: 华东
    children:
      - label: 上海
        value: sh
      - label: 杭州
        value: hz
  - label: 华北
    children:
      - label: 北京
        value: bj`

const FLAT_OPTIONS = `- label: 选项 A
    value: a
  - label: 选项 B
    value: b
  - label: 选项 C
    value: c`

const HANDWRITTEN = new Set([
  '/components/',
  '/components/mapping',
  '/components/link',
  '/components/form/',
  '/components/form',
  '/components/form/formitem',
  '/components/form/control',
  '/components/form/options',
  '/components/form/select',
  '/components/form/input-text',
  '/components/form/input-password',
  '/components/form/input-date',
  '/components/form/input-date-range',
  '/components/form/checkbox',
  // radio / switch / hidden 已按 Amis 章节手写，跑 `pnpm docs:build` 不能被生成器覆盖。
  '/components/form/radio',
  '/components/form/switch',
  '/components/form/hidden',
  '/components/form/input-file',
  '/components/form/input-image',
  '/components/form/textarea',
  '/components/form/transfer',
  '/components/form/picker',
  '/components/form/static',
  '/components/page',
  '/components/container',
  '/components/collapse',
  '/components/divider',
  '/components/flex',
  '/components/grid',
  '/components/grid-2d',
  '/components/hbox',
  '/components/pagination',
  '/components/progress',
  '/components/status',
  '/components/pagination-wrapper',
  '/components/panel',
  '/components/tabs',
  '/components/wrapper',
  '/components/portlet',
  '/components/switch-container',
  '/components/action',
  '/components/app',
  '/components/button',
  '/components/button-group',
  '/components/breadcrumb',
  '/components/dropdown-button',
  '/components/service',
  '/components/each',
  '/components/tag',
  '/components/list',
  '/components/table',
  '/components/nav',
  '/components/anchor-nav',
  '/components/tooltip',
  '/components/toast',
  '/components/spinner',
  '/components/alert',
  '/components/dialog',
  '/components/drawer',
  '/components/avatar',
  '/components/tasks',
  '/components/badge',
  '/components/audio',
  '/components/wizard',
  '/components/web-component',
  '/components/amis',
  '/components/popover',
  '/components/table-view',
  '/components/table2',
  '/components/calendar',
  '/components/card',
  '/components/cards',
  '/components/chart',
  '/components/code',
  '/components/form/editor',
  '/components/form/diff-editor',
  '/components/icon',
  '/components/image',
])

function parseTodo(text) {
  /** @type {Record<string, { status: string, progress: string, reason: string }>} */
  const map = {}
  for (const line of text.split('\n')) {
    const m = line.match(
      /^\| (.+?) \| [^|]+ \| [^|]+ \| [^|]+ \| (未开始|进行中|已完成) \| (\d+%) \| (.+?) \| P\d+ \|$/,
    )
    if (!m) continue
    const typeCell = m[1].trim()
    if (typeCell.startsWith('（')) continue
    const keys = typeCell.replace(/`/g, '').split('/').map((s) => s.trim()).filter(Boolean)
    const rec = { status: m[2], progress: m[3], reason: m[4].trim() }
    for (const key of keys) map[key] = rec
  }
  return map
}

const todo = parseTodo(fs.readFileSync(todoPath, 'utf8'))

function fieldName(type) {
  return type.replace(/-/g, '_')
}

function indent(text, n) {
  const pad = '  '.repeat(n)
  return text
    .split('\n')
    .map((line, i) => (i === 0 ? line : pad + line))
    .join('\n')
}

const SPECIAL = {
  page: `type: page
title: 页面标题
subTitle: 最外层页面容器
body:
  - type: tpl
    tpl: 页面正文
  - type: divider
  - type: tpl
    tpl: 可继续嵌套其它组件`,
  container: `type: container
body:
  - type: tpl
    tpl: Container 包裹的内容`,
  'collapse-group': `type: collapse-group
body:
  - type: collapse
    title: 第一节
    body:
      - type: tpl
        tpl: 折叠内容 A
  - type: collapse
    title: 第二节
    body:
      - type: tpl
        tpl: 折叠内容 B`,
  flex: `type: flex
justify: space-between
items:
  - type: tpl
    tpl: 左
  - type: tpl
    tpl: 中
  - type: tpl
    tpl: 右`,
  grid: `type: grid
columns:
  - md: 6
    body:
      - type: tpl
        tpl: 左栏 span 6
  - md: 6
    body:
      - type: tpl
        tpl: 右栏 span 6`,
  tabs: `type: tabs
tabs:
  - title: Tab 1
    body:
      - type: tpl
        tpl: 第一页
  - title: Tab 2
    body:
      - type: tpl
        tpl: 第二页`,
  form: `type: form
title: 新建记录
mode: horizontal
api: /api/mock2/form/saveForm
body:
  - type: input-text
    name: name
    label: 名称
    required: true
  - type: input-email
    name: email
    label: 邮箱
  - type: select
    name: status
    label: 状态
    options:
      - label: 在线
        value: online
      - label: 离线
        value: offline`,
  crud: `type: crud
syncLocation: false
api: /api/mock2/sample
headerToolbar:
  - type: button
    label: 新增
    level: primary
    actionType: dialog
    dialog:
      title: 新增
      body:
        type: form
        api: /api/mock2/sample
        body:
          - type: input-text
            name: name
            label: 名称
columns:
  - name: id
    label: ID
  - name: name
    label: 名称
    searchable: true
  - name: status
    label: 状态`,
  table: `type: table
source: \${items}
columns:
  - name: name
    label: 名称
  - name: status
    label: 状态`,
  action: `type: action
label: 弹出提示
actionType: toast
msg: Action 已点击`,
  button: `type: button
label: 主要按钮
level: primary`,
  service: `type: service
api: /api/mock2/sample
body:
  - type: tpl
    tpl: 共 \${total} 条`,
  dialog: `type: page
body:
  - type: button
    label: 打开对话框
    actionType: dialog
    dialog:
      title: 编辑
      body:
        type: form
        body:
          - type: input-text
            name: name
            label: 名称`,
  drawer: `type: page
body:
  - type: button
    label: 打开抽屉
    actionType: drawer
    drawer:
      title: 详情
      body:
        type: form
        body:
          - type: static
            name: name
            label: 名称
            value: 泵房-A`,
  toast: `type: page
body:
  - type: button
    label: Toast
    actionType: toast
    toast:
      items:
        - body: 已保存
          level: success`,
  alert: `type: alert
title: 提示
level: info
body: 说明文字`,
  wizard: `type: wizard
steps:
  - title: 步骤 1
    body:
      - type: input-text
        name: name
        label: 名称
  - title: 步骤 2
    body:
      - type: tpl
        tpl: 确认提交`,
  tpl: `type: tpl
tpl: Hello \${name|default:Vamis}`,
  chart: `type: chart
api: /api/mock2/chart/chart1`,
  nav: `type: nav
stacked: true
links:
  - label: 概览
    to: /overview
  - label: 设备
    to: /devices`,
  hidden: `type: form
mode: horizontal
body:
  - type: hidden
    name: token
    value: hidden-id
  - type: static
    name: token
    label: 隐藏字段已写入`,
  static: `type: form
mode: horizontal
body:
  - type: static
    name: status
    label: 状态
    value: 在线`,
  popover: `type: tpl
tpl: 悬停查看
popOver:
  body:
    type: tpl
    tpl: PopOver 尚未作为独立 type 落地，当前走宿主属性。`,
  badge: `type: grid-nav
options:
  - icon: fa fa-bell
    text: 消息
    badge: 3
  - icon: fa fa-user
    text: 我的`,
}

function widgetYaml(type, role) {
  if (SPECIAL[type]) return SPECIAL[type]
  if (role === 'item' || role === 'form') {
    const name = fieldName(type)
    const options = OPTION_TYPES.has(type)
      ? `\n    options:\n      ${type.includes('tree') || type.includes('nested') || type.includes('chained') ? TREE_OPTIONS : FLAT_OPTIONS}`
      : ''
    return `type: form
title: ${type}
mode: horizontal
api: /api/mock2/form/saveForm
body:
  - type: ${type}
    name: ${name}
    label: ${type}${options}`
  }
  return `type: ${type}`
}

function wrapPage(yaml, type, role) {
  if (yaml.startsWith('type: page') || role === 'root') return yaml
  if (type === 'dialog' || type === 'drawer' || type === 'toast') return yaml
  const body = indent(yaml, 2)
  const data =
    type === 'table' || type === 'list' || type === 'cards' || type === 'each'
      ? `data:
  items:
    - name: 泵房-A
      status: online
    - name: 闸门-B
      status: offline
`
      : ''
  return `type: page
title: ${type}
${data}body:
  - ${body}`
}

function propsTable(role) {
  if (role === 'item') {
    return `| 属性 | 说明 |
|------|------|
| \`type\` | 表单项种类 |
| \`name\` | 写入表单数据的字段名 |
| \`label\` | 标签 |
| \`value\` | 默认值 |
| \`required\` | 必填 |
| \`disabled\` / \`disabledOn\` | 禁用 |
| \`visibleOn\` / \`hiddenOn\` | 显隐表达式 |
| \`validations\` / \`validationErrors\` | 校验（部分落地） |
| \`description\` | 说明文案 |`
  }
  return `| 属性 | 说明 |
|------|------|
| \`type\` | 组件种类，与 Amis 同名 |
| \`className\` | 附加 class；Vamis 走 Tailwind，暂不解析 \`m:\` / \`pc:\` |
| \`visibleOn\` / \`hiddenOn\` | 显隐表达式 |
| \`onEvent\` | 事件到动作（D4 精简，尚未事件对象） |
| \`data\` | 静态数据，当前多与父级浅合并 |`
}

function extraProps(type) {
  if (type === 'chart') {
    return `\n| \`unMountOnHidden\` | 默认 \`false\`。为 \`true\` 时滚出视口卸载画布（对齐 Amis Chart） |`
  }
  return ''
}

function lookupTodo(type) {
  if (!type) return null
  if (todo[type]) return todo[type]
  if (type === 'popover') return todo.popOver || todo.popover || null
  if (type === 'button') return todo.button || todo.action || null
  return null
}

function readAmisSource(item) {
  const rels = resolveAmisDoc(amisComponentsDir, item.link, item.type)
  for (const rel of rels) {
    const file = path.join(amisComponentsDir, rel)
    if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8')
  }
  return ''
}

function stubMarkdown(item, group, rec) {
  const type = item.type
  const role = item.role || 'widget'
  const status = rec?.status || '进行中'
  const progress = rec?.progress || '—'
  const reason = rec?.reason || '已按 type 注册；文档主路径仍在补齐。'
  const yaml = wrapPage(widgetYaml(type || 'tpl', role), type || 'tpl', role)
  const pct = Number.parseInt(progress, 10)
  const callout =
    status === '已完成'
      ? 'tip'
      : status === '未开始'
        ? 'danger'
        : Number.isFinite(pct) && pct >= 80
          ? 'info'
          : Number.isFinite(pct) && pct >= 40
            ? 'warning'
            : 'danger'

  return `---
title: ${item.text}
outline: deep
---

# ${item.text}

::: ${callout} 实现进度 ${progress} · ${status}
${reason}
:::

\`${type || item.text}\` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 \`cxd-\` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **${group}**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

\`\`\`schema
${yaml}
\`\`\`

## 常用属性

${propsTable(role)}${extraProps(type)}

${diffSection(reason)}`
}

function pageMarkdown(item, group) {
  const type = item.type
  const rec = type ? lookupTodo(type) : lookupTodo(item.text)
  const status = rec?.status || '进行中'
  const progress = rec?.progress || '—'
  const reason = rec?.reason || '已按 type 注册；文档主路径仍在补齐。'
  if (type && SKIP_TYPES.has(type)) return stubMarkdown(item, group, rec)
  const amisMd = readAmisSource(item)
  if (amisMd) {
    return buildSyncedPage({
      title: item.text,
      group,
      type: type || item.text,
      status,
      progress,
      reason,
      amisMd,
    })
  }
  return stubMarkdown(item, group, rec)
}

/** 本轮才从 Amis 补上事件/动作表的手写页：每次 gen 用改写后的表覆盖，避免分列修复不同步。 */
const REFRESH_EVENT_ACTION = new Set([
  '/components/calendar',
  '/components/dialog',
  '/components/drawer',
  '/components/dropdown-button',
  '/components/form/transfer',
  '/components/nav',
  '/components/table2',
  '/components/wizard',
])

const H2_ALIASES = {
  基本使用: ['基本用法', '基础用法'],
  基本用法: ['基本使用', '基础用法'],
}

function hasSection(md, title) {
  if (hasH2(md, title)) return true
  return (H2_ALIASES[title] || []).some((alt) => hasH2(md, alt))
}

function h2Title(part) {
  const line = (String(part).split('\n', 1)[0] || '').trim()
  const m = line.match(/^##\s+(.+)$/)
  return m ? m[1].trim() : ''
}

function isTableHeading(title) {
  return /属性表|事件表|动作表/.test(title)
}

function insertBeforeTables(md, section) {
  if (!section) return md
  const text = String(md || '').replace(/\s+$/, '')
  const block = `\n\n${section.trim()}\n`
  if (/^## 属性表\s*$/m.test(text)) return text.replace(/^## 属性表\s*$/m, `${block}\n## 属性表`)
  return insertBeforeDiff(text, section)
}

/** 补进来的示例章节应在属性表之前，不要堆到动作表后面。 */
function placeExampleSectionsBeforeTables(md) {
  const parts = String(md || '').split(/(?=^## )/m)
  if (parts.length < 3) return md
  const head = []
  const examples = []
  const tables = []
  const rest = []
  const diffs = []
  let stage = 'head'
  for (const part of parts) {
    const title = h2Title(part)
    if (!title) {
      if (stage === 'head') head.push(part)
      else rest.push(part)
      continue
    }
    if (isDiffHeading(title)) {
      diffs.push(part)
      continue
    }
    if (isTableHeading(title)) {
      stage = 'tables'
      tables.push(part)
      continue
    }
    if (stage === 'tables' || stage === 'examples-after') {
      stage = 'examples-after'
      examples.push(part)
      continue
    }
    head.push(part)
  }
  if (!diffs.length && (!examples.length || !tables.length)) return md
  const next = [...head, ...examples, ...tables, ...rest, ...diffs].join('')
  return next.replace(/\n{3,}/g, '\n\n')
}

function dedupeExampleH2(md) {
  const parts = String(md || '').split(/(?=^## )/m)
  const seen = new Set()
  const out = []
  for (const part of parts) {
    const title = h2Title(part)
    if (title && !isTableHeading(title) && !isDiffHeading(title) && seen.has(title)) continue
    if (title) seen.add(title)
    out.push(part)
  }
  return out.join('')
}

function mergeMissingExampleSections(file, item, current) {
  const amisMd = readAmisSource(item)
  if (!amisMd) return { text: current, changed: false }
  const rewritten = rewriteAmisBody(amisMd)
  let next = current
  let changed = false
  const skip = new Set(['属性表', '事件表', '动作表'])
  for (const part of rewritten.split(/(?=^## )/m)) {
    const title = h2Title(part)
    if (!title || skip.has(title) || hasSection(next, title)) continue
    next = insertBeforeTables(next, part.trim())
    changed = true
  }
  const ordered = placeExampleSectionsBeforeTables(next)
  if (ordered !== next) {
    next = ordered
    changed = true
  }
  const deduped = dedupeExampleH2(next)
  if (deduped !== next) {
    next = deduped
    changed = true
  }
  return { text: next, changed }
}

function appendMissingTables(file, item) {
  const amisMd = readAmisSource(item)
  if (!amisMd) return false
  const current = fs.readFileSync(file, 'utf8')
  const rewritten = rewriteAmisBody(amisMd)
  const refresh = REFRESH_EVENT_ACTION.has(item.link)
  let next = current
  let changed = false
  for (const title of ['属性表', '事件表', '动作表']) {
    const section = extractH2(rewritten, title)
    if (!section) continue
    if (title === '属性表') {
      if (hasH2(next, title)) continue
      next = insertBeforeDiff(next, section)
      changed = true
      continue
    }
    if (hasH2(next, title) && !refresh) continue
    next = hasH2(next, title) ? replaceH2(next, title, section) : insertBeforeDiff(next, section)
    changed = true
  }
  const merged = mergeMissingExampleSections(file, item, next)
  next = merged.text
  changed = changed || merged.changed
  const placed = moveDiffToEnd(next)
  if (placed !== next) {
    next = placed
    changed = true
  }
  if (changed) fs.writeFileSync(file, next.endsWith('\n') ? next : `${next}\n`)
  return changed
}

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
}

let written = 0
let patched = 0
for (const group of componentNav) {
  if (!group.items) continue
  for (const item of group.items) {
    if (item.role === 'docs' && !item.type) continue
    if (!item.type && item.role === 'docs') continue
    const rel = item.link.replace(/^\//, '').replace(/\/$/, '/index') + '.md'
    const file = path.join(srcDir, rel)
    if (HANDWRITTEN.has(item.link)) {
      if (fs.existsSync(file) && appendMissingTables(file, item)) patched += 1
      continue
    }
    ensureDir(file)
    fs.writeFileSync(file, pageMarkdown(item, group.text))
    written += 1
  }
}

console.log(`generated ${written} component pages → website/src/components`)
console.log(`patched ${patched} handwritten pages with missing 章节/三表`)
