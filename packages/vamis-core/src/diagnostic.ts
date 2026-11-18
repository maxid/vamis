import type { RendererEnv } from './types'

export type VamisDiagnostic = {
  type: 'api' | 'expression' | 'renderer' | 'action'
  message: string
  path?: string
  detail?: unknown
  error?: unknown
}

export function isVamisDebugEnabled(env: RendererEnv): boolean {
  if (env.debug === true || env.enableVamisDebug === true) return true
  if (typeof window === 'undefined') return false
  if ((window as unknown as { enableVamisDebug?: boolean }).enableVamisDebug === true) return true
  return new URLSearchParams(window.location.search).get('vamisDebug') === '1'
}

export function reportDiagnostic(env: RendererEnv | undefined, diagnostic: VamisDiagnostic): void {
  if (!env) return
  env.onDiagnostic?.(diagnostic)
  if (!isVamisDebugEnabled(env) || typeof console === 'undefined') return
  console.groupCollapsed?.(`[vamis diagnostic] ${diagnostic.type}: ${diagnostic.message}`)
  console.debug('detail', diagnostic.detail)
  if (diagnostic.error !== undefined) console.debug('error', diagnostic.error)
  console.groupEnd?.()
}

