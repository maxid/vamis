<script setup lang="ts">
import { computed } from 'vue'
import { filterTpl, SchemaRenderer, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const text = computed(() => {
  if (props.schema.tpl) return filterTpl(props.schema.tpl, props.data)
  const name = props.schema.name
  if (name) return String(props.data?.[name] ?? '')
  return String(props.schema.value ?? '')
})
</script>

<template>
  <SchemaRenderer v-if="schema.body" :schema="schema.body" />
  <span v-else>{{ text }}</span>
</template>
