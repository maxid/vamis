import type { RendererConfig } from './types'

const renderers: RendererConfig[] = []
const byType = new Map<string, RendererConfig>()

export function registerRenderer(config: RendererConfig): RendererConfig {
  const type = config.type.toLowerCase()
  const renderer: RendererConfig = { ...config, type }
  const exists = byType.get(type)
  if (exists) {
    Object.assign(exists, renderer)
    return exists
  }
  renderers.push(renderer)
  byType.set(type, renderer)
  for (const alias of renderer.alias || []) {
    byType.set(alias.toLowerCase(), { ...renderer, type: alias.toLowerCase() })
  }
  return renderer
}

export function unRegisterRenderer(type: string) {
  const key = type.toLowerCase()
  const renderer = byType.get(key)
  if (!renderer) return
  byType.delete(key)
  const idx = renderers.findIndex((item) => item.type === renderer.type)
  if (idx >= 0) renderers.splice(idx, 1)
}

export function resolveRenderer(type?: string): RendererConfig | null {
  if (!type || typeof type !== 'string') return null
  return byType.get(type.toLowerCase()) || null
}

export function getRenderers(): RendererConfig[] {
  return renderers.slice()
}

export function hasRenderer(type: string): boolean {
  return byType.has(type.toLowerCase())
}
