import { describe, expect, it, vi } from 'vitest'
import { runOptionConfirm } from '../src/actions/options-event'
import { persistOptionMutation } from '../src/utils/option-mutation'

describe('runOptionConfirm', () => {
  it('returns false when the option event is prevented', async () => {
    const event = await runOptionConfirm({
      schema: {
        onEvent: {
          addConfirm: {
            actions: [{ actionType: 'preventDefault' }],
          },
        },
      },
      eventName: 'addConfirm',
      data: { role: 'admin' },
      value: 'b',
      options: [],
      item: { label: 'B', value: 'b' },
      env: { notify: vi.fn() } as any,
      scoped: undefined,
      overlay: undefined,
      form: undefined,
      scope: undefined,
    })

    expect(event).toBe(false)
  })
})

describe('persistOptionMutation', () => {
  it('keeps the local option data when no API is configured', async () => {
    const result = await persistOptionMutation({
      api: undefined,
      method: 'post',
      data: { label: 'C', value: 'c' },
      payload: { scopeSecret: 'do-not-copy', value: 'scope-value' },
      failureMessage: '新增选项失败',
      env: { notify: vi.fn() } as any,
    })

    expect(result).toEqual({ ok: true, data: { label: 'C', value: 'c' } })
  })

  it('persists an option API request and merges response data', async () => {
    const calls: string[] = []
    const result = await persistOptionMutation({
      api: '/api/add',
      method: 'post',
      data: { label: 'A', value: 'a' },
      payload: { scopeSecret: 'do-not-copy', name: 'A' },
      failureMessage: '新增选项失败',
      env: {
        fetcher: async () => {
          calls.push('api')
          return { status: 0, data: { value: 'saved' } }
        },
        notify: vi.fn(),
      } as any,
    })

    expect(result).toEqual({ ok: true, data: { label: 'A', value: 'saved' } })
    expect(calls).toEqual(['api'])
  })
})
