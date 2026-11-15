<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button, VamisCaret } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useFieldValue, useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import { dumpJoined, normalizeOptions, optionValuesEqual, parseJoined, type OptionItem } from '../../options'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const fieldApi = useFieldValue()
const open = ref(false)
const stack = ref<OptionItem[][]>([])
const path = ref<OptionItem[]>([])
const tree = computed(() => normalizeOptions(props.schema.options))
const columns = computed(() => [tree.value, ...stack.value].filter((col) => col?.length))
const selected = computed({
  get: () => parseJoined(props.schema.name ? fieldApi.getValue(props.schema.name) : '', false, true),
  set: (values: unknown[]) => props.schema.name && fieldApi.setValue(props.schema.name, dumpJoined(values, false, true)),
})
const label = computed(() => {
  if (path.value.length) return path.value.map((item) => item.label).join(' / ')
  const value = selected.value[0]
  return value == null || value === '' ? props.schema.placeholder || '请选择' : String(value)
})

function pick(item: OptionItem, depth: number) {
  path.value = [...path.value.slice(0, depth), item]
  if (item.children?.length) {
    stack.value = [...stack.value.slice(0, depth), item.children]
    return
  }
  selected.value = [item.value]
  open.value = false
}

function isActive(item: OptionItem, depth: number) {
  return path.value[depth] ? optionValuesEqual(path.value[depth].value, item.value) : optionValuesEqual(selected.value[0], item.value)
}

function toggle() {
  open.value = !open.value
  if (open.value && !stack.value.length) stack.value = []
}
</script>

<template>
  <FormItem :schema="schema">
    <div class="relative">
      <Button type="button" variant="outline" class="w-full justify-between" :disabled="disabled" @click="toggle">
        <span class="truncate">{{ label }}</span>
        <span class="vamis-nested-select__hint">级联</span>
      </Button>
      <div v-if="open" class="vamis-nested-select__menu">
        <ul v-for="(col, depth) in columns" :key="depth" class="vamis-nested-select__col">
          <li v-for="item in col" :key="String(item.value)">
            <button
              type="button"
              class="vamis-nested-select__option"
              :class="isActive(item, depth) ? 'is-active' : ''"
              @click="pick(item, depth)"
            >
              <span>{{ item.label }}</span>
              <VamisCaret v-if="item.children?.length" variant="tree" class="vamis-nested-select__caret" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  </FormItem>
</template>
