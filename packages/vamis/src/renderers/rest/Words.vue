<script setup lang="ts">
import { computed, ref } from 'vue'
import { filterTpl, type SchemaObject } from '@vamis/core'
import { readValue } from './format'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const open = ref(false)

function asList(raw: unknown): string | string[] | null {
  if (raw == null || raw === '') return null
  if (Array.isArray(raw)) {
    const list = raw.map((item) => {
      if (item && typeof item === 'object') {
        const rec = item as Record<string, unknown>
        return String(rec.label ?? rec.value ?? '')
      }
      return String(item)
    }).filter((item) => item !== '')
    return list.length ? list : null
  }
  return String(raw)
}

const words = computed(() => {
  const fromSchema = props.schema.words
  if (fromSchema != null && fromSchema !== '') {
    if (typeof fromSchema === 'string') {
      const resolved = filterTpl(fromSchema, props.data)
      return asList(resolved === fromSchema ? fromSchema : resolved)
    }
    return asList(fromSchema)
  }
  return asList(readValue(props.schema, props.data))
})

const inTag = computed(() => props.schema.type === 'tags' || props.schema.inTag === true)

const limit = computed(() => {
  const raw = props.schema.limit
  if (typeof raw === 'number') return raw
  return Array.isArray(words.value) ? 10 : 200
})

const overflow = computed(() => {
  const list = words.value
  const n = limit.value
  if (!n || !list) return false
  return Array.isArray(list) ? list.length > n : String(list).length > n
})

const shown = computed(() => {
  const list = words.value
  if (!list) return list
  if (!overflow.value || open.value) return list
  if (Array.isArray(list)) return list.slice(0, limit.value)
  return String(list).slice(0, limit.value)
})

const shownList = computed(() => {
  const list = shown.value
  if (list == null) return []
  return Array.isArray(list) ? list : [list]
})

const expandText = computed(() =>
  props.schema.expendButtonText != null && String(props.schema.expendButtonText)
    ? String(props.schema.expendButtonText)
    : '展开',
)
const collapseText = computed(() =>
  props.schema.collapseButtonText != null && String(props.schema.collapseButtonText)
    ? String(props.schema.collapseButtonText)
    : '收起',
)
const delimiter = computed(() =>
  props.schema.delimiter != null ? String(props.schema.delimiter) : '， ',
)
</script>

<template>
  <div v-if="words" class="vamis-words">
    <template v-if="inTag && Array.isArray(shown)">
      <span
        v-for="(item, i) in shownList"
        :key="item + i"
        class="vamis-tag"
        :title="item"
      >{{ item }}</span>
    </template>
    <template v-else-if="Array.isArray(shown)">
      <span v-for="(item, i) in shownList" :key="item + i">
        {{ item }}{{ i === shownList.length - 1 ? '' : delimiter }}
      </span>
    </template>
    <template v-else>{{ shown }}</template>
    <template v-if="overflow && !open">&nbsp;...</template>
    <button
      v-if="overflow"
      type="button"
      class="vamis-words__toggle"
      @click="open = !open"
    >
      {{ open ? collapseText : expandText }}
    </button>
  </div>
</template>
