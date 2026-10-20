<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import { dumpJoined, normalizeOptions, optionValuesEqual, parseJoined, type OptionItem } from '../../options'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const joinValues = computed(() => props.schema.joinValues !== false)
const tree = computed(() => normalizeOptions(props.schema.options))

const selected = computed({
  get: () => parseJoined(props.schema.name ? form?.getValue(props.schema.name) : '', true, joinValues.value),
  set: (values: unknown[]) => {
    if (!props.schema.name) return
    form?.setValue(props.schema.name, dumpJoined(values, true, joinValues.value))
  },
})

const path = ref<unknown[]>([])

function optionsAt(depth: number): OptionItem[] {
  if (depth === 0) return tree.value
  let current = tree.value
  for (let i = 0; i < depth; i++) {
    const value = path.value[i]
    const node = current.find((item) => optionValuesEqual(item.value, value))
    current = node?.children || []
  }
  return current
}

const levels = computed(() => {
  const cols: OptionItem[][] = []
  let depth = 0
  while (true) {
    const opts = optionsAt(depth)
    if (!opts.length) break
    cols.push(opts)
    if (path.value[depth] == null || path.value[depth] === '') break
    depth += 1
    if (depth > 8) break
  }
  return cols
})

watch(
  () => selected.value.slice(),
  (values) => {
    path.value = [...values]
  },
  { immediate: true },
)

function pick(depth: number, value: string) {
  const next = [...path.value.slice(0, depth), value]
  path.value = next
  selected.value = next
}
</script>

<template>
  <FormItem :schema="schema">
    <div class="flex flex-wrap gap-2">
      <Select
        v-for="(opts, depth) in levels"
        :key="depth"
        :model-value="path[depth] == null ? undefined : String(path[depth])"
        :disabled="disabled"
        @update:model-value="pick(depth, String($event ?? ''))"
      >
        <SelectTrigger class="min-w-36">
          <SelectValue :placeholder="schema.placeholder || '请选择'" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="opt in opts" :key="String(opt.value)" :value="String(opt.value)">
            {{ opt.label }}
          </SelectItem>
        </SelectContent>
      </Select>
      <p v-if="!tree.length" class="text-xs text-muted-foreground">暂无选项</p>
    </div>
  </FormItem>
</template>
