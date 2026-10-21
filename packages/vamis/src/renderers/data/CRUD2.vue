<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import {
  SchemaRenderer,
  asArray,
  createStoreId,
  normalizeApi,
  useEnv,
  useRendererHub,
  useScoped,
  type SchemaObject,
} from '@vamis/core'
import { Button } from '@vamis/ui'
import {
  asToolbarSchema,
  isBulkToolbar,
  isPagerToolbar,
  parseListPayload,
  provideColumnToggle,
  provideCrudHost,
  selectedIdsOf,
  toolbarType,
  useColumnToggle,
} from './crudHost'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
}>()

const env = useEnv()
const hub = useRendererHub()
const scoped = useScoped()
const store = hub.add({
  id: createStoreId('crud2'),
  type: 'crud2',
  name: props.schema.name,
  perPage: Number(props.schema.perPage || 10),
})

const columns = computed(() => (props.schema.columns || []) as SchemaObject[])
const filterSchema = computed(() => props.schema.filter as SchemaObject | undefined)
const headerToolbar = computed(() => asArray(props.schema.headerToolbar))
const footerToolbar = computed(() => asArray(props.schema.footerToolbar))
const bulkActions = computed(() => asArray(props.schema.bulkActions) as SchemaObject[])
const primaryField = computed(() => String(props.schema.primaryField || props.schema.valueField || 'id'))
const selectable = computed(
  () => props.schema.selectable === true || bulkActions.value.length > 0 || !!props.schema.rowSelection,
)
const mode = computed(() => String(props.schema.mode || 'table2'))
provideColumnToggle(useColumnToggle(columns))

function sanitizeQuery(extra: Record<string, any>) {
  const next: Record<string, any> = {}
  for (const [key, value] of Object.entries(extra)) {
    if (key === 'page' || key === 'perPage') continue
    next[key] = value
  }
  return next
}

async function reload(extra: Record<string, any> = {}) {
  if (!props.schema.api && !props.schema.source) {
    const local = parseListPayload(props.schema.data)
    store.items = local.items
    store.total = local.total
    return
  }
  if (!props.schema.api) {
    const fromData = props.data?.[String(props.schema.source || '').replace(/^\$\{?|\}$/g, '')]
    const local = parseListPayload(fromData)
    store.items = local.items
    store.total = local.total
    return
  }
  store.fetching = true
  const queryPatch = sanitizeQuery(extra)
  store.query = { ...store.query, ...queryPatch }
  if (Object.keys(queryPatch).length) store.page = 1
  try {
    const query = {
      ...store.query,
      page: store.page,
      perPage: store.perPage,
      orderBy: store.query.orderBy,
      orderDir: store.query.orderDir,
    }
    const payload = await env.fetcher(normalizeApi(props.schema.api, query), query)
    const { items, total } = parseListPayload(payload.data)
    store.items = items
    store.total = total
    if (!props.schema.keepItemSelectionOnPageChange) store.selectedItems = []
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '加载失败')
  } finally {
    store.fetching = false
  }
}

provideCrudHost({
  name: props.schema.name,
  reload,
  get primaryField() {
    return primaryField.value
  },
  get selectedItems() {
    return store.selectedItems
  },
  setSelectedItems(items) {
    store.selectedItems = items
  },
  getIds() {
    return selectedIdsOf(store.selectedItems, primaryField.value)
  },
})

const extraData = computed(() => ({
  items: store.items,
  rows: store.items,
  ids: selectedIdsOf(store.selectedItems, primaryField.value),
  selectedItems: store.selectedItems,
  total: store.total,
  page: store.page,
}))

const bodySchema = computed<SchemaObject>(() => {
  const currentMode = mode.value
  if (currentMode === 'cards') {
    return { type: 'cards', source: '$items', card: props.schema.card }
  }
  if (currentMode === 'list' || currentMode === 'grid') {
    return { type: 'list', source: '$items', listItem: props.schema.listItem || props.schema.item }
  }
  if (currentMode === 'table') {
    return { type: 'table', source: '$items', columns: columns.value }
  }
  return {
    type: 'table2',
    source: '$items',
    columns: columns.value,
    selectable: selectable.value,
    primaryField: primaryField.value,
    columnsTogglable: false,
    placeholder: props.schema.placeholder,
  }
})

const bulkData = computed(() => extraData.value)
const hasPagerToolbar = computed(() =>
  [...headerToolbar.value, ...footerToolbar.value].some((node) => isPagerToolbar(node)),
)
const showFallbackPager = computed(
  () => !hasPagerToolbar.value && store.total > store.perPage,
)

function bulkSchema(btn: SchemaObject): SchemaObject {
  return {
    ...btn,
    disabled: !store.selectedItems.length || btn.disabled,
    reload: btn.reload || props.schema.name,
  }
}

const crudApi = { name: props.schema.name, reload }
scoped?.register(crudApi)
onMounted(() => reload())
onBeforeUnmount(() => {
  scoped?.unregister(crudApi)
  hub.remove(store.id)
})
</script>

<template>
  <div class="space-y-4">
    <SchemaRenderer
      v-if="filterSchema"
      :schema="{
        ...filterSchema,
        type: filterSchema.type || 'form',
        mode: filterSchema.mode || 'horizontal',
        api: undefined,
        reload: schema.name,
        submitText: filterSchema.submitText || '搜索',
        resetAfterSubmit: false,
      }"
    />
    <div class="flex items-center justify-between gap-2">
      <p class="text-xs text-muted-foreground tabular-nums">
        {{ store.fetching ? '加载中…' : `共 ${store.total} 条` }}
        <span v-if="selectable"> · 已选 {{ store.selectedItems.length }}</span>
      </p>
      <div class="flex flex-wrap items-center gap-2">
        <template v-for="(node, i) in headerToolbar" :key="'h-' + i">
          <div v-if="isPagerToolbar(node)" class="flex justify-end gap-2">
            <Button type="button" size="sm" variant="outline" :disabled="store.page <= 1" @click="store.page -= 1; reload()">上一页</Button>
            <Button type="button" size="sm" variant="outline" :disabled="store.page * store.perPage >= store.total" @click="store.page += 1; reload()">下一页</Button>
          </div>
          <template v-else-if="isBulkToolbar(node)">
            <SchemaRenderer
              v-for="(btn, bi) in bulkActions"
              :key="'hb-' + bi"
              :schema="bulkSchema(btn as SchemaObject)"
              :extra-data="bulkData"
            />
          </template>
          <Button v-else-if="toolbarType(node) === 'reload'" type="button" size="sm" variant="outline" @click="reload()">刷新</Button>
          <span v-else-if="toolbarType(node) === 'statistics'" class="text-xs text-muted-foreground">{{ store.total }} 条</span>
          <SchemaRenderer v-else :schema="asToolbarSchema(node)" :extra-data="extraData" />
        </template>
        <template v-if="bulkActions.length && !headerToolbar.some((node) => isBulkToolbar(node))">
          <SchemaRenderer
            v-for="(btn, i) in bulkActions"
            :key="'bulk-' + i"
            :schema="bulkSchema(btn as SchemaObject)"
            :extra-data="bulkData"
          />
        </template>
      </div>
    </div>
    <SchemaRenderer :schema="bodySchema" :extra-data="extraData" />
    <div v-if="showFallbackPager" class="flex justify-end gap-2">
      <Button type="button" size="sm" variant="outline" :disabled="store.page <= 1" @click="store.page -= 1; reload()">上一页</Button>
      <Button type="button" size="sm" variant="outline" :disabled="store.page * store.perPage >= store.total" @click="store.page += 1; reload()">下一页</Button>
    </div>
    <div v-if="footerToolbar.length" class="flex flex-wrap items-center justify-end gap-2">
      <template v-for="(node, i) in footerToolbar" :key="'f-' + i">
        <div v-if="isPagerToolbar(node)" class="flex justify-end gap-2">
          <Button type="button" size="sm" variant="outline" :disabled="store.page <= 1" @click="store.page -= 1; reload()">上一页</Button>
          <Button type="button" size="sm" variant="outline" :disabled="store.page * store.perPage >= store.total" @click="store.page += 1; reload()">下一页</Button>
        </div>
        <template v-else-if="isBulkToolbar(node)">
          <SchemaRenderer
            v-for="(btn, bi) in bulkActions"
            :key="'fb-' + bi"
            :schema="bulkSchema(btn as SchemaObject)"
            :extra-data="bulkData"
          />
        </template>
        <SchemaRenderer v-else :schema="asToolbarSchema(node)" :extra-data="extraData" />
      </template>
    </div>
  </div>
</template>
