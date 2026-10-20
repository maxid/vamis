<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, filterTpl, type SchemaObject } from '@vamis/core'
import { Card, CardContent } from '@vamis/ui'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const body = computed(() => asArray(props.schema.body))
const actions = computed(() => asArray(props.schema.actions || props.schema.buttons))
const title = computed(() => filterTpl(props.schema.title || props.schema.itemTitle || '', props.data))
const subTitle = computed(() => filterTpl(props.schema.subTitle || props.schema.desc || '', props.data))
</script>

<template>
  <Card>
    <CardContent class="flex items-start justify-between gap-3 p-4">
      <div class="space-y-1">
        <p class="text-sm font-medium">{{ title || '列表项' }}</p>
        <p v-if="subTitle" class="text-xs text-muted-foreground">{{ subTitle }}</p>
        <div v-if="body.length" class="space-y-1 pt-1">
          <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
        </div>
      </div>
      <div v-if="actions.length" class="flex shrink-0 gap-1">
        <SchemaRenderer v-for="(node, i) in actions" :key="'a' + i" :schema="node" />
      </div>
    </CardContent>
  </Card>
</template>
