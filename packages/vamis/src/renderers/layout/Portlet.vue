<script setup lang="ts">
import { computed, ref } from 'vue'
import { SchemaRenderer, asArray, filterTpl, type SchemaObject } from '@vamis/core'
import { Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger } from '@vamis/ui'
import { tabKey } from './utils'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const tabs = computed(() => asArray(props.schema.tabs) as SchemaObject[])
const defaultValue = computed(() => tabKey(tabs.value[0] || {}, 0))
const current = ref(defaultValue.value)
const hideHeader = computed(() => props.schema.hideHeader === true)
const toolbar = computed(() => asArray(props.schema.toolbar) as SchemaObject[])
const activeTab = computed(
  () => tabs.value.find((tab, i) => tabKey(tab, i) === current.value) || tabs.value[0],
)
const tabToolbar = computed(() => asArray(activeTab.value?.toolbar) as SchemaObject[])
const description = computed(() => filterTpl(props.schema.description || '', props.data))

function tabBody(tab: SchemaObject) {
  if (tab.body != null) return asArray(tab.body)
  if (tab.tab != null) return asArray(tab.tab)
  return tab.type ? [tab] : []
}
</script>

<template>
  <Card :class="schema.className">
    <Tabs v-model="current" :default-value="defaultValue">
      <div v-if="!hideHeader" class="flex flex-wrap items-center justify-between gap-2 px-6 pt-4">
        <div class="flex min-w-0 flex-wrap items-center gap-3">
          <TabsList>
            <TabsTrigger v-for="(tab, i) in tabs" :key="tabKey(tab, i)" :value="tabKey(tab, i)">
              {{ tab.title || tab.label || `Tab ${i + 1}` }}
            </TabsTrigger>
          </TabsList>
          <p v-if="description" class="text-xs text-muted-foreground">{{ description }}</p>
        </div>
        <div v-if="toolbar.length || tabToolbar.length" class="flex flex-wrap gap-2">
          <SchemaRenderer v-for="(node, i) in toolbar" :key="'g' + i" :schema="node" />
          <SchemaRenderer v-for="(node, i) in tabToolbar" :key="'t' + i" :schema="node" />
        </div>
      </div>
      <CardContent class="space-y-3 pt-4">
        <TabsContent v-for="(tab, i) in tabs" :key="'c' + i" :value="tabKey(tab, i)">
          <SchemaRenderer v-for="(node, j) in tabBody(tab)" :key="j" :schema="node" />
        </TabsContent>
      </CardContent>
    </Tabs>
  </Card>
</template>
