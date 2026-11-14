import { inject, provide, type ComputedRef, type InjectionKey } from 'vue'

export type CardsSelectApi = {
  selectable: ComputedRef<boolean>
  checkOnItemClick: ComputedRef<boolean>
  hideCheckToggler: ComputedRef<boolean>
  multiple: ComputedRef<boolean>
  dragging: ComputedRef<boolean>
  isSelected: (row: Record<string, any>) => boolean
  isModified?: (row: Record<string, any>) => boolean
  toggle: (row: Record<string, any>, checked?: boolean) => void | Promise<void>
  onItemClick?: (row: Record<string, any>, event: MouseEvent) => void | Promise<void>
}

export const CardsSelectKey: InjectionKey<CardsSelectApi> = Symbol('vamis-cards-select')

export function useCardsSelect(): CardsSelectApi | undefined {
  return inject(CardsSelectKey, undefined)
}

export function provideCardsSelect(api: CardsSelectApi) {
  provide(CardsSelectKey, api)
  return api
}
