/** Spinner 父子 loading 互斥。对齐 Amis `SpinnerSharedStore`：祖先在转时子级不画。 */

export type SpinnerParent = { contains(other: SpinnerParent): boolean }

const spinningParents = new Set<SpinnerParent>()
const listeners = new Set<() => void>()

function notify() {
  for (const fn of listeners) fn()
}

export function spinnerPushParent(el: SpinnerParent | null | undefined) {
  if (!el || spinningParents.has(el)) return
  spinningParents.add(el)
  notify()
}

export function spinnerRemoveParent(el: SpinnerParent | null | undefined) {
  if (!el || !spinningParents.has(el)) return
  spinningParents.delete(el)
  notify()
}

/** 当前容器可以进入 loading：自己在集合里，且没有祖先也在转。 */
export function spinnerCheckLoading(el: SpinnerParent | null | undefined): boolean {
  if (!el || !spinningParents.has(el)) return false
  for (const container of spinningParents) {
    if (container !== el && container.contains(el)) return false
  }
  return true
}

export function subscribeSpinnerParents(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function resetSpinnerParents() {
  spinningParents.clear()
}
