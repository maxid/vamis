<script setup lang="ts">
import { computed, ref } from 'vue'
import { Badge, VamisCaret } from '@vamis/ui'

defineOptions({ name: 'JsonNode' })

const props = defineProps<{
  name?: string | number
  value: unknown
  depth: number
  levelExpand: number
  displayDataTypes?: boolean
  sortKeys?: boolean
}>()

const isObject = computed(() => props.value != null && typeof props.value === 'object')
const entries = computed(() => {
  if (!isObject.value) return []
  const list = Array.isArray(props.value)
    ? (props.value as unknown[]).map((item, i) => [i, item] as [string | number, unknown])
    : Object.entries(props.value as Record<string, unknown>)
  if (props.sortKeys && !Array.isArray(props.value)) {
    return [...list].sort((a, b) => String(a[0]).localeCompare(String(b[0])))
  }
  return list
})
const open = ref(props.depth < props.levelExpand)
const kind = computed(() => {
  if (props.value === null) return 'null'
  if (Array.isArray(props.value)) return 'array'
  return typeof props.value
})
const preview = computed(() => {
  if (Array.isArray(props.value)) return `[${(props.value as unknown[]).length}]`
  if (isObject.value) return `{${entries.value.length}}`
  if (typeof props.value === 'string') return JSON.stringify(props.value)
  return String(props.value)
})
</script>

<template>
  <div class="vamis-json-node font-mono">
    <button
      v-if="isObject"
      type="button"
      class="vamis-json-node__toggle inline-flex items-center gap-1 text-left"
      @click="open = !open"
    >
      <VamisCaret variant="tree" :open="open" class="vamis-json-node__caret" />
      <span v-if="name != null" class="vamis-json-node__key">{{ name }}</span>
      <span class="vamis-json-node__preview">{{ preview }}</span>
      <Badge v-if="displayDataTypes" variant="outline">{{ kind }}</Badge>
    </button>
    <div v-else class="flex items-baseline gap-1">
      <span v-if="name != null" class="vamis-json-node__key">{{ name }}:</span>
      <span
        class="vamis-json-node__value"
        :class="kind === 'string' ? 'is-string' : kind === 'number' ? 'is-number' : ''"
      >
        {{ preview }}
      </span>
      <Badge v-if="displayDataTypes" variant="outline">{{ kind }}</Badge>
    </div>
    <div v-if="isObject && open" class="ml-4 border-l pl-3">
      <JsonNode
        v-for="[key, child] in entries"
        :key="String(key)"
        :name="key"
        :value="child"
        :depth="depth + 1"
        :level-expand="levelExpand"
        :display-data-types="displayDataTypes"
        :sort-keys="sortKeys"
      />
    </div>
  </div>
</template>
