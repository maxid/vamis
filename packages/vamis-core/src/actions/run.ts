import type { ActionSchema, PlainObject, RendererEnv, SchemaObject } from '../types'
import { apiMessage, requestApi } from '../utils/api'
import { evalExpression, filterTpl, resolveValue } from '../formula'
import { tableConditionMatch } from '../utils/table'
import { dataMapping } from '../utils/data-mapping'
import { printElements } from './print'
import { resolveTargets, type ScopedContext } from '../scoped'
import type { OverlayApi } from '../overlay'
import type { FormApiLike } from '../form-api'
import type { Scope } from '../scope'
import {
  actionBlank,
  actionCopyFormat,
  actionMailto,
  actionRequiredNames,
  copyToClipboard,
  fileNameFromUrl,
  triggerBlobDownload,
  triggerSaveAs,
} from '../utils/action'
import { notifyToasts } from '../utils/toast'
import { setStatusStatic } from '../status-store'
import { createVamisEvent, eventEvalData, type VamisEvent } from './event'
import { getAction, registerAction } from './registry'

export type { VamisEvent } from './event'
export { createVamisEvent, eventEvalData } from './event'
export { registerAction, getAction, unregisterAction } from './registry'

type LoopFlow = { status: 'normal' | 'break' | 'continue' }

export interface ActionContext {
  env: RendererEnv
  data: PlainObject
  scoped?: ScopedContext
  overlay?: OverlayApi
  form?: FormApiLike
  scope?: Scope
  event?: VamisEvent
  loopFlow?: LoopFlow
}

function asActions(value: unknown): ActionSchema[] {
  if (!value) return []
  if (Array.isArray(value)) return value as ActionSchema[]
  if (typeof value === 'object' && Array.isArray((value as { actions?: ActionSchema[] }).actions)) {
    return (value as { actions: ActionSchema[] }).actions
  }
  if (typeof value === 'object') return [value as ActionSchema]
  return []
}

function actionData(action: ActionSchema, ctx: ActionContext): PlainObject {
  const base = { ...ctx.data, ...(ctx.event?.data || {}) }
  const extra = action.data && typeof action.data === 'object' ? dataMapping(action.data, base) as PlainObject : {}
  const args = action.args && typeof action.args === 'object' ? dataMapping(action.args, base) as PlainObject : {}
  if (action.actionType === 'custom' && action.args?.script != null) args.script = action.args.script
  return { ...base, ...extra, ...args }
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

export async function runAction(action: ActionSchema, ctx: ActionContext): Promise<boolean> {
  const data = actionData(action, ctx)
  if (action.expression != null) {
    const pass =
      typeof action.expression === 'boolean'
        ? action.expression
        : tableConditionMatch(action.expression, data)
    if (!pass) return false
  }
  if (action.confirmText) {
    const title = typeof action.confirmTitle === 'string' ? filterTpl(action.confirmTitle, data) : undefined
    if (!(await ctx.env.confirm(filterTpl(action.confirmText, data), title))) return false
  }

  const type =
    action.actionType || (action.type === 'submit' ? 'submit' : action.type === 'reset' ? 'reset' : '')
  const required = actionRequiredNames(action)
  if (required.length && ctx.form?.validate && !ctx.form.validate(required)) {
    ctx.env.notify('error', '请检查表单')
    return false
  }
  const handler = getAction(type)
  try {
    // 对齐 Amis runActions：找不到内置动作时走组件专有 doAction（preview / zoom / … + componentId）。
    if (handler) await handler(action, ctx)
    else await runComponentAction(action, ctx)
  } catch (error) {
    if (!action.ignoreError) throw error
  }

  if (truthyFlag(action.preventDefault, data)) ctx.event?.preventDefault()
  if (truthyFlag(action.stopPropagation, data)) ctx.event?.stopPropagation()
  return true
}

/** Amis CmptAction：`componentId` 跨域按 id 找（form 外也能点到 form 内）；name/target 只沿父链。 */
function findTargetComponent(ctx: ActionContext, action: ActionSchema, name: string) {
  if (!ctx.scoped) return undefined
  if (action.componentId) {
    return ctx.scoped.getComponentById?.(name) ?? ctx.scoped.getComponentByName(name)
  }
  return ctx.scoped.getComponentByName(name)
}

function closeAfterAction(action: ActionSchema, ctx: ActionContext) {
  if (action.close !== true) return
  if (ctx.overlay?.state.dialog) ctx.overlay.closeDialog()
  else ctx.overlay?.closeDrawer()
}

async function reloadAfterAction(action: ActionSchema, data: PlainObject, ctx: ActionContext) {
  if (!action.reload) return
  if (action.reload === 'window') {
    if (typeof window !== 'undefined') window.location.reload()
    return
  }
  await ctx.scoped?.reload(String(action.reload), data)
}

async function finishAjax(action: ActionSchema, data: PlainObject, resultData: unknown, ctx: ActionContext) {
  const merged =
    resultData && typeof resultData === 'object' && !Array.isArray(resultData)
      ? { ...data, ...(resultData as PlainObject) }
      : data
  if (action.redirect) {
    ctx.env.jumpTo(filterTpl(String(action.redirect), merged), { blank: actionBlank(action) })
  }
  if (action.feedback && ctx.overlay) {
    const raw = action.feedback
    const dialog = (typeof raw === 'string' ? { title: raw } : raw) as SchemaObject
    ctx.overlay.openDialog(dialog, merged)
  }
  await reloadAfterAction(action, merged, ctx)
  closeAfterAction(action, ctx)
}

function applySetValue(action: ActionSchema, data: PlainObject, ctx: ActionContext) {
  const raw =
    action.value ??
    action.args?.value ??
    (action.args && !action.args.value ? action.args : undefined)
  const target = action.componentId || action.componentName || action.target
  const args = (action.args && typeof action.args === 'object' ? action.args : {}) as PlainObject
  const replace = action.dataMergeMode === 'override' || args.replace === true
  const assign = (values: PlainObject) => {
    if (target) {
      for (const item of resolveTargets(target, data)) {
        const component = findTargetComponent(ctx, action, item.name)
        if (args.index != null || args.condition != null) {
          component?.setData?.(values, replace, args.index, args.condition)
        } else {
          component?.setData?.(values, replace)
        }
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
    assign(dataMapping(raw, data) as PlainObject)
    return
  }
  if (target) {
    assign({ value: resolveValue(raw, data) })
    return
  }
  if (action.name) {
    assign({ [action.name]: raw })
  }
}

async function runComponentAction(action: ActionSchema, ctx: ActionContext): Promise<boolean> {
  const target = action.componentId || action.componentName || action.target
  if (!target) return false
  const data = actionData(action, ctx)
  let found = false
  for (const item of resolveTargets(target, data)) {
    const component = findTargetComponent(ctx, action, item.name)
    if (!component?.doAction) continue
    await component.doAction(action, data)
    found = true
  }
  return found
}

let builtins = false

function registerBuiltinActions() {
  if (builtins) return
  builtins = true

  registerAction('ajax', async (action, ctx) => {
    const api = action.api || action.args?.api
    if (!api) return
    const data = actionData(action, ctx)
    const result = await requestApi(api, { env: ctx.env, data, reason: 'action' }, { autoAppend: true })
    if (result.skipped) return
    if (!result.ok) {
      throw new Error(apiMessage(api, result.payload, 'failed'))
    }
    const success =
      (action.messages && (action.messages as PlainObject).success) ||
      (action.args?.messages && (action.args.messages as PlainObject).success) ||
      apiMessage(api, result.payload, 'success')
    ctx.env.notify('success', String(success))
    const responseData = result.data
    const responseObject =
      responseData && typeof responseData === 'object' && !Array.isArray(responseData)
        ? (responseData as PlainObject)
        : {}
    ctx.event?.setData({
      ...responseObject,
      responseData,
      [action.outputVar || 'responseResult']: {
        ...responseObject,
        responseData,
        responseStatus: result.payload.status,
        responseMsg: result.payload.msg,
      },
    })
    if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
      if (ctx.form?.setData) ctx.form.setData(result.data as PlainObject, false, 'api')
      else ctx.scope?.merge(result.data as PlainObject, 'merge', 'api')
    }
    await finishAjax(action, data, result.data, ctx)
  })

  registerAction('download', async (action, ctx) => {
    const rawApi = action.api || action.args?.api
    if (!rawApi) return
    const data = actionData(action, ctx)
    const api =
      typeof rawApi === 'string'
        ? { url: rawApi, responseType: 'blob' as const, downloadFileName: action.downloadFileName }
        : { ...rawApi, responseType: 'blob' as const, downloadFileName: action.downloadFileName || rawApi.downloadFileName }
    const result = await requestApi(api, { env: ctx.env, data, reason: 'action' }, { autoAppend: true })
    if (result.skipped) return
    if (!result.ok) {
      throw new Error(apiMessage(rawApi, result.payload, 'failed'))
    }
    const blob = result.data instanceof Blob ? result.data : new Blob([result.data == null ? '' : String(result.data)])
    const name = filterTpl(String(action.downloadFileName || result.payload.fileName || 'download'), data)
    triggerBlobDownload(blob, name)
    await finishAjax(action, data, result.data instanceof Blob ? data : result.data, ctx)
  })

  registerAction('saveAs', async (action, ctx) => {
    const data = actionData(action, ctx)
    const api = action.api
    const url = typeof api === 'string' ? filterTpl(api, data) : filterTpl(api?.url || '', data)
    if (!url) return
    const fileName = filterTpl(String(action.fileName || ''), data) || fileNameFromUrl(url)
    triggerSaveAs(url, fileName)
  })

  registerAction('toast', async (action, ctx) => {
    notifyToasts(ctx.env.notify, action, actionData(action, ctx))
  })

  registerAction('alert', async (action, ctx) => {
    const data = actionData(action, ctx)
    ctx.env.alert(
      filterTpl(action.msg || action.message || action.args?.msg || '', data),
      typeof action.title === 'string' ? action.title : undefined,
    )
  })

  registerAction('confirm', async (action, ctx) => {
    if (ctx.overlay?.state.dialog) {
      if (await ctx.overlay.submitDialogForm?.()) return
      ctx.overlay.closeDialog()
      return
    }
    if (ctx.overlay?.state.drawer) {
      ctx.overlay.closeDrawer()
      return
    }
    const data = actionData(action, ctx)
    const ok = await ctx.env.confirm(
      filterTpl(action.msg || action.confirmText || '', data),
      typeof action.title === 'string' ? action.title : undefined,
    )
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
        ? dataMapping(action.data, data) as PlainObject
        : undefined
    await ctx.scoped?.reload(
      action.target || action.componentId || action.componentName || action.args?.target,
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
    ctx.overlay?.closeDialog()
  })
  registerAction('closeDrawer', async (_action, ctx) => {
    ctx.overlay?.closeDrawer()
  })
  registerAction('cancel', async (_action, ctx) => {
    if (ctx.overlay?.state.dialog) ctx.overlay.closeDialog()
    else ctx.overlay?.closeDrawer()
  })
  registerAction('close', async (_action, ctx) => {
    if (ctx.overlay?.state.dialog) ctx.overlay.closeDialog()
    else ctx.overlay?.closeDrawer()
  })

  registerAction('submit', async (_action, ctx) => {
    await ctx.form?.submit?.()
  })
  registerAction('reset', async (action, ctx) => {
    if (!(await runComponentAction(action, ctx))) ctx.form?.reset?.()
  })
  registerAction('clear', async (action, ctx) => {
    if (!(await runComponentAction(action, ctx))) ctx.form?.clear?.()
  })
  registerAction('focus', async (action, ctx) => {
    await runComponentAction(action, ctx)
  })
  registerAction('clear-and-submit', async (_action, ctx) => {
    ctx.form?.clear?.()
    await ctx.form?.submit?.()
  })
  registerAction('reset-and-submit', async (_action, ctx) => {
    ctx.form?.reset?.()
    await ctx.form?.submit?.()
  })

  registerAction('link', async (action, ctx) => {
    const data = actionData(action, ctx)
    ctx.env.jumpTo(filterTpl(action.link || action.url || action.args?.url || '#', data), {
      blank: actionBlank(action),
      actionType: 'link',
    })
  })
  registerAction('url', async (action, ctx) => {
    const data = actionData(action, ctx)
    ctx.env.jumpTo(filterTpl(action.link || action.url || action.args?.url || '#', data), {
      blank: actionBlank(action),
      actionType: 'url',
    })
  })

  registerAction('goBack', async () => {
    if (typeof window !== 'undefined') window.history.back()
  })
  registerAction('goPage', async (action) => {
    if (typeof window === 'undefined') return
    const delta = Number(action.args?.delta ?? 0)
    window.history.go(Number.isFinite(delta) ? delta : 0)
  })
  registerAction('refresh', async () => {
    if (typeof window !== 'undefined') window.location.reload()
  })
  registerAction('print', async (action) => {
    if (typeof document === 'undefined') return
    const ids = action.args?.ids || (action.args?.id ? [action.args.id] : [])
    if (!Array.isArray(ids)) return
    const elements = ids
      .map((id) => document.getElementById(String(id)) || document.querySelector(`[data-id="${String(id)}"]`))
      .filter((element): element is Element => !!element)
    printElements(elements)
  })

  registerAction('copy', async (action, ctx) => {
    const data = actionData(action, ctx)
    const text = filterTpl(action.copy || action.content || action.args?.content || '', data)
    await copyToClipboard(text, actionCopyFormat(action))
  })

  registerAction('email', async (action, ctx) => {
    const data = actionData(action, ctx)
    ctx.env.jumpTo(actionMailto({ ...action, ...action.args }, data))
  })

  registerAction('broadcast', async (action, ctx) => {
    const eventName = String(action.args?.eventName || action.eventName || '')
    if (!eventName) return
    const patch = action.data && typeof action.data === 'object' ? dataMapping(action.data, actionData(action, ctx)) as PlainObject : {}
    ctx.event?.setData(patch)
    await ctx.env.bus?.emit(eventName, { ...(ctx.event?.data || ctx.data), ...patch })
  })

  registerAction('custom', async (action, ctx) => {
    const raw = action.args?.script ?? action.script
    if (typeof raw !== 'function' && !ctx.env.trusted) return
    if (typeof raw !== 'string' && typeof raw !== 'function') return
    const script = typeof raw === 'string'
      ? new Function('context', 'doAction', 'event', `return (async () => { ${raw}\n })()`)
      : null
    const fn = (script || raw) as (
      context: ActionContext,
      doAction: (next: unknown) => Promise<void>,
      event?: VamisEvent,
    ) => unknown
    const proxy = new Proxy({}, {
      get(_target, key) {
        return typeof key === 'string' ? ctx.scoped?.getComponentByName(key) : undefined
      },
    })
    const doAction = async (next: unknown) => {
      await runActions(asActions(next), ctx)
    }
    await fn.call(proxy, ctx, doAction, ctx.event)
  })

  registerAction('static', async (action) => {
    setStatusStatic(action.componentId || action.componentName, true)
  })
  registerAction('nonstatic', async (action) => {
    setStatusStatic(action.componentId || action.componentName, false)
  })

  registerAction('wait', async (action) => {
    const ms = Number(action.args?.timeMs ?? action.time ?? 0)
    if (!Number.isFinite(ms) || ms <= 0) return
    await new Promise((resolve) => setTimeout(resolve, ms))
  })

  registerAction('loop', async (action, ctx) => {
    const data = actionData(action, ctx)
    const loopName = String(action.args?.loopName || '')
    const items = resolveValue(loopName, data)
    if (!Array.isArray(items) || !action.children?.length) return
    const originalEventData = ctx.event ? { ...ctx.event.data } : undefined
    for (const item of items) {
      const loopFlow: LoopFlow = { status: 'normal' }
      const itemData = item && typeof item === 'object' && !Array.isArray(item) ? item as PlainObject : { item }
      ctx.event?.setData(itemData)
      const loopCtx: ActionContext = { ...ctx, data: { ...data, ...itemData }, loopFlow }
      for (const child of action.children) {
        await runAction(child, loopCtx)
        if (loopFlow.status !== 'normal' || ctx.event?.stopped) break
      }
      if (loopFlow.status === 'break') {
        ctx.event?.stopPropagation()
        break
      }
      if (ctx.event?.stopped) break
    }
    if (ctx.event && originalEventData) {
      ctx.event.data = originalEventData
    }
  })
  registerAction('break', async (_action, ctx) => {
    if (ctx.loopFlow) ctx.loopFlow.status = 'break'
  })
  registerAction('continue', async (_action, ctx) => {
    if (ctx.loopFlow) ctx.loopFlow.status = 'continue'
  })
  registerAction('switch', async (action, ctx) => {
    for (const branch of action.children || []) {
      if (branch.expression == null) continue
      if (await runAction(branch, ctx)) break
    }
  })
  registerAction('parallel', async (action, ctx) => {
    await Promise.all((action.children || []).map((child: ActionSchema) => runAction(child, ctx)))
  })

  registerAction('preventDefault', async (_action, ctx) => {
    ctx.event?.preventDefault()
  })
  registerAction('stop', async (_action, ctx) => {
    ctx.event?.stopPropagation()
  })
}

registerBuiltinActions()
