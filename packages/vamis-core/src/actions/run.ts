import type { ActionSchema, PlainObject, RendererEnv, SchemaObject } from '../types'
import { normalizeApi } from '../utils/api'
import { evalExpression, filterTpl } from '../formula'
import type { ScopedContext } from '../scoped'
import type { OverlayApi } from '../overlay'
import type { FormApiLike } from '../form-api'

export interface ActionContext {
  env: RendererEnv
  data: PlainObject
  scoped?: ScopedContext
  overlay?: OverlayApi
  form?: FormApiLike
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

/** D4 子集：公式可读 `event.context.nativeEvent.type`，完整事件对象尚未落地。 */
export function withNativeEvent(data: PlainObject, nativeEvent: { type: string }): PlainObject {
  return {
    ...data,
    event: {
      context: {
        nativeEvent: { type: nativeEvent.type },
      },
    },
  }
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
    await runAction(action, ctx)
  }
}

export async function runAction(action: ActionSchema, ctx: ActionContext): Promise<void> {
  const data = actionData(action, ctx)
  if (typeof action.expression === 'string' && !evalExpression(action.expression, data)) return
  if (typeof action.stopPropagation === 'boolean' && action.stopPropagation === false) {
    /* keep going */
  }
  if (action.confirmText && !(await ctx.env.confirm(filterTpl(action.confirmText, data)))) return

  const type = action.actionType || (action.type === 'submit' ? 'submit' : action.type === 'reset' ? 'reset' : '')
  switch (type) {
    case 'ajax': {
      if (!action.api) return
      const payload = await ctx.env.fetcher(normalizeApi(action.api, data), data)
      if (payload.status !== 0 && payload.status !== 200) {
        throw new Error(payload.msg || '请求失败')
      }
      const success =
        (action.messages && (action.messages as PlainObject).success) || payload.msg || '完成'
      ctx.env.notify('success', String(success))
      if (action.reload) await ctx.scoped?.reload(String(action.reload), data)
      break
    }
    case 'toast': {
      const level = (action.level || action.args?.level || action.args?.msgType || 'info') as
        | 'info'
        | 'success'
        | 'warning'
        | 'error'
      const msg = filterTpl(action.msg || action.message || action.args?.msg || '提示', data)
      ctx.env.notify(level, msg)
      break
    }
    case 'setValue': {
      applySetValue(action, data, ctx)
      break
    }
    case 'reload': {
      await ctx.scoped?.reload(action.target || action.componentId || action.args?.target, data)
      break
    }
    case 'dialog': {
      const dialog = (action.dialog || action.args?.dialog || action) as SchemaObject
      ctx.overlay?.openDialog(dialog, data)
      break
    }
    case 'drawer': {
      const drawer = (action.drawer || action.args?.drawer || action) as SchemaObject
      ctx.overlay?.openDrawer(drawer, data)
      break
    }
    case 'closeDialog':
    case 'closeDrawer':
    case 'cancel': {
      ctx.overlay?.close()
      break
    }
    case 'submit': {
      await ctx.form?.submit?.()
      break
    }
    case 'reset': {
      ctx.form?.reset?.()
      break
    }
    case 'link':
    case 'url': {
      ctx.env.jumpTo(filterTpl(action.link || action.url || action.args?.url || '#', data))
      break
    }
    default:
      break
  }
}

function applySetValue(action: ActionSchema, data: PlainObject, ctx: ActionContext) {
  const raw =
    action.value ??
    action.args?.value ??
    (action.args && !action.args.value ? action.args : undefined)
  const target = action.componentId || action.target
  const assign = (values: PlainObject) => {
    if (target) {
      ctx.scoped?.getComponentByName(target)?.setData?.(values)
      return
    }
    if (ctx.form?.setData) {
      ctx.form.setData(values)
      return
    }
    if (ctx.form?.setValue) {
      Object.entries(values).forEach(([key, value]) => ctx.form?.setValue?.(key, value))
    }
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    assign(raw as PlainObject)
    return
  }
  if (action.name) {
    assign({ [action.name]: raw })
  }
}
