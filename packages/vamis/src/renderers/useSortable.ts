import { watchEffect } from 'vue'
import Sortable, {
  type SortableEvent,
  type SortableOptions,
} from 'sortablejs'

export interface UseSortableDragOptions {
  target: () => HTMLElement | null | undefined
  enabled?: () => boolean
  deps?: () => readonly unknown[]
  options: () => SortableOptions
}

/**
 * SortableJS mutates the DOM outside Vue. Restore that mutation before the
 * reactive list updates, and return the indexes the caller should reorder.
 */
export function consumeSortableDrag(
  event: SortableEvent,
): { from: number; to: number } | null {
  const { oldIndex, newIndex, item, to } = event
  if (
    oldIndex == null ||
    newIndex == null ||
    oldIndex === newIndex ||
    !Number.isInteger(oldIndex) ||
    !Number.isInteger(newIndex)
  ) {
    return null
  }

  if (oldIndex < to.childNodes.length - 1) {
    to.insertBefore(
      item,
      to.childNodes[oldIndex > newIndex ? oldIndex + 1 : oldIndex],
    )
  } else {
    to.appendChild(item)
  }

  return { from: oldIndex, to: newIndex }
}

/**
 * Own one Sortable instance for a renderer scope. Recreate it when its target,
 * enabled state, or explicit dependencies change, and always destroy it with
 * the component.
 */
export function useSortableDrag(config: UseSortableDragOptions): void {
  watchEffect(
    (onCleanup) => {
      const target = config.target()
      if (!target || config.enabled?.() === false) return
      config.deps?.()
      const sortable = new Sortable(target, config.options())
      onCleanup(() => sortable.destroy())
    },
    { flush: 'post' },
  )
}
