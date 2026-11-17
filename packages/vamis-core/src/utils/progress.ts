/** Progress 配色。对齐 Amis `amis-ui` `Progress.getColorArray` / `getLevelColor`。 */

export const PROGRESS_DEFAULT_MAP = ['bg-danger', 'bg-warning', 'bg-info', 'bg-success', 'bg-success'] as const

export type ProgressColorStop = { color: string; value: number }

export function isProgressBgClass(color: string): boolean {
  return /bg-/.test(color)
}

function asStops(map: unknown): ProgressColorStop[] {
  if (!Array.isArray(map) || map.length === 0) return []
  const span = 100 / map.length
  return map.map((item, index) => {
    if (typeof item === 'string') return { color: item, value: (index + 1) * span }
    if (item && typeof item === 'object') {
      const rec = item as Record<string, unknown>
      return { color: String(rec.color ?? ''), value: Number(rec.value) }
    }
    return { color: String(item), value: (index + 1) * span }
  })
}

/** 当前进度对应的 map 色。字符串 map 原样返回；空 map 是 `bg-primary`。 */
export function progressMapColor(map: unknown, value: number): string {
  if (typeof map === 'string' && map) return map
  const source = map == null ? PROGRESS_DEFAULT_MAP : map
  if (typeof source === 'string') return source || 'bg-primary'
  const stops = asStops(source)
  if (!stops.length) return 'bg-primary'
  const sorted = [...stops].sort((a, b) => a.value - b.value)
  const n = Number.isFinite(value) ? value : 0
  for (const stop of sorted) {
    if (stop.value >= n) return stop.color
  }
  return sorted[sorted.length - 1].color
}

const CIRCLE_STROKE: Record<string, string> = {
  'bg-danger': 'var(--destructive)',
  'bg-warning': 'var(--warning)',
  'bg-info': 'var(--info)',
  'bg-success': 'var(--success)',
  'bg-primary': 'var(--primary)',
}

/** 圆 / 仪表盘：`bg-*` 走主题 token（Amis `.bg-*-circle`），其它当 stroke 色。 */
export function progressCircleStroke(color: string): string {
  return CIRCLE_STROKE[color] || color
}
