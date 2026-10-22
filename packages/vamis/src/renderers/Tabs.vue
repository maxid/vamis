<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vamis/ui'

const props = defineProps<{ schema: SchemaObject }>()
const tabs = computed(() => (props.schema.tabs || []) as SchemaObject[])
const defaultValue = computed(() => String(tabs.value[0]?.key || tabs.value[0]?.title || 0))
</script>

<template>
  <Tabs :default-value="defaultValue">
    <TabsList>
      <TabsTrigger
        v-for="(tab, i) in tabs"
        :key="tab.key || i"
        :value="String(tab.key || tab.title || i)"
      >
        {{ tab.title || `Tab ${i + 1}` }}
      </TabsTrigger>
    </TabsList>
    <TabsContent
      v-for="(tab, i) in tabs"
      :key="'c' + i"
      :value="String(tab.key || tab.title || i)"
      class="pt-3"
    >
      <SchemaRenderer v-for="(node, j) in asArray(tab.body ?? tab.tab)" :key="j" :schema="node" />
    </TabsContent>
  </Tabs>
</template>
