<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  SchemaRenderer,
  asArray,
  createVamisEvent,
  eventEvalData,
  runAction,
  runOnEvent,
  useEnv,
  useScoped,
  type ActionSchema,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any>; items?: Record<string, any>[] }>()
const env = useEnv()
const scoped = useScoped()

const rows = computed(() => {
  if (Array.isArray(props.items)) return props.items
  const source = props.schema.source
  if (typeof source === 'string' && source.includes('$')) {
    const key = source.replace(/^\$\{?|\}$/g, '')
    return Array.isArray(props.data?.[key]) ? props.data[key] : []
  }
  if (props.schema.name && Array.isArray(props.data?.[props.schema.name])) return props.data[props.schema.name]
  if (Array.isArray(props.data?.items)) return props.data.items
  if (Array.isArray(props.data?.rows)) return props.data.rows
  return asArray(props.schema.list || props.schema.items)
})
const item = computed(() => (props.schema.listItem || { type: 'list-item' }) as SchemaObject)
const selectable = computed(() => props.schema.selectable === true)
const multiple = computed(() => props.schema.multiple !== false)
const selected = ref<number[]>([])

function rowData(row: Record<string, any>, i: number) {
  return { ...row, index: i }
}

async function emitListEvent(eventName: string, row: Record<string, any>, i: number, native: Event) {
  const payload = { ...props.data, ...row, index: i }
  const event = createVamisEvent(eventName, payload, native)
  await runOnEvent(props.schema, eventName, { env, data: eventEvalData(payload, event), scoped, event })
  return !event.prevented
}

function toggle(i: number) {
  if (multiple.value) {
    selected.value = selected.value.includes(i) ? selected.value.filter((n) => n !== i) : [...selected.value, i]
  } else {
    selected.value = selected.value[0] === i ? [] : [i]
  }
}

async function onRowClick(row: Record<string, any>, i: number, event: MouseEvent) {
  if (selectable.value) toggle(i)
  if (!(await emitListEvent('itemClick', row, i, event))) return
  const action = props.schema.itemAction
  if (action && typeof action === 'object') {
    await runAction(action as ActionSchema, {
      env,
      data: { ...props.data, ...row, index: i },
      scoped,
    })
  }
}

const listApi = {
  name: String(props.schema.id || props.schema.name || ''),
  id: props.schema.id ? String(props.schema.id) : undefined,
  getData: () => ({ selectedItems: selected.value.map((i) => rows.value[i]).filter(Boolean) }),
  setData: () => {},
  async doAction(action: { actionType?: string; args?: { indexes?: number[]; index?: number } }) {
    const type = action?.actionType
    if (type === 'select') {
      const index = Number(action.args?.index)
      if (Number.isFinite(index) && rows.value[index]) toggle(index)
    } else if (type === 'selectAll') {
      selected.value = rows.value.map((_, i) => i)
    } else if (type === 'clearAll') {
      selected.value = []
    }
  },
}
scoped?.register(listApi as never)
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => scoped?.unregister(listApi as never))
</script>

<template>
  <div data-vamis-list class="vamis-list" :class="schema.className" :style="schema.style">
    <div v-if="rows.length" data-vamis-list-items class="vamis-list__items">
      <div
        v-for="(row, i) in rows"
        :key="i"
        class="vamis-list__item"
        :class="{ 'is-selected': selected.includes(i), 'is-selectable': selectable }"
        @click="onRowClick(row, i, $event)"
      >
        <input
          v-if="selectable"
          type="checkbox"
          class="vamis-list__checkbox"
          :checked="selected.includes(i)"
          @click.stop="toggle(i)"
        >
        <SchemaRenderer :schema="{ type: 'list-item', ...item }" :extra-data="rowData(row, i)" />
      </div>
    </div>
    <div v-else class="vamis-list__empty">
      {{ schema.placeholder || '暂无列表数据' }}
    </div>
  </div>
</template>
