<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import {
  SchemaRenderer,
  asArray,
  createStoreId,
  filterTpl,
  normalizeApi,
  useEnv,
  useRendererHub,
  useScoped,
  type SchemaObject,
} from '@vamis/core'
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@vamis/ui'
import { CrudHostKey, selectedIdsOf } from './data/crudHost'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
}>()

const env = useEnv()
const hub = useRendererHub()
const scoped = useScoped()
const store = hub.add({
  id: createStoreId('crud'),
  type: 'crud',
  name: props.schema.name,
  perPage: Number(props.schema.perPage || 10),
})

const columns = computed(() => (props.schema.columns || []) as SchemaObject[])
const filterSchema = computed(() => props.schema.filter as SchemaObject | undefined)
const headerToolbar = computed(() => asArray(props.schema.headerToolbar))
const dialogOpen = ref(false)
const dialogSchema = ref<SchemaObject | null>(null)
const primaryField = computed(() => String(props.schema.primaryField || 'id'))
const bulkActions = computed(() => asArray(props.schema.bulkActions) as SchemaObject[])
const selectable = computed(
  () => props.schema.selectable === true || bulkActions.value.length > 0,
)

function listData(payloadData: any): { items: any[]; total: number } {
  if (Array.isArray(payloadData)) return { items: payloadData, total: payloadData.length }
  const items = payloadData?.items || payloadData?.rows || payloadData?.list || []
  return { items, total: Number(payloadData?.total ?? items.length) }
}

function sanitizeQuery(extra: Record<string, any>) {
  const next: Record<string, any> = {}
  for (const [key, value] of Object.entries(extra)) {
    if (key === 'page' || key === 'perPage') continue
    next[key] = value
  }
  return next
}

async function reload(extra: Record<string, any> = {}) {
  if (!props.schema.api) return
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
    const { items, total } = listData(payload.data)
    store.items = items
    store.total = total
    if (!props.schema.keepItemSelectionOnPageChange) store.selectedItems = []
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '加载失败')
  } finally {
    store.fetching = false
  }
}

function openDialog(schema: SchemaObject) {
  dialogSchema.value = schema
  dialogOpen.value = true
}

function asDialogBody(schema: SchemaObject | null) {
  const body = schema?.body || schema
  if (body && typeof body === 'object' && !Array.isArray(body) && (body as SchemaObject).type === 'form') {
    return { ...(body as SchemaObject), wrapWithPanel: false }
  }
  return body
}

function operationClass(btn: SchemaObject) {
  const destructive = btn.level === 'danger' || !!btn.confirmText
  return destructive
    ? 'text-destructive hover:bg-destructive/10 hover:text-destructive'
    : 'text-primary hover:bg-primary/10'
}

async function runColumnAction(button: SchemaObject, row: Record<string, any>) {
  const actionType = button.actionType
  if (actionType === 'toast') {
    env.notify('info', filterTpl(button.msg || button.message || '', row))
    return
  }
  if (actionType === 'dialog' || button.dialog) {
    openDialog({
      ...button.dialog,
      body: button.dialog?.body || button.dialog,
      data: row,
    })
    return
  }
  if (actionType === 'ajax' && button.api) {
    if (button.confirmText && !(await env.confirm(button.confirmText))) return
    try {
      const payload = await env.fetcher(normalizeApi(button.api, row), row)
      env.notify('success', payload.msg || '完成')
      await reload()
    } catch (error) {
      env.notify('error', error instanceof Error ? error.message : '失败')
    }
  }
}

function toggleSort(col: SchemaObject) {
  if (!col.name || col.sortable === false || col.type === 'operation') return
  const current = String(store.query.orderBy || '')
  const dir = String(store.query.orderDir || 'asc')
  store.query.orderBy = col.name
  store.query.orderDir = current === col.name && dir === 'asc' ? 'desc' : 'asc'
  store.page = 1
  reload()
}

function exportCsv() {
  const cols = columns.value.filter((col) => col.name && col.type !== 'operation')
  const header = cols.map((col) => col.label || col.name)
  const lines = [
    header.join(','),
    ...store.items.map((row) =>
      cols.map((col) => JSON.stringify(row[col.name as string] ?? '')).join(','),
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.schema.name || 'export'}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function sortMark(col: SchemaObject) {
  if (!col.name || store.query.orderBy !== col.name) return ''
  return store.query.orderDir === 'desc' ? ' ↓' : ' ↑'
}

function rowKey(row: Record<string, any>) {
  return row[primaryField.value] ?? JSON.stringify(row)
}

function isSelected(row: Record<string, any>) {
  return store.selectedItems.some((item) => rowKey(item) === rowKey(row))
}

function toggleRow(row: Record<string, any>, checked: boolean) {
  if (checked) {
    if (!isSelected(row)) store.selectedItems.push(row)
    return
  }
  store.selectedItems = store.selectedItems.filter((item) => rowKey(item) !== rowKey(row))
}

const allSelected = computed(
  () => store.items.length > 0 && store.items.every((row) => isSelected(row)),
)
const someSelected = computed(
  () => store.items.some((row) => isSelected(row)) && !allSelected.value,
)

function toggleAll(checked: boolean) {
  if (checked) {
    store.items.forEach((row) => {
      if (!isSelected(row)) store.selectedItems.push(row)
    })
    return
  }
  const keys = new Set(store.items.map((row) => rowKey(row)))
  store.selectedItems = store.selectedItems.filter((item) => !keys.has(rowKey(item)))
}

const bulkData = computed(() => ({
  ids: selectedIdsOf(store.selectedItems, primaryField.value),
  items: store.selectedItems,
  selectedItems: store.selectedItems,
  rows: store.selectedItems,
}))

provide(CrudHostKey, {
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

const crudApi = { name: props.schema.name, reload }
scoped?.register(crudApi)
onMounted(() => reload())
onBeforeUnmount(() => {
  scoped?.unregister(crudApi)
  hub.remove(store.id)
})
</script>

<template>
  <div class="space-y-3">
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
      </p>
      <div class="flex flex-wrap items-center gap-2">
        <SchemaRenderer v-for="(node, i) in headerToolbar" :key="i" :schema="node" />
        <span v-if="selectable" class="text-xs text-muted-foreground tabular-nums">已选 {{ store.selectedItems.length }}</span>
        <SchemaRenderer
          v-for="(btn, i) in bulkActions"
          :key="'bulk-' + i"
          :schema="{ ...btn, disabled: !store.selectedItems.length || btn.disabled, reload: btn.reload || schema.name }"
          :extra-data="bulkData"
        />
        <Button type="button" size="sm" variant="outline" @click="exportCsv">导出 CSV</Button>
        <Button
          v-if="schema.api && !headerToolbar.length"
          type="button"
          size="sm"
          @click="openDialog({ title: '新增', body: { type: 'form', api: schema.api, body: columns.filter(c => c.name && c.type !== 'operation').map(c => ({ type: 'input-text', name: c.name, label: c.label })) } })"
        >
          新增
        </Button>
      </div>
    </div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead v-if="selectable" class="w-10">
            <Checkbox
              :model-value="allSelected ? true : someSelected ? 'indeterminate' : false"
              @update:model-value="toggleAll($event === true)"
            />
          </TableHead>
          <TableHead
            v-for="col in columns"
            :key="col.name || col.label"
            :class="col.name && col.sortable !== false && col.type !== 'operation' ? 'cursor-pointer select-none' : ''"
            @click="toggleSort(col)"
          >
            {{ col.label || col.name }}{{ sortMark(col) }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="!store.items.length">
          <TableCell :colspan="Math.max(columns.length, 1) + (selectable ? 1 : 0)" class="py-10 text-center text-muted-foreground">
            暂无数据
          </TableCell>
        </TableRow>
        <TableRow
          v-for="row in store.items"
          :key="row.id ?? JSON.stringify(row)"
          :data-state="isSelected(row) ? 'selected' : undefined"
        >
          <TableCell v-if="selectable">
            <Checkbox
              :model-value="isSelected(row)"
              @update:model-value="toggleRow(row, $event === true)"
            />
          </TableCell>
          <TableCell v-for="col in columns" :key="col.name || col.label">
            <template v-if="col.type === 'operation'">
              <div class="flex gap-1">
                <Button
                  v-for="(btn, bi) in asArray(col.buttons || col.body)"
                  :key="bi"
                  type="button"
                  size="sm"
                  variant="ghost"
                  :class="operationClass(btn as SchemaObject)"
                  @click="runColumnAction(btn as SchemaObject, row)"
                >
                  {{ (btn as SchemaObject).label }}
                </Button>
              </div>
            </template>
            <SchemaRenderer
              v-else-if="col.type && col.type !== 'text' && col.type !== 'plain'"
              :schema="col"
              :extra-data="row"
            />
            <span v-else>{{ row[col.name] ?? '' }}</span>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <div v-if="schema.alwaysShowPagination || store.total > store.perPage" class="flex items-center justify-end gap-2">
      <Button type="button" size="sm" variant="outline" :disabled="store.page <= 1" @click="store.page -= 1; reload()">
        上一页
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        :disabled="store.page * store.perPage >= store.total"
        @click="store.page += 1; reload()"
      >
        下一页
      </Button>
    </div>
    <Dialog v-model:open="dialogOpen">
      <DialogContent class="max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ dialogSchema?.title || '编辑' }}</DialogTitle>
        </DialogHeader>
        <SchemaRenderer v-if="dialogSchema" :schema="asDialogBody(dialogSchema)" :extra-data="dialogSchema.data" />
      </DialogContent>
    </Dialog>
  </div>
</template>
