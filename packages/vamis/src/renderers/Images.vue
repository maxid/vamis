<script setup lang="ts">
import { computed } from 'vue'
import { asArray, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const list = computed(() => {
  const source = props.schema.source
  if (typeof source === 'string' && source.includes('$')) {
    const key = source.replace(/^\$\{?|\}$/g, '')
    return asArray(props.data?.[key] as any)
  }
  return asArray(props.schema.options || props.schema.list || props.schema.value)
})
function srcOf(item: unknown) {
  if (typeof item === 'string') return item
  if (item && typeof item === 'object') return String((item as any).src || (item as any).url || (item as any).image || '')
  return ''
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <img
      v-for="(item, i) in list"
      :key="i"
      :src="srcOf(item)"
      class="h-20 w-20 rounded-md border object-cover"
      alt=""
    />
    <p v-if="!list.length" class="text-xs text-muted-foreground">暂无图片</p>
  </div>
</template>
