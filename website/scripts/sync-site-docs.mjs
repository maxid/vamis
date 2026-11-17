/**
 * 同步概念 / 类型 / 扩展文档里尚未对齐的活示例与动作章节。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractH2, progressBanner, rewriteAmisBody } from './rewrite-amis-doc.mjs'

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)))
const src = path.join(root, 'website/src')
const amis = path.resolve(root, '../amis/docs/zh-CN')

function read(rel) {
  return fs.readFileSync(path.join(amis, rel), 'utf8')
}

function write(rel, text) {
  const file = path.join(src, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, text.endsWith('\n') ? text : `${text}\n`)
}

const UNIMPLEMENTED_EVENT_ACTIONS = new Set([
  '浏览器',
  '打印',
  '自定义 JS',
  '触发广播',
  '条件',
  '循环',
  '排他（switch）',
  '并行',
])

const EVENT_ACTION_KEEP_VAMIS = new Set([
  '基本使用',
  '分类',
  '发送 http 请求',
  '弹窗',
  '跳转链接',
  '刷新组件 / 改数据',
  '事件上下文',
  '干预执行',
  '从外部触发',
  '注册自定义动作',
  '阻止事件默认行为',
  '停止后续动作执行',
  '忽略动作报错继续执行',
])

function syncEventAction() {
  const vamPath = path.join(src, 'concepts/event-action.md')
  const vam = fs.readFileSync(vamPath, 'utf8')
  const rewritten = rewriteAmisBody(read('concepts/event-action.md'))
  const parts = rewritten.split(/(?=^## )/m).filter((p) => p.trim().startsWith('## '))
  const extras = []
  for (const part of parts) {
    const title = (part.split('\n', 1)[0] || '').replace(/^##\s+/, '').trim()
    if (!title || EVENT_ACTION_KEEP_VAMIS.has(title)) continue
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp(`^##\\s+${escaped}\\s*$`, 'm').test(vam)) continue
    let section = part.trim()
    if (UNIMPLEMENTED_EVENT_ACTIONS.has(title)) {
      section = section.replace(
        /^## .+$/m,
        (h) => `${h}\n\n::: danger 未接\n该动作尚未进 Vamis 动作表。下面按 Amis 6.13.0 列出契约与活示例，预览可能无对应行为。\n:::`,
      )
    }
    extras.push(section)
  }
  if (!extras.length) {
    console.log('event-action: no extra sections')
    return
  }
  const marker = /^## 从外部触发\s*$/m
  const block = `\n\n${extras.join('\n\n')}\n\n`
  const next = marker.test(vam)
    ? vam.replace(marker, `${block}## 从外部触发`)
    : `${vam.replace(/\s+$/, '')}${block}`
  write('concepts/event-action.md', next)
  console.log(`event-action: appended ${extras.length} Amis sections`)
}

function syncDefinitions() {
  const body = rewriteAmisBody(read('types/definitions.md'))
  const md = `---
title: Definitions
outline: deep
---

# Definitions

${progressBanner('进行中', '20%', '文档已按 Amis 主路径列出 `$ref` / 递归引用活示例；运行时尚未解析 `definitions`。')}

顶级节点可以写 \`definitions\`，其它节点用 \`$ref\` 引用。作者态 YAML 与 JSON 同等有效。

${body}

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON。
- 运行时尚未解析 \`definitions\` / \`$ref\`，下面示例按 Amis 6.13.0 契约列出。
`
  write('types/definitions.md', md)
  console.log('types/definitions.md written')
}

function syncI18n() {
  const body = rewriteAmisBody(read('extend/i18n.md'))
    .replace(/amis 中对多语言/g, 'Amis 对多语言')
    .replace(/amis 内部组件/g, '内部组件')
    .replace(/let amisScoped = amis\.embed/g, 'const scoped = vamis.embed')
    .replace(/(?<![vV])amis\.embed/g, 'vamis.embed')
    .replace(/amisRequire\('amis\/embed'\)/g, 'window.vamis')
    .replace(/### React[\s\S]*?(?=^## )/m, '### React\n\nVamis 没有 React 包，内部文案走 `env` / locale，不要抄 Amis `LocaleContext`。\n\n')
  const md = `---
title: 国际化
---

# 国际化

${progressBanner('进行中', '15%', '没有 i18n 包。文案写在 schema（`label` / `title` / `body`）。locale / `replaceText` 仍是 D12 余项。')}

内部组件文案（日期面板「月」「周」）和作者写在 schema 里的 \`label\` 是两条通道。Vamis 目前都走 schema 原文；\`locale: en-US\` 尚未注入 \`vamis.embed\`。

${body}
`
  write('extend/i18n.md', md)
  console.log('extend/i18n.md written')
}

function syncDebug() {
  const body = rewriteAmisBody(read('extend/debug.md'))
    .replace(/amis 内置了调试工具/g, 'Amis 内置了调试工具')
    .replace(/enableAMISDebug/g, 'enableVamisDebug')
    .replace(/amisDebug=1/g, 'vamisDebug=1')
  const md = `---
title: 调试
---

# 调试

${progressBanner('进行中', '20%', 'kernel D8 未落地。现在靠 Playground IR Tab、Vue/Pinia devtools、未知 type 占位。没有 `env.debug` 动作日志。')}

kernel **D8** 预留诊断通道，未落地。现在可以：

- Playground 的 **IR** Tab 看规范化后的信封
- 浏览器 Vue / Pinia devtools 看 hub store
- 未知 type 会渲染占位，而不是白屏

不要对 schema 做 \`eval\` 来「方便调试」。

Amis 文档站右侧的 Debug 面板对应下面契约，Vamis **尚未接**。

${body}
`
  write('extend/debug.md', md)
  console.log('extend/debug.md written')
}

syncEventAction()
syncDefinitions()
syncI18n()
syncDebug()
