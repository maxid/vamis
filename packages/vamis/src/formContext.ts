import { inject, provide, type InjectionKey } from 'vue'
import type { NodeState } from '@vamis/core'
import type { PlainObject } from '@vamis/core'

export interface FormContext {
  store: NodeState
  getValue: (name: string) => unknown
  setValue: (name: string, value: unknown) => void
  submit: () => Promise<void>
  reset: () => void
  setError: (name: string, message: string) => void
}

export const FormContextKey: InjectionKey<FormContext> = Symbol('vamis-form')

export function provideForm(ctx: FormContext) {
  provide(FormContextKey, ctx)
}

export function useForm(): FormContext | undefined {
  return inject(FormContextKey, undefined)
}

export function useFormData(): PlainObject {
  return useForm()?.store.data || {}
}
