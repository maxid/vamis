import { computed, inject, provide, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import type { PlainObject, RendererEnv, SchemaCollection, SchemaNode } from './types'

export const EnvKey: InjectionKey<RendererEnv> = Symbol('varmis-env')
export const DataKey: InjectionKey<ComputedRef<PlainObject> | Ref<PlainObject>> =
  Symbol('varmis-data')
export const PathKey: InjectionKey<string> = Symbol('varmis-path')
export const ParentStoreIdKey: InjectionKey<string> = Symbol('varmis-parent-store')

export function provideEnv(env: RendererEnv) {
  provide(EnvKey, env)
}

export function useEnv(): RendererEnv {
  const env = inject(EnvKey, null)
  if (!env) throw new Error('Varmis env is missing. Wrap with VarmisRoot.')
  return env
}

export function provideData(data: ComputedRef<PlainObject> | Ref<PlainObject>) {
  provide(DataKey, data)
}

export function useData(): ComputedRef<PlainObject> {
  const data = inject(DataKey, null)
  if (!data) {
    return computed(() => ({}))
  }
  return computed(() => data.value)
}

export function asArray(node?: SchemaCollection | null): SchemaNode[] {
  if (node == null) return []
  return Array.isArray(node) ? node : [node]
}

export function createObject(superData: PlainObject = {}, extra: PlainObject = {}): PlainObject {
  return Object.assign(Object.create(superData), extra)
}
