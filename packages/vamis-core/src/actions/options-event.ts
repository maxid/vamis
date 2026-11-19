import type { FormApiLike } from '../form-api'
import type { OverlayApi } from '../overlay'
import type { Scope } from '../scope'
import type { ScopedContext } from '../scoped'
import type { PlainObject, RendererEnv, SchemaObject } from '../types'
import { optionsEventPayload } from '../utils/options'
import type { OptionItem } from '../utils/options'
import { createVamisEvent, eventEvalData } from './event'
import { runOnEvent } from './run'

export type OptionConfirmEventName = 'addConfirm' | 'editConfirm' | 'deleteConfirm'

export interface OptionConfirmContext {
  schema: SchemaObject
  eventName: OptionConfirmEventName
  data: PlainObject
  value: unknown
  options: OptionItem[]
  item: OptionItem
  env: RendererEnv
  scoped?: ScopedContext
  overlay?: OverlayApi
  form?: FormApiLike
  scope?: Scope
}

/** 返回 true 表示继续 CUD；false 表示事件已阻止。 */
export async function runOptionConfirm(ctx: OptionConfirmContext): Promise<boolean> {
  const payload = optionsEventPayload({
    data: ctx.data,
    name: ctx.schema.name ? String(ctx.schema.name) : '',
    value: ctx.value,
    options: ctx.options,
    item: ctx.item,
  })
  const event = createVamisEvent(ctx.eventName, payload)
  await runOnEvent(ctx.schema, ctx.eventName, {
    env: ctx.env,
    data: eventEvalData(payload, event),
    scoped: ctx.scoped,
    overlay: ctx.overlay,
    form: ctx.form,
    scope: ctx.scope,
    event,
  })
  return !event.prevented
}
