<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const steps = computed(() => (props.schema.steps || props.schema.options || []) as SchemaObject[])
const current = computed(() => Number(props.schema.value ?? props.schema.current ?? 0))
</script>

<template>
  <ol class="flex flex-wrap gap-2">
    <li
      v-for="(step, i) in steps"
      :key="i"
      class="flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
      :class="i === current ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground'"
    >
      <span>{{ i + 1 }}</span>
      <span>{{ step.title || step.label || `步骤 ${i + 1}` }}</span>
    </li>
  </ol>
</template>
