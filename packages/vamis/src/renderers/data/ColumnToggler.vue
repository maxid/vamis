<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Button, Checkbox } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useInjectedColumnToggle, useColumnToggle, colKey } from './crudHost'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, any>
}>()

const injected = useInjectedColumnToggle()
const localColumns = computed(() => (props.schema.columns || []) as SchemaObject[])
const localToggle = useColumnToggle(localColumns)
const toggle = injected || localToggle
const open = ref(false)

const columns = computed(() => toggle.togglableColumns.value)
const label = computed(() => props.schema.label || props.schema.tooltip || '列显示')

function onDocClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('[data-column-toggler]')) return
  open.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div v-if="columns.length" class="relative inline-block" data-column-toggler>
    <Button type="button" size="sm" variant="outline" @click.stop="open = !open">
      {{ label }}
    </Button>
    <div
      v-if="open"
      class="absolute right-0 z-30 mt-1 min-w-40 rounded-md border bg-popover p-2 shadow-md"
    >
      <label
        v-for="(col, i) in columns"
        :key="colKey(col, i)"
        class="flex cursor-pointer items-center gap-2 py-1 text-sm"
      >
        <Checkbox
          :model-value="toggle.isVisible(col, i)"
          :disabled="col.toggable === false"
          @update:model-value="toggle.setVisible(col, $event === true, i)"
        />
        <span>{{ col.title || col.label || col.name }}</span>
      </label>
    </div>
  </div>
</template>
