import { inject, provide, type InjectionKey } from 'vue'
import type { PlainObject } from './types'

export interface FormApiLike {
  getValue?: (name: string) => unknown
  setValue?: (name: string, value: unknown) => void
  setData?: (values: PlainObject) => void
  getData?: () => PlainObject
  submit?: () => Promise<void> | void
  reset?: () => void
}

export const FormApiKey: InjectionKey<FormApiLike> = Symbol('varmis-form-api')

export function provideFormApi(api: FormApiLike) {
  provide(FormApiKey, api)
}

export function useFormApi(): FormApiLike | undefined {
  return inject(FormApiKey, undefined)
}
