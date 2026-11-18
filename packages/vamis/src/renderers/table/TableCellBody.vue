<script setup lang="ts">
/**
 * 单元格内容。对齐 Amis `TableCell`：列 `type` 走渲染器（去掉 label，`innerClassName` /
 * `innerStyle` 才给内层），没有 type 的是纯文本 + PopOver；外面再叠 quickEdit 与 copyable。
 */
import { computed, nextTick, onMounted, ref } from 'vue'
import {
  SchemaRenderer,
  copyToClipboard,
  filterTpl,
  isFormItemType,
  provideScoped,
  provideValueHost,
  resolveIcon,
  useScoped,
  type SchemaObject,
} from '@vamis/core'
import IconMark from '../IconMark.vue'
import PopOverHost from '../PopOverHost.vue'
import { VamisTableIcon } from '@vamis/ui'

const props = defineProps<{
  column: SchemaObject
  /** 行记录。 */
  row: Record<string, any>
  /** 表格所在数据域（复制内容 / 提示里的模板可以取到上层变量）。 */
  ctx: Record<string, any>
  index: number
}>()

const emit = defineEmits<{
  quickEdit: [value: unknown]
  /** 单元格里的表单项改了值。`init` 表示挂载阶段写的默认值，不算用户修改。 */
  change: [payload: { name: string; value: unknown; init: boolean }]
}>()

/**
 * 单元格里的表单项没有表单可写。对齐 Amis `TableRow.handleChange`：按字段名写回这一行，
 * 同一行里读这个字段的其他单元格（状态、映射、tpl…）跟着更新。
 */
const settled = ref(false)
onMounted(() => {
  void nextTick(() => {
    settled.value = true
  })
})
provideValueHost({
  forwardFromChildScope: true,
  setValue(name, value) {
    emit('change', { name, value, init: !settled.value })
  },
})
/**
 * 表单项列每行都会按同一个 `name` 注册组件。收进本格自己的 scoped：格内照常能按名字找到外面的组件，
 * 页面那层按 `name` 找不到这些行内控件（Amis 的单元格控件同样不进页面 scoped）。按 id 找不受影响。
 */
if (props.column.name != null && isFormItemType(String(props.column.type || ''))) provideScoped(useScoped())

/** 列自己就是按钮时，`onEvent` / `label` 属于按钮本身，不能摘掉。 */
const ACTION_TYPES = new Set(['button', 'action', 'submit', 'reset', 'dropdown-button', 'button-group', 'operation'])

const field = computed(() => (props.column.name == null ? '' : String(props.column.name)))
const type = computed(() => String(props.column.type || 'plain'))
const isRenderer = computed(() => type.value !== 'text' && type.value !== 'plain')
const rowData = computed(() => ({ index: props.index, ...props.row }))

function readField(row: Record<string, any>, name: string): unknown {
  if (!name) return undefined
  if (Object.prototype.hasOwnProperty.call(row, name)) return row[name]
  let cur: unknown = row
  for (const key of name.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[key]
  }
  return cur
}

const value = computed(() => readField(props.row, field.value))
/** Amis `Plain`：列上写了 `tpl` / `text` 就按模板出字，否则取值；空值画占位（默认 `-`）。 */
const template = computed(() => {
  const raw = props.column.tpl ?? props.column.text
  return typeof raw === 'string' && raw ? raw : ''
})
const empty = computed(() => !template.value && (value.value == null || value.value === ''))
const text = computed(() => {
  if (template.value) return filterTpl(template.value, { ...props.ctx, ...rowData.value })
  return empty.value ? String(props.column.placeholder ?? '-') : String(value.value)
})

/**
 * 列上的 `popOver`（Amis 是 TableCell 的 HOC）。`tpl` / `static` 自己会包，其余类型由单元格来包，
 * 例如 `type: container` 里放一段省略文本。
 */
const hostPopOver = computed(
  () =>
    isRenderer.value &&
    !!props.column.popOver &&
    !/^(tpl|html|static(-.+)?)$/.test(type.value),
)

/**
 * 内层 schema。展示类的列 `name` 只用来取值，不传下去（对照 named 探针、原生 `[name]`）；
 * 表单项要留着 `name`：它靠这个字段名从行记录取值、把改动写回这一行。
 */
const keepName = computed(() => !!field.value && isFormItemType(type.value))
const cellSchema = computed<SchemaObject>(() => {
  const col = props.column
  const next: SchemaObject = { ...col, type: type.value }
  if (!ACTION_TYPES.has(type.value)) {
    next.label = false
    delete next.onEvent
  }
  if (field.value && value.value !== undefined) {
    if (next.value == null) next.value = value.value
    if ((type.value === 'image' || type.value === 'static-image') && next.src == null) next.src = value.value
  }
  next.className = col.innerClassName
  next.style = col.innerStyle
  if (!keepName.value) delete next.name
  // Amis `TableCell`：单元格里的表单项只渲控件本身，没有表单项外壳的 `data-name`
  else next.inputOnly = true
  delete next.innerClassName
  delete next.innerStyle
  delete next.remark
  delete next.quickEdit
  delete next.visibleOn
  delete next.hiddenOn
  delete next.visible
  delete next.hidden
  if (hostPopOver.value) {
    delete next.popOver
    delete next.textOverflow
  }
  return next
})

const ellipsis = computed(() => props.column.textOverflow === 'ellipsis')

/* ---------- copyable ---------- */
const copyConf = computed(() => {
  const raw = props.column.copyable
  if (raw === true) return {} as SchemaObject
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as SchemaObject) : null
})
const copyContent = computed(() => {
  if (!copyConf.value) return ''
  const raw =
    copyConf.value.content != null
      ? String(copyConf.value.content)
      : field.value
        ? '${' + field.value + ' | raw}'
        : ''
  return raw ? filterTpl(raw, { ...props.ctx, ...props.row }) : ''
})
const copyTip = computed(() =>
  copyConf.value?.tooltip != null
    ? filterTpl(String(copyConf.value.tooltip), { ...props.ctx, ...props.row })
    : '点击复制',
)
/** 没写 `copyable.icon` 时画 Amis 的 `copy` 线图。 */
const copyMark = computed(() =>
  copyConf.value?.icon ? resolveIcon(String(copyConf.value.icon), { vendor: 'fa' }) : null,
)

async function copyCell() {
  if (!copyContent.value) return
  try {
    await copyToClipboard(copyContent.value)
  } catch {
    /* 宿主禁用剪贴板时静默失败 */
  }
}

/* ---------- quickEdit ---------- */
const quickConf = computed(() => {
  const raw = props.column.quickEdit
  if (raw === true) return {} as Record<string, unknown>
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null
})
const quickType = computed(() => String(quickConf.value?.type || 'input-text'))
const quickOptions = computed(() => {
  const raw = quickConf.value?.options
  if (!Array.isArray(raw)) return [] as Array<{ label: string; value: string }>
  return raw.map((item) => {
    if (item && typeof item === 'object') {
      const rec = item as Record<string, unknown>
      return { label: String(rec.label ?? rec.value ?? ''), value: String(rec.value ?? '') }
    }
    return { label: String(item), value: String(item) }
  })
})
const editing = ref(false)
const draft = ref('')
const editorEl = ref<HTMLElement | null>(null)

async function startEdit() {
  if (!field.value) return
  draft.value = empty.value ? '' : String(value.value)
  editing.value = true
  await nextTick()
  editorEl.value?.focus()
}

function commitEdit() {
  if (!editing.value) return
  editing.value = false
  const raw = draft.value
  const num = Number(raw)
  const next = quickType.value === 'input-number' && raw !== '' && Number.isFinite(num) ? num : raw
  if (String(next) === (empty.value ? '' : String(value.value))) return
  emit('quickEdit', next)
}

function cancelEdit() {
  editing.value = false
}
</script>

<template>
  <template v-if="quickConf">
    <select
      v-if="editing && quickType === 'select'"
      ref="editorEl"
      v-model="draft"
      class="vamis-table__edit"
      @click.stop
      @change="commitEdit"
      @blur="commitEdit"
    >
      <option v-for="opt in quickOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <textarea
      v-else-if="editing && quickType === 'textarea'"
      ref="editorEl"
      v-model="draft"
      class="vamis-table__edit vamis-table__edit--area"
      @click.stop
      @blur="commitEdit"
      @keydown.esc.prevent="cancelEdit"
    />
    <input
      v-else-if="editing"
      ref="editorEl"
      v-model="draft"
      :type="quickType === 'input-number' ? 'number' : 'text'"
      class="vamis-table__edit"
      @click.stop
      @blur="commitEdit"
      @keydown.enter.prevent="commitEdit"
      @keydown.esc.prevent="cancelEdit"
    >
    <span v-else class="vamis-table__quick">
      <SchemaRenderer v-if="isRenderer" :schema="cellSchema" :extra-data="rowData" />
      <span v-else :class="{ 'vamis-table__muted': empty }">{{ text }}</span>
      <button type="button" class="vamis-table__edit-btn" aria-label="编辑" @click.stop="startEdit">
        <VamisTableIcon name="edit" />
      </button>
    </span>
  </template>
  <template v-else-if="isRenderer">
    <PopOverHost v-if="hostPopOver" :schema="column" :data="row">
      <SchemaRenderer :schema="cellSchema" :extra-data="rowData" />
    </PopOverHost>
    <div v-else-if="ellipsis" class="vamis-table__ellipsis">
      <SchemaRenderer :schema="cellSchema" :extra-data="rowData" />
    </div>
    <SchemaRenderer v-else :schema="cellSchema" :extra-data="rowData" />
    <a
      v-if="copyConf && copyContent"
      class="vamis-table__copy"
      role="button"
      :data-tooltip="copyTip"
      data-position="right"
      :aria-label="copyTip"
      @click.stop="copyCell"
    >
      <IconMark v-if="copyMark" :icon="copyMark" img-class="icon" />
      <VamisTableIcon v-else name="copy" />
    </a>
  </template>
  <PopOverHost v-else :schema="column" :data="row">
    <span :class="{ 'vamis-table__muted': empty }">{{ text }}</span>
    <a
      v-if="copyConf && copyContent"
      class="vamis-table__copy"
      role="button"
      :data-tooltip="copyTip"
      data-position="right"
      :aria-label="copyTip"
      @click.stop="copyCell"
    >
      <IconMark v-if="copyMark" :icon="copyMark" img-class="icon" />
      <VamisTableIcon v-else name="copy" />
    </a>
  </PopOverHost>
</template>
