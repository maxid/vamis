/** 组件 TODO「依赖与优先级」：分类表 P 列是项目阶段（全表仍 P0）；侧栏 P0/P1/P2 来自速览四段。 */

const ALIASES: Record<string, string[]> = {
  'office-viewer': ['office-viewer-excel'],
}

export type PriorityRange = { min: number; max: number }

export type PriorityStage = 0 | 1 | 2

export type SidebarQuery = {
  text: string
  /** 侧栏档 P0/P1/P2 */
  stage?: PriorityRange
  /** 全量顺序 `#N`，仍可筛 */
  rank?: PriorityRange
}

/** 解锁主干 #1–#10 → P0；主路径容器 #11–#65 → P1；零被依赖 + app → P2。 */
export const STAGE_RANK_MAX: readonly [number, number] = [10, 65]

export const STAGE_HINT: Record<PriorityStage, string> = {
  0: '解锁主干',
  1: '主路径容器',
  2: '零被依赖',
}

export function parsePriorityTable(raw: string): Map<string, number> {
  const map = new Map<string, number>()
  const start = raw.indexOf('### 全量顺序')
  const body = start < 0 ? raw : raw.slice(start)
  const end = body.search(/\n## /)
  const section = end < 0 ? body : body.slice(0, end)
  for (const line of section.split('\n')) {
    const m = line.match(/^\| (\d+) \| (.+?) \|/)
    if (!m) continue
    if (!/进行中|已完成|未开始/.test(line)) continue
    const rank = Number.parseInt(m[1], 10)
    if (!Number.isFinite(rank)) continue
    for (const key of typeKeys(m[2])) {
      if (!map.has(key)) map.set(key, rank)
    }
  }
  return map
}

function typeKeys(cell: string): string[] {
  const stripped = cell.replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '')
  const keys = stripped
    .split('/')
    .map((part) => part.replace(/`/g, '').trim().toLowerCase())
    .filter(Boolean)
  const extra: string[] = []
  for (const key of keys) {
    const aliases = ALIASES[key]
    if (aliases) extra.push(...aliases)
  }
  return [...keys, ...extra]
}

export function lookupPriority(table: Map<string, number>, type: string | undefined): number | undefined {
  if (!type) return undefined
  return table.get(type.trim().toLowerCase())
}

export function stageFromRank(rank: number): PriorityStage {
  if (rank <= STAGE_RANK_MAX[0]) return 0
  if (rank <= STAGE_RANK_MAX[1]) return 1
  return 2
}

export function formatStage(stage: number): string {
  return `P${stage}`
}

export function stageTitle(stage: number, rank?: number, group = false): string {
  const hint = STAGE_HINT[stage as PriorityStage] ?? '零被依赖'
  const prefix = group ? '本组最高 ' : ''
  return rank != null
    ? `${prefix}${formatStage(stage)} ${hint} · #${rank}`
    : `${prefix}${formatStage(stage)} ${hint}`
}

export function typeFromNavItem(item: { type?: string; link: string }): string | undefined {
  if (item.type) return item.type
  const path = (item.link.split(/[?#]/)[0] || '').replace(/\/+$/, '') || '/'
  const seg = path.split('/').filter(Boolean).pop()
  return seg === 'components' ? undefined : seg
}

export function minPriority(values: Array<number | undefined>): number | undefined {
  const nums = values.filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
  if (!nums.length) return undefined
  return Math.min(...nums)
}

const STAGE_TOKEN = /\bP\s*([012])(?:\s*[–\-]\s*P?\s*([012]))?/gi
const RANK_TOKEN = /#\s*(<=|>=|<|>)?\s*(\d+)(?:\s*[–\-]\s*#?\s*(\d+))?/g

export function parseSidebarFilter(raw: string): SidebarQuery {
  const source = raw.trim()
  if (!source) return { text: '' }
  let stage: PriorityRange | undefined
  let rank: PriorityRange | undefined
  const text = source
    .replace(STAGE_TOKEN, (_, a: string, b: string | undefined) => {
      const left = Number.parseInt(a, 10)
      if (!Number.isFinite(left)) return ''
      if (b) {
        const right = Number.parseInt(b, 10)
        if (!Number.isFinite(right)) return ''
        stage = { min: Math.min(left, right), max: Math.max(left, right) }
      } else {
        stage = { min: left, max: left }
      }
      return ' '
    })
    .replace(RANK_TOKEN, (_, op: string | undefined, a: string, b: string | undefined) => {
      const left = Number.parseInt(a, 10)
      if (!Number.isFinite(left)) return ''
      if (b) {
        const right = Number.parseInt(b, 10)
        if (!Number.isFinite(right)) return ''
        rank = { min: Math.min(left, right), max: Math.max(left, right) }
      } else if (op === '<') rank = { min: 1, max: left - 1 }
      else if (op === '<=') rank = { min: 1, max: left }
      else if (op === '>') rank = { min: left + 1, max: Number.POSITIVE_INFINITY }
      else if (op === '>=') rank = { min: left, max: Number.POSITIVE_INFINITY }
      else rank = { min: left, max: left }
      return ' '
    })
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
  return { text, ...(stage ? { stage } : {}), ...(rank ? { rank } : {}) }
}

export function matchesRange(value: number | undefined, range?: PriorityRange): boolean {
  if (!range) return true
  if (value == null) return false
  return value >= range.min && value <= range.max
}
