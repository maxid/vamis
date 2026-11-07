<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { cn } from '@vamis/ui'
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
import BadgeHost from '../BadgeHost.vue'

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
const nativeEl = ref<HTMLInputElement | null>(null)
const markClass = computed(() => ({
  'is-checked': checked.value,
  'is-partial': partial.value,
  'is-disabled': locked.value,
}))

watch(
  [partial, nativeEl],
  () => {
    if (nativeEl.value) nativeEl.value.indeterminate = partial.value
  },
  { immediate: true },
)

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

function onNativeChange(ev: Event) {
  const el = ev.target as HTMLInputElement
  void onToggle(el.checked)
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
    <BadgeHost :schema="schema" :data="data">
      <div class="vamis-checkbox-control">
        <label
          v-if="buttonMode"
          class="vamis-checkbox--button"
          :class="[cn(optionClass), { 'is-checked': checked, 'is-disabled': locked }]"
          @click.prevent="onToggle(!checked)"
        >
          <input
            ref="nativeEl"
            class="vamis-checkbox__native"
            type="checkbox"
            :checked="checked"
            :disabled="locked"
            tabindex="-1"
            @change="onNativeChange"
          />
          <i class="vamis-checkbox__corner" aria-hidden="true">
            <svg class="vamis-checkbox__icon" viewBox="0 0 1024 1024">
              <path
                d="M806.784 295.744l45.248 45.184-362.112 362.048-45.184 45.312-226.24-226.24 45.184-45.184 180.992 180.928z"
                fill="currentColor"
              />
            </svg>
          </i>
          <span v-if="optionNode?.kind === 'text'">{{ optionNode.text }}</span>
          <SchemaRenderer v-else-if="optionNode?.kind === 'schema'" :schema="optionNode.schema" :extra-data="data" />
        </label>
        <label
          v-else
          class="vamis-checkbox-option"
          :class="markClass"
          @click.prevent="onToggle(!checked)"
        >
          <input
            ref="nativeEl"
            class="vamis-checkbox__native"
            type="checkbox"
            :checked="checked"
            :disabled="locked"
            tabindex="-1"
            @change="onNativeChange"
          />
          <i class="vamis-checkbox__mark" data-slot="checkbox" :class="markClass" aria-hidden="true">
            <svg class="vamis-checkbox__icon vamis-checkbox__icon--check" viewBox="0 0 1024 1024">
              <path
                d="M806.784 295.744l45.248 45.184-362.112 362.048-45.184 45.312-226.24-226.24 45.184-45.184 180.992 180.928z"
                fill="currentColor"
              />
            </svg>
            <svg class="vamis-checkbox__icon vamis-checkbox__icon--partial" viewBox="0 0 12 12">
              <rect x="2" y="5" width="8" height="2" fill="currentColor" />
            </svg>
          </i>
          <span v-if="optionNode?.kind === 'text'" :class="optionClass">{{ optionNode.text }}</span>
          <SchemaRenderer v-else-if="optionNode?.kind === 'schema'" :schema="optionNode.schema" :extra-data="data" />
        </label>
      </div>
    </BadgeHost>
  </FormItem>
</template>
