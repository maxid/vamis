<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../formContext'

const props = defineProps<{ schema: SchemaObject }>()
const form = useForm()
const total = computed(() => Number(props.schema.total || props.schema.lastPage || 5))
const page = computed({
  get: () => Number((props.schema.name && form?.getValue(props.schema.name)) || props.schema.value || props.schema.activePage || 1),
  set: (value) => {
    if (props.schema.name) form?.setValue(props.schema.name, value)
  },
})
</script>

<template>
  <div class="flex items-center gap-1">
    <Button type="button" size="sm" variant="outline" :disabled="page <= 1" @click="page = page - 1">上一页</Button>
    <span class="px-2 text-xs text-muted-foreground">{{ page }} / {{ total }}</span>
    <Button type="button" size="sm" variant="outline" :disabled="page >= total" @click="page = page + 1">下一页</Button>
  </div>
</template>
