import { inject, provide, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import type { SchemaNode } from '@vamis/core'

export type CollapseGroupApi = {
  grouped: true
  accordion: ComputedRef<boolean>
  activeKeys: Ref<string[]>
  expandIcon: ComputedRef<SchemaNode | undefined>
  expandIconPosition: ComputedRef<'left' | 'right'>
  enableFieldSetStyle: ComputedRef<boolean>
  isCollapsed: (key: string) => boolean
  toggle: (key: string) => Promise<void>
}

export const CollapseGroupKey: InjectionKey<CollapseGroupApi> = Symbol('vamis-collapse-group')

export function provideCollapseGroup(api: CollapseGroupApi) {
  provide(CollapseGroupKey, api)
}

export function useCollapseGroup(): CollapseGroupApi | undefined {
  return inject(CollapseGroupKey, undefined)
}
