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

/**
 * 脱离表单的表单项把值写到哪。对齐 Amis：`wrapControl` 没有 `formStore` 时把变化交给最近的 `onChange`，
 * `TableRow` 写回行数据，`Page` / `Service` 这类有自己数据域的渲染器写进本层数据域。
 * 取值不走这里：行记录、本层数据域都已经在 `useData()` 里。
 */
export interface ValueHost {
  setValue: (name: string, value: unknown) => void
}

export const ValueHostKey: InjectionKey<ValueHost> = Symbol('vamis-value-host')

export function provideValueHost(host: ValueHost) {
  provide(ValueHostKey, host)
}

export function useValueHost(): ValueHost | undefined {
  return inject(ValueHostKey, undefined)
}

export function asArray(node?: SchemaCollection | null): SchemaNode[] {
  if (node == null) return []
  return Array.isArray(node) ? node : [node]
}

export function createObject(superData: PlainObject = {}, extra: PlainObject = {}): PlainObject {
  return Object.assign(Object.create(superData), extra)
}
