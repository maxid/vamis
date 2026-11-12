<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  SchemaRenderer,
  filterTpl,
  isApiOutdated,
  isEffectiveApi,
  requestApi,
  resolveClassName,
  resolveValue,
  useEnv,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const env = useEnv()
const remoteMap = ref<Record<string, unknown> | null>(null)

const data = computed(() => ({ ...(props.schema.data as Record<string, any> | undefined || {}), ...(props.data || {}) }))
const name = computed(() => (props.schema.name ? String(props.schema.name) : ''))
const valueField = computed(() => String(props.schema.valueField || 'value'))
const labelField = computed(() =>
  props.schema.labelField == null ? '' : String(props.schema.labelField),
)

/** map / source 都归一成 key → label 的字典。 */
function normalizeMap(raw: unknown): Record<string, unknown> {
  const map: Record<string, unknown> = {}
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue
      const keys = Object.keys(entry as Record<string, unknown>).filter((key) => key !== '$$id')
      if (keys.length === 1) {
        map[keys[0]] = (entry as Record<string, unknown>)[keys[0]]
      } else if (keys.length > 1) {
        const key = (entry as Record<string, unknown>)[valueField.value]
        if (key != null) map[String(key)] = entry
      }
    }
    return map
  }
  if (raw && typeof raw === 'object') return { ...(raw as Record<string, unknown>) }
  return map
}

function resolveVariableSource(source: string): unknown {
  let token = source.trim()
  if (!token.startsWith('$')) return undefined
  // Amis `$${zidian}`：`$$` 表示取原始变量值。
  if (token.startsWith('$$')) token = token.slice(1)
  const resolved = resolveValue(token, data.value)
  return resolved === token ? undefined : resolved
}

const variableMap = computed(() => {
  const source = props.schema.source
  if (typeof source !== 'string' || !source.trim().startsWith('$')) return undefined
  return normalizeMap(resolveVariableSource(source))
})

const map = computed(() => {
  if (variableMap.value) return variableMap.value
  if (remoteMap.value) return remoteMap.value
  return normalizeMap(props.schema.map ?? props.schema.mapping)
})

const rawValue = computed(() => {
  const explicit = props.schema.defaultValue
  const current = props.schema.value !== undefined ? props.schema.value : name.value ? data.value[name.value] : undefined
  if (explicit && typeof explicit === 'string' && explicit === current) {
    return resolveValue(explicit, data.value)
  }
  return current
})
const keys = computed(() => (Array.isArray(rawValue.value) ? rawValue.value : [rawValue.value]))

function match(key: unknown): { matched: boolean; label: unknown } {
  const mapValue = map.value
  const current = typeof key === 'string' ? key.trim() : key
  if (typeof current === 'undefined') return { matched: false, label: undefined }
  if (current != null && Object.prototype.hasOwnProperty.call(mapValue, String(current))) {
    return { matched: true, label: mapValue[String(current)] }
  }
  if (current === true && Object.prototype.hasOwnProperty.call(mapValue, '1')) {
    return { matched: true, label: mapValue['1'] }
  }
  if (current === false && Object.prototype.hasOwnProperty.call(mapValue, '0')) {
    return { matched: true, label: mapValue['0'] }
  }
  if (Object.prototype.hasOwnProperty.call(mapValue, '*')) {
    return { matched: true, label: mapValue['*'] }
  }
  return { matched: false, label: undefined }
}

function isSchemaObject(value: unknown): value is SchemaObject {
  return !!value && typeof value === 'object' && !Array.isArray(value) && typeof (value as SchemaObject).type === 'string'
}

/** label 为字符串/HTML 时走 tpl；对象按 labelField / label / schema 三种情况处理。 */
function labelOf(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value
  const object = value as Record<string, unknown>
  if (labelField.value) return object[labelField.value]
  if (typeof object.type === 'string') return object
  return object.label
}

function itemData(value: unknown) {
  const patch =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : { item: value }
  return { ...data.value, ...patch }
}

function tagFriendly(schema: SchemaObject): SchemaObject {
  // Vamis Tag 从 value/tags 取值；Amis mapping 的 tag 映射用 label 表达，这里把它落到 value。
  if (schema.type === 'tag' && schema.label != null && schema.value == null) {
    return { ...schema, value: schema.label }
  }
  return schema
}

function labelSchema(label: unknown, key: unknown): SchemaObject {
  if (isSchemaObject(label)) {
    const schema = tagFriendly({ ...label })
    if (name.value && schema.name == null) schema.name = name.value
    if (schema.type === 'tpl' && schema.value == null) schema.value = null
    return schema
  }
  if (label && typeof label === 'object' && !Array.isArray(label)) {
    const object = label as Record<string, unknown>
    return { type: 'tpl', tpl: object.label != null ? object.label : object }
  }
  return { type: 'tpl', tpl: label == null ? '' : String(label) }
}

const itemSchema = computed(() => props.schema.itemSchema)
const itemSchemaNode = computed<SchemaObject>(() => {
  const raw = itemSchema.value
  if (typeof raw === 'string') return { type: 'tpl', tpl: raw }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return tagFriendly(raw as SchemaObject)
  return { type: 'tpl', tpl: '' }
})
const outerClass = computed(() => resolveClassName(props.schema.className, data.value))

async function loadSource() {
  const source = props.schema.source
  if (!source || typeof source === 'string' && source.trim().startsWith('$')) return
  if (!isEffectiveApi(source, data.value)) return
  try {
    const result = await requestApi(source, { env, data: data.value, reason: 'init' })
    if (result.skipped || !result.ok) return
    const payload = (result.data || {}) as Record<string, unknown>
    const options = Array.isArray(payload)
      ? payload
      : payload.options ?? payload.items ?? payload.records ?? payload
    remoteMap.value = normalizeMap(options)
  } catch {
    /* 字典拉取失败保持占位 */
  }
}

onMounted(() => void loadSource())
watch(
  () => [props.schema.source, data.value] as const,
  (curr, prev) => {
    if (!prev) return
    if (typeof curr[0] === 'string' && curr[0].trim().startsWith('$')) return
    if (isApiOutdated(prev[0], curr[0], prev[1], curr[1])) void loadSource()
  },
  { deep: true },
)
</script>

<template>
  <span class="vamis-mapping" :class="outerClass" :style="schema.style">
    <template v-for="(key, index) in keys" :key="index">
      <span v-if="match(key).matched" class="vamis-mapping__item">
        <SchemaRenderer
          v-if="itemSchema"
          :schema="itemSchemaNode"
          :extra-data="itemData(match(key).label)"
        />
        <SchemaRenderer
          v-else
          :schema="labelSchema(labelOf(match(key).label), key)"
          :extra-data="data"
        />
      </span>
      <span v-else class="vamis-mapping__placeholder text-muted-foreground">{{ schema.placeholder || '-' }}</span>
    </template>
  </span>
</template>
