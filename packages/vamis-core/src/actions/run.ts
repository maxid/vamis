import type { ActionSchema, PlainObject, RendererEnv, SchemaObject } from '../types'
import { apiMessage, requestApi } from '../utils/api'
import { evalExpression, filterTpl } from '../formula'
import { resolveTargets, type ScopedContext } from '../scoped'
import type { OverlayApi } from '../overlay'
import type { FormApiLike } from '../form-api'
import type { Scope } from '../scope'
import { createVamisEvent, eventEvalData, type VamisEvent } from './event'
import { getAction, registerAction } from './registry'

export type { VamisEvent } from './event'
export { createVamisEvent, eventEvalData } from './event'
export { registerAction, getAction, unregisterAction } from './registry'

export interface ActionContext {
  env: RendererEnv
  data: PlainObject
  scoped?: ScopedContext
  overlay?: OverlayApi
  form?: FormApiLike
  scope?: Scope
  event?: VamisEvent
}

function asActions(value: unknown): ActionSchema[] {
  if (!value) return []
  if (Array.isArray(value)) return value as ActionSchema[]
  if (typeof value === 'object' && Array.isArray((value as { actions?: ActionSchema[] }).actions)) {
    return (value as { actions: ActionSchema[] }).actions
  }
  return []
}

function actionData(action: ActionSchema, ctx: ActionContext): PlainObject {
  const extra = (action.data && typeof action.data === 'object' ? action.data : {}) as PlainObject
  const args = (action.args && typeof action.args === 'object' ? action.args : {}) as PlainObject
  return { ...ctx.data, ...extra, ...args }
}

function truthyFlag(value: unknown, data: PlainObject): boolean {
  if (value === true) return true
  if (value === false || value == null || value === '') return false
  if (typeof value === 'string') return evalExpression(value, data)
  return Boolean(value)
}

/** D4：`event` + `__rendererData`。无 native 时仍带空 context。 */
export function withNativeEvent(data: PlainObject, nativeEvent?: { type: string }): PlainObject {
  const event = createVamisEvent(nativeEvent?.type || '', data, nativeEvent)
  return eventEvalData(data, event)
}

export async function runOnEvent(
  schema: SchemaObject | undefined,
  eventName: string,
  ctx: ActionContext,
): Promise<void> {
  if (!schema?.onEvent) return
  const conf = schema.onEvent[eventName]
  await runActions(asActions(conf), ctx)
}

export async function runActions(actions: ActionSchema[] | undefined, ctx: ActionContext): Promise<void> {
  if (!actions?.length) return
  for (const action of actions) {
    if (ctx.event?.stopped) break
    await runAction(action, ctx)
  }
}

export async function runAction(action: ActionSchema, ctx: ActionContext): Promise<void> {
  const data = actionData(action, ctx)
  if (typeof action.expression === 'string' && !evalExpression(action.expression, data)) return
  if (action.confirmText && !(await ctx.env.confirm(filterTpl(action.confirmText, data)))) return

  const type =
    action.actionType || (action.type === 'submit' ? 'submit' : action.type === 'reset' ? 'reset' : '')
  const handler = getAction(type)
  try {
    if (handler) await handler(action, ctx)
  } catch (error) {
    if (!action.ignoreError) throw error
  }

  if (truthyFlag(action.preventDefault, data)) ctx.event?.preventDefault()
  if (truthyFlag(action.stopPropagation, data)) ctx.event?.stopPropagation()
}

function applySetValue(action: ActionSchema, data: PlainObject, ctx: ActionContext) {
  const raw =
    action.value ??
    action.args?.value ??
    (action.args && !action.args.value ? action.args : undefined)
  const target = action.componentId || action.target
  const replace = action.dataMergeMode === 'override'
  const assign = (values: PlainObject) => {
    if (target) {
      for (const item of resolveTargets(target, data)) {
        ctx.scoped?.getComponentByName(item.name)?.setData?.(values, replace)
      }
      return
    }
    if (ctx.form?.setData) {
      ctx.form.setData(values)
      return
    }
    if (ctx.form?.setValue) {
      Object.entries(values).forEach(([key, value]) => ctx.form?.setValue?.(key, value))
      return
    }
    ctx.scope?.merge(values, replace ? 'override' : 'merge')
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    assign(raw as PlainObject)
    return
  }
  if (action.name) {
    assign({ [action.name]: raw })
  }
}

let builtins = false

function registerBuiltinActions() {
  if (builtins) return
  builtins = true

  registerAction('ajax', async (action, ctx) => {
    if (!action.api) return
    const data = actionData(action, ctx)
    const result = await requestApi(action.api, { env: ctx.env, data, reason: 'action' }, { autoAppend: true })
    if (result.skipped) return
    if (!result.ok) {
      throw new Error(apiMessage(action.api, result.payload, 'failed'))
    }
    const success =
      (action.messages && (action.messages as PlainObject).success) ||
      apiMessage(action.api, result.payload, 'success')
    ctx.env.notify('success', String(success))
    if (action.reload) await ctx.scoped?.reload(String(action.reload), data)
  })

  registerAction('toast', async (action, ctx) => {
    const data = actionData(action, ctx)
    const level = (action.level || action.args?.level || action.args?.msgType || 'info') as
      | 'info'
      | 'success'
      | 'warning'
      | 'error'
    const msg = filterTpl(action.msg || action.message || action.args?.msg || '提示', data)
    ctx.env.notify(level, msg)
  })

  registerAction('alert', async (action, ctx) => {
    const data = actionData(action, ctx)
    ctx.env.alert(filterTpl(action.msg || action.message || action.args?.msg || '', data), action.title)
  })

  registerAction('confirm', async (action, ctx) => {
    const data = actionData(action, ctx)
    const ok = await ctx.env.confirm(filterTpl(action.msg || action.confirmText || '', data), action.title)
    if (!ok) ctx.event?.stopPropagation()
  })

  registerAction('setValue', async (action, ctx) => {
    applySetValue(action, actionData(action, ctx), ctx)
  })
  registerAction('setData', async (action, ctx) => {
    applySetValue(action, actionData(action, ctx), ctx)
  })

  registerAction('reload', async (action, ctx) => {
    const data = actionData(action, ctx)
    const extra =
      action.data && typeof action.data === 'object' && !Array.isArray(action.data)
        ? (action.data as PlainObject)
        : undefined
    await ctx.scoped?.reload(
      action.target || action.componentId || action.args?.target,
      extra,
      action.dataMergeMode === 'override',
      data,
    )
  })

  registerAction('dialog', async (action, ctx) => {
    const dialog = (action.dialog || action.args?.dialog || action) as SchemaObject
    ctx.overlay?.openDialog(dialog, actionData(action, ctx))
  })

  registerAction('drawer', async (action, ctx) => {
    const drawer = (action.drawer || action.args?.drawer || action) as SchemaObject
    ctx.overlay?.openDrawer(drawer, actionData(action, ctx))
  })

  registerAction('closeDialog', async (_action, ctx) => {
    ctx.overlay?.close()
  })
  registerAction('closeDrawer', async (_action, ctx) => {
    ctx.overlay?.close()
  })
  registerAction('cancel', async (_action, ctx) => {
    ctx.overlay?.close()
  })
  registerAction('close', async (_action, ctx) => {
    ctx.overlay?.close()
  })

  registerAction('submit', async (_action, ctx) => {
    await ctx.form?.submit?.()
  })
  registerAction('reset', async (_action, ctx) => {
    ctx.form?.reset?.()
  })

  registerAction('link', async (action, ctx) => {
    const data = actionData(action, ctx)
    ctx.env.jumpTo(filterTpl(action.link || action.url || action.args?.url || '#', data))
  })
  registerAction('url', async (action, ctx) => {
    const data = actionData(action, ctx)
    ctx.env.jumpTo(filterTpl(action.link || action.url || action.args?.url || '#', data))
  })

  registerAction('copy', async (action, ctx) => {
    const data = actionData(action, ctx)
    const text = filterTpl(action.copy || action.content || action.args?.content || '', data)
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    }
  })

  registerAction('wait', async (action) => {
    const ms = Number(action.args?.timeMs ?? action.time ?? 0)
    if (!Number.isFinite(ms) || ms <= 0) return
    await new Promise((resolve) => setTimeout(resolve, ms))
  })

  registerAction('preventDefault', async (_action, ctx) => {
    ctx.event?.preventDefault()
  })
  registerAction('stop', async (_action, ctx) => {
    ctx.event?.stopPropagation()
  })
}

registerBuiltinActions()
