import { computed, inject, provide, unref, type ComputedRef, type InjectionKey, type MaybeRef, type Ref } from 'vue'
import type { Scope } from './scope'
import type { PlainObject, RendererEnv, SchemaCollection, SchemaNode } from './types'

export const EnvKey: InjectionKey<RendererEnv> = Symbol('vamis-env')
export const DataKey: InjectionKey<ComputedRef<PlainObject> | Ref<PlainObject>> =
  Symbol('vamis-data')
export const ScopeKey: InjectionKey<MaybeRef<Scope | undefined>> = Symbol('vamis-scope')
export const PathKey: InjectionKey<string> = Symbol('vamis-path')
export const ParentStoreIdKey: InjectionKey<string> = Symbol('vamis-parent-store')

export function provideEnv(env: RendererEnv) {
  provide(EnvKey, env)
}

export function useEnv(): RendererEnv {
  const env = inject(EnvKey, null)
  if (!env) throw new Error('Vamis env is missing. Wrap with VamisRoot.')
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

export function provideScope(scope: MaybeRef<Scope | undefined>) {
  provide(ScopeKey, scope)
}

export function useScope(): ComputedRef<Scope | undefined> {
  const scope = inject(ScopeKey, undefined)
  return computed(() => unref(scope))
}

export function asArray(node?: SchemaCollection | null): SchemaNode[] {
  if (node == null) return []
  return Array.isArray(node) ? node : [node]
}

export function createObject(superData: PlainObject = {}, extra: PlainObject = {}): PlainObject {
  return Object.assign(Object.create(superData), extra)
}
