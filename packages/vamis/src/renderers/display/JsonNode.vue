<script setup lang="ts">
import { computed, ref } from 'vue'
import { Badge, VamisIcon } from '@vamis/ui'

defineOptions({ name: 'JsonNode' })

const props = defineProps<{
  name?: string | number
  value: unknown
  depth: number
  levelExpand: number
  displayDataTypes?: boolean
  sortKeys?: boolean
  ellipsisThreshold?: number | false
  quotesOnKeys?: boolean
}>()

const isObject = computed(() => props.value != null && typeof props.value === 'object')
const isArray = computed(() => Array.isArray(props.value))
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
  if (isObject.value) {
    const count = entries.value.length
    return `${count} ${count === 1 ? 'item' : 'items'}`
  }
  if (typeof props.value === 'string') {
    const text = props.ellipsisThreshold !== false && typeof props.ellipsisThreshold === 'number'
      && props.value.length > props.ellipsisThreshold
      ? `${props.value.slice(0, props.ellipsisThreshold)}...`
      : props.value
    return JSON.stringify(text)
  }
  return String(props.value)
})
const keyLabel = computed(() => {
  if (props.name == null) return ''
  return props.quotesOnKeys !== false && typeof props.name === 'string'
    ? JSON.stringify(props.name)
    : String(props.name)
})
const opening = computed(() => (isArray.value ? '[' : '{'))
const closing = computed(() => (isArray.value ? ']' : '}'))
</script>

<template>
  <div class="vamis-json-node font-mono">
    <button
      v-if="isObject"
      type="button"
      class="vamis-json-node__toggle inline-flex items-center gap-1 text-left"
      @click="open = !open"
    >
      <span class="vamis-json-node__toggle-box" :class="{ 'is-open': open }">
        <VamisIcon
          :name="open ? 'minus' : 'plus'"
          class="vamis-json-node__toggle-glyph"
        />
      </span>
      <span v-if="name != null" class="vamis-json-node__key">{{ keyLabel }} :</span>
      <span class="vamis-json-node__brace">{{ opening }}</span>
      <span v-if="open" class="vamis-json-node__preview">{{ preview }}</span>
      <span v-else class="vamis-json-node__ellipsis">...</span>
      <span v-if="!open" class="vamis-json-node__brace">{{ closing }}</span>
      <span v-if="!open" class="vamis-json-node__preview">{{ preview }}</span>
      <Badge v-if="displayDataTypes" variant="outline">{{ kind }}</Badge>
    </button>
    <div v-else class="flex items-baseline gap-1">
      <span v-if="name != null" class="vamis-json-node__key">{{ keyLabel }} :</span>
      <span
        class="vamis-json-node__value"
        :class="kind === 'string' ? 'is-string' : kind === 'number' ? 'is-number' : kind === 'boolean' ? 'is-boolean' : kind === 'null' ? 'is-null' : ''"
      >
        {{ preview }}
      </span>
      <Badge v-if="displayDataTypes" variant="outline">{{ kind }}</Badge>
    </div>
    <div v-if="isObject && open" class="vamis-json-node__children">
      <JsonNode
        v-for="[key, child] in entries"
        :key="String(key)"
        :name="key"
        :value="child"
        :depth="depth + 1"
        :level-expand="levelExpand"
        :display-data-types="displayDataTypes"
        :sort-keys="sortKeys"
        :ellipsis-threshold="ellipsisThreshold"
        :quotes-on-keys="quotesOnKeys"
      />
    </div>
    <div v-if="isObject && open" class="vamis-json-node__closing">
      <span class="vamis-json-node__brace">{{ closing }}</span>
    </div>
  </div>
</template>
