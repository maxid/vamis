<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  SchemaRenderer,
  asArray,
  createStoreId,
  normalizeApi,
  useEnv,
  useRendererHub,
  useScoped,
  type SchemaObject,
} from '@varmis/core'
import {
  Button,
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
} from '@varmis/ui'
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
    const query = { ...store.query, page: store.page, perPage: store.perPage }
    const payload = await env.fetcher(normalizeApi(props.schema.api, query), query)
    const { items, total } = listData(payload.data)
    store.items = items
    store.total = total
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

async function runColumnAction(button: SchemaObject, row: Record<string, any>) {
  const actionType = button.actionType
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
    <div v-if="filterSchema" class="rounded-md border bg-card p-4">
      <SchemaRenderer
        :schema="{
          ...filterSchema,
          type: filterSchema.type || 'form',
          api: undefined,
          reload: schema.name,
          submitText: filterSchema.submitText || '搜索',
          resetAfterSubmit: false,
        }"
      />
    </div>
    <div class="flex items-center justify-between gap-2">
      <p class="font-mono text-xs text-muted-foreground">
        {{ store.fetching ? '同步中' : `${store.total} 条` }}
      </p>
      <div class="flex flex-wrap gap-2">
        <SchemaRenderer v-for="(node, i) in headerToolbar" :key="i" :schema="node" />
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
          <TableHead v-for="col in columns" :key="col.name || col.label">{{ col.label || col.name }}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="!store.items.length">
          <TableCell :colspan="Math.max(columns.length, 1)" class="py-8 text-center text-muted-foreground">
            暂无数据
          </TableCell>
        </TableRow>
        <TableRow v-for="row in store.items" :key="row.id ?? JSON.stringify(row)">
          <TableCell v-for="col in columns" :key="col.name || col.label">
            <template v-if="col.type === 'operation'">
              <div class="flex gap-2">
                <Button
                  v-for="(btn, bi) in asArray(col.buttons || col.body)"
                  :key="bi"
                  type="button"
                  size="sm"
                  variant="ghost"
                  @click="runColumnAction(btn as SchemaObject, row)"
                >
                  {{ (btn as SchemaObject).label }}
                </Button>
              </div>
            </template>
            <span v-else>{{ row[col.name] ?? '' }}</span>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <div v-if="store.total > store.perPage" class="flex justify-end gap-2">
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
        <SchemaRenderer v-if="dialogSchema" :schema="dialogSchema.body || dialogSchema" :extra-data="dialogSchema.data" />
      </DialogContent>
    </Dialog>
  </div>
</template>
