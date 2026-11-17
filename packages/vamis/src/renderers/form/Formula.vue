<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { evalExpression, evalFormula, filterTpl, useScoped, type SchemaObject } from '@vamis/core'
import { Input } from '@vamis/ui'
import { useFieldValue, useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import { useData } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const fieldApi = useFieldValue()
const data = useData()
const scoped = useScoped()
const name = computed(() => (props.schema.name ? String(props.schema.name) : ''))
const applying = ref(false)

const result = computed((): string | number => {
  const formula = String(props.schema.formula || props.schema.value || '')
  if (!formula) return ''
  const ctx = { ...data.value, ...(form?.store.data || {}) }
  if (formula.includes('${')) return filterTpl(formula, ctx)
  const value = evalFormula(formula, ctx)
  // 两边都空时公式引擎是 NaN；Amis evalJS 缺变量抛错后留下 schema value 0。
  if (typeof value === 'number' && Number.isNaN(value)) return 0
  if (typeof value === 'number' || typeof value === 'string') return value
  return value == null ? '' : String(value)
})

function apply() {
  if (!name.value || !form || applying.value || props.disabled) return
  const condition = props.schema.condition
  if (typeof condition === 'string' && condition) {
    try {
      if (!evalExpression(condition, { ...data.value, ...(form.store.data || {}) })) return
    } catch {
      return
    }
  }
  applying.value = true
  try {
    fieldApi.setValue(name.value, result.value)
  } finally {
    applying.value = false
  }
}

let stopWatch: (() => void) | undefined
onMounted(() => {
  if (!name.value || !form) return
  if (props.schema.initSet !== false) apply()
  if (props.schema.autoSet !== false) {
    stopWatch = watch(
      () => [form.store.data, data.value] as const,
      () => apply(),
      { deep: true },
    )
  }
})
onBeforeUnmount(() => stopWatch?.())
const formulaApi = {
  name: String(props.schema.id || props.schema.name || ''),
  id: props.schema.id ? String(props.schema.id) : undefined,
  getData: () => ({ value: result.value }),
  setData(values: Record<string, unknown>) {
    if (values && 'value' in values && name.value) fieldApi.setValue(name.value, values.value)
  },
  async doAction(action: { actionType?: string }) {
    if (action?.actionType === 'apply' || action?.actionType === 'reload' || !action?.actionType) apply()
  },
}
scoped?.register(formulaApi as never)
onBeforeUnmount(() => scoped?.unregister(formulaApi as never))
</script>

<template>
  <FormItem :schema="schema">
    <Input :model-value="result" :disabled="schema.type !== 'input-formula' || disabled" readonly />
  </FormItem>
</template>
