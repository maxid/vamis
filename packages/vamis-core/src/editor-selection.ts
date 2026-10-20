import { inject, provide, type InjectionKey, type Ref } from 'vue'

export const EDITOR_PATH_MIME = 'application/x-vamis-tree-path'

export interface EditorSelection {
  selectedPath: Ref<string>
  dropPath?: Ref<string>
  select: (path: string) => void
  enabled: boolean
}

export const EditorSelectionKey: InjectionKey<EditorSelection> = Symbol('vamis-editor-selection')

export function provideEditorSelection(api: EditorSelection) {
  provide(EditorSelectionKey, api)
}

export function useEditorSelection(): EditorSelection | undefined {
  return inject(EditorSelectionKey, undefined)
}
