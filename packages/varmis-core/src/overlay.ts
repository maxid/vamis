import { inject, provide, reactive, type InjectionKey } from 'vue'
import type { PlainObject, SchemaObject } from './types'

export interface OverlayState {
  dialog: SchemaObject | null
  drawer: SchemaObject | null
  data: PlainObject
}

export interface OverlayApi {
  state: OverlayState
  openDialog: (schema: SchemaObject, data?: PlainObject) => void
  openDrawer: (schema: SchemaObject, data?: PlainObject) => void
  closeDialog: () => void
  closeDrawer: () => void
  close: () => void
}

export const OverlayKey: InjectionKey<OverlayApi> = Symbol('varmis-overlay')

export function provideOverlay(): OverlayApi {
  const state = reactive<OverlayState>({
    dialog: null,
    drawer: null,
    data: {},
  })
  const api: OverlayApi = {
    state,
    openDialog(schema, data = {}) {
      state.dialog = schema
      state.data = data
    },
    openDrawer(schema, data = {}) {
      state.drawer = schema
      state.data = data
    },
    closeDialog() {
      state.dialog = null
    },
    closeDrawer() {
      state.drawer = null
    },
    close() {
      state.dialog = null
      state.drawer = null
      state.data = {}
    },
  }
  provide(OverlayKey, api)
  return api
}

export function useOverlay(): OverlayApi | undefined {
  return inject(OverlayKey, undefined)
}
