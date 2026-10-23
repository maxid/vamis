<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject }>()
const ACTION_TYPES = new Set(['action', 'button', 'submit', 'reset'])
const body = computed(() =>
  asArray(props.schema.body || props.schema.controls).map((node) => {
    if (!node || typeof node === 'string') return { type: 'tpl', tpl: String(node), label: false as const }
    const item = node as SchemaObject
    if (ACTION_TYPES.has(String(item.type))) return item
    return { ...item, label: false as const }
  }),
)
</script>

<template>
  <FormItem :schema="schema">
    <div class="flex items-start overflow-hidden rounded-md border [&_.grid]:py-0">
      <div
        v-for="(node, i) in body"
        :key="i"
        class="min-w-0 flex-1 border-r last:border-r-0 px-1"
      >
        <SchemaRenderer :schema="node" />
      </div>
    </div>
  </FormItem>
</template>
