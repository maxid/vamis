#!/usr/bin/env node
/**
 * 从组件 TODO「全量顺序」表读依赖边，按「拓扑约束 + 解锁分 + 综合分」重算实施顺序并回写该节。
 *
 * 边 A 依赖 B：B 必须先做。就绪集（依赖均已排）里：
 *   S = 被依赖 × (max深度 + 1) + 深度
 *   U = max(S, 被自己挡住的下游 U)  —— 避免低 S chrome 堵住高 S 枢纽
 * 同 U 再按 S、深度、文档序。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const todoPath = path.join(root, 'docs/superpowers/specs/2026-10-20-vamis-component-todo.md')
const depsPath = path.join(root, 'docs/superpowers/specs/2026-10-20-vamis-component-deps.md')

const SECTION_HEAD = '## 依赖与优先级（基于 amis）'
const SECTION_END = '\n## 附录：侧栏没有、Vamis 已注册'

function nodeKeys(label) {
  const keys = []
  if (/\bFormItem\b/.test(label) || label.includes('FormItem')) keys.push('FormItem')
  if (/(?<![A-Za-z])Options(?![A-Za-z])/.test(label) && !label.includes('`')) {
    keys.push('Options')
  }
  for (const m of label.matchAll(/`([^`]+)`/g)) keys.push(m[1])
  if (!keys.length) {
    keys.push(label.replace(/（[^）]*）/g, '').trim())
  }
  return [...new Set(keys)]
}

function parseDeps(cell) {
  const t = cell.trim()
  if (!t || t === '—' || t === '-') return []
  return t
    .split('、')
    .map((s) => s.trim().replace(/^`|`$/g, ''))
    .filter(Boolean)
}

function formatDepCell(deps) {
  if (!deps.length) return '—'
  return deps.map((d) => (d === 'FormItem' || d === 'Options' ? d : `\`${d}\``)).join('、')
}

/**
 * 全表构建依赖（默认包裹 / 文档专章 / 渲染器 import / 示例主路径）。
 * 示例证据：`scripts/audit-amis-examples.mjs`（docs ```schema + examples export default）。
 * SET 整格替换；ADD 追加；REMOVE 删掉误边。
 * 互开不写回边：icon↔badge、action↔dialog/drawer、popOver↔dialog、calendar.scheduleAction。
 */
const DEPS_SET = {
  calendar: ['input-date', 'tpl'],
}

const DEPS_ADD = {
  FormItem: ['remark'],
  tpl: ['badge'],
  remark: ['tooltip-wrapper', 'icon', 'tpl'],
  link: ['badge'],
  avatar: ['badge'],
  nav: ['badge'],
  form: ['panel', 'spinner'],
  page: ['spinner', 'remark'],
  service: ['spinner'],
  dialog: ['spinner'],
  drawer: ['spinner'],
  crud: ['spinner'],
  select: ['spinner'],
  table: ['badge'],
  table2: ['badge', 'mapping'],
  list: ['popOver'],
  cards: ['popOver'],
  timeline: ['card'],
  'dropdown-button': ['tooltip-wrapper', 'icon'],
  'input-text': ['Options', 'action'],
  transfer: ['Options'],
  'input-tree': ['Options'],
}

/** 示例 + 专章对不上的边：HOC 有、文档主路径没有；或 UI 原语 ≠ schema type */
const DEPS_REMOVE = {
  checkbox: ['badge'],
  radio: ['badge'],
  table: ['checkbox'],
}

function applyBuildDeps(rows) {
  const changed = []
  for (const r of rows) {
    const key = nodeKeys(r.label)[0]
    let next = parseDeps(r.depCell)
    if (DEPS_SET[key]) next = [...DEPS_SET[key]]
    if (DEPS_ADD[key]) {
      next = [...next]
      for (const d of DEPS_ADD[key]) if (!next.includes(d)) next.push(d)
    }
    if (DEPS_REMOVE[key]) {
      next = next.filter((d) => !DEPS_REMOVE[key].includes(d))
    }
    const cell = formatDepCell(next)
    if (cell !== r.depCell) {
      changed.push({ key, from: r.depCell, to: cell })
      r.depCell = cell
    }
  }
  return changed
}

function parseNodes(text) {
  const start = text.indexOf(SECTION_HEAD)
  if (start < 0) throw new Error('missing 依赖与优先级 section')
  const end = text.indexOf(SECTION_END, start)
  if (end < 0) throw new Error('missing 附录 after 依赖与优先级')
  const section = text.slice(start, end)
  const tableStart = section.indexOf('### 全量顺序')
  if (tableStart < 0) throw new Error('missing 全量顺序 table')
  const rows = []
  for (const line of section.slice(tableStart).split('\n')) {
    const m = line.match(
      /^\| (\d+) \| (.+?) \| (.+?) \| (?:\d+ \| )+(未开始|进行中|已完成) \| (\d+%) \|$/,
    )
    if (!m) continue
    rows.push({
      orig: Number(m[1]),
      label: m[2].trim(),
      depCell: m[3].trim(),
      status: m[4],
      progress: m[5],
    })
  }
  if (rows.length < 100) throw new Error(`parsed too few rows: ${rows.length}`)
  return { start, end, rows }
}

function rank(rows) {
  const nodes = rows.map((r, i) => ({
    id: i,
    ...r,
    keys: nodeKeys(r.label),
  }))
  const byKey = new Map()
  for (const n of nodes) {
    for (const k of n.keys) {
      if (byKey.has(k) && byKey.get(k) !== n.id) {
        throw new Error(`duplicate key ${k}: ${nodes[byKey.get(k)].label} vs ${n.label}`)
      }
      byKey.set(k, n.id)
    }
  }

  for (const n of nodes) {
    n.depIds = []
    for (const d of parseDeps(n.depCell)) {
      const id = byKey.get(d)
      if (id == null) throw new Error(`${n.label} 依赖未知节点 ${d}`)
      if (id === n.id) throw new Error(`${n.label} 自依赖`)
      n.depIds.push(id)
    }
    n.depIds = [...new Set(n.depIds)]
  }

  const dependents = nodes.map(() => [])
  for (const n of nodes) {
    for (const d of n.depIds) dependents[d].push(n.id)
  }
  const fanIn = dependents.map((xs) => xs.length)

  const H = nodes.map(() => 0)
  const visiting = nodes.map(() => 0) // 0 not, 1 visiting, 2 done
  const dfsH = (id) => {
    if (visiting[id] === 1) throw new Error(`cycle at ${nodes[id].label}`)
    if (visiting[id] === 2) return H[id]
    visiting[id] = 1
    let h = 0
    for (const d of nodes[id].depIds) h = Math.max(h, dfsH(d) + 1)
    H[id] = h
    visiting[id] = 2
    return h
  }
  for (const n of nodes) dfsH(n.id)
  const maxH = Math.max(...H)
  const depth = H.map((h) => maxH - h)
  const maxDepth = Math.max(...depth)
  const weight = maxDepth + 1
  const score = nodes.map((_, i) => fanIn[i] * weight + depth[i])
  const unlock = nodes.map(() => 0)
  const uVis = nodes.map(() => 0)
  const dfsU = (id) => {
    if (uVis[id] === 1) throw new Error(`unlock cycle at ${nodes[id].label}`)
    if (uVis[id] === 2) return unlock[id]
    uVis[id] = 1
    let u = score[id]
    for (const m of dependents[id]) u = Math.max(u, dfsU(m))
    unlock[id] = u
    uVis[id] = 2
    return u
  }
  for (const n of nodes) dfsU(n.id)

  const wait = nodes.map((n) => n.depIds.length)
  const remainingDeps = nodes.map((n) => new Set(n.depIds))
  const ready = []
  const inReady = nodes.map(() => false)
  const pushReady = (id) => {
    if (inReady[id]) return
    inReady[id] = true
    ready.push(id)
  }
  for (const n of nodes) if (wait[n.id] === 0) pushReady(n.id)

  const cmpReady = (a, b) => {
    if (unlock[a] !== unlock[b]) return unlock[b] - unlock[a]
    if (score[a] !== score[b]) return score[b] - score[a]
    if (fanIn[a] !== fanIn[b]) return fanIn[b] - fanIn[a]
    if (depth[a] !== depth[b]) return depth[b] - depth[a]
    return nodes[a].orig - nodes[b].orig
  }

  const order = []
  while (ready.length) {
    ready.sort(cmpReady)
    const id = ready.shift()
    inReady[id] = false
    order.push(id)
    for (const m of dependents[id]) {
      remainingDeps[m].delete(id)
      wait[m] -= 1
      if (wait[m] === 0) pushReady(m)
    }
  }
  if (order.length !== nodes.length) {
    const leftover = nodes.filter((n) => !order.includes(n.id)).map((n) => n.label)
    throw new Error(`unranked (cycle?): ${leftover.join(', ')}`)
  }

  const ranked = order.map((id, rankIdx) => ({
    rank: rankIdx + 1,
    label: nodes[id].label,
    depCell: nodes[id].depCell,
    H: H[id],
    depth: depth[id],
    fanIn: fanIn[id],
    score: score[id],
    unlock: unlock[id],
    status: nodes[id].status,
    progress: nodes[id].progress,
    keys: nodes[id].keys,
    orig: nodes[id].orig,
  }))

  return { ranked, maxH, maxDepth, weight, count: nodes.length }
}

function groupByH(ranked) {
  const byH = new Map()
  for (const r of ranked) {
    if (!byH.has(r.H)) byH.set(r.H, [])
    byH.get(r.H).push(r)
  }
  for (const xs of byH.values()) xs.sort((a, b) => a.rank - b.rank)
  return byH
}

function layerMeaning(h, maxH, xs) {
  if (h === 0) return '叶子：无组件依赖'
  if (h === maxH) return '应用'
  if (h === maxH - 1) return '页面'
  if (h === maxH - 2) return 'CRUD / 组合容器'
  const sample = xs
    .slice(0, 4)
    .map((r) => r.keys[0])
    .join('、')
  return sample
}

function layerRows(ranked, maxH) {
  const byH = groupByH(ranked)
  const lines = [
    '| 依赖高度 H | 深度 | 数量 | 最早 / 最晚 | 代表 |',
    '|-----------|------|------|-------------|------|',
  ]
  for (let h = 0; h <= maxH; h++) {
    const xs = byH.get(h) || []
    if (!xs.length) continue
    const ranks = xs.map((x) => x.rank)
    const d = xs[0].depth
    lines.push(
      `| ${h} | ${d} | ${xs.length} | #${Math.min(...ranks)}–#${Math.max(...ranks)} | ${layerMeaning(h, maxH, xs)} |`,
    )
  }
  return lines.join('\n')
}

function mermaidId(key) {
  return `t_${String(key).replace(/[^A-Za-z0-9]/g, '_')}`
}

function headingAnchor(key) {
  return String(key)
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}

function collectDependents(ranked) {
  const byKey = new Map()
  for (const r of ranked) {
    for (const k of r.keys) byKey.set(k, r)
  }
  const dependents = new Map()
  for (const r of ranked) {
    for (const d of parseDeps(r.depCell)) {
      if (!dependents.has(d)) dependents.set(d, [])
      dependents.get(d).push(r)
    }
  }
  return { byKey, dependents }
}

function unlocksOf(r, dependents) {
  const seen = new Map()
  for (const k of r.keys) {
    for (const u of dependents.get(k) || []) seen.set(u.rank, u)
  }
  return [...seen.values()].sort((a, b) => a.rank - b.rank)
}

/** 开工前置闭包：自身 + 全部祖先（直接和间接）。 */
function ancestorsOf(r, byKey) {
  const seen = new Map()
  const walk = (node) => {
    for (const d of parseDeps(node.depCell)) {
      const dep = byKey.get(d)
      if (!dep || seen.has(dep.rank)) continue
      seen.set(dep.rank, dep)
      walk(dep)
    }
  }
  walk(r)
  return [...seen.values()].sort((a, b) => a.rank - b.rank)
}

function mermaidClosure(r, ancestors) {
  const nodes = [...ancestors, r]
  const inSet = new Set(nodes.map((n) => n.rank))
  const dir = nodes.length > 16 ? 'TB' : 'LR'
  const self = mermaidId(r.keys[0])
  const lines = [`flowchart ${dir}`]
  for (const n of nodes) {
    lines.push(`  ${mermaidId(n.keys[0])}["#${n.rank} ${n.keys[0]}"]`)
  }
  const seenEdge = new Set()
  for (const n of nodes) {
    const b = mermaidId(n.keys[0])
    for (const d of parseDeps(n.depCell)) {
      const dep = nodes.find((x) => x.keys.includes(d))
      if (!dep || !inSet.has(dep.rank)) continue
      const a = mermaidId(dep.keys[0])
      const ek = `${a}-->${b}`
      if (seenEdge.has(ek) || a === b) continue
      seenEdge.add(ek)
      lines.push(`  ${a} --> ${b}`)
    }
  }
  lines.push('  classDef self stroke-width:3px')
  lines.push(`  class ${self} self`)
  return lines.join('\n')
}

/** 每个 type 一张图：开工前置闭包（祖先诱导子图），不是只有直接依赖。 */
function renderPerTypeDeps(ranked) {
  const { byKey, dependents } = collectDependents(ranked)
  const leaves = ranked.filter((r) => parseDeps(r.depCell).length === 0)
  const rest = ranked.filter((r) => parseDeps(r.depCell).length > 0)
  const toc = rest
    .map((r) => `- [#${r.rank} \`${r.keys[0]}\`](#${headingAnchor(r.keys[0])})`)
    .join('\n')

  const parts = [
    '# 组件分 type 依赖图',
    '',
    '由 `scripts/component-priority.mjs` 生成，不要手改。箭头 `A --> B` = 先做 A。',
    'TODO 里的拓扑图只画**主干**。这里每个 type 一张 **开工前置闭包**：自身 + 全部祖先，边是诱导子图（祖先之间的依赖也画）。',
    '只画直接依赖不够：Action 研发时会把 `tooltip-wrapper` 当成一个点，在按钮里再造一套浮层。这张图里的节点全部做完才能开工。',
    '',
    '[← 组件 P0 TODO](./2026-10-20-vamis-component-todo.md)',
    '',
    '## 目录',
    '',
    toc,
    '',
    `## 无组件依赖（叶子，${leaves.length}）`,
    '',
    leaves.map((r) => `- #${r.rank} \`${r.keys[0]}\``).join('\n'),
    '',
  ]

  for (const r of rest) {
    const key = r.keys[0]
    const ancestors = ancestorsOf(r, byKey)
    const direct = parseDeps(r.depCell)
    const unlock = unlocksOf(r, dependents)
    parts.push(`## ${key}`, '')
    parts.push(
      `#${r.rank} · H=${r.H} · 前置 ${ancestors.length} · 直接依赖 ${direct.length} · 被依赖 ${r.fanIn} · ${r.progress} ${r.status}`,
      '',
    )
    parts.push(
      `直接依赖：${direct.map((d) => `\`${d}\``).join('、') || '—'}`,
      '',
    )
    parts.push('```mermaid', mermaidClosure(r, ancestors), '```', '')
    if (unlock.length) {
      parts.push(
        `解锁：${unlock.map((u) => `#${u.rank} \`${u.keys[0]}\``).join('、')}`,
        '',
      )
    }
  }

  return `${parts.join('\n').trim()}\n`
}

function orderTable(ranked) {
  const lines = [
    '| # | type | 依赖 | 深度 | 被依赖 | S | U | 状态 | 进度 |',
    '|---|------|------|------|--------|---|---|------|------|',
  ]
  for (const r of ranked) {
    lines.push(
      `| ${r.rank} | ${r.label} | ${r.depCell} | ${r.depth} | ${r.fanIn} | ${r.score} | ${r.unlock} | ${r.status} | ${r.progress} |`,
    )
  }
  return lines.join('\n')
}

function typeLabel(r) {
  const k = r.keys[0]
  if (k === 'FormItem' || k === 'Options') return k
  return `\`${k}\``
}

function topHint(ranked, n = 8) {
  const skip = new Set(['custom', 'office-viewer', 'pdf-viewer'])
  const next = ranked.filter((r) => {
    if (r.status === '已完成') return false
    if (r.keys.some((k) => skip.has(k))) return false
    const pct = Number.parseInt(r.progress, 10)
    if (Number.isFinite(pct) && pct >= 90) return false
    return true
  })
  return next
    .slice(0, n)
    .map((r) => `${typeLabel(r)}（#${r.rank}，${r.progress}）`)
    .join('、')
}

function overview(ranked) {
  const firstZero = ranked.find((r) => r.fanIn === 0)
  const zeroAt = firstZero ? firstZero.rank : ranked.length
  const top = ranked.filter((r) => r.rank < zeroAt && r.rank <= 10)
  const pick = (key) => ranked.find((r) => r.keys.includes(key))
  const midKeys = ['image', 'service', 'table', 'list', 'form', 'dialog', 'crud', 'page']
  const mid = midKeys
    .map(pick)
    .filter((r) => r && r.rank > 10 && r.rank < zeroAt)
    .map((r) => `#${r.rank} ${typeLabel(r)}`)
    .join('、')
  const last = ranked[ranked.length - 1]
  return `### 速览

| 段 | 序号 | 代表 |
|----|------|------|
| 解锁主干 | #1–#10 | ${top.map(typeLabel).join('、')} |
| 主路径容器 | #11–#${zeroAt - 1} | ${mid} |
| 零被依赖 | #${zeroAt}–#${ranked.length - 1} | 展示叶子与其余组合件（含 Custom / office / pdf，实施时跳过） |
| 最后 | #${last.rank} | ${typeLabel(last)} |

\`#\` 是**拓扑就绪后**按解锁分 U 再按 S 的序，不是全局 S 序：例如 \`action\` 的 S 高于 \`tooltip-wrapper\`，但必须等 tooltip chrome 做完才能开工。`
}

function renderSection(result) {
  const { ranked, maxH, maxDepth, weight, count } = result
  const next = topHint(ranked)
  return `${SECTION_HEAD}

- 口径：边 \`A → B\` 表示 A 的**构建依赖**——默认包裹、渲染器 import、文档专章、或 Amis 示例主路径把 B 当契约。任意 \`body\` / \`scheduleAction\` 嵌套仍不统计。不要把默认包裹当成「可选装饰」。全表按此补边，不是只改 Action。
- **示例核对**：\`scripts/audit-amis-examples.mjs\` 收割 \`../amis/docs/zh-CN\` \`\`\`schema\` 与 \`examples/\` export default（JSON + 对象字面量）。只把「专章或主路径示例反复出现」的 chrome / 契约写成边；page 壳包着 \`spinner.md\` 示例不算 \`page → spinner\`（那条边来自 Page 渲染器 import Spinner）。
- **已计入的构建依赖**：\`withBadge\` 宿主以 badge.md 首例为准（\`action\` / \`tpl\` / \`link\` / \`avatar\` / \`icon\`）；\`nav.itemBadge\`；\`FormItem.labelRemark\` → \`remark\` → \`tooltip-wrapper\`；Page 属性表 \`remark\`；Form \`wrapWithPanel\` → \`panel\`；\`Spinner\` 宿主（\`page\` / \`service\` / \`dialog\` / \`drawer\` / \`crud\` / \`select\` / \`form\`）；Table / Table2 \`itemBadge\`（勾选是 \`selectable\` UI，不是 \`type: checkbox\`）；popover.md 的 list 列 / cards 字段；timeline 卡片展示；\`input-text\` 选择器 + \`addOn\`；transfer / input-tree 的 \`options\`；\`calendar\` extends \`input-date\`；\`dropdown-button\` 的 icon / TooltipWrapper。
- **示例删掉的边**：checkbox / radio 的 \`withBadge\`（HOC 有，badge.md 与示例主路径没有）；\`table → checkbox\`。
- **互开不成环**：\`actionType: dialog|drawer\` 与弹层页脚 \`action\`；\`icon\` 的 \`withBadge\` 与 \`badge → icon\`；\`popOver\` mode dialog。Kahn 只留一边。\`calendar.scheduleAction\` 当任意嵌套，不写 dialog。
- **依赖链**：Kahn 拓扑——B 未排完则 A 不能开工（先做被依赖的节点）。
- **树深度**：叶子高度 \`H = 0\`，沿依赖向上递增；\`深度 = maxH − H\`（当前 maxH = ${maxH}）。深度大 = 更靠近叶子、更基础。
- **被依赖**：有多少个本表节点的构建依赖直接列出该 type。
- **综合分** \`S = 被依赖 × ${weight} + 深度\`（${weight} = max深度 + 1）。多 1 次被依赖就超过整段深度差，避免 \`pdf-viewer\` 这类无人依赖的叶子排在 \`action\` / \`form\` 前面。
- **解锁分** \`U(n) = max(S(n), max U(依赖 n 的节点))\`。就绪集先比 U 再比 S，避免 \`tooltip-wrapper\`（被依赖少、S 低）堵住 \`action\`（被依赖多、S 高）。同分再按深度降序、原文档序。
- 优先级 \`#1\` 最先做，\`#${count}\` 最后做。\`P\` 列仍是阶段 P0；**执行顺序看本表**。
- \`FormItem\` / \`Options\` 是契约节点；\`toast\` 是动作；\`badge\` / \`popOver\` 是属性型节点，均按组件计入。
- \`office-viewer\` 的 Word/Excel 两行共用一个 type，只列一次；主表 155 行对应 ${count} 个 type 节点。
- 跳过 Custom 与 office/pdf；「下一批」跳过已完成和进度 ≥90% 的主干余项。当前建议下一批：${next}。
- 示例：\`icon → badge → tpl → tooltip-wrapper → remark → FormItem\`；\`action → {icon, tpl, tooltip-wrapper, badge, toast}\`；\`form → panel / spinner / FormItem / Options + input-*\`；\`calendar → input-date\`。
- 重算：\`node scripts/component-priority.mjs\`（读本表依赖列，回写本节 + [分 type 依赖图](./2026-10-20-vamis-component-deps.md)）。拓扑图只画主干；分 type 图是开工前置闭包（全部祖先，不是只有直接依赖）；全表看「全量顺序」。

${overview(ranked)}

\`\`\`mermaid
flowchart LR
  FormItem --> Options
  FormItem --> inputText["input-text"]
  Options --> select
  icon --> badge
  badge --> tpl
  tpl --> tooltipWrapper["tooltip-wrapper"]
  tooltipWrapper --> remark
  remark --> FormItem
  icon --> action
  tpl --> container
  tooltipWrapper --> action
  badge --> action
  toast --> action
  action --> form
  panel --> form
  spinner --> form
  inputDate["input-date"] --> calendar
  FormItem --> form
  select --> form
  form --> dialog
  form --> crud
  table --> crud
  crud --> page
  page --> app
\`\`\`

每个 type 的开工前置闭包（全部祖先，不是只有直接依赖）：[分 type 依赖图](./2026-10-20-vamis-component-deps.md)。

### 分层

高度仍描述依赖树形状；序号不再按层切成连续区间（同层里被依赖多的会插到更浅、但已就绪的节点之前）。

${layerRows(ranked, maxH)}

### 全量顺序

${orderTable(ranked)}

`
}

function main() {
  const text = fs.readFileSync(todoPath, 'utf8')
  const { start, end, rows } = parseNodes(text)
  const depPatch = applyBuildDeps(rows)
  const result = rank(rows)
  result.depPatch = depPatch
  const section = renderSection(result)
  const next = text.slice(0, start) + section + text.slice(end)
  if (next !== text) fs.writeFileSync(todoPath, next)
  const depsMd = renderPerTypeDeps(result.ranked)
  fs.writeFileSync(depsPath, depsMd)
  const changed = result.ranked.filter((r) => r.rank !== r.orig)
  console.log(
    JSON.stringify(
      {
        nodes: result.count,
        maxH: result.maxH,
        weight: result.weight,
        depPatch: depPatch.length,
        depPatchSample: depPatch.slice(0, 24),
        moved: changed.length,
        top12: result.ranked.slice(0, 12).map((r) => ({
          rank: r.rank,
          was: r.orig,
          type: r.keys[0],
          S: r.score,
          U: r.unlock,
          depth: r.depth,
          fanIn: r.fanIn,
        })),
        last8: result.ranked.slice(-8).map((r) => ({
          rank: r.rank,
          was: r.orig,
          type: r.keys[0],
          S: r.score,
          fanIn: r.fanIn,
        })),
        nextBatch: topHint(result.ranked),
      },
      null,
      2,
    ),
  )
}

main()
