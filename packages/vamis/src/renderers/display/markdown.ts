function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] || ch)
}

function safeHref(href: string) {
  if (/^(https?:|mailto:|\/|\.\/|\.\.\/|#)/i.test(href)) return href
  return '#'
}

function inline(text: string) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => `<a class="text-primary underline-offset-2 hover:underline" href="${escapeHtml(safeHref(href))}" target="_blank" rel="noreferrer">${label}</a>`)
}

export function renderMarkdown(source: string) {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (/^```/.test(line)) {
      const lang = escapeHtml(line.slice(3).trim())
      const buf: string[] = []
      i++
      while (i < lines.length && !/^```/.test(lines[i])) {
        buf.push(lines[i])
        i++
      }
      i++
      out.push(
        `<pre class="overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs"><code data-lang="${lang}">${escapeHtml(buf.join('\n'))}</code></pre>`,
      )
      continue
    }
    if (/^(\s*[-*]\s+)/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^(\s*[-*]\s+)/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\s*[-*]\s+/, ''))}</li>`)
        i++
      }
      out.push(`<ul class="list-disc space-y-1 pl-5">${items.join('')}</ul>`)
      continue
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`)
        i++
      }
      out.push(`<ol class="list-decimal space-y-1 pl-5">${items.join('')}</ol>`)
      continue
    }
    if (/^>\s?/.test(line)) {
      const buf: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      out.push(`<blockquote class="border-l-2 pl-3 text-muted-foreground">${inline(buf.join(' '))}</blockquote>`)
      continue
    }
    if (/^---+$/.test(line.trim())) {
      out.push('<hr class="my-3 border-border" />')
      i++
      continue
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      const level = heading[1].length
      const size = ['text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm', 'text-sm'][level - 1]
      out.push(`<h${level} class="${size} font-semibold tracking-tight">${inline(heading[2])}</h${level}>`)
      i++
      continue
    }
    if (!line.trim()) {
      i++
      continue
    }
    const buf: string[] = []
    while (i < lines.length && lines[i].trim() && !/^#{1,6}\s/.test(lines[i]) && !/^```/.test(lines[i]) && !/^>\s?/.test(lines[i]) && !/^(\s*[-*]\s+)/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i])) {
      buf.push(lines[i])
      i++
    }
    out.push(`<p class="leading-relaxed">${inline(buf.join(' '))}</p>`)
  }
  return out.join('\n')
}
