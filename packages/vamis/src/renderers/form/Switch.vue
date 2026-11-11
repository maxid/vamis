<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
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
  formItemStatic,
  formItemStaticSchema,
  runOnEvent,
  statusStaticOf,
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
const valueSchema = computed(() => ({
  trueValue: props.schema.trueValue,
  falseValue: props.schema.falseValue,
  checked: props.schema.checked,
  resetValue: props.schema.resetValue,
}))
/** 对齐 Amis `value == trueValue`（宽松相等），默认 true / false。 */
const checked = computed(() => checkboxIsChecked(current.value, valueSchema.value))
const isStatic = computed(() =>
  formItemStatic(props.schema, data.value, form?.isStatic?.() === true, statusStaticOf(props.schema)),
)
/** Amis `loadingOn`：loading 期间开关不可操作，转圈画在滑块位置。 */
const loadingNow = computed(() => {
  if (props.schema.loading === true) return true
  const raw = props.schema.loadingOn
  if (typeof raw === 'string' && raw) return evalExpression(raw, data.value)
  return false
})
const locked = computed(() => {
  if (props.disabled || isStatic.value || loadingNow.value || props.schema.readOnly === true) return true
  if (typeof props.schema.readOnlyOn === 'string') return evalExpression(props.schema.readOnlyOn, data.value)
  return false
})
const small = computed(() => props.schema.size === 'sm')
const optionText = computed(() => {
  const raw = props.schema.option
  if (raw == null || raw === '' || raw === false) return ''
  return typeof raw === 'string' ? raw : String(raw)
})
/** Amis `SwitchProps.optionAtLeft`；不在 schema 类型里，按 Amis 默认右侧。 */
const optionAtLeft = computed(() => props.schema.optionAtLeft === true)

type TextNode =
  | { kind: 'text'; text: string }
  | { kind: 'schema'; schema: SchemaObject }
  | { kind: 'nodes'; nodes: SchemaObject[] }

function isSchemaObject(raw: unknown): raw is SchemaObject {
  return !!raw && typeof raw === 'object' && !Array.isArray(raw)
}

/** 对齐 Amis `Switch.renderBody`：字符串直接渲染；只有 icon 的对象走 Icon；其余交给 schema。 */
function resolveText(raw: unknown): TextNode | null {
  if (raw == null || raw === '' || raw === false) return null
  if (typeof raw === 'string' || typeof raw === 'number') return { kind: 'text', text: String(raw) }
  if (Array.isArray(raw)) {
    const nodes = raw
      .map((item) => (isSchemaObject(item) ? { ...item } : { type: 'tpl', tpl: String(item ?? '') }))
      .map((node) => ({ ...node, inline: true }))
    return nodes.length ? { kind: 'nodes', nodes } : null
  }
  if (isSchemaObject(raw)) {
    if (typeof raw.icon === 'string' && !raw.type) {
      return { kind: 'schema', schema: { type: 'icon', icon: raw.icon, inline: true } }
    }
    return { kind: 'schema', schema: { ...raw, inline: true } }
  }
  return { kind: 'text', text: String(raw) }
}

const textNode = computed(() => resolveText(checked.value ? props.schema.onText : props.schema.offText))
/** Amis 静态态：显示 onText / offText；都没配时用 locale 的「开 / 关」。 */
const staticNodes = computed<SchemaObject[]>(() => {
  if (!isStatic.value || formItemStaticSchema(props.schema)) return []
  const nodes: SchemaObject[] = []
  const option = optionText.value
    ? [{ type: 'tpl', tpl: optionText.value, inline: true, className: 'vamis-switch-option' } as SchemaObject]
    : []
  if (optionAtLeft.value) nodes.push(...option)
  const node = textNode.value
  if (!node) nodes.push({ type: 'tpl', tpl: checked.value ? '开' : '关', inline: true })
  else if (node.kind === 'text') nodes.push({ type: 'tpl', tpl: node.text, inline: true })
  else if (node.kind === 'schema') nodes.push(node.schema)
  else nodes.push(...node.nodes)
  if (!optionAtLeft.value) nodes.push(...option)
  return nodes
})
const formItemSchema = computed(() => {
  if (!isStatic.value) return { ...props.schema, static: false }
  if (formItemStaticSchema(props.schema)) return props.schema
  return { ...props.schema, staticSchema: staticNodes.value }
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

/** 返回最终展示的 checked：事件被 preventDefault 时保持原值。 */
async function onToggle(nextChecked: boolean): Promise<boolean> {
  if (locked.value) return checked.value
  const next = checkboxWriteValue(nextChecked, valueSchema.value)
  const event = await emitChange(next)
  if (event.prevented) return checked.value
  write(next)
  return nextChecked
}

async function onNativeChange(ev: Event) {
  const el = ev.target as HTMLInputElement
  const accepted = await onToggle(el.checked)
  if (el.checked !== accepted) el.checked = accepted
}

function setData(values: Record<string, unknown>) {
  const next = checkboxSetDataValue(values, fieldName.value)
  if (next !== undefined) write(next)
}

async function doAction(raw: unknown) {
  const action = raw as { actionType?: string; value?: unknown; args?: { value?: unknown } }
  const type = action?.actionType
  if (type === 'clear') {
    write(checkboxClearValue())
    return
  }
  if (type === 'reset') {
    write(checkboxResetValue(valueSchema.value, pristine))
    return
  }
  if (type === 'setValue') {
    write(action.args?.value ?? action.value)
  }
}

function makeApi(name: string, id?: string) {
  return {
    name,
    id,
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
  scopedId ? makeApi(scopedId, scopedId) : null,
  scopedName && scopedName !== scopedId ? makeApi(scopedName) : null,
].filter(Boolean) as ReturnType<typeof makeApi>[]
for (const api of apis) scoped?.register(api)
onBeforeUnmount(() => {
  for (const api of apis) scoped?.unregister(api)
})
</script>

<template>
  <FormItem :schema="formItemSchema">
    <div class="vamis-switch-control">
      <span v-if="optionText && optionAtLeft" class="vamis-switch-option">{{ optionText }}</span>
      <label
        class="vamis-switch"
        :class="{ 'is-checked': checked, 'is-disabled': locked, 'vamis-switch--sm': small }"
      >
        <input
          class="vamis-switch__input"
          type="checkbox"
          :checked="checked"
          :disabled="locked"
          @change="onNativeChange"
        />
        <span class="vamis-switch__text">
          <template v-if="textNode?.kind === 'text'">{{ textNode.text }}</template>
          <SchemaRenderer
            v-else-if="textNode?.kind === 'schema'"
            :schema="textNode.schema"
            :extra-data="data"
          />
          <template v-else-if="textNode?.kind === 'nodes'">
            <SchemaRenderer
              v-for="(node, i) in textNode.nodes"
              :key="i"
              :schema="node"
              :extra-data="data"
            />
          </template>
        </span>
        <span class="vamis-switch__slider" aria-hidden="true"></span>
        <span v-if="loadingNow" class="vamis-switch__spinner" aria-hidden="true">
          <span class="vamis-switch__spinner-icon"></span>
        </span>
      </label>
      <span v-if="optionText && !optionAtLeft" class="vamis-switch-option">{{ optionText }}</span>
    </div>
  </FormItem>
</template>
