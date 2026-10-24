<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  SchemaRenderer,
  createVamisEvent,
  eventEvalData,
  portletDescription,
  portletDivider,
  portletHideHeader,
  portletMountOnEnter,
  portletToolbarItems,
  resolveClassName,
  runOnEvent,
  tabBody,
  tabDisabled,
  tabKey,
  tabScope,
  tabTitle,
  tabsFromSource,
  tabsInitialActive,
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

const props = defineProps<{ schema: SchemaObject }>()
const data = useData()
const env = useEnv()
const scoped = useScoped()
const overlay = useOverlay()
const formApi = useFormApi()
const scope = useScope()

const hideHeader = computed(() => portletHideHeader(props.schema))
const divider = computed(() => portletDivider(props.schema))
const description = computed(() => portletDescription(props.schema, data.value))
const mountOnEnter = computed(() => portletMountOnEnter(props.schema))
const unmountOnExit = computed(() => tabsUnmountOnExit(props.schema))
const allTabs = computed(() => tabsFromSource(props.schema, data.value))
const tabs = computed(() => tabsVisible(allTabs.value, data.value))
const toolbar = computed(() => portletToolbarItems(props.schema.toolbar))
const tabsClass = computed(() => resolveClassName(props.schema.tabsClassName, data.value))
const linksClass = computed(() => resolveClassName(props.schema.linksClassName, data.value))
const contentClass = computed(() => resolveClassName(props.schema.contentClassName, data.value))

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

function titleOf(tab: (typeof tabs.value)[number]) {
  const raw = tabTitle(tab, scopeOf(tab))
  if (raw == null || raw === false) return ''
  return String(raw)
}

function iconOf(tab: (typeof tabs.value)[number]) {
  const icon = tab.icon
  return typeof icon === 'string' && icon ? icon : ''
}

const active = ref('0')
const visited = ref(new Set<string>())
const inited = ref(false)

const activeTab = computed(
  () => tabs.value.find((tab, index) => keyOf(tab, index) === active.value) || tabs.value[0],
)
const tabToolbar = computed(() => portletToolbarItems(activeTab.value?.toolbar))

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
}
</script>

<template>
  <div
    data-vamis-portlet
    :data-header="hideHeader ? 'hidden' : undefined"
    :data-divider="divider ? undefined : 'none'"
    :data-solo="tabs.length <= 1 ? 'true' : undefined"
  >
    <div v-if="!hideHeader" data-vamis-portlet-head :class="tabsClass">
      <div data-vamis-portlet-links :class="linksClass">
        <button
          v-for="(tab, i) in tabs"
          :key="keyOf(tab, i)"
          type="button"
          :data-active="active === keyOf(tab, i) ? 'true' : undefined"
          :disabled="tabDisabled(tab, scopeOf(tab))"
          @click="onSelect(tab, i)"
        >
          <img v-if="iconOf(tab).includes('/')" :src="iconOf(tab)" alt="" data-vamis-portlet-icon />
          <template v-if="tab.title && typeof tab.title === 'object'">
            <SchemaRenderer :schema="tab.title" :extra-data="extraOf(tab)" />
          </template>
          <template v-else>{{ titleOf(tab) || `Tab ${i + 1}` }}</template>
        </button>
        <span v-if="description" data-vamis-portlet-desc>{{ description }}</span>
      </div>
      <div v-if="toolbar.length || tabToolbar.length" data-vamis-portlet-toolbar>
        <SchemaRenderer v-for="(node, i) in toolbar" :key="'g' + i" :schema="node" />
        <SchemaRenderer v-for="(node, i) in tabToolbar" :key="'t' + i" :schema="node" />
      </div>
    </div>
    <div data-vamis-portlet-body :class="contentClass">
      <template v-for="(tab, i) in tabs" :key="keyOf(tab, i)">
        <div v-if="showContent(keyOf(tab, i))" v-show="active === keyOf(tab, i)">
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
[data-vamis-portlet] {
  width: 100%;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--gap-base);
}
[data-vamis-portlet-head] {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
}
[data-vamis-portlet-links] {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-width: 0;
  border-bottom: 1px solid var(--border);
}
[data-vamis-portlet][data-divider='none'] [data-vamis-portlet-links] {
  border-bottom: 0;
}
[data-vamis-portlet-links] > button {
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
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
[data-vamis-portlet-links] > button[data-active] {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 500;
}
[data-vamis-portlet][data-solo] [data-vamis-portlet-links] > button[data-active] {
  color: inherit;
  border-bottom-color: transparent;
  font-weight: inherit;
  cursor: default;
}
[data-vamis-portlet-links] > button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
[data-vamis-portlet-icon] {
  width: 14px;
  height: 14px;
}
[data-vamis-portlet-desc] {
  margin-left: var(--gap-base);
  font-size: 12px;
  color: var(--muted-foreground);
}
[data-vamis-portlet-toolbar] {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}
[data-vamis-portlet-body] {
  padding-top: 12px;
}
[data-vamis-portlet][data-header='hidden'] [data-vamis-portlet-body] {
  padding-top: 0;
}
</style>
