#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { componentNav } from '../nav.mjs'

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)))
const srcDir = path.join(root, 'website/src')
const todoPath = path.join(root, 'docs/superpowers/specs/2026-10-20-vamis-component-todo.md')

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
  '/components/form/',
  '/components/form/formitem',
  '/components/form/control',
  '/components/form/options',
  '/components/page',
  '/components/container',
  '/components/chart',
  '/components/code',
  '/components/form/editor',
  '/components/form/diff-editor',
])

function parseTodo(text) {
  /** @type {Record<string, { status: string, progress: string, reason: string }>} */
  const map = {}
  for (const line of text.split('\n')) {
    const m = line.match(
      /^\| `([^`]+)` \| [^|]+ \| (未开始|进行中|已完成) \| (\d+%) \| ([^|]+) \|/,
    )
    if (!m) continue
    const keys = m[1].split('/').map((s) => s.replace(/`/g, '').trim()).filter(Boolean)
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

function pageMarkdown(item, group) {
  const type = item.type
  const role = item.role || 'widget'
  const rec = type ? lookupTodo(type) : lookupTodo(item.text)
  const status = rec?.status || '进行中'
  const progress = rec?.progress || '—'
  const reason = rec?.reason || '已按 type 注册；文档主路径仍在补齐。'
  const yaml = wrapPage(widgetYaml(type || 'tpl', role), type || 'tpl', role)
  const callout =
    status === '已完成'
      ? 'tip'
      : status === '未开始'
        ? 'danger'
        : Number.parseInt(progress, 10) >= 50
          ? 'info'
          : 'warning'

  return `---
title: ${item.text}
outline: deep
---

# ${item.text}

::: ${callout} 实现进度 ${progress} · ${status}
${reason}
:::

\`${type || item.text}\` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue token，不使用 \`cxd-\` 类名。

属于侧栏分类 **${group}**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

\`\`\`schema
${yaml}
\`\`\`

## 常用属性

${propsTable(role)}${extraProps(type)}

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（\`yes\` / \`On\` / \`012\` 当字符串）。
- 可包在 IR 信封 \`apiVersion: lcdp.ir/v1\` + \`kind: UiPage\` 里，\`spec\` 仍是这棵 widget 树。
- 数据域（D1）、表达式过滤器（D2）、完整 API 管线（D3）和事件对象（D4）尚未落地，高级示例可能与 Amis 官网行为不一致。
`
}

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
}

let written = 0
for (const group of componentNav) {
  if (!group.items) continue
  for (const item of group.items) {
    if (HANDWRITTEN.has(item.link) || item.role === 'docs' && !item.type) continue
    if (!item.type && item.role === 'docs') continue
    if (HANDWRITTEN.has(item.link)) continue
    const rel = item.link.replace(/^\//, '').replace(/\/$/, '/index') + '.md'
    const file = path.join(srcDir, rel)
    ensureDir(file)
    fs.writeFileSync(file, pageMarkdown(item, group.text))
    written += 1
  }
}

console.log(`generated ${written} component pages → website/src/components`)
