<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Checkbox, VamisCaret } from '@vamis/ui'
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
const iconOnly = computed(() => props.schema.label === false || props.schema.iconOnly === true)
const label = computed(() => {
  if (iconOnly.value) return ''
  if (props.schema.label != null && props.schema.label !== '') return String(props.schema.label)
  return String(props.schema.tooltip || '列显示')
})
const alignRight = computed(() => props.schema.align === 'right')

function onDocClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('[data-column-toggler]')) return
  open.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div v-if="columns.length" class="vamis-column-toggler" data-column-toggler>
    <button
      type="button"
      class="vamis-column-toggler__btn"
      :class="{ 'is-icon': iconOnly }"
      :aria-label="iconOnly ? '列显示' : label"
      @click.stop="open = !open"
    >
      <svg
        v-if="iconOnly"
        class="vamis-column-toggler__icon"
        viewBox="0 0 122 123"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M5.583.75h22.084c1.666 0 2.916.417 3.75 1.667.833 1.25 1.666 2.5 1.666 3.75V28.25c0 1.667-.416 2.917-1.666 3.75-1.25.833-2.5 1.667-3.75 1.667H5.583c-1.666 0-2.916-.417-3.75-1.667C.583 30.75.167 29.5.167 28.25V6.167c0-1.667.416-2.917 1.666-3.75C2.667 1.583 3.917.75 5.583.75Zm44.167 0h22.083c1.667 0 2.917.417 3.75 1.667 1.25 1.25 1.667 2.5 1.667 3.75V28.25c0 1.667-.417 2.917-1.667 3.75-1.25 1.25-2.5 1.667-3.75 1.667H49.75c-1.667 0-2.917-.417-3.75-1.667-1.25-1.25-1.667-2.5-1.667-3.75V6.167c0-1.667.417-2.917 1.667-3.75.833-.834 2.5-1.667 3.75-1.667Zm44.583 0h22.084c1.666 0 2.916.417 3.75 1.667.833 1.25 1.666 2.5 1.666 3.75V28.25c0 1.667-.416 2.917-1.666 3.75-1.25.833-2.5 1.667-3.75 1.667H94.333c-1.666 0-2.916-.417-3.75-1.667-.833-1.25-1.666-2.5-1.666-3.75V6.167c0-1.667.416-2.917 1.666-3.75 1.25-.834 2.084-1.667 3.75-1.667ZM5.583 45.333h22.084c1.666 0 2.916.417 3.75 1.667 1.25 1.25 1.666 2.5 1.666 3.75v22.083c0 1.667-.416 2.917-1.666 3.75-1.25.834-2.5 1.667-3.75 1.667H5.583c-1.666 0-2.916-.417-3.75-1.667-1.25-1.25-1.666-2.5-1.666-3.75V50.75c0-1.667.416-2.917 1.666-3.75.834-1.25 2.084-1.667 3.75-1.667Zm44.167 0h22.083c1.667 0 2.917.417 3.75 1.667 1.25 1.25 1.667 2.5 1.667 3.75v22.083c0 1.667-.417 2.917-1.667 3.75-1.25 1.25-2.5 1.667-3.75 1.667H49.75c-1.667 0-2.917-.417-3.75-1.667-1.25-1.25-1.667-2.5-1.667-3.75V50.75c0-1.667.417-2.917 1.667-3.75.833-1.25 2.5-1.667 3.75-1.667Zm44.583 0h22.084c1.666 0 2.916.417 3.75 1.667 1.25 1.25 1.666 2.5 1.666 3.75v22.083c0 1.667-.416 2.917-1.666 3.75-1.25.834-2.5 1.667-3.75 1.667H94.333c-1.666 0-2.916-.417-3.75-1.667-.833-1.25-1.666-2.5-1.666-3.75V50.75c0-1.667.416-2.917 1.666-3.75.834-1.25 2.084-1.667 3.75-1.667ZM5.583 89.917h22.084c1.666 0 2.916.416 3.75 1.666.833 1.25 1.666 2.5 1.666 3.75v22.084c0 1.666-.416 2.916-1.666 3.75-1.25.833-2.5 1.666-3.75 1.666H5.583c-1.666 0-2.916-.416-3.75-1.666-1.25-1.25-1.666-2.5-1.666-3.75V95.333c0-1.666.416-2.916 1.666-3.75.834-1.25 2.084-1.666 3.75-1.666Zm44.167 0h22.083c1.667 0 2.917.416 3.75 1.666 1.25 1.25 1.667 2.5 1.667 3.75v22.084c0 1.666-.417 2.916-1.667 3.75-1.25 1.25-2.5 1.666-3.75 1.666H49.75c-1.667 0-2.917-.416-3.75-1.666-1.25-1.25-1.667-2.5-1.667-3.75V95.333c0-1.666.417-2.916 1.667-3.75.833-1.25 2.5-1.666 3.75-1.666Zm44.583 0h22.084c1.666 0 2.916.416 3.75 1.666.833 1.25 1.666 2.5 1.666 3.75v22.084c0 1.666-.416 2.916-1.666 3.75-1.25.833-2.5 1.666-3.75 1.666H94.333c-1.666 0-2.916-.416-3.75-1.666-.833-1.25-1.666-2.5-1.666-3.75V95.333c0-1.666.416-2.916 1.666-3.75.834-1.25 2.084-1.666 3.75-1.666Z"
        />
      </svg>
      <span v-if="label">{{ label }}</span>
      <VamisCaret variant="dropdown" :open="open" />
    </button>
    <div
      v-if="open"
      class="vamis-column-toggler__menu"
      :class="{ 'is-right': alignRight }"
    >
      <label
        v-for="(col, i) in columns"
        :key="colKey(col, i)"
        class="vamis-column-toggler__item"
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
