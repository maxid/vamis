/** Tpl / Html：行数截断与原生 title。对齐 Amis Tpl.tsx `maxLine` / `showNativeTitle`。 */

export function tplMaxLine(schema: { maxLine?: unknown } | null | undefined): number {
  const n = Number(schema?.maxLine)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

/** 去掉标签，给 `showNativeTitle` 当 DOM title。无 document 时用正则。 */
export function tplPlainText(html: string): string {
  const raw = String(html || '')
  if (!raw) return ''
  if (typeof document !== 'undefined') {
    const box = document.createElement('div')
    box.innerHTML = raw
    return (box.textContent || '').replace(/\s+/g, ' ').trim()
  }
  return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
