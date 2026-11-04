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
 * 全表构建依赖（默认包裹 / 文档专章 / 渲染器 import）。
 * SET 整格替换；ADD 追加。互开不写回边：icon↔badge、action↔dialog/drawer、popOver↔dialog、calendar.scheduleAction。
 */
const DEPS_SET = {
  calendar: ['input-date', 'tpl'],
}

const DEPS_ADD = {
  FormItem: ['remark'],
  tpl: ['badge'],
  remark: ['tooltip-wrapper', 'icon', 'tpl'],
  link: ['badge'],
  checkbox: ['badge'],
  radio: ['badge'],
  avatar: ['badge'],
  form: ['panel', 'spinner'],
  page: ['spinner'],
  service: ['spinner'],
  dialog: ['spinner'],
  drawer: ['spinner'],
  crud: ['spinner'],
  select: ['spinner'],
  table: ['checkbox', 'badge'],
  table2: ['badge', 'mapping'],
  'dropdown-button': ['tooltip-wrapper'],
  'input-text': ['Options', 'action'],
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

function layerRows(ranked, maxH) {
  const byH = new Map()
  for (const r of ranked) {
    if (!byH.has(r.H)) byH.set(r.H, [])
    byH.get(r.H).push(r)
  }
  const meaning = {
    0: '叶子：无组件依赖',
    1: '直接依赖叶子（icon 等）',
    [maxH - 2]: 'CRUD / 组合容器',
    [maxH - 1]: '页面',
    [maxH]: '应用',
  }
  const lines = [
    '| 依赖高度 H | 深度 | 数量 | 最早 / 最晚 | 含义 |',
    '|-----------|------|------|-------------|------|',
  ]
  for (let h = 0; h <= maxH; h++) {
    const xs = byH.get(h) || []
    if (!xs.length) continue
    const ranks = xs.map((x) => x.rank)
    const d = xs[0].depth
    lines.push(
      `| ${h} | ${d} | ${xs.length} | #${Math.min(...ranks)}–#${Math.max(...ranks)} | ${meaning[h] ?? ''} |`,
    )
  }
  return lines.join('\n')
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

- 口径：边 \`A → B\` 表示 A 的**构建依赖**——默认包裹、渲染器 import、或文档专章把 B 当主路径。任意 \`body\` / \`scheduleAction\` 嵌套仍不统计。不要把默认包裹当成「可选装饰」。全表按此补边，不是只改 Action。
- **已计入的构建依赖**：\`withBadge\` 宿主（\`action\` / \`tpl\` / \`link\` / \`checkbox\` / \`radio\` / \`avatar\`）；\`FormItem.labelRemark\` → \`remark\` → \`tooltip-wrapper\`；Form \`wrapWithPanel\` → \`panel\`；\`Spinner\` 宿主（\`page\` / \`service\` / \`dialog\` / \`drawer\` / \`crud\` / \`select\` / \`form\`）；Table 勾选 / \`itemBadge\`；\`input-text\` 选择器模式 + \`addOn\`；\`calendar\` extends \`input-date\`；\`dropdown-button\` / \`remark\` 的 TooltipWrapper。
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
- 重算：\`node scripts/component-priority.mjs\`（读本表依赖列，回写本节）。

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
