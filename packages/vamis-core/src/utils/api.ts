import type { ApiObject, Payload, PlainObject, SchemaApi } from '../types'
import { evalExpression, filterTpl } from '../formula'

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
    const sendOn = (api as ApiObject & { sendOn?: string }).sendOn
    if (typeof sendOn === 'string' && !evalExpression(sendOn, data)) return false
    return true
  }
  return false
}

export function normalizeApi(api: SchemaApi, data: PlainObject = {}): ApiObject {
  if (typeof api === 'string') {
    const match = /^(get|post|put|patch|delete):/i.exec(api)
    if (match) {
      return {
        method: match[1].toLowerCase() as ApiObject['method'],
        url: filterTpl(api.slice(match[0].length), data),
      }
    }
    return { method: 'get', url: filterTpl(api, data) }
  }
  return {
    ...api,
    method: api.method || 'get',
    url: filterTpl(api.url, data),
  }
}

export function normalizePayload(raw: unknown): Payload {
  if (raw && typeof raw === 'object') {
    const body = raw as PlainObject
    if (typeof body.status === 'number') {
      return {
        status: body.status,
        msg: body.msg || body.message,
        data: body.data,
      }
    }
    if (Array.isArray(body.items) || Array.isArray(body.rows) || Array.isArray(body.list)) {
      return { status: 0, data: body }
    }
  }
  return { status: 0, data: raw }
}

export async function defaultFetcher(api: ApiObject, data?: PlainObject): Promise<Payload> {
  const method = (api.method || 'get').toUpperCase()
  const isGet = method === 'GET'
  const url = new URL(api.url, window.location.origin)
  let body: string | undefined
  if (isGet) {
    Object.entries(data || {}).forEach(([key, value]) => {
      if (value == null || value === '') return
      url.searchParams.set(key, String(value))
    })
  } else {
    body = JSON.stringify({ ...(api.data || {}), ...(data || {}) })
  }
  const response = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(api.headers || {}),
    },
    body,
  })
  const json = await response.json().catch(() => ({}))
  return normalizePayload(json)
}
