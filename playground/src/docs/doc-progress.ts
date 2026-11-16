/** 文档页 banner `::: <callout> 实现进度 N% · 状态`。目录页没有这条。 */

const BANNER_RE = /^::: (?:tip|info|warning|danger) 实现进度 (\d+)\s*%/m

export type ProgressTone = 'success' | 'info' | 'warning' | 'danger'

export function parseDocProgress(raw: string): number | undefined {
  const match = BANNER_RE.exec(raw)
  if (!match) return undefined
  const n = Number.parseInt(match[1], 10)
  return Number.isFinite(n) ? n : undefined
}

/** 对齐进度档位：100% 成功、≥80 接近标准、≥40 主路径、其余占位/精简。 */
export function progressTone(percent: number): ProgressTone {
  if (percent >= 100) return 'success'
  if (percent >= 80) return 'info'
  if (percent >= 40) return 'warning'
  return 'danger'
}

/** `website/src` 相对路径 → 侧栏可能用到的 playground 路径。 */
export function mdRelToPaths(rel: string): string[] {
  let path = rel.replace(/\.md$/, '')
  if (path.endsWith('/index')) path = path.slice(0, -'/index'.length) || '/'
  if (path === '/index' || path === '') path = '/'
  const paths = new Set<string>([path])
  if (path === '/') {
    paths.add('/docs')
    paths.add('/index')
  } else if (!path.startsWith('/components') && !path.startsWith('/style') && !path.startsWith('/docs')) {
    paths.add(`/docs${path}`)
  }
  return [...paths]
}

export function averageProgress(values: Array<number | undefined>): number | undefined {
  const nums = values.filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
  if (!nums.length) return undefined
  return Math.round(nums.reduce((sum, n) => sum + n, 0) / nums.length)
}
