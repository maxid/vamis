<script setup lang="ts">
import { computed, ref } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const open = ref(props.schema.collapsed === false || props.schema.active === true)
const body = computed(() => asArray(props.schema.body))
const title = computed(() => props.schema.header || props.schema.title || props.schema.label || '折叠')
</script>

<template>
  <details class="rounded-md border bg-card" :open="open" @toggle="open = ($event.target as HTMLDetailsElement).open">
    <summary class="cursor-pointer px-3 py-2 text-sm font-medium">{{ title }}</summary>
    <div class="space-y-2 border-t px-3 py-3">
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </div>
  </details>
</template>
