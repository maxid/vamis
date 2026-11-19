import type { PlainObject, RendererEnv, SchemaApi } from '../types'
import { apiMessage, isEffectiveApi, requestApi } from './api'

export interface PersistOptionMutationInput {
  api: unknown
  method: 'post' | 'delete'
  env: RendererEnv
  /** 本地选项基准；无 API / skipped / 失败时原样返回。 */
  data: PlainObject
  /** 请求上下文；不得作为本地选项对象回写。 */
  payload: PlainObject
  failureMessage: string
}

export interface PersistOptionMutationResult {
  ok: boolean
  data: PlainObject
}

/** CUD 事件确认后再调用选项接口；skipped 与无接口都按成功处理。 */
export async function persistOptionMutation(
  input: PersistOptionMutationInput,
): Promise<PersistOptionMutationResult> {
  const api = input.api as SchemaApi | false | null | undefined
  if (!api || !isEffectiveApi(api, input.payload)) return { ok: true, data: input.data }
  try {
    const result = await requestApi(
      api,
      { env: input.env, data: input.payload, reason: 'action' },
      { defaultMethod: input.method, autoAppend: true },
    )
    if (result.skipped) return { ok: true, data: input.data }
    if (!result.ok) {
      const customFailure =
        typeof api === 'object' && api !== null && api.messages?.failed
      input.env.notify(
        'error',
        customFailure ? apiMessage(api, result.payload, 'failed') : result.payload.msg || input.failureMessage,
      )
      return { ok: false, data: input.data }
    }
    const data =
      result.data && typeof result.data === 'object' && !Array.isArray(result.data)
        ? { ...input.data, ...(result.data as PlainObject) }
        : input.data
    return { ok: true, data }
  } catch (error) {
    input.env.notify(
      'error',
      error instanceof Error ? error.message : input.failureMessage,
    )
    return { ok: false, data: input.data }
  }
}
