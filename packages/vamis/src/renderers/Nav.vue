<script setup lang="ts">
import { computed } from 'vue'
import { asArray, filterTpl, useEnv, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const env = useEnv()
const links = computed(() => asArray(props.schema.links || props.schema.body) as SchemaObject[])
const stacked = computed(() => props.schema.stacked !== false && props.schema.mode !== 'horizontal')

function onClick(link: SchemaObject) {
  const to = filterTpl(link.to || link.href || link.link || '', props.data)
  if (to) env.jumpTo(to)
}
</script>

<template>
  <nav :class="stacked ? 'flex flex-col gap-1' : 'flex flex-wrap gap-2'">
    <button
      v-for="(link, i) in links"
      :key="i"
      type="button"
      class="rounded-md px-3 py-1.5 text-left text-sm hover:bg-accent"
      :class="link.active ? 'bg-primary text-primary-foreground' : ''"
      @click="onClick(link)"
    >
      {{ filterTpl(link.label || link.title || '', data) }}
    </button>
  </nav>
</template>
