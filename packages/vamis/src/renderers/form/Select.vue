<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
} from '@vamis/ui'
import {
  isApiOutdated,
  isEffectiveApi,
  requestApi,
  useData,
  useEnv,
  useScoped,
  type SchemaObject,
} from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import {
  dumpJoined,
  flattenOptions,
  normalizeOptions,
  optionValuesEqual,
  parseJoined,
  type OptionItem,
} from '../../options'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const env = useEnv()
const scoped = useScoped()
const data = useData()
const remote = ref<OptionItem[]>([])

const multiple = computed(() => !!(props.schema.multiple || props.schema.type === 'multi-select'))
const joinValues = computed(() => props.schema.joinValues !== false)

const options = computed(() => {
  const local = normalizeOptions(props.schema.options || remote.value)
  return flattenOptions(local)
})

function isVariableSource(source: unknown): source is string {
  return typeof source === 'string' && source.includes('$') && !source.includes('/') && !/^[a-z]+:/i.test(source)
}

async function loadSource() {
  const source = props.schema.source
  if (!source) return
  if (isVariableSource(source)) {
    const key = source.replace(/^\$\{?|\}$/g, '')
    remote.value = normalizeOptions(data.value[key])
    return
  }
  if (!isEffectiveApi(source as any, data.value)) return
  try {
    const result = await requestApi(source as any, { env, data: data.value, reason: 'init' })
    if (result.skipped || !result.ok) return
    const list = result.data?.options || result.data?.items || result.data
    remote.value = normalizeOptions(list)
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '选项加载失败')
  }
}

onMounted(loadSource)
watch(
  () => [props.schema.source, data.value] as const,
  (curr, prev) => {
    if (!prev) return
    if (isApiOutdated(prev[0] as any, curr[0] as any, prev[1], curr[1])) void loadSource()
  },
)

const selectApi = {
  get name() {
    return String(props.schema.name || props.schema.id || '')
  },
  reload: loadSource,
}
scoped?.register(selectApi)
onBeforeUnmount(() => scoped?.unregister(selectApi))

const selected = computed({
  get: () => parseJoined(props.schema.name ? form?.getValue(props.schema.name) : '', multiple.value, joinValues.value),
  set: (values: unknown[]) => {
    if (!props.schema.name) return
    form?.setValue(props.schema.name, dumpJoined(values, multiple.value, joinValues.value))
  },
})

const singleValue = computed({
  get: () => {
    const current = selected.value[0]
    return current == null ? undefined : String(current)
  },
  set: (value: string) => {
    selected.value = value == null || value === '' ? [] : [value]
  },
})

function toggle(option: OptionItem, checked: boolean) {
  const current = selected.value.filter((item) => !optionValuesEqual(item, option.value))
  selected.value = checked ? [...current, option.value] : current
}
</script>

<template>
  <FormItem :schema="schema">
    <div v-if="multiple" class="max-h-48 space-y-1 overflow-auto rounded-md border p-2">
      <label
        v-for="opt in options"
        :key="String(opt.value)"
        class="flex items-center gap-2 text-sm"
      >
        <Checkbox
          :model-value="selected.some((item) => optionValuesEqual(item, opt.value))"
          :disabled="disabled || opt.disabled"
          @update:model-value="toggle(opt, $event === true)"
        />
        <span>{{ opt.label }}</span>
      </label>
      <p v-if="!options.length" class="text-xs text-muted-foreground">暂无选项</p>
    </div>
    <Select
      v-else
      :model-value="singleValue"
      :disabled="disabled"
      @update:model-value="singleValue = String($event ?? '')"
    >
      <SelectTrigger class="w-full">
        <SelectValue :placeholder="schema.placeholder || '请选择'" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="opt in options" :key="String(opt.value)" :value="String(opt.value)">
          {{ opt.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </FormItem>
</template>
