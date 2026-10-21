<script setup lang="ts">
import { computed, ref } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'
import { Button, levelToVariant } from '@vamis/ui'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const open = ref(false)
const buttons = computed(() => asArray(props.schema.buttons || props.schema.body))
</script>

<template>
  <div class="relative inline-block">
    <Button
      type="button"
      :variant="levelToVariant(schema.level)"
      :disabled="disabled"
      @click="open = !open"
    >
      {{ schema.label || schema.title || '更多' }}
      <span class="text-xs">▾</span>
    </Button>
    <div
      v-if="open"
      class="absolute z-40 mt-1 min-w-36 rounded-md border bg-popover p-1 shadow-md"
      @click="open = false"
    >
      <SchemaRenderer v-for="(node, i) in buttons" :key="i" :schema="node" />
    </div>
  </div>
</template>
