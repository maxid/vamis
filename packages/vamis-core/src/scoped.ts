import { inject, provide, type InjectionKey } from 'vue'
import type { PlainObject } from './types'
import { filterTpl } from './formula'
import { dataMapping } from './utils/data-mapping'

export interface ScopedComponent {
  name?: string
  reload?: (extra?: PlainObject, replace?: boolean) => Promise<void> | void
  getData?: () => PlainObject
  setData?: (values: PlainObject, replace?: boolean) => void
  submit?: () => Promise<void> | void
  doAction?: (actions: unknown, ctx?: PlainObject) => Promise<void> | void
}

export type ResolvedTarget = {
  name: string
  extra?: PlainObject
}

/** 逗号分割目标，不切开 `${}` 里的逗号。 */
export function splitTarget(target: string): string[] {
  const parts: string[] = []
  let buf = ''
  let depth = 0
  for (let i = 0; i < target.length; i++) {
    const ch = target[i]
    if (ch === '{') depth += 1
    else if (ch === '}') depth = Math.max(0, depth - 1)
    if (ch === ',' && depth === 0) {
      const piece = buf.trim()
      if (piece) parts.push(piece)
      buf = ''
      continue
    }
    buf += ch
  }
  const last = buf.trim()
  if (last) parts.push(last)
  return parts.length ? parts : target.trim() ? [target.trim()] : []
}

function parseQueryString(query: string): PlainObject {
  const out: PlainObject = {}
  if (!query) return out
  for (const pair of query.split('&')) {
    if (!pair) continue
    const eq = pair.indexOf('=')
    if (eq < 0) {
      out[pair] = true
      continue
    }
    out[pair.slice(0, eq)] = pair.slice(eq + 1)
  }
  return out
}

/** 只展开 `?` 前面的名字；query 留给 dataMapping 保类型。 */
export function filterTarget(target: string, data: PlainObject = {}): string {
  const idx = target.indexOf('?')
  if (idx >= 0) return filterTpl(target.slice(0, idx), data) + target.slice(idx)
  return filterTpl(target, data)
}

/** D5：动态名 / 多目标 / `name?a=${a}` 数据携带。 */
export function resolveTargets(target: unknown, data: PlainObject = {}): ResolvedTarget[] {
  if (target == null || target === '') return []
  const raw = Array.isArray(target) ? target.map(String).join(',') : String(target)
  return splitTarget(raw).flatMap((part) => {
    const filtered = filterTarget(part.trim(), data)
    const q = filtered.indexOf('?')
    const name = (q >= 0 ? filtered.slice(0, q) : filtered).trim()
    if (!name) return []
    if (q < 0) return [{ name }]
    const mapped = dataMapping(parseQueryString(filtered.slice(q + 1)), data)
    const extra = mapped && typeof mapped === 'object' && !Array.isArray(mapped) ? (mapped as PlainObject) : undefined
    return extra && Object.keys(extra).length ? [{ name, extra }] : [{ name }]
  })
}

export class ScopedContext {
  parent?: ScopedContext
  components: ScopedComponent[] = []

  constructor(parent?: ScopedContext) {
    this.parent = parent
  }

  register(component: ScopedComponent) {
    if (!this.components.includes(component)) this.components.push(component)
  }

  unregister(component: ScopedComponent) {
    this.components = this.components.filter((item) => item !== component)
  }

  getComponentByName(name: string): ScopedComponent | undefined {
    const local = this.components.find((item) => item.name === name)
    if (local) return local
    return this.parent?.getComponentByName(name)
  }

  async reload(target?: string, extra?: PlainObject, replace = false, data?: PlainObject) {
    if (!target) {
      await Promise.all(this.components.map((item) => item.reload?.(extra, replace)))
      return
    }
    const ctx = data || extra || {}
    for (const item of resolveTargets(target, ctx)) {
      const payload = item.extra ? { ...(extra || {}), ...item.extra } : extra
      const component = this.getComponentByName(item.name)
      await component?.reload?.(payload, replace)
    }
  }
}

export const ScopedKey: InjectionKey<ScopedContext> = Symbol('vamis-scoped')

export function provideScoped(parent?: ScopedContext) {
  const scoped = new ScopedContext(parent)
  provide(ScopedKey, scoped)
  return scoped
}

export function useScoped(): ScopedContext | undefined {
  return inject(ScopedKey, undefined)
}
