import { inject, provide, type InjectionKey } from 'vue'
import type { NodeState } from '@vamis/core'
import type { PlainObject } from '@vamis/core'

export interface FormContext {
  store: NodeState
  mode?: string
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

/** 表单控件 v-model：未知值收成 Input / Textarea 能吃的标量。 */
export function controlInputValue(raw: unknown): string | number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (raw == null) return ''
  return String(raw)
}
