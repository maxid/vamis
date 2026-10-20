<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import {
  dumpJoined,
  flattenOptions,
  normalizeOptions,
  optionValuesEqual,
  parseJoined,
} from '../../options'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const options = computed(() => flattenOptions(normalizeOptions(props.schema.options)))
const selected = computed({
  get: () => parseJoined(props.schema.name ? form?.getValue(props.schema.name) : '', true, props.schema.joinValues !== false),
  set: (values: unknown[]) => props.schema.name && form?.setValue(props.schema.name, dumpJoined(values, true, props.schema.joinValues !== false)),
})
const left = computed(() => options.value.filter((item) => !selected.value.some((value) => optionValuesEqual(value, item.value))))
const right = computed(() => options.value.filter((item) => selected.value.some((value) => optionValuesEqual(value, item.value))))

function add(value: unknown) {
  selected.value = [...selected.value, value]
}
function remove(value: unknown) {
  selected.value = selected.value.filter((item) => !optionValuesEqual(item, value))
}
function addAll() {
  selected.value = options.value.map((item) => item.value)
}
function clear() {
  selected.value = []
}
</script>

<template>
  <FormItem :schema="schema">
    <div class="grid gap-2 sm:grid-cols-[1fr_auto_1fr]">
      <ul class="max-h-48 overflow-auto rounded-md border p-2 text-sm">
        <li v-for="item in left" :key="String(item.value)">
          <button type="button" class="w-full rounded px-2 py-1 text-left hover:bg-accent" :disabled="disabled" @click="add(item.value)">
            {{ item.label }}
          </button>
        </li>
        <li v-if="!left.length" class="px-2 py-4 text-xs text-muted-foreground">无候选</li>
      </ul>
      <div class="flex flex-col justify-center gap-1">
        <Button type="button" size="sm" variant="outline" :disabled="disabled" @click="addAll">全部 &gt;</Button>
        <Button type="button" size="sm" variant="outline" :disabled="disabled" @click="clear">&lt; 清空</Button>
      </div>
      <ul class="max-h-48 overflow-auto rounded-md border p-2 text-sm">
        <li v-for="item in right" :key="String(item.value)">
          <button type="button" class="w-full rounded px-2 py-1 text-left hover:bg-accent" :disabled="disabled" @click="remove(item.value)">
            {{ item.label }}
          </button>
        </li>
        <li v-if="!right.length" class="px-2 py-4 text-xs text-muted-foreground">未选择</li>
      </ul>
    </div>
  </FormItem>
</template>
