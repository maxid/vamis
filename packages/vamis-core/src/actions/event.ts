import type { PlainObject } from '../types'

export type NativeEventLike = {
  type: string
  target?: unknown
}

export interface VamisEvent {
  type: string
  data: PlainObject
  prevented: boolean
  stopped: boolean
  /** Amis 拼写兼容 */
  readonly stoped: boolean
  context: { nativeEvent?: { type: string; target?: { className: string } } }
  setData(patch: PlainObject): void
  preventDefault(): void
  stopPropagation(): void
}

function nativeEventTarget(target: NativeEventLike['target']): { className: string } {
  if (target && typeof target === 'object' && 'className' in target) {
    return { className: String((target as { className?: unknown }).className ?? '') }
  }
  return { className: '' }
}

export function createVamisEvent(
  type: string,
  payload: PlainObject = {},
  nativeEvent?: NativeEventLike,
): VamisEvent {
  const data: PlainObject = { ...payload }
  const event: VamisEvent = {
    type,
    data,
    prevented: false,
    stopped: false,
    get stoped() {
      return event.stopped
    },
    context: nativeEvent
      ? { nativeEvent: { type: nativeEvent.type, target: nativeEventTarget(nativeEvent.target) } }
      : {},
    setData(patch: PlainObject) {
      if (patch && typeof patch === 'object' && !Array.isArray(patch)) Object.assign(data, patch)
    },
    preventDefault() {
      event.prevented = true
    },
    stopPropagation() {
      event.stopped = true
    },
  }
  return event
}

/** 动作公式可读 `${event.data}` / `${__rendererData}`。 */
export function eventEvalData(scopeData: PlainObject, event: VamisEvent): PlainObject {
  const rest = { ...scopeData }
  delete rest.event
  return {
    ...rest,
    ...event.data,
    event,
    __rendererData: scopeData,
  }
}
