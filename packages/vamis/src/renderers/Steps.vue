<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const steps = computed(() => (props.schema.steps || props.schema.options || []) as SchemaObject[])
const current = computed(() => Number(props.schema.value ?? props.schema.current ?? 0))
</script>

<template>
  <ol class="vamis-steps">
    <li
      v-for="(step, i) in steps"
      :key="i"
      class="vamis-steps__item"
      :class="i === current ? 'is-active' : ''"
    >
      <span>{{ i + 1 }}</span>
      <span>{{ step.title || step.label || `步骤 ${i + 1}` }}</span>
    </li>
  </ol>
</template>
