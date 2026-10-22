import type {
  ApiObject,
  Payload,
  PlainObject,
  RendererEnv,
  RequestAdaptor,
  ResponseAdaptor,
  SchemaApi,
} from '../types'
import { evalExpression, filterTpl } from '../formula'
import { createObject } from '../context'
import { dataMapping } from './data-mapping'

export interface ApiContext {
  env: RendererEnv
  data: PlainObject
  reason?: 'init' | 'submit' | 'reload' | 'action'
}

export interface ApiResult {
  skipped: boolean
  ok: boolean
  payload: Payload
  data: any
  replaceData: boolean
}

export interface RequestApiOptions {
  defaultMethod?: ApiObject['method']
  autoAppend?: boolean
}

type CacheEntry = { expires: number; result: ApiResult }

const apiCache = new Map<string, CacheEntry>()
const fnCache = new Map<string, Function>()

function isPlainObject(value: unknown): value is PlainObject {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function compileFn(body: string, args: string[]): Function | null {
  const key = `${args.join(',')}|${body}`
  const cached = fnCache.get(key)
  if (cached) return cached
  try {
    const fn = new Function(...args, body)
    fnCache.set(key, fn)
    return fn
  } catch {
    return null
  }
}

async function runRequestAdaptor(
  adaptor: ApiObject['requestAdaptor'],
  api: ApiObject,
  data: PlainObject,
  trusted?: boolean,
): Promise<ApiObject> {
  if (!adaptor) return api
  if (typeof adaptor === 'function') return (await adaptor(api, data)) || api
  if (typeof adaptor === 'string' && trusted) {
    const fn = compileFn(adaptor, ['api', 'context']) as RequestAdaptor | null
    if (fn) return (await fn(api, data)) || api
  }
  return api
}

async function runResponseAdaptor(
  adaptor: ApiObject['adaptor'],
  payload: any,
  api: ApiObject,
  data: PlainObject,
  trusted?: boolean,
): Promise<any> {
  if (!adaptor) return payload
  const response = { data: payload }
  if (typeof adaptor === 'function') return await adaptor(payload, response, api, data)
  if (typeof adaptor === 'string' && trusted) {
    const fn = compileFn(adaptor, ['payload', 'response', 'api', 'context']) as ResponseAdaptor | null
    if (fn) return await fn(payload, response, api, data)
  }
  return payload
}

function appendQuery(url: string, query: PlainObject): string {
  const parts: string[] = []
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue
    if (typeof value === 'object') continue
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
  }
  if (!parts.length) return url
  return `${url}${url.includes('?') ? '&' : '?'}${parts.join('&')}`
}

/** 发给接口的数据不要带 Scope 内部字段，否则会变成 `__super=[object Object]`。 */
function omitInternal(data: PlainObject): PlainObject {
  const out: PlainObject = {}
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('__')) continue
    out[key] = value
  }
  return out
}

function rawUrlOf(api: SchemaApi): string {
  if (typeof api === 'string') {
    const trimmed = api.trim()
    const match = /^(get|post|put|patch|delete|jsonp|js):/i.exec(trimmed)
    return match ? trimmed.slice(match[0].length).trim() : trimmed
  }
  return typeof api.url === 'string' ? api.url.trim() : ''
}

function hasCustomData(api: SchemaApi): boolean {
  return typeof api === 'object' && !!api.data
}

function hasFile(value: unknown): boolean {
  if (typeof File !== 'undefined' && value instanceof File) return true
  if (typeof Blob !== 'undefined' && value instanceof Blob) return true
  if (Array.isArray(value)) return value.some(hasFile)
  if (isPlainObject(value)) return Object.values(value).some(hasFile)
  return false
}

function toFormBody(data: PlainObject, dataType: ApiObject['dataType']): BodyInit {
  if (dataType === 'form') {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) continue
      params.set(key, String(value))
    }
    return params.toString()
  }
  const form = new FormData()
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue
    if (typeof File !== 'undefined' && value instanceof File) form.append(key, value)
    else if (typeof Blob !== 'undefined' && value instanceof Blob) form.append(key, value)
    else form.append(key, String(value))
  }
  return form
}

export function normalizeApiResponseData(data: any): PlainObject {
  if (typeof data === 'undefined') return {}
  if (isPlainObject(data)) return data
  return { [Array.isArray(data) ? 'items' : 'result']: data }
}

/** Amis `isEffectiveApi`：有 url、未被 initFetch/initFetchOn/sendOn 关掉才发请求。 */
export function isEffectiveApi(
  api?: SchemaApi | false | null,
  data: PlainObject = {},
  initFetch?: boolean,
  initFetchOn?: string,
): api is SchemaApi {
  if (!api) return false
  if (initFetch === false) return false
  if (initFetchOn && !evalExpression(initFetchOn, data)) return false
  if (typeof api === 'string') return api.length > 0
  if (typeof api === 'object' && api.url) {
    if (typeof api.sendOn === 'string' && !evalExpression(api.sendOn, data)) return false
    return true
  }
  return false
}

export function normalizeApi(
  api: SchemaApi,
  data: PlainObject = {},
  defaultMethod: ApiObject['method'] = 'get',
): ApiObject {
  if (typeof api === 'string') {
    const match = /^(get|post|put|patch|delete|jsonp|js):/i.exec(api)
    if (match) {
      return {
        method: match[1].toLowerCase() as ApiObject['method'],
        url: filterTpl(api.slice(match[0].length), data),
      }
    }
    return { method: defaultMethod, url: filterTpl(api, data) }
  }
  return {
    ...api,
    method: api.method || defaultMethod,
    url: filterTpl(api.url, data),
    headers: api.headers ? dataMapping(api.headers, data, false) : api.headers,
  }
}

export function normalizePayload(raw: unknown): Payload {
  if (!raw || typeof raw !== 'object') {
    return { status: 0, ok: true, data: raw }
  }
  const body = { ...(raw as PlainObject) }

  if (Object.prototype.hasOwnProperty.call(body, 'errorCode')) {
    body.status = body.errorCode
    body.msg = body.errorMessage || body.errorMsg || body.msg
  } else if (Object.prototype.hasOwnProperty.call(body, 'errno')) {
    body.status = body.errno
    body.msg = body.errmsg || body.errstr || body.msg
  } else if (isPlainObject(body.error) && Object.prototype.hasOwnProperty.call(body.error, 'code')) {
    body.status = body.error.code
    body.msg = body.error.message
  } else if (Object.prototype.hasOwnProperty.call(body, 'error') && typeof body.error !== 'object') {
    body.status = body.error
    body.msg = body.errmsg || body.msg
  }

  if (typeof body.status === 'number') {
    return {
      status: body.status,
      msg: body.msg || body.message,
      data: body.data,
      ok: body.status === 0,
      msgTimeout: body.msgTimeout,
      errors: body.errors,
    }
  }
  if (Array.isArray(body.items) || Array.isArray(body.rows) || Array.isArray(body.list)) {
    return { status: 0, ok: true, data: body }
  }
  return { status: 0, ok: true, data: body }
}

function cacheKey(api: ApiObject): string {
  return `${api.method || 'get'}:${api.url}:${JSON.stringify(api.data ?? null)}`
}

/** 拉取类接口自动刷新的跟踪值。对象形式配了 `data` 则默认不跟踪 url（Amis 同款）。 */
export function apiTrackKey(api: SchemaApi | undefined, data: PlainObject = {}): string {
  if (!api) return ''
  const obj: ApiObject = typeof api === 'string' ? { url: api } : api
  if (obj.autoRefresh === false) return ''
  if (obj.trackExpression) return String(filterTpl(obj.trackExpression, data) ?? '')
  if (typeof api !== 'string' && obj.data && typeof obj.data === 'object') return ''
  return filterTpl(obj.url, data)
}

/** 对齐 Amis `normalizeApi`：只拆 method 前缀，不插值。 */
function rawApi(api: SchemaApi | false | null | undefined): ApiObject | undefined {
  if (!api) return undefined
  if (typeof api === 'string') {
    const trimmed = api.trim()
    if (!trimmed) return undefined
    const match = /^(get|post|put|patch|delete|jsonp|js):/i.exec(trimmed)
    if (match) {
      return {
        method: match[1].toLowerCase() as ApiObject['method'],
        url: trimmed.slice(match[0].length).trim(),
      }
    }
    return { method: 'get', url: trimmed }
  }
  return {
    ...api,
    url: typeof api.url === 'string' ? api.url.trim() : api.url,
  }
}

export function isValidApi(url?: string): boolean {
  if (!url || typeof url !== 'string') return false
  const idx = url.indexOf('://')
  if (idx >= 0 && idx + 3 === url.length) return false
  return url.length > 0
}

/**
 * 对齐 Amis `isApiOutdated`：initApi / source 默认只在初始化拉一次。
 * 数据变了不会重拉，除非 url / trackExpression 含 `$` 且插值结果变了，或接口本身换了。
 */
export function isApiOutdated(
  prevApi: SchemaApi | false | null | undefined,
  nextApi: SchemaApi | false | null | undefined,
  prevData: PlainObject = {},
  nextData: PlainObject = {},
): boolean {
  if (!nextApi) return false
  if (prevApi === undefined || prevApi === null) return true
  const next = rawApi(nextApi)
  const prev = rawApi(prevApi)
  if (!next) return false
  if (next.autoRefresh === false) return false
  if ((prev && prev.url !== next.url) || !prev) {
    return !!(isValidApi(next.url) && (!next.sendOn || evalExpression(next.sendOn, nextData)))
  }
  const trackExpression = next.trackExpression ?? next.url
  if (typeof trackExpression !== 'string' || !trackExpression.includes('$')) return false
  const modified =
    next.trackExpression || prev.trackExpression
      ? filterTpl(prev.trackExpression || '', prevData) !== filterTpl(next.trackExpression || '', nextData)
      : filterTpl(prev.url, prevData) !== filterTpl(next.url, nextData)
  return !!(modified && isValidApi(next.url) && (!next.sendOn || evalExpression(next.sendOn, nextData)))
}

export function mergeApiData(target: PlainObject, result: ApiResult): void {
  if (result.skipped || result.data == null || typeof result.data !== 'object' || Array.isArray(result.data)) {
    return
  }
  if (result.replaceData) {
    for (const key of Object.keys(target)) delete target[key]
  }
  Object.assign(target, result.data)
}

export async function requestApi(
  api: SchemaApi | false | null | undefined,
  ctx: ApiContext,
  options: RequestApiOptions = {},
): Promise<ApiResult> {
  const empty: ApiResult = {
    skipped: true,
    ok: true,
    payload: { status: 0, ok: true, data: {} },
    data: undefined,
    replaceData: false,
  }
  if (!isEffectiveApi(api, ctx.data)) return empty

  let built = normalizeApi(api, ctx.data, options.defaultMethod)
  const convertKeyToPath = built.convertKeyToPath
  const customData = hasCustomData(api)
  const method = (built.method || 'get').toLowerCase()
  const payload = omitInternal(ctx.data)

  if (customData && built.data && typeof built.data === 'object') {
    built.data = dataMapping(built.data, ctx.data, convertKeyToPath)
  } else if (
    (method === 'post' || method === 'put' || method === 'patch') &&
    options.autoAppend &&
    Object.keys(payload).length
  ) {
    built.data = payload
  }

  if (built.graphql) {
    built.data = {
      query: built.graphql,
      variables: isPlainObject(built.data) ? built.data : {},
    }
  }

  if (method === 'get' || method === 'jsonp' || method === 'js') {
    const raw = rawUrlOf(api)
    if (
      !customData &&
      ((raw.indexOf('$') < 0 && options.autoAppend) || built.forceAppendDataToQuery)
    ) {
      built.data = payload
    }
    if (isPlainObject(built.data) && built.attachDataToQuery !== false) {
      built.query = { ...(built.query || {}), ...built.data }
      built.url = appendQuery(built.url, built.data)
      delete built.data
    }
  }

  built = await runRequestAdaptor(built.requestAdaptor, built, ctx.data, ctx.env.trusted)
  built.context = ctx.data

  if (built.mockResponse) {
    const raw = built.mockResponse?.data ?? built.mockResponse
    return finalize(raw, built, ctx)
  }

  if (typeof built.cache === 'number' && built.cache > 0) {
    const key = cacheKey(built)
    const hit = apiCache.get(key)
    if (hit && hit.expires > Date.now()) return hit.result
    const result = await fetchAndFinalize(built, ctx)
    apiCache.set(key, { expires: Date.now() + built.cache, result })
    return result
  }

  return fetchAndFinalize(built, ctx)
}

async function fetchAndFinalize(api: ApiObject, ctx: ApiContext): Promise<ApiResult> {
  const raw = await ctx.env.fetcher(api, isPlainObject(api.data) ? api.data : ctx.data)
  return finalize(raw, api, ctx)
}

async function finalize(raw: unknown, api: ApiObject, ctx: ApiContext): Promise<ApiResult> {
  const adapted = await runResponseAdaptor(api.adaptor, raw, api, ctx.data, ctx.env.trusted)
  const payload = normalizePayload(adapted)
  if (api.responseData && (payload.ok || payload.data != null)) {
    payload.data = dataMapping(
      api.responseData,
      createObject({ api }, normalizeApiResponseData(payload.data)),
      api.convertKeyToPath,
    )
  }
  return {
    skipped: false,
    ok: payload.ok !== false && (payload.status === 0 || payload.status === 200),
    payload,
    data: payload.data,
    replaceData: !!api.replaceData,
  }
}

export function apiMessage(api: SchemaApi | undefined, payload: Payload, kind: 'success' | 'failed'): string {
  const obj = api && typeof api === 'object' ? api : undefined
  const custom = obj?.messages?.[kind]
  if (custom) return filterTpl(custom, (payload.data as PlainObject) || {})
  return payload.msg || (kind === 'success' ? '保存成功' : '请求失败')
}

export async function defaultFetcher(api: ApiObject, data?: PlainObject): Promise<Payload> {
  const method = (api.method || 'get').toUpperCase()
  const isGet = method === 'GET' || method === 'HEAD'
  const url = new URL(api.url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
  let body: BodyInit | undefined
  const headers: Record<string, string> = { ...(api.headers || {}) }
  const payloadData = isPlainObject(api.data) ? api.data : isGet ? undefined : data

  if (!isGet && payloadData) {
    const dataType = api.dataType || (hasFile(payloadData) ? 'form-data' : 'json')
    if (dataType === 'form' || dataType === 'form-data') {
      body = toFormBody(payloadData, dataType)
      if (dataType === 'form' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
      }
    } else {
      if (!headers['Content-Type']) headers['Content-Type'] = 'application/json'
      body = JSON.stringify(payloadData)
    }
  }

  if (api.responseType === 'blob') {
    const response = await fetch(url.toString(), { method, headers, body })
    const blob = await response.blob()
    return { status: 0, ok: true, data: blob }
  }

  const response = await fetch(url.toString(), { method, headers, body })
  const json = await response.json().catch(() => ({}))
  return normalizePayload(json)
}
