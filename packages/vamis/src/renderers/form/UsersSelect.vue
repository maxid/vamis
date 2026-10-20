<script setup lang="ts">
import { computed } from 'vue'
import Select from './Select.vue'
import type { SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const patched = computed(() => ({
  ...props.schema,
  searchable: true,
  options: props.schema.options?.length
    ? props.schema.options
    : [
        { label: '张三', value: 'u1' },
        { label: '李四', value: 'u2' },
        { label: '王五', value: 'u3' },
      ],
}))
</script>

<template>
  <Select :schema="patched" :disabled="disabled" />
</template>
