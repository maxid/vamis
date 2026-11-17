import { inject, provide, type InjectionKey } from 'vue'
import { getByPath, useData, useScope, useValueHost } from '@vamis/core'
import type { FormHorizontal, NodeState } from '@vamis/core'
import type { PlainObject } from '@vamis/core'

export interface FormContext {
  store: NodeState
  mode?: string
  horizontal?: FormHorizontal | null
  labelAlign?: string
  isStatic?: () => boolean
  getValue: (name: string) => unknown
  setValue: (name: string, value: unknown) => void
  submit: () => Promise<void>
  reset: () => void
  clear: () => void
  setError: (name: string, message: string) => void
}

export const FormContextKey: InjectionKey<FormContext> = Symbol('vamis-form')

export function provideForm(ctx: FormContext) {
  provide(FormContextKey, ctx)
}

export function useForm(): FormContext | undefined {
  return inject(FormContextKey, undefined)
}

export interface FieldValueApi {
  getValue: (name: string) => unknown
  setValue: (name: string, value: unknown) => void
}

/**
 * 表单项的取值 / 写值口，表单项一律走它，不要直接 `form?.getValue` / `form?.setValue`。
 * 有祖先表单时就是表单自己。脱离表单时（表格单元格、page / service 里直接放表单项）对齐 Amis `wrapControl`：
 * 值从数据链读（`data[name]`，行记录也在里面），变化交给最近的 ValueHost（表格行 → 行数据，否则 → 本层数据域）。
 * 只写 `form?.setValue` 的话，脱离表单时值会被直接丢掉，同一字段的其他组件也不会跟着变。
 */
export function useFieldValue(): FieldValueApi {
  const form = useForm()
  if (form) return form
  const data = useData()
  const host = useValueHost()
  const scope = useScope()
  return {
    getValue: (name) => (name ? getByPath(data.value, name) : undefined),
    setValue(name, value) {
      if (!name) return
      if (host) host.setValue(name, value)
      else scope.value?.set(name, value, 'input')
    },
  }
}

/** Combo `multiple` 把 `type: radio` 互斥写回整列。返回 false 时 Radio 不再自己写字段。 */
export interface ComboRadioApi {
  index: number
  onChange?: (ctx: {
    index: number
    name: string
    trueValue: unknown
    falseValue: unknown
  }) => false | void
}

export const ComboRadioKey: InjectionKey<ComboRadioApi> = Symbol('vamis-combo-radio')

export function provideComboRadio(api: ComboRadioApi) {
  provide(ComboRadioKey, api)
}

export function useComboRadio(): ComboRadioApi | undefined {
  return inject(ComboRadioKey, undefined)
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
