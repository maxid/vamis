<script setup lang="ts">
import { computed } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import Transfer from './Transfer.vue'
import { normalizeOptions } from '../../options'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const tabs = computed(() => {
  const raw = props.schema.options || []
  if (Array.isArray(raw) && raw.some((item: any) => item?.children)) {
    return raw.map((item: any, i: number) => ({
      title: item.label || `分组 ${i + 1}`,
      options: item.children || [],
    }))
  }
  return [{ title: '全部', options: normalizeOptions(raw) }]
})
</script>

<template>
  <Tabs :default-value="tabs[0]?.title">
    <TabsList>
      <TabsTrigger v-for="tab in tabs" :key="tab.title" :value="tab.title">{{ tab.title }}</TabsTrigger>
    </TabsList>
    <TabsContent v-for="tab in tabs" :key="tab.title" :value="tab.title">
      <Transfer :schema="{ ...schema, options: tab.options }" :disabled="disabled" />
    </TabsContent>
  </Tabs>
</template>
