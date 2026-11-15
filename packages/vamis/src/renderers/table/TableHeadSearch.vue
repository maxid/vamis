<script setup lang="ts">
/**
 * 表头快速搜索。对齐 Amis `HeadCellSearchDropdown`：放大镜 + PopOver，
 * 里面是一张小表单（重置 / 取消 / 搜索）。弹层贴整格 th，走 `VamisOverlay`。
 */
import { computed, onBeforeUnmount, ref, useId } from 'vue'
import { SchemaRenderer, useScoped, type SchemaObject } from '@vamis/core'
import { Button } from '@vamis/ui'
import VamisOverlay from '../../overlay/VamisOverlay.vue'
import TableIcon from './TableIcon.vue'

const props = defineProps<{
  column: SchemaObject
  /** 当前检索值（按表单项 name）。 */
  values: Record<string, unknown>
  container?: string | HTMLElement
  /** 返回 `false` 表示 `columnSearch` 被拦下，弹层不关。 */
  search: (values: Record<string, unknown>) => Promise<boolean> | boolean
  reset: (names: string[]) => void
}>()

const scoped = useScoped()
const formId = `table-search-${useId().replace(/:/g, '')}`
const btnEl = ref<HTMLElement | null>(null)
const opened = ref(false)
const anchor = computed(() => (btnEl.value?.closest('th') as HTMLElement | null) || btnEl.value)

const name = computed(() => String(props.column.name || ''))
const label = computed(() => String(props.column.label ?? ''))

/** `searchable: true` 是一个输入框；对象是任意表单项，或带 `body` 的整张表单。 */
const formBody = computed<SchemaObject[]>(() => {
  const raw = props.column.searchable
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const conf = raw as SchemaObject
    if (!conf.type && Array.isArray(conf.body)) return conf.body as SchemaObject[]
    const { formClassName: _formClassName, ...rest } = conf
    return [
      {
        type: conf.type || 'input-text',
        name: conf.name || name.value,
        ...rest,
      } as SchemaObject,
    ]
  }
  return [{ type: 'input-text', name: name.value, clearable: true }]
})

const fieldNames = computed(() => {
  const out: string[] = []
  const walk = (list: unknown) => {
    if (!Array.isArray(list)) return
    for (const item of list) {
      if (!item || typeof item !== 'object') continue
      const rec = item as SchemaObject
      if (rec.name) out.push(String(rec.name))
      if (typeof rec.extraName === 'string' && rec.extraName) out.push(rec.extraName)
      walk(rec.body)
    }
  }
  walk(formBody.value)
  return out
})

const formSchema = computed<SchemaObject>(() => {
  const conf = props.column.searchable
  const formClassName =
    conf && typeof conf === 'object' && !Array.isArray(conf) ? (conf as SchemaObject).formClassName : undefined
  return {
    type: 'form',
    id: formId,
    title: '',
    mode: 'normal',
    wrapWithPanel: false,
    className: formClassName,
    body: formBody.value,
  }
})

/** 只把本表单的字段喂进去，父域同名字段不要漏进检索框。 */
const formData = computed(() => {
  const out: Record<string, unknown> = {}
  for (const key of fieldNames.value) out[key] = props.values[key] ?? ''
  return out
})

const active = computed(() =>
  fieldNames.value.some((key) => props.values[key] != null && props.values[key] !== ''),
)

function open() {
  opened.value = true
}

function close() {
  opened.value = false
}

async function submit() {
  const data = (scoped?.getComponentById(formId)?.getData?.() || {}) as Record<string, unknown>
  const values: Record<string, unknown> = {}
  for (const key of fieldNames.value) values[key] = data[key]
  if ((await props.search(values)) !== false) close()
}

function reset() {
  close()
  props.reset(fieldNames.value)
}

/** 表单里的 Select / 日期自己也开浮层（Teleport 到 body），点它不算点到外面。 */
let lastDown: HTMLElement | null = null
function onDocDown(event: MouseEvent) {
  lastDown = event.target as HTMLElement | null
}
function onOutside() {
  if (lastDown?.closest?.('[data-vamis-overlay-layer], .vamis-popup, .vamis-date-sheet')) return
  close()
}
if (typeof document !== 'undefined') document.addEventListener('mousedown', onDocDown, true)
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.removeEventListener('mousedown', onDocDown, true)
})

function onEnter(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (!target || target.tagName !== 'INPUT') return
  event.preventDefault()
  event.stopPropagation()
  void submit()
}
</script>

<template>
  <span
    ref="btnEl"
    class="vamis-table__search-btn"
    :class="{ 'is-active': active, 'is-opened': opened }"
    @click.stop
  >
    <span role="button" :aria-label="`搜索${label}`" @click="open">
      <TableIcon name="search" />
    </span>
    <VamisOverlay
      :show="opened"
      :target="anchor"
      :container="container"
      layer-class="vamis-overlay--popover"
      @outside="onOutside"
    >
      <div class="vamis-table-search" @keydown.capture.enter="onEnter" @click.stop>
        <div class="vamis-table-search__body">
          <SchemaRenderer :schema="formSchema" :extra-data="formData" />
        </div>
        <div class="vamis-table-search__footer">
          <Button type="button" variant="outline" @click="reset">重置</Button>
          <Button type="button" variant="outline" @click="close">取消</Button>
          <Button type="button" @click="submit">搜索</Button>
        </div>
      </div>
    </VamisOverlay>
  </span>
</template>
