import type { ActionSchema, PlainObject, RendererEnv, SchemaObject } from '../types'
import { apiMessage, requestApi } from '../utils/api'
import { evalExpression, filterTpl, resolveValue } from '../formula'
import { tableConditionMatch } from '../utils/table'
import { dataMapping } from '../utils/data-mapping'
import { printElements } from './print'
import { createEventDebounce, type EventDebounceConfig } from '../event-debounce'
import { isVamisDebugEnabled } from '../diagnostic'
import { publicScopeData, setByPathCopy } from '../scope'
import { resolveTargets, type ScopedContext } from '../scoped'
import type { OverlayApi } from '../overlay'
import type { FormApiLike } from '../form-api'
import type { Scope } from '../scope'
import {
  actionBlank,
  actionCopyFormat,
  actionJumpUrl,
  actionMailto,
  actionRequiredNames,
  copyToClipboard,
  fileNameFromUrl,
  triggerBlobDownload,
  triggerSaveAs,
} from '../utils/action'
import { notifyToasts } from '../utils/toast'
import { setStatusDisabled, setStatusStatic, setStatusVisible } from '../status-store'
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

function asRecord(value: unknown): PlainObject {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as PlainObject) : {}
}

function dialogConfig(action: ActionSchema): PlainObject {
  const dialog = action.dialog
  if (dialog && typeof dialog === 'object' && !Array.isArray(dialog)) return dialog as PlainObject
  return asRecord(action.args)
}

function tplText(value: unknown, data: PlainObject): string {
  if (value == null || value === false) return ''
  return filterTpl(String(value), data)
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

const listenerDebouncers = new WeakMap<SchemaObject, Map<string, ReturnType<typeof createEventDebounce>>>()

function listenerDebounce(schema: SchemaObject, eventName: string, config?: EventDebounceConfig) {
  if (!config) return undefined
  let handlers = listenerDebouncers.get(schema)
  if (!handlers) {
    handlers = new Map()
    listenerDebouncers.set(schema, handlers)
  }
  let handler = handlers.get(eventName)
  if (!handler) {
    handler = createEventDebounce(config)
    handlers.set(eventName, handler)
  }
  return handler
}

export function cancelEventDebounce(schema: SchemaObject): void {
  const handlers = listenerDebouncers.get(schema)
  if (!handlers) return
  for (const handler of handlers.values()) handler.cancel()
  listenerDebouncers.delete(schema)
}

export async function runOnEvent(
  schema: SchemaObject | undefined,
  eventName: string,
  ctx: ActionContext,
): Promise<void> {
  if (!schema?.onEvent) return
  const conf = schema.onEvent[eventName]
  const ownData = ctx.form?.getData?.() || ctx.scope?.data
  if (ownData) {
    let rendererData = publicScopeData(ownData)
    // 对齐 Amis `resolveEventData`：`__rendererData` 只补当前 `name`，不要把事件 payload 的 `value` 写进数据域快照。
    const name = typeof schema.name === 'string' ? schema.name : ''
    if (name && ctx.event?.data && Object.prototype.hasOwnProperty.call(ctx.event.data, name)) {
      rendererData = setByPathCopy(rendererData, name, ctx.event.data[name])
    }
    ctx = { ...ctx, data: { ...ctx.data, __rendererData: rendererData } }
  }
  if (conf?.track) {
    ctx.env.tracker?.({
      eventType: eventName,
      eventData: { trackId: conf.track.id, trackName: conf.track.name },
    })
  }
  const debouncer = listenerDebounce(schema, eventName, conf?.debounce)
  if (debouncer) await debouncer.run(() => runActions(asActions(conf), ctx))
  else await runActions(asActions(conf), ctx)
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
  if (action.confirmText && !action.ignoreConfirm) {
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
  const hasTarget = !!(action.componentId || action.componentName || action.target)
  const debug = isVamisDebugEnabled(ctx.env) && typeof console !== 'undefined' && (!!handler || hasTarget)
  if (debug) {
    const args = action.args && typeof action.args === 'object' ? dataMapping(action.args, data) : {}
    const logData = publicScopeData(data)
    delete logData.event
    console.group?.(`[vamis] run action ${type}`)
    console.debug(`[${type}] action args, data`, args, logData)
  }
  let actionResult: unknown = true
  try {
    // 对齐 Amis runActions：找不到内置动作时走组件专有 doAction（preview / zoom / … + componentId）。
    if (handler) actionResult = await handler(action, ctx)
    else actionResult = await runComponentAction(action, ctx)
  } catch (error) {
    if (action.ignoreError) return false
    // 对齐 Amis runActions：默认停后续、不把异常抛出页面。
    ctx.event?.preventDefault()
    ctx.event?.stopPropagation()
    if (typeof console !== 'undefined') {
      console.error(
        `${type} 动作执行失败，原因：${error instanceof Error ? error.message : '未知'}`,
      )
    }
    return false
  } finally {
    if (debug) {
      console.debug(`[${type}] action end event`, ctx.event)
      console.groupEnd?.()
    }
  }

  // 对齐 Amis Action.ts：confirmDialog 取消则 preventDefault + 停后续。
  if (type === 'confirmDialog' && !actionResult) {
    ctx.event?.preventDefault()
    ctx.event?.stopPropagation()
    return false
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
    const silent =
      action.options?.silent === true || (typeof api === 'object' && api.silent === true)
    const result = await requestApi(api, { env: ctx.env, data, reason: 'action' }, { autoAppend: true, emptyDataIfUnset: true })
    if (result.skipped) return
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
    if (!result.ok) {
      const failed =
        (action.messages && (action.messages as PlainObject).failed) ||
        (action.args?.messages && (action.args.messages as PlainObject).failed) ||
        apiMessage(api, result.payload, 'failed')
      if (!silent) {
        ctx.env.notify('error', String(failed))
        throw new Error(String(failed))
      }
      return
    }
    const success =
      (action.messages && (action.messages as PlainObject).success) ||
      (action.args?.messages && (action.args.messages as PlainObject).success) ||
      apiMessage(api, result.payload, 'success')
    if (!silent) ctx.env.notify('success', String(success))
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
    const result = await requestApi(api, { env: ctx.env, data, reason: 'action' }, { autoAppend: true, emptyDataIfUnset: true })
    if (result.skipped) return
    if (!result.ok) {
      const failed = apiMessage(rawApi, result.payload, 'failed')
      ctx.env.notify('error', String(failed))
      throw new Error(String(failed))
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
    const modal = dialogConfig(action)
    ctx.env.alert(
      tplText(modal.msg ?? action.msg ?? action.message ?? action.args?.msg, data),
      tplText(modal.title ?? action.title ?? action.args?.title, data) || undefined,
      tplText(modal.className ?? action.args?.className, data) || undefined,
    )
  })

  registerAction('confirmDialog', async (action, ctx) => {
    const data = actionData(action, ctx)
    const modal = dialogConfig(action)
    let confirmed = false
    if (!modal.type) {
      confirmed = await ctx.env.confirm(
        tplText(modal.msg ?? action.args?.msg, data),
        tplText(modal.title ?? action.args?.title, data) || undefined,
        {
          closeOnEsc: modal.closeOnEsc === true || action.args?.closeOnEsc === true,
          size: String(modal.size ?? action.args?.size ?? ''),
          confirmText: tplText(modal.confirmText ?? action.args?.confirmText, data) || undefined,
          cancelText: tplText(modal.cancelText ?? action.args?.cancelText, data) || undefined,
          confirmBtnLevel: String(modal.confirmBtnLevel ?? action.args?.confirmBtnLevel ?? '') || undefined,
          cancelBtnLevel: String(modal.cancelBtnLevel ?? action.args?.cancelBtnLevel ?? '') || undefined,
          className: tplText(modal.className, data),
        },
      )
    } else {
      const result = await ctx.overlay?.openDialog(modal as SchemaObject, data)
      confirmed = result !== false
      if (result && typeof result === 'object') ctx.event?.setData(result)
    }
    return confirmed
  })

  registerAction('confirm', async (action, ctx) => {
    if (ctx.overlay?.state.dialog) {
      if (await ctx.overlay.submitDialogForm?.()) return
      ctx.overlay.closeDialog({})
      return
    }
    if (ctx.overlay?.state.drawer) {
      ctx.overlay.closeDrawer(ctx.overlay.state.data || {})
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
  registerAction('setState', async (action, ctx) => {
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
    const pending = ctx.overlay?.openDialog(dialog, actionData(action, ctx))
    if (!action.waitForAction || !pending) return
    const value = await pending
    const confirmed = value !== false
    ctx.event?.setData({
      [action.outputVar || 'dialogResponse']: {
        confirmed,
        value: confirmed ? value : undefined,
      },
    })
  })

  registerAction('drawer', async (action, ctx) => {
    const drawer = (action.drawer || action.args?.drawer || action) as SchemaObject
    const pending = ctx.overlay?.openDrawer(drawer, actionData(action, ctx))
    if (!action.waitForAction || !pending) return
    const value = await pending
    const confirmed = value !== false
    ctx.event?.setData({
      [action.outputVar || 'drawerResponse']: {
        confirmed,
        value: confirmed ? value : undefined,
      },
    })
  })

  registerAction('closeDialog', async (action, ctx) => {
    const id = action.componentId
    if (id) ctx.overlay?.closeById(String(id))
    else ctx.overlay?.closeDialog()
  })
  registerAction('closeDrawer', async (action, ctx) => {
    const id = action.componentId
    if (id) ctx.overlay?.closeById(String(id))
    else ctx.overlay?.closeDrawer()
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
  registerAction('validate', async (action, ctx) => {
    const target = action.componentId || action.componentName || action.target
    const components = target
      ? resolveTargets(target, actionData(action, ctx)).map((item) => findTargetComponent(ctx, action, item.name))
      : [ctx.form]
    for (const component of components) {
      if (!component?.validate) continue
      const valid = await component.validate()
      const payload = component.getData?.() || {}
      ctx.event?.setData({
        [action.outputVar || 'validateResult']: { error: !valid, payload },
      })
    }
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
    ctx.env.jumpTo(actionJumpUrl(action, data) || '#', {
      blank: actionBlank(action),
      actionType: 'link',
    })
  })
  registerAction('url', async (action, ctx) => {
    const data = actionData(action, ctx)
    ctx.env.jumpTo(actionJumpUrl(action, data) || '#', {
      blank: actionBlank(action),
      actionType: 'url',
    })
  })
  registerAction('jump', async (action, ctx) => {
    const data = actionData(action, ctx)
    ctx.env.jumpTo(actionJumpUrl(action, data) || '#', {
      blank: actionBlank(action),
      actionType: 'jump',
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
  registerAction('print', async (action, ctx) => {
    if (action.componentId) {
      await runComponentAction(action, ctx)
      return
    }
    if (typeof document === 'undefined') return
    const ids = action.args?.ids || (action.args?.id ? [action.args.id] : [])
    if (!Array.isArray(ids)) return
    const elements = ids
      .map((id) => {
        const key = String(id)
        return (
          document.querySelector(`[data-id="${key}"]`) ||
          document.getElementById(key)
        )
      })
      .filter((element): element is Element => !!element)
    printElements(elements)
  })

  registerAction('copy', async (action, ctx) => {
    const data = actionData(action, ctx)
    const text = filterTpl(action.copy || action.content || action.args?.content || '', data)
    await copyToClipboard(text, actionCopyFormat({ ...action, copyFormat: action.args?.copyFormat ?? action.copyFormat }))
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
  registerAction('show', async (action) => {
    setStatusVisible(action.componentId || action.componentName, true)
  })
  registerAction('hidden', async (action) => {
    setStatusVisible(action.componentId || action.componentName, false)
  })
  registerAction('enabled', async (action) => {
    setStatusDisabled(action.componentId || action.componentName, false)
  })
  registerAction('disabled', async (action) => {
    setStatusDisabled(action.componentId || action.componentName, true)
  })
  registerAction('visibility', async (action) => {
    setStatusVisible(action.componentId || action.componentName, action.args?.value !== false)
  })
  registerAction('usability', async (action) => {
    setStatusDisabled(action.componentId || action.componentName, action.args?.value === false)
  })

  registerAction('setEventData', async (action, ctx) => {
    const key = String(action.args?.key ?? action.key ?? '')
    if (!key || !ctx.event) return
    let value: unknown = action.args?.value ?? action.value
    if (typeof value === 'string') value = filterTpl(value, actionData(action, ctx))
    ctx.event.setData(setByPathCopy(ctx.event.data, key, value))
  })

  registerAction('wait', async (action) => {
    const ms = Number(action.args?.time ?? action.args?.timeMs ?? action.time ?? 0)
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
  registerAction('stopPropagation', async (_action, ctx) => {
    ctx.event?.stopPropagation()
  })
}

registerBuiltinActions()
