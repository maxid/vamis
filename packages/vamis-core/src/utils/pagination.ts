/** Pagination。对齐 Amis layout / mode / lastPage / maxButtons / 省略号跳页。 */

export type PaginationMode = 'normal' | 'simple'
export type PaginationSize = 'sm' | 'md'
export type PaginationWidget = 'pager' | 'perpage' | 'total' | 'go'

export type PaginationPagerItem =
  | { kind: 'prev'; disabled: boolean }
  | { kind: 'next'; disabled: boolean }
  | { kind: 'page'; page: number; active: boolean }
  | { kind: 'ellipsis'; dir: 'backward' | 'forward'; page: number }

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

export function paginationNum(value: unknown, fallback?: number): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const n = parseInt(value, 10)
    if (!Number.isNaN(n)) return n
  }
  return fallback
}

export function paginationMode(schema: unknown): PaginationMode {
  return asRecord(schema).mode === 'simple' ? 'simple' : 'normal'
}

export function paginationSize(schema: unknown): PaginationSize {
  return asRecord(schema).size === 'sm' ? 'sm' : 'md'
}

export function paginationActivePage(schema: unknown): number {
  const n = paginationNum(asRecord(schema).activePage, 1)
  return n != null && n > 0 ? n : 1
}

export function paginationPerPage(schema: unknown): number {
  const n = paginationNum(asRecord(schema).perPage, 10)
  return n != null && n > 0 ? n : 10
}

export function paginationLastPage(schema: unknown, perPage: number, activePage: number): number {
  const rec = asRecord(schema)
  const total = paginationNum(rec.total)
  if (total && perPage) return Math.ceil(total / perPage)
  const last = paginationNum(rec.lastPage)
  if (last) return last
  if (rec.hasNext) return Number(activePage) + 1
  return Number(activePage) || 1
}

export function paginationMaxButtons(schema: unknown): number {
  const n = paginationNum(asRecord(schema).maxButtons, 5)
  return n != null && n > 0 ? n : 5
}

export function paginationEllipsisGap(schema: unknown): number {
  const n = paginationNum(asRecord(schema).ellipsisPageGap, 5)
  return n != null && n >= 1 ? n : 5
}

export function paginationPerPageAvailable(schema: unknown): number[] {
  const raw = asRecord(schema).perPageAvailable
  const list = Array.isArray(raw) ? raw.map((item) => paginationNum(item)).filter((n): n is number => !!n) : []
  return list.length ? list : [10, 20, 50, 100]
}

export function paginationLayout(schema: unknown): PaginationWidget[] {
  const rec = asRecord(schema)
  const raw = rec.layout
  let list: string[] = Array.isArray(raw)
    ? raw.map((item) => String(item))
    : typeof raw === 'string'
      ? raw.split(',')
      : []
  list = list.map((item) => item.trim().toLowerCase()).filter(Boolean)
  if (!list.includes('pager')) list.unshift('pager')
  if (rec.showPageInput && !list.includes('go')) list.push('go')
  if (rec.showPerPage && !list.includes('perpage')) list.unshift('perpage')
  return list.filter((item): item is PaginationWidget => item === 'pager' || item === 'perpage' || item === 'total' || item === 'go')
}

function innerPages(cur: number, counts: number, min: number, max: number): number[] {
  const pages: number[] = []
  if (counts === 0) return pages
  let step = 0
  while (true) {
    if (pages.length >= counts) return pages
    if (cur - step < min && cur + step > max) return pages
    const left = cur - step
    if (pages.length < counts && left >= min) pages.unshift(left)
    const right = cur + step
    if (step !== 0 && pages.length < counts && right <= max) pages.push(right)
    step += 1
  }
}

function pageItems(pages: number[], activePage: number): PaginationPagerItem[] {
  return pages.map((page) => ({ kind: 'page', page, active: page === activePage }))
}

export function paginationPagerItems(opts: {
  activePage: number
  lastPage: number
  maxButtons: number
  ellipsisPageGap?: number
  hasNext?: boolean
}): PaginationPagerItem[] {
  const activePage = Math.max(1, opts.activePage || 1)
  const lastPage = Math.max(1, opts.lastPage || 1)
  const maxButtons = opts.maxButtons > 0 ? opts.maxButtons : 5
  const gap = opts.ellipsisPageGap != null && opts.ellipsisPageGap >= 1 ? opts.ellipsisPageGap : 5
  let pages: PaginationPagerItem[] = []

  if (lastPage <= maxButtons) {
    pages = pageItems(innerPages(activePage, maxButtons, 1, Math.min(maxButtons, lastPage)), activePage)
  } else if (activePage <= maxButtons - 3) {
    pages = pageItems(innerPages(activePage, maxButtons - 2, 1, Math.min(maxButtons - 2, lastPage)), activePage)
    pages.push({ kind: 'ellipsis', dir: 'forward', page: Math.min(lastPage, activePage + gap) })
    pages.push({ kind: 'page', page: lastPage, active: lastPage === activePage })
  } else if (activePage > lastPage - (maxButtons - 3)) {
    const min = lastPage - (maxButtons - 3)
    pages = pageItems(innerPages(activePage, maxButtons - 2, min, lastPage), activePage)
    pages.unshift({ kind: 'ellipsis', dir: 'backward', page: Math.max(1, activePage - gap) })
    pages.unshift({ kind: 'page', page: 1, active: activePage === 1 })
  } else {
    pages = pageItems(innerPages(activePage, maxButtons - 2, 3, lastPage - 3), activePage)
    pages.unshift({ kind: 'ellipsis', dir: 'backward', page: Math.max(1, activePage - gap) })
    pages.unshift({ kind: 'page', page: 1, active: activePage === 1 })
    pages.push({ kind: 'ellipsis', dir: 'forward', page: Math.min(lastPage, activePage + gap) })
    pages.push({ kind: 'page', page: lastPage, active: lastPage === activePage })
  }

  return [
    { kind: 'prev', disabled: activePage < 2 },
    ...pages,
    { kind: 'next', disabled: activePage >= lastPage && !opts.hasNext },
  ]
}

export function paginationTotalText(schema: unknown, lastPage: number): string | undefined {
  const rec = asRecord(schema)
  const total = paginationNum(rec.total)
  if (total != null && rec.total !== '' && rec.total !== false) {
    if (total || total === 0) return `共 ${total} 条`
  }
  const last = paginationNum(rec.lastPage)
  if (last) return `共 ${lastPage} 页`
  return undefined
}
