<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import { dumpJoined, normalizeOptions, optionValuesEqual, parseJoined, type OptionItem } from '../../options'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const open = ref(false)
const stack = ref<OptionItem[][]>([])
const path = ref<OptionItem[]>([])
const tree = computed(() => normalizeOptions(props.schema.options))
const columns = computed(() => [tree.value, ...stack.value].filter((col) => col?.length))
const selected = computed({
  get: () => parseJoined(props.schema.name ? form?.getValue(props.schema.name) : '', false, true),
  set: (values: unknown[]) => props.schema.name && form?.setValue(props.schema.name, dumpJoined(values, false, true)),
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
        <span class="text-xs text-muted-foreground">级联</span>
      </Button>
      <div v-if="open" class="absolute z-20 mt-1 flex max-h-56 overflow-auto rounded-md border bg-popover shadow-md">
        <ul v-for="(col, depth) in columns" :key="depth" class="min-w-32 border-r last:border-r-0 py-1 text-sm">
          <li v-for="item in col" :key="String(item.value)">
            <button
              type="button"
              class="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-accent"
              :class="isActive(item, depth) ? 'bg-accent' : ''"
              @click="pick(item, depth)"
            >
              <span>{{ item.label }}</span>
              <span v-if="item.children?.length" class="text-xs text-muted-foreground">›</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </FormItem>
</template>
