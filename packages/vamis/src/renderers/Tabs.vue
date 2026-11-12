<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  SchemaRenderer,
  asArray,
  createVamisEvent,
  eventEvalData,
  resolveClassName,
  runOnEvent,
  tabBody,
  tabDisabled,
  tabKey,
  tabScope,
  tabTitle,
  tabsFromSource,
  tabsInitialActive,
  tabsMode,
  tabsMountOnEnter,
  tabsUnmountOnExit,
  tabsVisible,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type SchemaObject,
} from '@vamis/core'
import { useForm } from '../formContext'

const props = defineProps<{ schema: SchemaObject }>()
const data = useData()
const env = useEnv()
const scoped = useScoped()
const overlay = useOverlay()
const formApi = useFormApi()
const scope = useScope()
const form = useForm()

const mode = computed(() => tabsMode(props.schema))
const mountOnEnter = computed(() => tabsMountOnEnter(props.schema))
const unmountOnExit = computed(() => tabsUnmountOnExit(props.schema))
const allTabs = computed(() => tabsFromSource(props.schema, data.value))
const localTabs = ref<ReturnType<typeof tabsFromSource>>([...allTabs.value])
let edited = false
watch(allTabs, (next) => { if (!edited) localTabs.value = [...next] }, { deep: true })
const tabs = computed(() => tabsVisible(localTabs.value, data.value))
const linksClass = computed(() => resolveClassName(props.schema.linksClassName, data.value))
const contentClass = computed(() => resolveClassName(props.schema.contentClassName, data.value))
const toolbar = computed(() => asArray(props.schema.toolbar))
const toolbarClass = computed(() => resolveClassName(props.schema.toolbarClassName, data.value))

function scopeOf(tab: (typeof tabs.value)[number]) {
  return tabScope(tab, data.value)
}

function extraOf(tab: (typeof tabs.value)[number]) {
  const item = tab.__item
  if (item && typeof item === 'object' && !Array.isArray(item)) return item as Record<string, unknown>
  return undefined
}

function keyOf(tab: (typeof tabs.value)[number], index: number) {
  return tabKey(tab, index, scopeOf(tab))
}

const active = ref('0')
const visited = ref(new Set<string>())
const inited = ref(false)

function seedVisited(next: string) {
  if (!mountOnEnter.value) {
    visited.value = new Set(tabs.value.map((tab, index) => keyOf(tab, index)))
    return
  }
  visited.value = unmountOnExit.value ? new Set([next]) : new Set([...visited.value, next])
}

watch(
  () => tabsInitialActive(props.schema, tabs.value, data.value),
  (next) => {
    if (!inited.value) {
      active.value = next
      seedVisited(next)
      inited.value = true
      return
    }
    if (props.schema.activeKey != null && props.schema.activeKey !== '') {
      active.value = next
      seedVisited(next)
    }
  },
  { immediate: true },
)

function showContent(key: string) {
  return visited.value.has(key)
}

async function onSelect(tab: (typeof tabs.value)[number], index: number) {
  const key = keyOf(tab, index)
  if (tabDisabled(tab, scopeOf(tab)) || key === active.value) return
  const payload = { ...data.value, value: key }
  const event = createVamisEvent('change', payload)
  await runOnEvent(props.schema, 'change', {
    env,
    data: eventEvalData(payload, event),
    scoped,
    overlay,
    form: formApi,
    scope: scope.value,
    event,
  })
  if (event.prevented) return
  active.value = key
  const next = unmountOnExit.value ? new Set<string>() : new Set(visited.value)
  next.add(key)
  visited.value = next
  if (typeof props.schema.name === 'string' && props.schema.name) {
    const val = tab.value ?? (typeof tab.title === 'string' ? tab.title : key)
    form?.setValue(props.schema.name, val)
  }
}

function titleOf(tab: (typeof tabs.value)[number]) {
  const raw = tabTitle(tab, scopeOf(tab))
  if (raw == null || raw === false) return ''
  return String(raw)
}

function paneClass(tab: (typeof tabs.value)[number]) {
  return resolveClassName(tab.className, scopeOf(tab))
}

const addable = computed(() => props.schema.addable === true)
const closable = computed(() => props.schema.closable === true)
const editable = computed(() => props.schema.editable === true)
const addBtnText = computed(() => String(props.schema.addBtnText || '新增'))
const editing = ref(-1)
const editingTitle = ref('')
const dragIndex = ref(-1)

function addTab() {
  edited = true
  const next = { title: `Tab ${localTabs.value.length + 1}`, tab: '' } as (typeof localTabs.value)[number]
  localTabs.value = [...localTabs.value, next]
  const key = keyOf(next, localTabs.value.length - 1)
  active.value = key
  visited.value = new Set([...visited.value, key])
}

function closeTab(index: number, event: Event) {
  event.stopPropagation()
  edited = true
  const next = [...localTabs.value]
  next.splice(index, 1)
  localTabs.value = next
  if (!next.length) active.value = ''
}

function startEdit(index: number, event: MouseEvent) {
  if (!editable.value) return
  const tab = localTabs.value[index]
  if (tabDisabled(tab, scopeOf(tab))) return
  editing.value = index
  editingTitle.value = titleOf(tab)
  event.stopPropagation()
  setTimeout(() => {
    const input = document.querySelector<HTMLInputElement>('[data-vamis-tabs-edit]')
    input?.focus()
    input?.select()
  })
}

function commitEdit() {
  if (editing.value < 0) return
  const tab = localTabs.value[editing.value]
  if (tab && editingTitle.value.trim()) {
    ;(tab as Record<string, unknown>).title = editingTitle.value.trim()
    edited = true
  }
  editing.value = -1
}

function onDragStart(index: number, event: DragEvent) {
  dragIndex.value = index
  event.dataTransfer?.setData('text/plain', String(index))
}

function onDrop(index: number, event: DragEvent) {
  event.preventDefault()
  if (dragIndex.value < 0 || dragIndex.value === index) return
  const next = [...localTabs.value]
  const [moved] = next.splice(dragIndex.value, 1)
  next.splice(index, 0, moved)
  localTabs.value = next
  edited = true
  dragIndex.value = -1
}

function tipOf(tab: (typeof tabs.value)[number]) {
  if (!props.schema.showTip) return undefined
  const tip = tab.tip
  if (tip != null && tip !== '') return String(tip)
  return titleOf(tab) || undefined
}
</script>

<template>
  <div data-vamis-tabs :data-mode="mode">
    <div data-vamis-tabs-nav>
      <div data-vamis-tabs-links :class="linksClass">
        <button
          v-for="(tab, i) in tabs"
          :key="keyOf(tab, i)"
          type="button"
          :data-active="active === keyOf(tab, i) ? 'true' : undefined"
          :disabled="tabDisabled(tab, scopeOf(tab))"
          :title="tipOf(tab)"
          :draggable="schema.draggable === true"
          @click="onSelect(tab, i)"
          @dblclick="startEdit(i, $event)"
          @dragstart="onDragStart(i, $event)"
          @dragover.prevent
          @drop="onDrop(i, $event)"
        >
          <input
            v-if="editing === i"
            v-model="editingTitle"
            data-vamis-tabs-edit
            class="vamis-tabs__edit"
            @click.stop
            @blur="commitEdit"
            @keydown.enter.prevent="commitEdit"
          >
          <template v-else>
            <SchemaRenderer v-if="tab.title && typeof tab.title === 'object'" :schema="tab.title" :extra-data="extraOf(tab)" />
            <template v-else>{{ titleOf(tab) || `Tab ${i + 1}` }}</template>
          </template>
          <span
            v-if="closable && (tab as Record<string, unknown>).closable !== false"
            class="vamis-tabs__close"
            role="button"
            aria-label="关闭"
            @click="closeTab(i, $event)"
          >×</span>
        </button>
        <button v-if="addable" type="button" class="vamis-tabs__add" @click="addTab">{{ addBtnText }}</button>
      </div>
      <div v-if="toolbar.length" data-vamis-tabs-toolbar :class="toolbarClass">
        <SchemaRenderer v-for="(node, i) in toolbar" :key="i" :schema="node" />
      </div>
    </div>
    <div data-vamis-tabs-content :class="contentClass">
      <template v-for="(tab, i) in tabs" :key="keyOf(tab, i)">
        <div
          v-if="showContent(keyOf(tab, i))"
          v-show="active === keyOf(tab, i)"
          :class="paneClass(tab)"
        >
          <SchemaRenderer
            v-for="(node, j) in tabBody(tab)"
            :key="j"
            :schema="node"
            :extra-data="extraOf(tab)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
[data-vamis-tabs] {
  width: 100%;
  min-width: 0;
}
[data-vamis-tabs-nav] {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}
[data-vamis-tabs-links] {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  width: 100%;
  min-width: 0;
  border-bottom: 1px solid var(--border);
}
[data-vamis-tabs-links] > button {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 8px 16px;
  font-size: 14px;
  line-height: 20px;
  color: inherit;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
[data-vamis-tabs-links] > button[data-active] {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 500;
}
[data-vamis-tabs-links] > button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
[data-vamis-tabs-content] {
  padding: 12px 0 0;
}
[data-vamis-tabs][data-mode='vertical'] {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 12px;
}
[data-vamis-tabs][data-mode='vertical'] [data-vamis-tabs-nav] {
  flex-direction: column;
  align-items: stretch;
}
[data-vamis-tabs][data-mode='vertical'] [data-vamis-tabs-links] {
  flex-direction: column;
  border-bottom: 0;
  border-right: 1px solid var(--border);
}
[data-vamis-tabs][data-mode='vertical'] [data-vamis-tabs-links] > button {
  margin-bottom: 0;
  margin-right: -1px;
  border-bottom: 0;
  border-right: 2px solid transparent;
  text-align: left;
}
[data-vamis-tabs][data-mode='vertical'] [data-vamis-tabs-links] > button[data-active] {
  border-right-color: var(--primary);
}
[data-vamis-tabs][data-mode='card'] [data-vamis-tabs-links] {
  gap: 4px;
  border-bottom: 0;
}
[data-vamis-tabs][data-mode='card'] [data-vamis-tabs-links] > button {
  border: 1px solid var(--border);
  border-radius: var(--radius) var(--radius) 0 0;
  margin-bottom: 0;
}
[data-vamis-tabs][data-mode='card'] [data-vamis-tabs-links] > button[data-active] {
  background: var(--card, #fff);
  border-bottom-color: var(--card, #fff);
}
[data-vamis-tabs][data-mode='tiled'] [data-vamis-tabs-links] > button {
  flex: 1;
  text-align: center;
}
.vamis-tabs__edit {
  width: 7em;
  border: 1px solid var(--input);
  border-radius: 2px;
  padding: 0 4px;
  font: inherit;
}
.vamis-tabs__close {
  margin-left: 6px;
  color: var(--select-clear-color);
}
.vamis-tabs__close:hover {
  color: var(--foreground);
}
.vamis-tabs__add {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--primary);
  font-size: 13px;
  cursor: pointer;
  padding: 8px 10px;
}
</style>
