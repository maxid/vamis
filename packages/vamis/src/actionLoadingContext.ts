import { inject, provide, type InjectionKey } from 'vue'

export interface ActionLoadingApi {
  begin(actionType?: string): ActionLoadingHandle
}

export interface ActionLoadingHandle {
  end(): void
  /** End only the request-triggered host loading; keep action/feedback loading alive. */
  endRequest?(): void
}

const ActionLoadingKey: InjectionKey<ActionLoadingApi> = Symbol('vamis-action-loading')

export function provideActionLoading(api: ActionLoadingApi) {
  provide(ActionLoadingKey, api)
}

export function useActionLoading(): ActionLoadingApi | undefined {
  return inject(ActionLoadingKey, undefined)
}
