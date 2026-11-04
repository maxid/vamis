<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import { Button, Checkbox, cn } from '@vamis/ui'
import {
  SchemaRenderer,
  checkboxClearValue,
  checkboxIsChecked,
  checkboxResetValue,
  checkboxSetDataValue,
  checkboxWriteValue,
  createVamisEvent,
  evalExpression,
  eventEvalData,
  filterTpl,
  formItemStatic,
  formItemStaticSchema,
  resolveClassName,
  statusStaticOf,
  runOnEvent,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type SchemaObject,
} from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()

const form = useForm()
const env = useEnv()
const scoped = useScoped()
const scope = useScope()
const overlay = useOverlay()
const formApi = useFormApi()
const data = useData()

const fieldName = computed(() => (props.schema.name ? String(props.schema.name) : ''))
const current = computed(() => (fieldName.value ? form?.getValue(fieldName.value) : props.schema.value))
const checked = computed(() => checkboxIsChecked(current.value, props.schema))
const partial = computed(() => props.schema.partial === true)
const model = computed(() => (partial.value ? 'indeterminate' : checked.value))
const buttonMode = computed(() => props.schema.optionType === 'button')
const isStatic = computed(() =>
  formItemStatic(props.schema, data.value, form?.isStatic?.() === true, statusStaticOf(props.schema)),
)
const locked = computed(() => {
  if (props.disabled || isStatic.value || props.schema.readOnly === true) return true
  if (typeof props.schema.readOnlyOn === 'string') return evalExpression(props.schema.readOnlyOn, data.value)
  return false
})
const optionNode = computed(() => resolveOption(props.schema.option, data.value))
const optionClass = computed(() => resolveClassName(props.schema.labelClassName, data.value))
const formItemSchema = computed(() => {
  if (isStatic.value && formItemStaticSchema(props.schema)) return props.schema
  return { ...props.schema, static: false }
})
const pristine = fieldName.value ? form?.getValue(fieldName.value) : props.schema.value

function write(next: unknown) {
  if (fieldName.value) form?.setValue(fieldName.value, next)
}

async function emitChange(next: unknown) {
  const payload = {
    ...data.value,
    value: next,
    ...(fieldName.value ? { [fieldName.value]: next } : {}),
  }
  const event = createVamisEvent('change', payload)
  await runOnEvent(props.schema, 'change', {
    env,
    data: eventEvalData(payload, event),
    scoped,
    overlay,
    form: formApi,
    scope: scope.value,
    event,
  })
  return event
}

async function onToggle(nextChecked: boolean) {
  if (locked.value) return
  const next = checkboxWriteValue(nextChecked, props.schema)
  const event = await emitChange(next)
  if (event.prevented) return
  write(next)
}

function setData(values: Record<string, unknown>) {
  const next = checkboxSetDataValue(values, fieldName.value)
  if (next !== undefined) write(next)
}

async function doAction(action: { actionType?: string; value?: unknown; args?: { value?: unknown } }) {
  const type = action?.actionType
  if (type === 'clear') {
    write(checkboxClearValue())
    return
  }
  if (type === 'reset') {
    write(checkboxResetValue(props.schema, pristine))
    return
  }
  if (type === 'setValue') {
    write(action.args?.value ?? action.value)
  }
}

function makeApi(name: string) {
  return {
    name,
    setData,
    doAction,
    getValue: () => current.value,
    getData: () =>
      fieldName.value ? { value: current.value, [fieldName.value]: current.value } : { value: current.value },
  }
}
const scopedId = String(props.schema.id || '')
const scopedName = fieldName.value
const apis = [
  scopedId ? makeApi(scopedId) : null,
  scopedName && scopedName !== scopedId ? makeApi(scopedName) : null,
].filter(Boolean) as ReturnType<typeof makeApi>[]
for (const api of apis) scoped?.register(api)
onBeforeUnmount(() => {
  for (const api of apis) scoped?.unregister(api)
})

function resolveOption(raw: unknown, ctx: Record<string, unknown>) {
  if (raw == null || raw === false || raw === '') return null
  if (typeof raw === 'string' || typeof raw === 'number') {
    return { kind: 'text' as const, text: filterTpl(String(raw), ctx) }
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const rec = raw as SchemaObject
    return { kind: 'schema' as const, schema: rec.type ? rec : ({ type: 'tpl', tpl: String(rec.tpl ?? ''), inline: true } as SchemaObject) }
  }
  return { kind: 'text' as const, text: String(raw) }
}
</script>

<template>
  <FormItem :schema="formItemSchema">
    <div class="flex min-h-8 items-center">
      <Button
        v-if="buttonMode"
        type="button"
        size="sm"
        :variant="checked ? 'default' : 'outline'"
        :disabled="locked"
        :class="cn('vamis-checkbox-option--button', optionClass)"
        @click="onToggle(!checked)"
      >
        <template v-if="optionNode?.kind === 'schema'">
          <SchemaRenderer :schema="optionNode.schema" :extra-data="data" />
        </template>
        <template v-else>{{ optionNode?.text }}</template>
      </Button>
      <label
        v-else
        class="inline-flex items-center gap-2 text-sm"
        :class="locked ? 'cursor-not-allowed' : 'cursor-pointer'"
      >
        <Checkbox
          :model-value="model"
          :disabled="locked"
          @update:model-value="onToggle($event === true)"
        />
        <span v-if="optionNode?.kind === 'text'" :class="optionClass">{{ optionNode.text }}</span>
        <SchemaRenderer v-else-if="optionNode?.kind === 'schema'" :schema="optionNode.schema" :extra-data="data" />
      </label>
    </div>
  </FormItem>
</template>
