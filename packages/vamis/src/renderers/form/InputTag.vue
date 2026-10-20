<script setup lang="ts">
import { computed, ref } from 'vue'
import { Badge, Button, Input } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import { dumpJoined, normalizeOptions, parseJoined } from '../../options'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const draft = ref('')

const joinValues = computed(() => props.schema.joinValues !== false)
const max = computed(() => Number(props.schema.max || 0))
const options = computed(() => normalizeOptions(props.schema.options))

const tags = computed({
  get: () =>
    parseJoined(props.schema.name ? form?.getValue(props.schema.name) : '', true, joinValues.value).map((item) =>
      String(item),
    ),
  set: (values: string[]) => {
    if (!props.schema.name) return
    form?.setValue(props.schema.name, dumpJoined(values, true, joinValues.value))
  },
})

function add(raw?: string) {
  const text = String(raw ?? draft.value).trim()
  if (!text) return
  const pieces = props.schema.enableBatchAdd
    ? text.split(String(props.schema.separator || ',')).map((item) => item.trim()).filter(Boolean)
    : [text]
  const next = [...tags.value]
  for (const piece of pieces) {
    if (props.schema.maxTagLength && piece.length > Number(props.schema.maxTagLength)) continue
    if (next.includes(piece)) continue
    if (max.value && next.length >= max.value) break
    next.push(piece)
  }
  tags.value = next
  draft.value = ''
}

function remove(index: number) {
  tags.value = tags.value.filter((_, i) => i !== index)
}

const suggestions = computed(() => {
  const q = draft.value.trim().toLowerCase()
  return options.value
    .map((item) => String(item.value ?? item.label))
    .filter((item) => item && !tags.value.includes(item) && (!q || item.toLowerCase().includes(q)))
    .slice(0, 8)
})
</script>

<template>
  <FormItem :schema="schema">
    <div class="rounded-md border px-2 py-1.5">
      <div class="flex flex-wrap items-center gap-1">
        <Badge v-for="(tag, i) in tags" :key="tag + i" variant="secondary" class="gap-1">
          {{ tag }}
          <button type="button" class="text-xs" :disabled="disabled" @click="remove(i)">×</button>
        </Badge>
        <Input
          v-model="draft"
          class="h-7 min-w-24 flex-1 border-0 shadow-none focus-visible:ring-0"
          :placeholder="schema.placeholder || '回车添加'"
          :disabled="disabled"
          @keydown.enter.prevent="add()"
        />
      </div>
      <div v-if="suggestions.length" class="mt-1 flex flex-wrap gap-1 border-t pt-1">
        <Button
          v-for="item in suggestions"
          :key="item"
          type="button"
          size="sm"
          variant="ghost"
          class="h-6 px-2 text-xs"
          :disabled="disabled"
          @click="add(item)"
        >
          {{ item }}
        </Button>
      </div>
    </div>
  </FormItem>
</template>
