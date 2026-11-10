import { inject, provide, type InjectionKey } from 'vue'

/** Amis ListItem 把 hbox/grid 列交给 `itemRender` → `ListItem-field`（label + value）。 */
export const ListItemFieldKey: InjectionKey<boolean> = Symbol('vamis-list-item-field')

export function provideListItemField() {
  provide(ListItemFieldKey, true)
}

export function useListItemField() {
  return inject(ListItemFieldKey, false)
}
