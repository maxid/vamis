<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  SchemaRenderer,
  asArray,
  createVamisEvent,
  eachList,
  eventEvalData,
  filterTpl,
  runAction,
  runOnEvent,
  table2Source,
  useEnv,
  useOverlay,
  useScoped,
  type ActionSchema,
  type SchemaNode,
  type SchemaObject,
} from '@vamis/core'
import { Checkbox } from '@vamis/ui'
import {
  isListControlClick,
  listIndexDataField,
  listItemLetter,
  matchListRows,
} from './list-utils'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any>; items?: Record<string, any>[] }>()
const env = useEnv()
const scoped = useScoped()
const overlay = useOverlay()
const mainEl = ref<HTMLElement | null>(null)

const localRows = ref<Record<string, any>[] | null>(null)
const snapshot = ref<Record<string, any>[] | null>(null)
const dragging = ref(false)
const moved = ref(false)
const selected = ref<number[]>([])
const currentLetter = ref('')
const userClick = ref(false)
const itemEls = ref<Record<number, HTMLElement | null>>({})
const dragFrom = ref(-1)
let stopScroll: (() => void) | null = null
let itemObserver: IntersectionObserver | null = null
let userClickTimer: ReturnType<typeof setTimeout> | undefined
let dragGhost: HTMLElement | null = null
let dragMove: ((e: PointerEvent) => void) | null = null
let dragUp: (() => void) | null = null

function clearDragGhost() {
  dragGhost?.remove()
  dragGhost = null
  if (dragMove) window.removeEventListener('pointermove', dragMove)
  if (dragUp) window.removeEventListener('pointerup', dragUp)
  dragMove = null
  dragUp = null
}

function findOverflowAncestor(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el.parentElement
  while (node && node !== document.documentElement) {
    const oy = getComputedStyle(node).overflowY
    if (oy === 'auto' || oy === 'scroll' || oy === 'overlay') return node
    node = node.parentElement
  }
  return null
}

const rows = computed(() => {
  if (localRows.value) return localRows.value
  if (Array.isArray(props.items)) return props.items
  const data = props.data || {}
  const rec = props.schema
  if (rec.value != null || rec.source != null || rec.name) {
    return eachList(rec, data) as Record<string, any>[]
  }
  return table2Source(rec, data)
})
const item = computed(() => (props.schema.listItem || { type: 'list-item' }) as SchemaObject)
const selectable = computed(() => props.schema.selectable === true)
const multiple = computed(() => props.schema.multiple !== false)
const showIndexBar = computed(() => props.schema.showIndexBar === true)
const hasClickActions = computed(() => {
  const actions = props.schema.onEvent?.itemClick?.actions
  return Array.isArray(actions) && actions.length > 0
})
const hasItemActionSchema = computed(() => {
  const action = props.schema.itemAction
  return Boolean(action && typeof action === 'object')
})
const hasItemAction = computed(() => hasItemActionSchema.value || hasClickActions.value)
/** 选择示例点行即可勾选（Amis 默认只能点 checkbox；未写 checkOnItemClick: false 时打开）。 */
const checkOnItemClick = computed(() => {
  if (hasClickActions.value || hasItemActionSchema.value) return false
  if (props.schema.checkOnItemClick === false) return false
  return selectable.value
})
const heading = computed(() => {
  const title = props.schema.title
  if (typeof title !== 'string' || !title) return ''
  return filterTpl(title, props.data || {})
})
function asSchema(node: SchemaNode): SchemaObject {
  if (node && typeof node === 'object' && !Array.isArray(node)) return node as SchemaObject
  return { type: 'tpl', tpl: String(node ?? '') }
}
const headerNodes = computed(() => asArray(props.schema.header).filter(Boolean).map(asSchema))
const footerNodes = computed(() => asArray(props.schema.footer).filter(Boolean).map(asSchema))
const indexFieldName = computed(() =>
  listIndexDataField(item.value, typeof props.schema.indexField === 'string' ? props.schema.indexField : undefined),
)
const letters = computed(() => {
  const set = new Set<string>()
  for (const row of rows.value) {
    const letter = listItemLetter(row, indexFieldName.value)
    if (letter) set.add(letter)
  }
  return [...set].sort()
})
const itemScrollStyle = computed(() => {
  const offset = props.schema.indexBarOffset
  if (offset == null || offset === '') return undefined
  return { scrollMarginTop: `${offset}px` }
})

function rowData(row: Record<string, any>, i: number) {
  return { ...row, index: i }
}

function ensureLocal() {
  if (!localRows.value) localRows.value = rows.value.map((row) => ({ ...row }))
}

function letterOf(row: Record<string, any>) {
  return listItemLetter(row, indexFieldName.value)
}

function setItemEl(i: number, el: unknown) {
  itemEls.value[i] = el instanceof HTMLElement ? el : null
}

function stopObserver() {
  stopScroll?.()
  stopScroll = null
  itemObserver?.disconnect()
  itemObserver = null
}

function bounceUserClick() {
  if (userClickTimer) clearTimeout(userClickTimer)
  userClickTimer = setTimeout(() => {
    userClick.value = false
    syncLetterFromScroll()
  }, 300)
}

function syncLetterFromScroll() {
  if (userClick.value) {
    bounceUserClick()
    return
  }
  const main = mainEl.value
  if (!(main instanceof HTMLElement)) return
  const scroller = findOverflowAncestor(main)
  const box = scroller?.getBoundingClientRect() ?? { top: 0, bottom: window.innerHeight }
  const first = [...main.querySelectorAll<HTMLElement>('.vamis-list__item[data-index]')].find((el) => {
    const rect = el.getBoundingClientRect()
    return rect.bottom > box.top + 8 && rect.top < box.bottom
  })
  if (!first) return
  const index = Number(first.getAttribute('data-index'))
  if (Number.isFinite(index) && rows.value[index]) {
    currentLetter.value = letterOf(rows.value[index])
  }
}

function observeItems() {
  stopObserver()
  if (!showIndexBar.value) return
  const main = mainEl.value
  if (!(main instanceof HTMLElement)) return
  const scroller = findOverflowAncestor(main)
  const onScroll = () => syncLetterFromScroll()
  const opts: AddEventListenerOptions = { passive: true, capture: true }
  scroller?.addEventListener('scroll', onScroll, opts)
  window.addEventListener('scroll', onScroll, opts)
  stopScroll = () => {
    scroller?.removeEventListener('scroll', onScroll, opts)
    window.removeEventListener('scroll', onScroll, opts)
  }
  itemObserver = new IntersectionObserver(
    () => syncLetterFromScroll(),
    { root: scroller, threshold: [0, 0.01, 1] },
  )
  main.querySelectorAll<HTMLElement>('.vamis-list__item[data-index]').forEach((el) => itemObserver!.observe(el))
  syncLetterFromScroll()
  if (!currentLetter.value && rows.value.length) {
    const first = letterOf(rows.value[0])
    if (first) currentLetter.value = first
  }
}

function onLetterClick(letter: string) {
  currentLetter.value = letter
  userClick.value = true
  const i = rows.value.findIndex((row) => letterOf(row) === letter)
  const el = i >= 0 ? mainEl.value?.querySelector<HTMLElement>(`[data-index="${i}"]`) : null
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  bounceUserClick()
}

function toggle(i: number) {
  if (multiple.value) {
    selected.value = selected.value.includes(i) ? selected.value.filter((n) => n !== i) : [...selected.value, i]
  } else {
    selected.value = selected.value[0] === i ? [] : [i]
  }
}

function actionCtx(row: Record<string, any>, i: number, native?: Event) {
  const payload = { ...(props.data || {}), ...row, index: i, item: { data: row, index: i } }
  const event = native ? createVamisEvent('itemClick', payload, native) : undefined
  return {
    env,
    data: event ? eventEvalData(payload, event) : payload,
    scoped,
    overlay,
    event,
  }
}

async function emitItemClick(row: Record<string, any>, i: number, native: Event) {
  const ctx = actionCtx(row, i, native)
  await runOnEvent(props.schema, 'itemClick', ctx)
  return !ctx.event?.prevented
}

async function onRowClick(row: Record<string, any>, i: number, event: MouseEvent) {
  if (dragging.value || isListControlClick(event)) return
  if (hasClickActions.value) {
    await emitItemClick(row, i, event)
    return
  }
  const action = props.schema.itemAction
  if (action && typeof action === 'object') {
    await runAction(action as ActionSchema, actionCtx(row, i, event))
    return
  }
  if (selectable.value && checkOnItemClick.value) toggle(i)
}

function moveRow(from: number, to: number) {
  if (!Number.isFinite(from) || !Number.isFinite(to) || from === to) return
  ensureLocal()
  const next = [...(localRows.value || [])]
  const [movedRow] = next.splice(from, 1)
  next.splice(to, 0, movedRow)
  localRows.value = next
  moved.value = true
  selected.value = selected.value.map((n) => {
    if (n === from) return to
    if (from < to && n > from && n <= to) return n - 1
    if (from > to && n >= to && n < from) return n + 1
    return n
  })
}

function onRowPointerDown(i: number, event: PointerEvent) {
  if (!dragging.value || event.button !== 0) return
  const row = event.currentTarget
  if (!(row instanceof HTMLElement)) return
  event.preventDefault()
  clearDragGhost()
  const rect = row.getBoundingClientRect()
  const offsetX = event.clientX - rect.left
  const offsetY = event.clientY - rect.top
  dragFrom.value = i
  const ghost = row.cloneNode(true) as HTMLElement
  ghost.classList.add('vamis-list__item-float')
  ghost.removeAttribute('data-index')
  ghost.style.cssText = [
    `position:fixed`,
    `left:${rect.left}px`,
    `top:${rect.top}px`,
    `width:${rect.width}px`,
    `height:${rect.height}px`,
    `margin:0`,
    `z-index:2000`,
    `pointer-events:none`,
    `box-sizing:border-box`,
  ].join(';')
  document.body.appendChild(ghost)
  dragGhost = ghost
  dragMove = (e: PointerEvent) => {
    ghost.style.left = `${e.clientX - offsetX}px`
    ghost.style.top = `${e.clientY - offsetY}px`
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('.vamis-list__item')
    if (!(el instanceof HTMLElement) || el === ghost) return
    const to = Number(el.getAttribute('data-index'))
    if (!Number.isFinite(to) || to === dragFrom.value) return
    moveRow(dragFrom.value, to)
    dragFrom.value = to
  }
  dragUp = () => {
    clearDragGhost()
    dragFrom.value = -1
  }
  window.addEventListener('pointermove', dragMove)
  window.addEventListener('pointerup', dragUp)
}

function saveOrder() {
  snapshot.value = localRows.value ? localRows.value.map((row) => ({ ...row })) : null
  moved.value = false
  dragging.value = false
}

function resetOrder() {
  if (snapshot.value) localRows.value = snapshot.value.map((row) => ({ ...row }))
  moved.value = false
  dragging.value = false
}

const listApi = {
  name: String(props.schema.id || props.schema.name || ''),
  id: props.schema.id ? String(props.schema.id) : undefined,
  getData: () => ({
    items: rows.value,
    rows: rows.value,
    selectedItems: selected.value.map((i) => rows.value[i]).filter(Boolean),
  }),
  setData(
    values: Record<string, unknown>,
    replace?: boolean,
    index?: unknown,
    condition?: unknown,
  ) {
    ensureLocal()
    const data = props.data || {}
    if (index != null || condition != null) {
      const targets = matchListRows(localRows.value || [], data, index, condition)
      for (const i of targets) {
        const current = localRows.value?.[i]
        if (!current) continue
        localRows.value![i] = replace ? { ...(values as Record<string, any>) } : { ...current, ...values }
      }
      return
    }
    if (Array.isArray(values)) {
      localRows.value = values as Record<string, any>[]
      selected.value = []
      return
    }
    const next = values?.items ?? values?.rows
    if (Array.isArray(next)) {
      localRows.value = next as Record<string, any>[]
      selected.value = []
    }
  },
  async doAction(action: { actionType?: string; args?: Record<string, unknown> }) {
    const type = action?.actionType
    const args = action?.args || {}
    if (type === 'selectAll') {
      selected.value = rows.value.map((_, i) => i)
    } else if (type === 'clearAll') {
      selected.value = []
    } else if (type === 'select') {
      selected.value = matchListRows(rows.value, props.data || {}, args.index, args.condition)
    } else if (type === 'initDrag') {
      ensureLocal()
      if (!snapshot.value) snapshot.value = (localRows.value || []).map((row) => ({ ...row }))
      dragging.value = true
    } else if (type === 'cancelDrag') {
      dragging.value = false
    } else if (type === 'setValue') {
      listApi.setData((args.value || {}) as Record<string, unknown>, Boolean(args.replace), args.index, args.condition)
    }
  },
}
scoped?.register(listApi as never)
onBeforeUnmount(() => {
  scoped?.unregister(listApi as never)
  stopObserver()
  clearDragGhost()
  if (userClickTimer) clearTimeout(userClickTimer)
})

onMounted(() => nextTick(observeItems))
watch(mainEl, () => nextTick(observeItems))
watch(
  () => [showIndexBar.value, rows.value.length] as const,
  () => nextTick(observeItems),
)
</script>

<template>
  <div
    data-vamis-list
    class="vamis-list"
    :class="[schema.className, { 'is-index': showIndexBar }]"
    :style="schema.style"
  >
    <div class="vamis-list__wrap">
      <div ref="mainEl" class="vamis-list__main" :class="schema.innerClassName">
        <div v-if="moved || heading" class="vamis-list__heading" :class="{ 'is-unsaved': moved }">
          <template v-if="moved">
            当前有记录修改了顺序, 但并没有提交。请选择:
            <button type="button" class="vamis-list__save" @click="saveOrder">提交</button>
            <button type="button" class="vamis-list__reset" @click="resetOrder">放弃</button>
          </template>
          <template v-else>{{ heading }}</template>
        </div>
        <div v-if="headerNodes.length" class="vamis-list__header" :class="schema.headerClassName">
          <SchemaRenderer v-for="(node, i) in headerNodes" :key="'h' + i" :schema="node" />
        </div>
        <div v-if="dragging" class="vamis-list__drag-tip">请拖动左边的按钮进行排序</div>
        <div v-if="rows.length" data-vamis-list-items class="vamis-list__items">
          <div
            v-for="(row, i) in rows"
            :key="i"
            class="vamis-list__item"
            :class="[
              schema.itemClassName,
              {
                'is-selected': selected.includes(i),
                'is-selectable': selectable,
                'is-dragging': dragging,
                'is-ghost': dragFrom === i,
                'has-item-action': hasItemAction,
              },
            ]"
            :data-index="i"
            :style="itemScrollStyle"
            :ref="(el) => setItemEl(i, el)"
            @click.capture="onRowClick(row, i, $event)"
            @pointerdown="onRowPointerDown(i, $event)"
          >
            <span
              v-if="dragging"
              class="vamis-list__drag"
              title="拖动排序"
              @click.stop
            >
              <svg class="icon" viewBox="0 0 16 16" aria-hidden="true">
                <g transform="translate(5 1)" fill="currentColor">
                  <circle cx="1" cy="1" r="1" />
                  <circle cx="5" cy="1" r="1" />
                  <circle cx="1" cy="5" r="1" />
                  <circle cx="5" cy="5" r="1" />
                  <circle cx="1" cy="9" r="1" />
                  <circle cx="5" cy="9" r="1" />
                  <circle cx="1" cy="13" r="1" />
                  <circle cx="5" cy="13" r="1" />
                </g>
              </svg>
            </span>
            <span v-else-if="selectable" class="vamis-list__check" @click.stop>
              <Checkbox
                v-if="multiple"
                :model-value="selected.includes(i)"
                @update:model-value="toggle(i)"
              />
              <button
                v-else
                type="button"
                class="vamis-radio-dot"
                role="radio"
                :aria-checked="selected.includes(i)"
                @click="toggle(i)"
              />
            </span>
            <SchemaRenderer :schema="{ type: 'list-item', ...item }" :extra-data="rowData(row, i)" />
          </div>
        </div>
        <div v-else class="vamis-list__empty">
          {{ schema.placeholder || '暂无数据' }}
        </div>
        <div v-if="footerNodes.length" class="vamis-list__footer" :class="schema.footerClassName">
          <SchemaRenderer v-for="(node, i) in footerNodes" :key="'f' + i" :schema="node" />
        </div>
      </div>
      <div v-if="showIndexBar && rows.length" class="vamis-list__index" @touchmove.prevent>
        <div
          v-for="letter in letters"
          :key="letter"
          class="vamis-list__index-letter"
          :class="{ 'is-active': letter === currentLetter }"
          :data-letter="letter"
          @click="onLetterClick(letter)"
        >
          {{ letter }}
        </div>
      </div>
    </div>
  </div>
</template>
