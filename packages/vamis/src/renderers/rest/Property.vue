<script setup lang="ts">
import { computed } from 'vue'
import { filterTpl, type SchemaObject } from '@vamis/core'
import { Card, CardContent, CardHeader, CardTitle } from '@vamis/ui'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const items = computed(() =>
  (props.schema.items || []).map((item: any) => ({
    label: filterTpl(item.label, props.data),
    content: filterTpl(item.content ?? item.value ?? '', props.data),
  })),
)
const columns = computed(() => Number(props.schema.column || 2))
</script>

<template>
  <Card>
    <CardHeader v-if="schema.title">
      <CardTitle class="vamis-property__title">{{ schema.title }}</CardTitle>
    </CardHeader>
    <CardContent
      class="vamis-property__body"
      :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }"
    >
      <div v-for="(item, i) in items" :key="i" class="space-y-1">
        <div class="vamis-property__label">{{ item.label }}</div>
        <div class="vamis-property__value">{{ item.content || '-' }}</div>
      </div>
    </CardContent>
  </Card>
</template>
