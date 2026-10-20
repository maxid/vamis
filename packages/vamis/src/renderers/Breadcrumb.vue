<script setup lang="ts">
import { computed } from 'vue'
import { asArray, filterTpl, useEnv, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const env = useEnv()
const items = computed(() => asArray(props.schema.items || props.schema.links || props.schema.options) as SchemaObject[])
</script>

<template>
  <ol class="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
    <li v-for="(item, i) in items" :key="i" class="flex items-center gap-1">
      <span v-if="i">/</span>
      <button
        v-if="item.href || item.to"
        type="button"
        class="hover:text-foreground"
        @click="env.jumpTo(filterTpl(item.href || item.to, data))"
      >
        {{ filterTpl(item.label || item.title, data) }}
      </button>
      <span v-else :class="i === items.length - 1 ? 'text-foreground' : ''">
        {{ filterTpl(item.label || item.title, data) }}
      </span>
    </li>
  </ol>
</template>
