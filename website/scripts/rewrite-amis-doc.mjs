/**
 * 把 Amis 6.13.0 文档主路径改写成 Vamis 站点正文。
 * 不搬版本号、GitHub 仓库链、cxd 自称；活示例转成合法 JSON ```schema 围栏。
 */

const SKIP_TYPES = new Set(['custom', 'office-viewer', 'office-viewer-excel', 'pdf-viewer'])

const AMIS_REL_BY_LINK = {
  '/components/tooltip': 'tooltip-wrapper.md',
}

export { SKIP_TYPES }

export function stripFrontmatter(md) {
  const text = String(md || '').replace(/^\uFEFF/, '')
  if (!text.startsWith('---')) return text
  const end = text.indexOf('\n---', 3)
  if (end < 0) return text
  return text.slice(end + 4).replace(/^\s*\n/, '')
}

export function parseAmisFence(text) {
  const trimmed = String(text || '').trim()
  if (!trimmed) return { keep: true, text: trimmed }
  if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) {
    return { keep: true, text: trimmed }
  }
  try {
    return { value: JSON.parse(trimmed) }
  } catch {
    /* JS 对象 / 单引号 / 注释 / 尾逗号 */
  }
  try {
    const fn = new Function(`"use strict"; return (${trimmed});`)
    return { value: fn() }
  } catch {
    return { keep: true, text: trimmed }
  }
}

function fenceInfo(meta) {
  const raw = String(meta || '').trim()
  if (!raw) return 'schema'
  return raw.startsWith('schema') ? raw : `schema${raw.startsWith(':') ? raw : `: ${raw}`}`
}

export function rewriteSchemaFences(md) {
  return String(md || '').replace(/```(schema[^\n]*)\n([\s\S]*?)```/g, (full, meta, body) => {
    const parsed = parseAmisFence(body)
    if (parsed.keep || parsed.value === undefined) {
      return `\`\`\`${meta}\n${rewriteAmisGithubUrl(body)}\n\`\`\``
    }
    const json = JSON.stringify(rewriteValueUrls(parsed.value), null, 2)
    return `\`\`\`${fenceInfo(meta)}\n${json}\n\`\`\``
  })
}

function splitRow(line) {
  const trimmed = line.trim()
  if (!trimmed.startsWith('|')) return null
  const inner = trimmed.replace(/^\|/, '').replace(/\|$/, '')
  const cells = []
  let buf = ''
  let inTick = false
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i]
    if (ch === '`') inTick = !inTick
    if (ch === '\\' && inner[i + 1] === '|') {
      buf += '\\|'
      i += 1
      continue
    }
    if (ch === '|' && !inTick) {
      cells.push(buf.trim())
      buf = ''
      continue
    }
    buf += ch
  }
  cells.push(buf.trim())
  return cells
}

function isSepRow(cells) {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, '')) || cell === '')
}

export function dropVersionColumns(md) {
  const lines = String(md || '').split('\n')
  const out = []
  let i = 0
  while (i < lines.length) {
    const header = splitRow(lines[i])
    const sep = i + 1 < lines.length ? splitRow(lines[i + 1]) : null
    if (header && sep && isSepRow(sep)) {
      const verIdx = header.findIndex((cell) => cell.replace(/\s/g, '') === '版本')
      if (verIdx >= 0) {
        const drop = (cells) => cells.filter((_, idx) => idx !== verIdx)
        const fmt = (cells) => `| ${cells.join(' | ')} |`
        out.push(fmt(drop(header)))
        out.push(fmt(drop(sep).map((cell) => cell || '---')))
        i += 2
        while (i < lines.length) {
          const row = splitRow(lines[i])
          if (!row) break
          out.push(fmt(drop(row)))
          i += 1
        }
        continue
      }
    }
    out.push(lines[i])
    i += 1
  }
  return out.join('\n')
}

const VAMIS_GITHUB = 'https://github.com/maxid/vamis'

function rewriteAmisGithubUrl(text) {
  return String(text || '').replace(/https?:\/\/github\.com\/baidu\/amis[^\s)"']*/g, VAMIS_GITHUB)
}

function rewriteValueUrls(value) {
  if (typeof value === 'string') return rewriteAmisGithubUrl(value)
  if (Array.isArray(value)) return value.map(rewriteValueUrls)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [key, nested] of Object.entries(value)) out[key] = rewriteValueUrls(nested)
    return out
  }
  return value
}

function mapOutsideFences(md, fn) {
  const parts = []
  const re = /```[\s\S]*?```/g
  let last = 0
  let match
  const text = String(md || '')
  while ((match = re.exec(text))) {
    parts.push(fn(text.slice(last, match.index)))
    parts.push(match[0])
    last = match.index + match[0].length
  }
  parts.push(fn(text.slice(last)))
  return parts.join('')
}

export function rewriteLinks(md) {
  return String(md || '')
    .replace(/\]\(\.\.\/\.\.\/\.\.\/docs\/types\//g, '](/types/')
    .replace(/\]\(\.\.\/\.\.\/docs\/types\//g, '](/types/')
    .replace(/\]\(\.\.\/\.\.\/\.\.\/docs\/concepts\//g, '](/concepts/')
    .replace(/\]\(\.\.\/\.\.\/docs\/concepts\//g, '](/concepts/')
    .replace(/\]\(\.\.\/\.\.\/components\//g, '](/components/')
    .replace(/\]\(\.\.\/\.\.\/docs\//g, '](/')
    .replace(/\[([^\]]+)\]\(https?:\/\/github\.com\/baidu\/amis[^)]*\)/g, `$1`)
    .replace(/https?:\/\/github\.com\/baidu\/amis[^\s)]*/g, VAMIS_GITHUB)
}

export function rewriteProse(md) {
  return String(md || '')
    .replace(/^>\s*\d+\.\d+(?:\.\d+)?\s*及以上版本\s*$/gm, '')
    .replace(/`?\d+\.\d+(?:\.\d+)?`?\s*版本后/g, '现已')
    .replace(/`?\d+\.\d+(?:\.\d+)?`?\s*后支持/g, '支持')
    .replace(/（\d+\.\d+(?:\.\d+)?\s*及以上）/g, '')
    .replace(/\d+\.\d+(?:\.\d+)?\s*及以下版本为/g, '否则为')
    .replace(/amis 会有/gi, 'Vamis 会有')
    .replace(/Amis 官网/g, 'Amis 文档')
    .replace(/\n{3,}/g, '\n\n')
}

export function rewriteAmisBody(md) {
  let body = stripFrontmatter(md)
  body = rewriteSchemaFences(body)
  body = mapOutsideFences(body, (text) => rewriteProse(rewriteLinks(dropVersionColumns(text))))
  return body.trim()
}

function escapeRe(text) {
  return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function extractH2(md, title) {
  const parts = String(md || '').split(/(?=^## )/m)
  const hit = parts.find((part) => {
    const line = part.split('\n', 1)[0] || ''
    return new RegExp(`^##\\s+${escapeRe(title)}\\s*$`).test(line.trim())
  })
  return hit ? hit.trim() : ''
}

export function hasH2(md, title) {
  return new RegExp(`^##\\s+${escapeRe(title)}\\s*$`, 'm').test(String(md || ''))
}

export function insertBeforeDiff(md, section) {
  if (!section) return md
  const text = String(md || '').replace(/\s+$/, '')
  const block = `\n\n${section.trim()}\n`
  const marker = /^## 和 Amis 文档的差异\s*$/m
  if (marker.test(text)) return text.replace(marker, `${block}\n## 和 Amis 文档的差异`)
  return `${text}${block}`
}

export function replaceH2(md, title, section) {
  if (!section) return String(md || '')
  const parts = String(md || '').split(/(?=^## )/m)
  let found = false
  const next = parts.map((part) => {
    const line = (part.split('\n', 1)[0] || '').trim()
    if (new RegExp(`^##\\s+${escapeRe(title)}\\s*$`).test(line)) {
      found = true
      return `${section.trim()}\n\n`
    }
    return part
  })
  if (found) return next.join('').replace(/\n{3,}/g, '\n\n')
  return insertBeforeDiff(md, section)
}

export function diffSection(reason) {
  const extra = reason
    ? `- 当前实现：${reason}。属性 / 事件 / 动作表按 Amis 6.13.0 主路径列出，运行时尚未接上的字段预览可能无对应行为。`
    : '- 属性 / 事件 / 动作表按 Amis 6.13.0 主路径列出；运行时尚未接上的字段预览可能无对应行为。'
  return `## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（\`yes\` / \`On\` / \`012\` 当字符串）。
- 可包在 IR 信封 \`apiVersion: lcdp.ir/v1\` + \`kind: UiPage\` 里，\`spec\` 仍是这棵 widget 树。
${extra}
`
}

export function progressBanner(status, progress, reason) {
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
  return `::: ${callout} 实现进度 ${progress} · ${status}
${reason}
:::`
}

export function resolveAmisDoc(amisDocsDir, link, type) {
  const mapped = AMIS_REL_BY_LINK[link]
  const rel = mapped || `${String(link || '').replace(/^\/components\/?/, '').replace(/\/$/, '/index')}.md`
  const candidates = [rel]
  if (type && type !== rel.replace(/\.md$/, '').split('/').pop()) {
    const dir = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/') + 1) : ''
    candidates.push(`${dir}${type}.md`)
  }
  return candidates
}

export function buildSyncedPage({ title, group, type, status, progress, reason, amisMd }) {
  const body = rewriteAmisBody(amisMd)
  const intro = `\`${type}\` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 \`cxd-\` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **${group}**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。
`
  return `---
title: ${title}
outline: deep
---

# ${title}

${progressBanner(status, progress, reason)}

${intro}
${body}

${diffSection(reason)}`
}
