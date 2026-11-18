import { describe, expect, it, vi } from 'vitest'
import { evalFormula } from '../src/formula'
import { reportDiagnostic } from '../src/diagnostic'
import { requestApi } from '../src/utils/api'
import type { RendererEnv } from '../src/types'

function env(partial: Partial<RendererEnv> = {}): RendererEnv {
  return {
    fetcher: vi.fn(async () => ({ status: 0, msg: 'ok', data: { answer: 42 } })),
    notify: vi.fn(),
    jumpTo: vi.fn(),
    alert: vi.fn(),
    confirm: vi.fn(async () => true),
    ...partial,
  }
}

describe('diagnostics', () => {
  it('reports structured diagnostics without logging when debug is off', () => {
    const onDiagnostic = vi.fn()
    const group = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => undefined)
    reportDiagnostic(env({ onDiagnostic }), { type: 'action', message: 'test', detail: { id: 1 } })
    expect(onDiagnostic).toHaveBeenCalledWith({ type: 'action', message: 'test', detail: { id: 1 } })
    expect(group).not.toHaveBeenCalled()
    vi.restoreAllMocks()
  })

  it('reports API request and response', async () => {
    const onDiagnostic = vi.fn()
    const context = env({ onDiagnostic })
    await requestApi('/api/example', { env: context, data: {} })
    expect(onDiagnostic).toHaveBeenCalledWith(expect.objectContaining({ type: 'api', message: 'request GET /api/example' }))
    expect(onDiagnostic).toHaveBeenCalledWith(expect.objectContaining({ type: 'api', message: 'response /api/example' }))
  })

  it('reports expression errors with the expression text', () => {
    const onDiagnostic = vi.fn()
    const context = env({ onDiagnostic })
    expect(evalFormula('{', { __env: context })).toBeUndefined()
    expect(onDiagnostic).toHaveBeenCalledWith(expect.objectContaining({
      type: 'expression',
      message: '表达式求值失败',
      detail: { expression: '{' },
    }))
  })
})
