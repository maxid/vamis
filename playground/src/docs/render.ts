import MarkdownIt from 'markdown-it'
import { playgroundHref } from './pages'
import { parseSchemaFenceMeta } from './schema-scope'

const md = new MarkdownIt({ html: true, linkify: true, breaks: false })

export type DocBlock =
  | { kind: 'html'; html: string }
  | { kind: 'schema'; yaml: string; scope?: string; height?: number }

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
  return html.replace(/href="([^"]+)"/g, (_all, href: string) => `href="${playgroundHref(href)}"`)
}

function calloutHtml(level: string, title: string, body: string): string {
  const inner = rewriteHtml(md.render(body.trim() || title))
  const heading = body.trim() ? title : ''
  return `<div class="doc-callout doc-callout--${level}">${
    heading ? `<p class="doc-callout__title">${heading}</p>` : ''
  }${inner}</div>`
}

export function parseDoc(raw: string): { title: string; blocks: DocBlock[] } {
  const { title, body } = parseFrontmatter(raw)
  const blocks: DocBlock[] = []
  const tokenRe =
    /^```schema([^\n]*)\n([\s\S]*?)^```|::: ?(info|tip|warning|danger)[^\n]*\n([\s\S]*?):::/gm
  let last = 0
  let match: RegExpExecArray | null
  while ((match = tokenRe.exec(body))) {
    const before = body.slice(last, match.index)
    if (before.trim()) blocks.push({ kind: 'html', html: rewriteHtml(md.render(before)) })
    if (match[2] != null) {
      const meta = parseSchemaFenceMeta(match[1] || '')
      blocks.push({
        kind: 'schema',
        yaml: match[2].trim(),
        scope: meta.scope,
        height: meta.height,
      })
    } else {
      const fence = match[0]
      const firstLine = fence.split('\n', 1)[0].replace(/^:::\s*/, '').trim()
      const [level, ...rest] = firstLine.split(/\s+/)
      blocks.push({
        kind: 'html',
        html: calloutHtml(level || 'info', rest.join(' '), match[4] || ''),
      })
    }
    last = match.index + match[0].length
  }
  const tail = body.slice(last)
  if (tail.trim()) blocks.push({ kind: 'html', html: rewriteHtml(md.render(tail)) })
  return { title, blocks }
}
