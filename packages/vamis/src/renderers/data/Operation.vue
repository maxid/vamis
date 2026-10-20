<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, any>
}>()

const buttons = computed(() =>
  asArray(props.schema.buttons || props.schema.body).map((node) => {
    const button = node as SchemaObject
    return {
      type: 'button',
      size: button.size || 'sm',
      ...button,
    }
  }),
)
</script>

<template>
  <div class="flex flex-wrap items-center gap-1">
    <SchemaRenderer v-for="(btn, i) in buttons" :key="i" :schema="btn" />
    <span v-if="!buttons.length" class="text-xs text-muted-foreground">{{ schema.placeholder || '' }}</span>
  </div>
</template>
