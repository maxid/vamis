<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  SchemaRenderer,
  asArray,
  isApiOutdated,
  buildCssBlock,
  createVamisEvent,
  evalExpression,
  eventEvalData,
  filterTpl,
  isEffectiveApi,
  requestApi,
  resolveClassName,
  resolveCssVars,
  runOnEvent,
  useEnv,
  useOverlay,
  useScope,
  useScoped,
  type PlainObject,
  type SchemaApi,
  type SchemaObject,
} from '@vamis/core'
import { cn } from '@vamis/ui'
import Remark from './rest/Remark.vue'

const DEFAULT_ASIDE_MIN = 160
const DEFAULT_ASIDE_MAX = 400
const DEFAULT_ASIDE_WIDTH = 256

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
}>()

const env = useEnv()
const scoped = useScoped()
const scope = useScope()
const overlayHost = useOverlay()
const asideWidth = ref(DEFAULT_ASIDE_WIDTH)

const body = computed(() => asArray(props.schema.body || props.schema.children))
const toolbar = computed(() => asArray(props.schema.toolbar))
const aside = computed(() => asArray(props.schema.aside))
const hasAside = computed(() => aside.value.length > 0)
const asideOnLeft = computed(() => props.schema.asidePosition !== 'right')
const asideSticky = computed(() => props.schema.asideSticky !== false)
const asideMinWidth = computed(() => {
  const n = Number(props.schema.asideMinWidth)
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_ASIDE_MIN
})
const asideMaxWidth = computed(() => {
  const n = Number(props.schema.asideMaxWidth)
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_ASIDE_MAX
})
const viewData = computed(() => scope.value?.resolved() ?? { ...props.data })
const cssVars = computed(() =>
  resolveCssVars(props.schema.cssVars as Record<string, string> | undefined),
)
const hasTitleBlock = computed(
  () => !!(props.schema.title || props.schema.subTitle || props.schema.remark),
)
const hasHeader = computed(() => hasTitleBlock.value || toolbar.value.length > 0)
const headerClass = computed(() =>
  cn(
    hasTitleBlock.value && toolbar.value.length
      ? 'mb-0 flex w-full min-w-0 items-center justify-between gap-4'
      : 'mb-0 w-full min-w-0',
    resolveClassName(props.schema.headerClassName, viewData.value),
  ),
)
const toolbarClass = computed(() =>
  cn(
    'min-w-0',
    hasTitleBlock.value ? 'flex flex-1 flex-wrap items-center justify-end gap-2' : 'w-full',
    resolveClassName(props.schema.toolbarClassName, viewData.value),
  ),
)
const bodyClass = computed(() => resolveClassName(props.schema.bodyClassName, viewData.value))
const asideClass = computed(() => resolveClassName(props.schema.asideClassName, viewData.value))
const titleText = computed(() =>
  typeof props.schema.title === 'string' ? filterTpl(props.schema.title, viewData.value) : '',
)
const subTitleText = computed(() =>
  typeof props.schema.subTitle === 'string' ? filterTpl(props.schema.subTitle, viewData.value) : '',
)
const remarkSchema = computed<SchemaObject | null>(() => {
  const remark = props.schema.remark
  const placement = props.schema.remarkPlacement || 'bottom'
  if (typeof remark === 'string' && remark) {
    return { type: 'remark', content: remark, placement }
  }
  if (isNodeObject(remark)) {
    return remark.type ? { placement, ...remark } : { type: 'remark', placement, ...remark }
  }
  return null
})
const cssText = computed(() => buildCssBlock(props.schema.css))

function isNodeObject(value: unknown): value is SchemaObject {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function eventCtx(data: PlainObject, nativeType?: string) {
  const event = createVamisEvent(nativeType || '', data, nativeType ? { type: nativeType } : undefined)
  return {
    env,
    data: eventEvalData(data, event),
    scoped,
    overlay: overlayHost,
    scope: scope.value,
    event,
  }
}

function setData(values: PlainObject, replace = false) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) return
  scope.value?.merge(values, replace ? 'override' : 'merge')
}

let mounted = false
let fetching = false
let timer: ReturnType<typeof setTimeout> | undefined
let dragStartX = 0
let dragStartWidth = DEFAULT_ASIDE_WIDTH

function clearTimer() {
  if (timer != null) {
    clearTimeout(timer)
    timer = undefined
  }
}

function schedulePoll() {
  if (!mounted) return
  const interval = Number(props.schema.interval)
  if (!Number.isFinite(interval) || interval <= 0) return
  const stop = props.schema.stopAutoRefreshWhen
  if (typeof stop === 'string' && evalExpression(stop, viewData.value)) return
  timer = setTimeout(() => {
    void fetchInit({ silent: !!props.schema.silentPolling })
  }, Math.max(interval, 1000))
}

async function fetchInit(options: { silent?: boolean; initial?: boolean } = {}) {
  const initApi = props.schema.initApi as SchemaApi | undefined
  const allowed = options.initial
    ? isEffectiveApi(initApi, viewData.value, props.schema.initFetch, props.schema.initFetchOn)
    : isEffectiveApi(initApi, viewData.value)
  if (!allowed) return
  if (fetching) return
  fetching = true
  clearTimer()
  try {
    const result = await requestApi(initApi, { env, data: viewData.value, reason: 'init' })
    const payload = result.payload
    const ok = !result.skipped && result.ok
    if (ok && result.data && typeof result.data === 'object') {
      scope.value?.merge(result.data as PlainObject, result.replaceData ? 'override' : 'merge')
    }
    const eventData: PlainObject = {
      ...viewData.value,
      ...(payload.data && typeof payload.data === 'object' ? payload.data : {}),
      responseData: payload.data ?? {},
      responseStatus: payload.status ?? (ok ? 0 : 1),
      responseMsg: payload.msg || '',
    }
    await runOnEvent(props.schema, 'inited', eventCtx(eventData, 'inited'))
    if (ok) {
      schedulePoll()
    } else if (!options.silent) {
      env.notify('error', payload.msg || '初始化失败')
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : '初始化失败'
    await runOnEvent(
      props.schema,
      'inited',
      eventCtx(
        {
          ...viewData.value,
          responseData: {},
          responseStatus: 1,
          responseMsg: msg,
        },
        'inited',
      ),
    )
    if (!options.silent) env.notify('error', msg)
  } finally {
    fetching = false
  }
}

async function reload(extra?: PlainObject, replace = false) {
  if (extra && typeof extra === 'object') {
    scope.value?.merge(extra, replace ? 'override' : 'merge')
  } else if (replace) {
    scope.value?.merge({}, 'override')
  }
  await fetchInit()
}

const pageApi = {
  name: String(props.schema.id || props.schema.name || ''),
  reload,
  getData: () => scope.value?.resolved() ?? { ...props.data },
  setData,
}

scoped?.register(pageApi)

function onResizeMove(event: MouseEvent) {
  const dx = event.clientX - dragStartX
  const raw = asideOnLeft.value ? dragStartWidth + dx : dragStartWidth - dx
  const min = asideMinWidth.value
  const max = Math.max(min, asideMaxWidth.value)
  asideWidth.value = Math.min(Math.max(raw, min), max)
}

function onResizeUp() {
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeUp)
  document.body.style.removeProperty('cursor')
  document.body.style.removeProperty('user-select')
}

function onResizeDown(event: MouseEvent) {
  if (event.button !== 0) return
  event.preventDefault()
  dragStartX = event.clientX
  dragStartWidth = asideWidth.value
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeUp)
}

onMounted(async () => {
  mounted = true
  const min = asideMinWidth.value
  const max = Math.max(min, asideMaxWidth.value)
  asideWidth.value = Math.min(Math.max(DEFAULT_ASIDE_WIDTH, min), max)
  await runOnEvent(props.schema, 'init', eventCtx(viewData.value, 'init'))
  await fetchInit({ initial: true })
})
watch(
  () => [props.schema.initApi, viewData.value] as const,
  (curr, prev) => {
    if (!prev) return
    const initFetch = props.schema.initFetch
    const initFetchOn = props.schema.initFetchOn
    const becameFetchable =
      typeof initFetchOn === 'string' &&
      initFetch !== false &&
      !isEffectiveApi(curr[0], prev[1], initFetch, initFetchOn) &&
      isEffectiveApi(curr[0], curr[1], initFetch, initFetchOn)
    if (
      becameFetchable ||
      (initFetch !== false && isApiOutdated(prev[0], curr[0], prev[1], curr[1]))
    ) {
      void fetchInit()
    }
  },
)

onBeforeUnmount(() => {
  mounted = false
  clearTimer()
  onResizeUp()
  scoped?.unregister(pageApi)
})
</script>

<template>
  <div class="w-full min-w-0 space-y-4" :style="cssVars">
    <component :is="'style'" v-if="cssText">{{ cssText }}</component>
    <div class="flex w-full min-w-0 gap-4">
      <div
        v-if="hasAside && asideOnLeft"
        class="relative min-w-0 shrink-0 space-y-3"
        :class="[asideSticky ? 'sticky top-0 self-start' : '', asideClass]"
        :style="{ width: `${asideWidth}px` }"
      >
        <SchemaRenderer v-for="(node, i) in aside" :key="'a' + i" :schema="node" />
        <div
          v-if="schema.asideResizor"
          class="absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize bg-border hover:bg-primary"
          @mousedown="onResizeDown"
        />
      </div>

      <div class="flex min-w-0 flex-1 flex-col">
        <div
          v-if="hasHeader"
          :class="headerClass"
        >
          <div v-if="hasTitleBlock" class="min-w-0" :class="toolbar.length ? 'flex-1' : ''">
            <h1 v-if="schema.title" class="flex flex-wrap items-center gap-1 text-pretty font-sans text-xl font-semibold tracking-tight">
              <SchemaRenderer v-if="isNodeObject(schema.title)" :schema="schema.title" />
              <template v-else>{{ titleText }}</template>
              <Remark
                v-if="remarkSchema"
                :schema="remarkSchema"
                :data="viewData"
              />
            </h1>
            <p v-if="schema.subTitle" class="mt-1 text-sm text-muted-foreground">
              <SchemaRenderer v-if="isNodeObject(schema.subTitle)" :schema="schema.subTitle" />
              <template v-else>{{ subTitleText }}</template>
            </p>
          </div>
          <div
            v-if="toolbar.length"
            :class="toolbarClass"
          >
            <SchemaRenderer v-for="(node, i) in toolbar" :key="'t' + i" :schema="node" />
          </div>
        </div>
        <div class="w-full min-w-0 space-y-3 p-[var(--page-body-padding)]" :class="bodyClass">
          <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
        </div>
      </div>

      <div
        v-if="hasAside && !asideOnLeft"
        class="relative min-w-0 shrink-0 space-y-3"
        :class="[asideSticky ? 'sticky top-0 self-start' : '', asideClass]"
        :style="{ width: `${asideWidth}px` }"
      >
        <div
          v-if="schema.asideResizor"
          class="absolute left-0 top-0 z-10 h-full w-1 cursor-col-resize bg-border hover:bg-primary"
          @mousedown="onResizeDown"
        />
        <SchemaRenderer v-for="(node, i) in aside" :key="'ar' + i" :schema="node" />
      </div>
    </div>
  </div>
</template>
