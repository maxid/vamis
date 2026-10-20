<script setup lang="ts">
import { computed, ref } from 'vue'
import { filterTpl, type SchemaObject } from '@vamis/core'
import { Button } from '@vamis/ui'
import { readValue } from './format'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const open = ref(false)
const limit = computed(() => Number(props.schema.limit || 36))
const text = computed(() =>
  filterTpl(readValue(props.schema, props.data) ?? props.schema.tpl ?? '', props.data),
)
const clipped = computed(() => !open.value && text.value.length > limit.value)
</script>

<template>
  <p class="text-sm">
    {{ clipped ? `${text.slice(0, limit)}…` : text }}
    <Button v-if="text.length > limit" type="button" variant="link" class="h-auto px-1" @click="open = !open">
      {{ open ? '收起' : '展开' }}
    </Button>
  </p>
</template>
