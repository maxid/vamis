<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  createVamisEvent,
  eventEvalData,
  isApiOutdated,
  LazyComponent,
  requestApi,
  resolveValue,
  runAction,
  runOnEvent,
  useEnv,
  useOverlay,
  useScoped,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const env = useEnv()
const scoped = useScoped()
const overlay = useOverlay()
const el = ref<HTMLDivElement>()
const missing = ref('')
let chart: {
  dispose: () => void
  setOption: (option: unknown, replace?: boolean) => void
  resize: () => void
  on?: (event: string, handler: (params: unknown) => void) => void
} | null = null
let listeningResize = false

async function fetchOption() {
  let option = props.schema.config || props.schema.chart
  if (!option && props.schema.source != null) option = resolveValue(props.schema.source, props.data)
  if (!option && props.schema.api) {
    const result = await requestApi(props.schema.api, { env, data: props.data, reason: 'init' })
    option = result.data?.config || result.data
  }
  return option
}

let lastOption: unknown
let pollTimer: ReturnType<typeof setTimeout> | undefined

function stopPolling() {
  if (pollTimer) clearTimeout(pollTimer)
  pollTimer = undefined
}

function schedulePoll() {
  stopPolling()
  const interval = Number(props.schema.interval)
  if (!Number.isFinite(interval) || interval < 1000) return
  pollTimer = setTimeout(() => {
    void loadChart()
  }, interval)
}

async function applyOption(option: unknown) {
  lastOption = option
  if (!option || typeof option !== 'object') {
    missing.value = 'chart 需要 spec.config 或 spec.api 返回 ECharts option，当前未配置。'
    return
  }
  missing.value = ''
  if (!el.value) return
  if (chart) {
    chart.setOption(option, props.schema.replaceChartOption === true)
    return
  }
  try {
    const echarts = await import('echarts')
    if (!el.value) return
    chart = echarts.init(el.value)
    chart.setOption(option, props.schema.replaceChartOption === true)
    chart.on?.('click', async (params: unknown) => {
      const payload = { ...props.data, ...(params && typeof params === 'object' ? (params as Record<string, unknown>) : {}) }
      const event = createVamisEvent('click', payload)
      const actionCtx = { env, data: eventEvalData(payload, event), scoped, overlay, event }
      await runOnEvent(props.schema, 'click', actionCtx)
      if (!event.prevented && props.schema.clickAction) {
        await runAction(props.schema.clickAction, actionCtx)
      }
    })
    if (!listeningResize) {
      window.addEventListener('resize', onResize)
      listeningResize = true
    }
  } catch {
    missing.value = '未安装 echarts，无法绘制图表。已保留 chart 类型占位。'
  }
}

async function loadChart() {
  try {
    await applyOption(await fetchOption())
    schedulePoll()
  } catch (error) {
    missing.value = error instanceof Error ? error.message : 'chart api 加载失败'
  }
}

onMounted(() => {
  void loadChart()
})
watch(el, (node) => {
  if (!node) {
    chart?.dispose()
    chart = null
    return
  }
  if (lastOption !== undefined) void applyOption(lastOption)
  else void loadChart()
})

watch(
  () => props.schema.interval,
  () => schedulePoll(),
)

watch(
  () => [props.schema.api, props.data] as const,
  (curr, prev) => {
    if (!prev) return
    if (!isApiOutdated(prev[0], curr[0], prev[1], curr[1])) return
    void loadChart()
  },
)

function onResize() {
  chart?.resize()
}

const chartApi = {
  name: String(props.schema.id || props.schema.name || ''),
  id: props.schema.id ? String(props.schema.id) : undefined,
  getData: () => ({ option: lastOption }),
  setData(values: Record<string, unknown>) {
    if (values && 'option' in values) void applyOption(values.option)
  },
  async doAction(action: { actionType?: string; args?: { value?: unknown } }) {
    if (action?.actionType === 'reload') await loadChart()
    else if (action?.actionType === 'setValue') await applyOption(action.args?.value)
    else if (action?.actionType === 'reset') await applyOption(await fetchOption())
  },
}
scoped?.register(chartApi as never)

onBeforeUnmount(() => {
  stopPolling()
  scoped?.unregister(chartApi as never)
  if (listeningResize) window.removeEventListener('resize', onResize)
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div :style="schema.style">
    <div v-if="missing" class="vamis-chart__empty">
      {{ missing }}
    </div>
    <LazyComponent
      v-else
      :un-mount-on-hidden="schema.unMountOnHidden === true"
      placeholder="..."
    >
      <div ref="el" class="w-full" :style="{ height: schema.height || '16rem' }" />
    </LazyComponent>
  </div>
</template>
