import { inject, provide, type InjectionKey } from 'vue'
import type { PlainObject } from './types'

export interface ScopedComponent {
  name?: string
  reload?: (extra?: PlainObject, replace?: boolean) => Promise<void> | void
  getData?: () => PlainObject
  setData?: (values: PlainObject, replace?: boolean) => void
  submit?: () => Promise<void> | void
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

  async reload(name?: string, extra?: PlainObject, replace = false) {
    if (!name) {
      await Promise.all(this.components.map((item) => item.reload?.(extra, replace)))
      return
    }
    const target = this.getComponentByName(name)
    await target?.reload?.(extra, replace)
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
