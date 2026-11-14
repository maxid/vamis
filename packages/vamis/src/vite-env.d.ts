/// <reference types="vite/client" />

declare module 'sortablejs' {
  export interface SortableEvent {
    item: HTMLElement
    to: HTMLElement
    oldIndex?: number
    newIndex?: number
  }
  export interface SortableOptions {
    animation?: number
    draggable?: string
    handle?: string
    ghostClass?: string
    filter?: string
    preventOnFilter?: boolean
    onEnd?: (event: SortableEvent) => void
  }
  export default class Sortable {
    constructor(el: HTMLElement, options?: SortableOptions)
    destroy(): void
  }
}
