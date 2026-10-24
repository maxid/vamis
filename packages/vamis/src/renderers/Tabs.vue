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
const tabs = computed(() => tabsVisible(allTabs.value, data.value))
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
          @click="onSelect(tab, i)"
        >
          <SchemaRenderer v-if="tab.title && typeof tab.title === 'object'" :schema="tab.title" :extra-data="extraOf(tab)" />
          <template v-else>{{ titleOf(tab) || `Tab ${i + 1}` }}</template>
        </button>
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
}
[data-vamis-tabs-links] {
  display: flex;
  flex-wrap: wrap;
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
</style>
