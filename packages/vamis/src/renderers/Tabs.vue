<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Sortable from 'sortablejs'
import {
  SchemaRenderer,
  asArray,
  createVamisEvent,
  eventEvalData,
  overlayContainerFrom,
  resolveClassName,
  resolveIcon,
  runOnEvent,
  tabBody,
  tabClosable,
  tabDisabled,
  tabFormValue,
  tabHasHash,
  tabIconPosition,
  tabKey,
  tabScope,
  tabTitle,
  tabsAddBtnText,
  tabsCollapseBtnLabel,
  tabsCollapseOnExceed,
  tabsFromSource,
  tabsInitialActive,
  tabsMode,
  tabsMountOnEnter,
  tabsNormalizeActive,
  tabsResolveActiveKey,
  tabsSidePosition,
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
import { VamisCaret, VamisClose } from '@vamis/ui'
import { useForm } from '../formContext'
import IconMark from './IconMark.vue'
import VamisOverlay from '../overlay/VamisOverlay.vue'
import VamisTooltipLayer from '../overlay/VamisTooltipLayer.vue'

const props = defineProps<{ schema: SchemaObject }>()
const data = useData()
const env = useEnv()
const scoped = useScoped()
const overlay = useOverlay()
const formApi = useFormApi()
const scope = useScope()
const form = useForm()

const mode = computed(() => tabsMode(props.schema))
const sidePosition = computed(() => tabsSidePosition(props.schema))
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
const overlayContainer = computed(() => overlayContainerFrom(props.schema, env))

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
  () => tabsResolveActiveKey(props.schema, tabs.value, data.value),
  (resolved) => {
    if (!inited.value) {
      const initial = tabsInitialActive(props.schema, tabs.value, data.value)
      active.value = initial
      seedVisited(initial)
      inited.value = true
      return
    }
    if (props.schema.activeKey != null && props.schema.activeKey !== '' && resolved != null) {
      active.value = resolved
      seedVisited(resolved)
    }
  },
  { immediate: true },
)

watch(
  () => data.value.key,
  (key, prev) => {
    if (!inited.value || key === prev) return
    if (props.schema.activeKey == null || props.schema.activeKey === '') return
    if (props.schema.defaultKey == null || props.schema.defaultKey === '') return
    if (tabsResolveActiveKey(props.schema, tabs.value, data.value) != null) return
    if (key == null || key === '') return
    const next = tabsNormalizeActive(key, tabs.value, data.value)
    active.value = next
    seedVisited(next)
  },
)

function showContent(key: string) {
  return visited.value.has(key)
}

function titleOf(tab: (typeof tabs.value)[number]) {
  const raw = tabTitle(tab, scopeOf(tab))
  if (raw == null || raw === false) return ''
  return String(raw)
}

function writeForm(tab: (typeof tabs.value)[number] | undefined, index: number, key: string) {
  if (!tab || typeof props.schema.name !== 'string' || !props.schema.name) return
  form?.setValue(props.schema.name, tabFormValue(tab, key, scopeOf(tab)))
}

function syncHash(tab: (typeof tabs.value)[number] | undefined, key: string) {
  if (!env.updateLocation) return
  if (tab && tabHasHash(tab, scopeOf(tab))) {
    env.updateLocation(`#${key}`)
    return
  }
  const prev = tabs.value.find((item, i) => keyOf(item, i) === active.value)
  if (prev && tabHasHash(prev, scopeOf(prev))) env.updateLocation('#')
}

async function onSelect(tab: (typeof tabs.value)[number], index: number) {
  const key = keyOf(tab, index)
  if (tabDisabled(tab, scopeOf(tab))) return
  if (key === active.value) {
    syncHash(tab, key)
    return
  }
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
  syncHash(tab, key)
  active.value = key
  const next = unmountOnExit.value ? new Set<string>() : new Set(visited.value)
  next.add(key)
  visited.value = next
  writeForm(tab, index, key)
  moreOpen.value = false
}

function paneClass(tab: (typeof tabs.value)[number]) {
  return resolveClassName(tab.className, scopeOf(tab))
}

function iconOf(tab: (typeof tabs.value)[number]) {
  return resolveIcon(tab.icon, {})
}

const addable = computed(() => props.schema.addable === true)
const editable = computed(() => props.schema.editable === true)
const addBtnText = computed(() => tabsAddBtnText(props.schema))
const collapseAt = computed(() => tabsCollapseOnExceed(props.schema))
const collapseLabel = computed(() => tabsCollapseBtnLabel(props.schema))
const editing = ref(-1)
const editingTitle = ref('')
const moreOpen = ref(false)
const moreEl = ref<HTMLElement | null>(null)
const linksEl = ref<HTMLElement | null>(null)
let sortable: Sortable | null = null
const tipEl = ref<HTMLElement | null>(null)
const tipOpen = ref(false)
const tipText = ref('')

const shownTabs = computed(() => {
  const list = tabs.value
  const n = collapseAt.value
  if (!n || list.length <= n) return list.map((tab, i) => ({ tab, i }))
  return list.slice(0, n - 1).map((tab, i) => ({ tab, i }))
})

const overflowTabs = computed(() => {
  const list = tabs.value
  const n = collapseAt.value
  if (!n || list.length <= n) return []
  return list.slice(n - 1).map((tab, i) => ({ tab, i: i + n - 1 }))
})

function addTab() {
  edited = true
  const next = { title: `Tab ${localTabs.value.length + 1}`, tab: '' } as (typeof localTabs.value)[number]
  localTabs.value = [...localTabs.value, next]
  const key = keyOf(next, localTabs.value.length - 1)
  active.value = key
  visited.value = new Set([...visited.value, key])
}

async function closeTab(index: number, event: Event) {
  event.stopPropagation()
  const tab = localTabs.value[index]
  if (!tab) return
  const key = keyOf(tab, index)
  const payload = { ...data.value, value: key }
  const ev = createVamisEvent('delete', payload)
  await runOnEvent(props.schema, 'delete', {
    env,
    data: eventEvalData(payload, ev),
    scoped,
    overlay,
    form: formApi,
    scope: scope.value,
    event: ev,
  })
  if (ev.prevented) return
  edited = true
  const next = [...localTabs.value]
  next.splice(index, 1)
  localTabs.value = next
  if (active.value === key) {
    const neighbor = next[Math.min(index, next.length - 1)]
    active.value = neighbor ? keyOf(neighbor, Math.min(index, next.length - 1)) : ''
  }
}

function startEdit(index: number, event: MouseEvent) {
  if (!editable.value) return
  const tab = localTabs.value[index]
  if (!tab || tabDisabled(tab, scopeOf(tab))) return
  if (tab.title && typeof tab.title === 'object') return
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

function destroySortable() {
  sortable?.destroy()
  sortable = null
}

function initSortable() {
  destroySortable()
  if (props.schema.draggable !== true || !linksEl.value) return
  sortable = new Sortable(linksEl.value, {
    animation: 250,
    draggable: '.vamis-tabs__link:not(.vamis-tabs__more-host)',
    ghostClass: 'vamis-tabs__link--dragging',
    filter: '.vamis-tabs__add, .vamis-tabs__more-host, .vamis-tabs__close, .vamis-tabs__edit',
    preventOnFilter: false,
    onEnd(event) {
      const from = Number((event.item as HTMLElement).dataset.tabIndex)
      const items = [...event.to.querySelectorAll<HTMLElement>(':scope > [data-tab-index]')]
      const to = items.indexOf(event.item as HTMLElement)
      const parent = event.to
      if (event.oldIndex != null && event.newIndex != null && event.oldIndex !== event.newIndex) {
        const children = parent.children
        if (event.oldIndex < children.length - 1) {
          parent.insertBefore(
            event.item,
            children[event.oldIndex > event.newIndex ? event.oldIndex + 1 : event.oldIndex],
          )
        } else {
          parent.appendChild(event.item)
        }
      }
      if (!Number.isInteger(from) || to < 0 || from === to) return
      const next = [...localTabs.value]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      localTabs.value = next
      edited = true
    },
  })
}

function tipOf(tab: (typeof tabs.value)[number]) {
  if (!props.schema.showTip) return ''
  const tip = tab.tip
  if (tip != null && tip !== '') return String(tip)
  return titleOf(tab)
}

function onTipEnter(tab: (typeof tabs.value)[number], event: MouseEvent) {
  if (!props.schema.showTip) return
  const text = tipOf(tab)
  if (!text) return
  tipEl.value = event.currentTarget as HTMLElement
  tipText.value = text
  tipOpen.value = true
}

function onTipLeave() {
  tipOpen.value = false
}

const tipConfig = computed(() => {
  if (!props.schema.showTip) return null
  const cfg: Record<string, unknown> = { content: tipText.value, placement: 'top' }
  if (props.schema.showTipClassName) cfg.tooltipClassName = props.schema.showTipClassName
  return cfg
})

function selectIndex(index: number) {
  const tab = tabs.value[index]
  if (tab) onSelect(tab, index)
}

async function doAction(action: { actionType?: string; args?: Record<string, unknown> }) {
  const type = action?.actionType
  const args = action?.args || {}
  if (type === 'changeActiveKey') {
    const raw = args.activeKey
    const n = Number(raw)
    if (typeof raw === 'number' || (typeof raw === 'string' && raw.trim() !== '' && Number.isFinite(n) && String(n) === String(raw).trim())) {
      const index = (Number.isFinite(n) ? n : 0) - 1
      if (index >= 0 && index < tabs.value.length) selectIndex(index)
      return
    }
    const key = String(raw ?? '')
    const found = tabs.value.findIndex((tab, i) => keyOf(tab, i) === key)
    if (found >= 0) selectIndex(found)
    return
  }
  if (type === 'deleteTab') {
    const hash = String(args.deleteHash ?? '')
    const found = localTabs.value.findIndex((tab, i) => keyOf(tab, i) === hash)
    if (found >= 0) await closeTab(found, new Event('click'))
  }
}

const api = {
  name: String(props.schema.id || props.schema.name || ''),
  id: props.schema.id != null && props.schema.id !== '' ? String(props.schema.id) : undefined,
  doAction,
}
if (api.name || api.id) scoped?.register(api as never)

function onHashChange() {
  const hash = String(window.location.hash || '').replace(/^#/, '')
  if (!hash) return
  const found = tabs.value.findIndex((tab, i) => keyOf(tab, i) === hash)
  if (found < 0) return
  const key = keyOf(tabs.value[found], found)
  if (key === active.value) return
  active.value = key
  seedVisited(key)
  writeForm(tabs.value[found], found, key)
}

onMounted(() => {
  const index = tabs.value.findIndex((tab, i) => keyOf(tab, i) === active.value)
  if (index >= 0) writeForm(tabs.value[index], index, active.value)
  window.addEventListener('hashchange', onHashChange)
  window.addEventListener('popstate', onHashChange)
  void nextTick(() => initSortable())
})

watch(
  () => props.schema.draggable === true,
  () => { void nextTick(() => initSortable()) },
)

onBeforeUnmount(() => {
  if (api.name || api.id) scoped?.unregister(api as never)
  window.removeEventListener('hashchange', onHashChange)
  window.removeEventListener('popstate', onHashChange)
  destroySortable()
})

const rootClass = computed(() =>
  [
    'vamis-tabs',
    `vamis-tabs--${mode.value}`,
    mode.value === 'sidebar' ? `vamis-tabs--sidebar-${sidePosition.value}` : '',
  ]
    .filter(Boolean)
    .join(' '),
)
</script>

<template>
  <div data-vamis-tabs :class="rootClass" :data-mode="mode">
    <div class="vamis-tabs__nav" data-vamis-tabs-nav :class="{ 'is-toolbar': toolbar.length }">
      <div ref="linksEl" class="vamis-tabs__links" data-vamis-tabs-links :class="linksClass">
        <div
          v-for="item in shownTabs"
          :key="keyOf(item.tab, item.i)"
          class="vamis-tabs__link"
          :class="{
            'is-active': active === keyOf(item.tab, item.i),
            'is-disabled': tabDisabled(item.tab, scopeOf(item.tab)),
          }"
          :data-tab-index="item.i"
          @click="onSelect(item.tab, item.i)"
          @dblclick="startEdit(item.i, $event)"
          @mouseenter="onTipEnter(item.tab, $event)"
          @mouseleave="onTipLeave"
        >
          <button
            type="button"
            :data-active="active === keyOf(item.tab, item.i) ? 'true' : undefined"
            :disabled="tabDisabled(item.tab, scopeOf(item.tab))"
          >
            <input
              v-if="editing === item.i"
              v-model="editingTitle"
              data-vamis-tabs-edit
              class="vamis-tabs__edit"
              @click.stop
              @blur="commitEdit"
              @keydown.enter.prevent="commitEdit"
            >
            <template v-else>
              <IconMark
                v-if="iconOf(item.tab).kind !== 'empty' && tabIconPosition(item.tab) === 'left'"
                :icon="iconOf(item.tab)"
                img-class="vamis-tabs__icon"
              />
              <span class="vamis-tabs__text">
                <SchemaRenderer v-if="item.tab.title && typeof item.tab.title === 'object'" :schema="item.tab.title" :extra-data="extraOf(item.tab)" />
                <template v-else>{{ titleOf(item.tab) || `Tab ${item.i + 1}` }}</template>
              </span>
              <IconMark
                v-if="iconOf(item.tab).kind !== 'empty' && tabIconPosition(item.tab) === 'right'"
                :icon="iconOf(item.tab)"
                img-class="vamis-tabs__icon"
              />
              <span
                v-if="tabClosable(schema, item.tab)"
                class="vamis-tabs__close"
                role="button"
                aria-label="关闭"
                @click.stop="closeTab(item.i, $event)"
              ><VamisClose /></span>
            </template>
          </button>
        </div>
        <div
          v-if="overflowTabs.length"
          ref="moreEl"
          class="vamis-tabs__link vamis-tabs__more-host"
          :class="{ 'is-active': overflowTabs.some((item) => active === keyOf(item.tab, item.i)) }"
        >
          <button type="button" class="vamis-tabs__more" :class="{ 'is-opened': moreOpen }" @click="moreOpen = !moreOpen">
            <span>{{ collapseLabel }}</span>
            <VamisCaret variant="select" :open="moreOpen" />
          </button>
        </div>
      </div>
      <button v-if="addable" type="button" class="vamis-tabs__add" @click="addTab">
        <svg class="vamis-tabs__add-icon" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
          <path d="M6.6 6.6V12H5.4V6.6H0V5.4h5.4V0h1.2v5.4H12v1.2z" fill="currentColor" />
        </svg>
        <span>{{ addBtnText }}</span>
      </button>
      <div v-if="toolbar.length" class="vamis-tabs__toolbar" data-vamis-tabs-toolbar :class="toolbarClass">
        <SchemaRenderer v-for="(node, i) in toolbar" :key="i" :schema="node" />
      </div>
    </div>
    <div class="vamis-tabs__content" data-vamis-tabs-content :class="contentClass">
      <template v-for="(tab, i) in tabs" :key="keyOf(tab, i)">
        <div
          v-if="showContent(keyOf(tab, i))"
          v-show="active === keyOf(tab, i)"
          class="vamis-tabs__pane"
          :class="[paneClass(tab), active === keyOf(tab, i) ? 'is-active' : '']"
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
    <VamisOverlay
      :show="moreOpen && overflowTabs.length > 0"
      :target="moreEl"
      :container="overlayContainer"
      placement="center-bottom-center-top center-top-center-bottom"
      @outside="moreOpen = false"
    >
      <ul class="vamis-dropdown-menu vamis-tabs__more-menu">
        <li
          v-for="item in overflowTabs"
          :key="keyOf(item.tab, item.i)"
          class="vamis-dropdown-item"
          :class="{
            'is-active': active === keyOf(item.tab, item.i),
            'is-disabled': tabDisabled(item.tab, scopeOf(item.tab)),
          }"
          @click="onSelect(item.tab, item.i)"
        >{{ titleOf(item.tab) || `Tab ${item.i + 1}` }}</li>
      </ul>
    </VamisOverlay>
    <VamisTooltipLayer
      v-if="tipConfig"
      :show="tipOpen"
      :target="tipEl"
      :container="overlayContainer"
      :tooltip="tipConfig"
      :data="data"
      @outside="tipOpen = false"
    />
  </div>
</template>
