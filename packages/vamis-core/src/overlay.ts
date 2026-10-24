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

export const OverlayKey: InjectionKey<OverlayApi> = Symbol('vamis-overlay')

export function createOverlay(): OverlayApi {
  const dialogs: SchemaObject[] = []
  const drawers: SchemaObject[] = []
  const state = reactive<OverlayState>({
    dialog: null,
    drawer: null,
    data: {},
  })

  function sync() {
    state.dialog = dialogs.at(-1) ?? null
    state.drawer = drawers.at(-1) ?? null
  }

  return {
    state,
    openDialog(schema, data = {}) {
      dialogs.push(schema)
      state.data = { ...state.data, ...data }
      sync()
    },
    openDrawer(schema, data = {}) {
      drawers.push(schema)
      state.data = { ...state.data, ...data }
      sync()
    },
    closeDialog() {
      dialogs.pop()
      sync()
    },
    closeDrawer() {
      drawers.pop()
      sync()
    },
    close() {
      dialogs.length = 0
      drawers.length = 0
      state.data = {}
      sync()
    },
  }
}

export function provideOverlay(): OverlayApi {
  const api = createOverlay()
  provide(OverlayKey, api)
  return api
}

export function useOverlay(): OverlayApi | undefined {
  return inject(OverlayKey, undefined)
}
