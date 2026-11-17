<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  createVamisEvent,
  eventEvalData,
  findOption,
  isEffectiveApi,
  isOptionsVariableSource,
  optionNeedsDefer,
  optionsDeferField,
  optionsFromPayload,
  requestApi,
  resolveDeferredOption,
  runOnEvent,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type SchemaApi,
  type SchemaObject,
} from '@vamis/core'
import { useFieldValue } from '../../formContext'
import FormItem from '../FormItem.vue'
import TreeBranch from './TreeBranch.vue'
import {
  dumpJoined,
  normalizeOptions,
  optionValuesEqual,
  parseJoined,
  type OptionItem,
} from '../../options'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const fieldApi = useFieldValue()
const data = useData()
const env = useEnv()
const scoped = useScoped()
const overlay = useOverlay()
const formApi = useFormApi()
const scope = useScope()
const query = ref('')
const localOptions = ref<OptionItem[] | null>(null)
const labelField = computed(() => String(props.schema.labelField || 'label'))
const valueField = computed(() => String(props.schema.valueField || 'value'))
const deferField = computed(() => optionsDeferField(props.schema))
const options = computed(() =>
  localOptions.value ?? normalizeOptions(props.schema.options, labelField.value, valueField.value),
)
const multiple = computed(() => !!props.schema.multiple)
const expanded = ref(new Map<OptionItem, boolean>())
const deferring = ref(new Set<OptionItem>())
const selected = computed({
  get: () =>
    parseJoined(props.schema.name ? fieldApi.getValue(props.schema.name) : '', multiple.value, props.schema.joinValues !== false),
  set: (values: unknown[]) =>
    props.schema.name && fieldApi.setValue(props.schema.name, dumpJoined(values, multiple.value, props.schema.joinValues !== false)),
})

watch(
  () => props.schema.options,
  () => {
    localOptions.value = null
    expanded.value = new Map()
    deferring.value = new Set()
  },
  { deep: true },
)

function matches(item: OptionItem): boolean {
  if (!query.value) return true
  if (item.label.toLowerCase().includes(query.value.toLowerCase())) return true
  return !!item.children?.some(matches)
}

const filteredOptions = computed(() => options.value.filter(matches))

function isExpanded(item: OptionItem) {
  if (optionNeedsDefer(item, deferField.value)) return false
  return expanded.value.get(item) ?? true
}

function isDeferring(item: OptionItem) {
  return deferring.value.has(item)
}

function toggleExpand(item: OptionItem) {
  if (props.disabled || item.disabled || isDeferring(item)) return
  if (optionNeedsDefer(item, deferField.value)) {
    void deferLoad(item)
    return
  }
  const next = new Map(expanded.value)
  next.set(item, !isExpanded(item))
  expanded.value = next
}

async function deferLoad(item: OptionItem) {
  const api = (item.deferApi || props.schema.deferApi || props.schema.source) as SchemaApi | undefined
  const ctx = { ...data.value, ...item }
  if (!api || isOptionsVariableSource(api) || !isEffectiveApi(api, ctx)) {
    env.notify('error', '请在选项中设置 deferApi，或在表单项中设置 deferApi，用来加载子选项')
    return
  }
  const pending = new Set(deferring.value)
  pending.add(item)
  deferring.value = pending
  try {
    const result = await requestApi(api, { env, data: ctx, reason: 'action' })
    if (result.skipped) return
    if (!result.ok) {
      env.notify('error', result.payload.msg || '选项加载失败')
      return
    }
    const next = resolveDeferredOption(
      options.value,
      item,
      optionsFromPayload(result.data).list,
      { labelField: labelField.value, valueField: valueField.value },
      deferField.value,
    )
    localOptions.value = next
    const loaded = findOption(next, item.value, valueField.value)
    if (loaded) {
      const nextExpanded = new Map(expanded.value)
      nextExpanded.set(loaded, true)
      expanded.value = nextExpanded
    }
    const name = props.schema.name ? String(props.schema.name) : ''
    const value = name ? fieldApi.getValue(name) : undefined
    const payload = {
      ...data.value,
      result: result.payload,
      items: next,
      value,
      ...(name ? { [name]: value } : {}),
    }
    const event = createVamisEvent('deferLoadFinished', payload)
    await runOnEvent(props.schema, 'deferLoadFinished', {
      env,
      data: eventEvalData(payload, event),
      scoped,
      overlay,
      form: formApi,
      scope: scope.value,
      event,
    })
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '选项加载失败')
  } finally {
    const done = new Set(deferring.value)
    done.delete(item)
    deferring.value = done
  }
}

function toggle(item: OptionItem) {
  if (props.disabled || item.disabled) return
  if (!multiple.value) {
    selected.value = [item.value]
    return
  }
  const exists = selected.value.some((value) => optionValuesEqual(value, item.value))
  selected.value = exists
    ? selected.value.filter((value) => !optionValuesEqual(value, item.value))
    : [...selected.value, item.value]
}

function checked(item: OptionItem) {
  return selected.value.some((value) => optionValuesEqual(value, item.value))
}
</script>

<template>
  <FormItem :schema="schema">
    <input
      v-if="schema.searchable"
      v-model="query"
      class="vamis-input-tree__search mb-2 w-full rounded-md border px-2 py-1"
      placeholder="搜索"
    />
    <div class="vamis-input-tree__control">
      <TreeBranch
        :nodes="filteredOptions"
        :checked="checked"
        :disabled="!!disabled"
        :expanded="(item) => !!query || isExpanded(item)"
        :deferring="isDeferring"
        :defer-field="deferField"
        @pick="toggle"
        @expand="toggleExpand"
      />
    </div>
  </FormItem>
</template>
