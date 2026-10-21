import { describe, expect, it, vi } from 'vitest'
import { isEffectiveApi, normalizeApi, normalizePayload, requestApi, apiTrackKey } from '../src/utils/api'
import type { RendererEnv } from '../src/types'

function env(fetcher: RendererEnv['fetcher'], extra: Partial<RendererEnv> = {}): RendererEnv {
  return {
    fetcher,
    notify: vi.fn(),
    jumpTo: vi.fn(),
    alert: vi.fn(),
    confirm: vi.fn(async () => true),
    ...extra,
  }
}

describe('isEffectiveApi', () => {
  it('rejects missing or empty api', () => {
    expect(isEffectiveApi(undefined, {})).toBe(false)
    expect(isEffectiveApi('', {})).toBe(false)
    expect(isEffectiveApi(false, {})).toBe(false)
  })

  it('honors initFetch false and initFetchOn', () => {
    expect(isEffectiveApi('/api/x', {}, false)).toBe(false)
    expect(isEffectiveApi('/api/x', { go: false }, true, '${go}')).toBe(false)
    expect(isEffectiveApi('/api/x', { go: true }, true, '${go}')).toBe(true)
    expect(isEffectiveApi('/api/x', {}, undefined)).toBe(true)
  })

  it('honors sendOn on api objects', () => {
    expect(isEffectiveApi({ url: '/api/x', sendOn: '${ok}' }, { ok: false })).toBe(false)
    expect(isEffectiveApi({ url: '/api/x', sendOn: '${ok}' }, { ok: true })).toBe(true)
    expect(isEffectiveApi({ url: '/api/x' }, {})).toBe(true)
    expect(isEffectiveApi({ method: 'get', url: '' }, {})).toBe(false)
  })
})

describe('normalizeApi', () => {
  it('parses method prefix on strings', () => {
    expect(normalizeApi('post:/api/x', {})).toEqual({ method: 'post', url: '/api/x' })
  })

  it('templates url from data', () => {
    expect(normalizeApi('/api/${id}', { id: 7 }).url).toBe('/api/7')
  })
})

describe('normalizePayload', () => {
  it('keeps status/msg/data', () => {
    expect(normalizePayload({ status: 0, msg: 'ok', data: { a: 1 } })).toEqual({
      status: 0,
      msg: 'ok',
      data: { a: 1 },
      ok: true,
    })
  })

  it('maps errorCode / errno / error variants', () => {
    expect(normalizePayload({ errorCode: 2, errorMessage: 'boom' })).toMatchObject({
      status: 2,
      msg: 'boom',
      ok: false,
    })
    expect(normalizePayload({ errno: 1, errmsg: 'nope' })).toMatchObject({ status: 1, msg: 'nope', ok: false })
    expect(normalizePayload({ error: { code: 9, message: 'x' } })).toMatchObject({ status: 9, msg: 'x', ok: false })
  })

  it('treats a bare object as successful data', () => {
    expect(normalizePayload({ username: 'amis' })).toMatchObject({
      status: 0,
      ok: true,
      data: { username: 'amis' },
    })
  })
})

describe('requestApi', () => {
  it('skips when sendOn is false', async () => {
    const fetcher = vi.fn(async () => ({ status: 0, data: {} }))
    const result = await requestApi(
      { url: '/api/x', sendOn: '${ok}' },
      { env: env(fetcher), data: { ok: false } },
    )
    expect(result.skipped).toBe(true)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('maps api.data and appends GET fields to the query', async () => {
    const fetcher = vi.fn(async (api) => ({ status: 0, data: { url: api.url, body: api.data } }))
    const result = await requestApi(
      { method: 'get', url: '/api/x', data: { q: '${word}' } },
      { env: env(fetcher), data: { word: 'hi' } },
    )
    expect(result.ok).toBe(true)
    expect(fetcher.mock.calls[0][0].url).toContain('q=hi')
  })

  it('maps responseData with & flatten', async () => {
    const fetcher = vi.fn(async () => ({ status: 0, data: { items: [{ a: 1 }, { a: 2 }] } }))
    const result = await requestApi(
      {
        url: '/api/x',
        responseData: { '&': '$$', first: '${items|first}' },
      },
      { env: env(fetcher), data: {} },
    )
    expect(result.data).toEqual({ items: [{ a: 1 }, { a: 2 }], first: { a: 1 } })
  })

  it('returns replaceData for the caller', async () => {
    const fetcher = vi.fn(async () => ({ status: 0, data: { a: 1 } }))
    const result = await requestApi(
      { url: '/api/x', replaceData: true },
      { env: env(fetcher), data: {} },
    )
    expect(result.replaceData).toBe(true)
    expect(result.data).toEqual({ a: 1 })
  })

  it('reuses cache within the ttl', async () => {
    const fetcher = vi.fn(async () => ({ status: 0, data: { n: 1 } }))
    const api = { url: '/api/cached-once', cache: 5000 }
    const context = { env: env(fetcher), data: {} }
    const first = await requestApi(api, context)
    const second = await requestApi(api, context)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(second.data).toEqual(first.data)
  })

  it('runs a function adaptor and skips string adaptor unless trusted', async () => {
    const fetcher = vi.fn(async () => ({ code: 200, data: { ok: true } }))
    const adapted = await requestApi(
      {
        url: '/api/x',
        adaptor: (payload: any) => ({ ...payload, status: payload.code === 200 ? 0 : payload.code }),
      },
      { env: env(fetcher), data: {} },
    )
    expect(adapted.ok).toBe(true)

    const untrusted = await requestApi(
      { url: '/api/x', adaptor: 'return { status: 0, data: { hack: 1 } }' },
      { env: env(fetcher), data: {} },
    )
    expect(untrusted.data).not.toEqual({ hack: 1 })

    const trusted = await requestApi(
      { url: '/api/y', adaptor: 'return { status: 0, data: { hack: 1 } }' },
      { env: env(fetcher, { trusted: true }), data: {} },
    )
    expect(trusted.data).toEqual({ hack: 1 })
  })

  it('honors mockResponse from requestAdaptor', async () => {
    const fetcher = vi.fn(async () => ({ status: 0, data: { real: true } }))
    const result = await requestApi(
      {
        url: '/api/x',
        requestAdaptor: (api) => ({
          ...api,
          mockResponse: { status: 200, data: { status: 0, data: { name: 'mock' } } },
        }),
      },
      { env: env(fetcher), data: {} },
    )
    expect(fetcher).not.toHaveBeenCalled()
    expect(result.data).toEqual({ name: 'mock' })
  })

  it('wraps graphql + data as query/variables', async () => {
    const fetcher = vi.fn(async (api) => ({ status: 0, data: api.data }))
    await requestApi(
      {
        method: 'post',
        url: '/api/gql',
        graphql: '{ user { id } }',
        data: { id: '${uid}' },
      },
      { env: env(fetcher), data: { uid: 3 } },
    )
    expect(fetcher.mock.calls[0][0].data).toEqual({
      query: '{ user { id } }',
      variables: { id: 3 },
    })
  })
})

describe('apiTrackKey', () => {
  it('tracks url templates unless data is an object map', () => {
    expect(apiTrackKey('/api/x?tpl=${tpl}', { tpl: 'a' })).toBe('/api/x?tpl=a')
    expect(apiTrackKey({ url: '/api/x?tpl=${tpl}' }, { tpl: 'b' })).toBe('/api/x?tpl=b')
    expect(apiTrackKey({ url: '/api/x', data: { tpl: '${tpl}' } }, { tpl: 'c' })).toBe('')
    expect(apiTrackKey({ url: '/api/x?tpl=${tpl}', autoRefresh: false }, { tpl: 'd' })).toBe('')
    expect(apiTrackKey({ url: '/api/x', trackExpression: '${a}' }, { a: 2 })).toBe('2')
  })
})
