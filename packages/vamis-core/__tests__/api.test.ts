import { describe, expect, it } from 'vitest'
import { isEffectiveApi, normalizeApi } from '../src/utils/api'

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
})
