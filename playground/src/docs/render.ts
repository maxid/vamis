import MarkdownIt from 'markdown-it'
import { playgroundHref, withBase } from './pages'
import { parseSchemaFenceMeta } from './schema-scope'

export type TocItem = {
  id: string
  text: string
  level: number
}

export type DocBlock =
  | { kind: 'html'; html: string }
  | { kind: 'schema'; yaml: string; scope?: string; height?: number }
  | { kind: 'code'; language: string; value: string }

type TocState = {
  items: TocItem[]
  seen: Map<string, number>
}

const tocState: TocState = { items: [], seen: new Map() }

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false,
})

md.core.ruler.after('inline', 'vamis-heading-anchors', (state) => {
  const tokens = state.tokens
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type !== 'heading_open') continue
    const level = Number(token.tag.slice(1))
    if (level < 2 || level > 4) continue
    const inline = tokens[i + 1]
    if (!inline || inline.type !== 'inline') continue
    const text = headingText(inline).trim()
    if (!text) continue
    const id = uniqueHeadingId(text, tocState.seen)
    token.attrSet('id', id)
    tocState.items.push({ id, text, level })
  }
})

/** Align Amis md-parser: keep CJK / word chars, turn the rest into `-`. */
export function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5_a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function headingText(inline: { children: { type: string; content: string }[] | null; content: string }): string {
  if (!inline.children?.length) return inline.content
  return inline.children
    .filter((child) => child.type === 'text' || child.type === 'code_inline')
    .map((child) => child.content)
    .join('')
}

function uniqueHeadingId(text: string, seen: Map<string, number>): string {
  const base = slugifyHeading(text) || 'section'
  const count = (seen.get(base) ?? 0) + 1
  seen.set(base, count)
  return count === 1 ? base : `${base}-${count}`
}

function resetToc() {
  tocState.items = []
  tocState.seen = new Map()
}

export function parseFrontmatter(raw: string): { title: string; body: string } {
  let title = ''
  let body = raw
  if (raw.startsWith('---')) {
    const end = raw.indexOf('\n---', 3)
    if (end >= 0) {
      const head = raw.slice(3, end)
      const m = head.match(/^title:\s*(.+)$/m)
      if (m) title = m[1].trim()
      body = raw.slice(end + 4).replace(/^\s+/, '')
    }
  }
  const h1 = body.match(/^#\s+(.+)$/m)
  if (!title && h1) title = h1[1]
  return { title, body }
}

function rewriteHtml(html: string): string {
  return html
    .replace(/href="([^"]+)"/g, (_all, href: string) => `href="${playgroundHref(href)}"`)
    .replace(/src="([^"]+)"/g, (_all, src: string) => `src="${withBase(src)}"`)
}

function calloutHtml(level: string, title: string, body: string): string {
  const inner = rewriteHtml(md.render(body.trim() || title))
  const heading = body.trim() ? title : ''
  return `<div class="doc-callout doc-callout--${level}">${
    heading ? `<p class="doc-callout__title">${heading}</p>` : ''
  }${inner}</div>`
}

export function parseDoc(raw: string): { title: string; blocks: DocBlock[]; toc: TocItem[] } {
  const { title, body } = parseFrontmatter(raw)
  resetToc()
  const blocks: DocBlock[] = []
  const tokenRe =
    /^```schema([^\n]*)\n([\s\S]*?)^```|^```([^\n]*)\n([\s\S]*?)^```|::: ?(info|tip|warning|danger)[^\n]*\n([\s\S]*?):::/gm
  let last = 0
  let match: RegExpExecArray | null
  while ((match = tokenRe.exec(body))) {
    const before = body.slice(last, match.index)
    if (before.trim()) blocks.push({ kind: 'html', html: rewriteHtml(md.render(before)) })
    if (match[0].startsWith('```schema')) {
      const meta = parseSchemaFenceMeta(match[1] || '')
      blocks.push({
        kind: 'schema',
        yaml: (match[2] || '').trim(),
        scope: meta.scope,
        height: meta.height,
      })
    } else if (match[0].startsWith('```')) {
      const language = (match[3] || '').trim().split(/\s+/, 1)[0] || 'plaintext'
      blocks.push({ kind: 'code', language, value: match[4] ?? '' })
    } else {
      const fence = match[0]
      const firstLine = fence.split('\n', 1)[0].replace(/^:::\s*/, '').trim()
      const [level, ...rest] = firstLine.split(/\s+/)
      blocks.push({
        kind: 'html',
        html: calloutHtml(level || 'info', rest.join(' '), match[6] || ''),
      })
    }
    last = match.index + match[0].length
  }
  const tail = body.slice(last)
  if (tail.trim()) blocks.push({ kind: 'html', html: rewriteHtml(md.render(tail)) })
  return { title, blocks, toc: tocState.items }
}
