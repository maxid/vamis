<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { isApiOutdated, requestApi, useEnv, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const env = useEnv()
const el = ref<HTMLDivElement>()
const missing = ref('')
let chart: { dispose: () => void; setOption: (option: unknown) => void; resize: () => void } | null = null
let listeningResize = false

async function fetchOption() {
  let option = props.schema.config || props.schema.chart
  if (!option && props.schema.api) {
    const result = await requestApi(props.schema.api, { env, data: props.data, reason: 'init' })
    option = result.data?.config || result.data
  }
  return option
}

async function applyOption(option: unknown) {
  if (!option || typeof option !== 'object') {
    missing.value = 'chart 需要 spec.config 或 spec.api 返回 ECharts option，当前未配置。'
    return
  }
  missing.value = ''
  if (chart) {
    chart.setOption(option)
    return
  }
  try {
    const echarts = await import('echarts')
    if (!el.value) return
    chart = echarts.init(el.value)
    chart.setOption(option)
    if (!listeningResize) {
      window.addEventListener('resize', onResize)
      listeningResize = true
    }
  } catch {
    missing.value = '未安装 echarts，无法绘制图表。已保留 chart 类型占位。'
  }
}

onMounted(async () => {
  try {
    await applyOption(await fetchOption())
  } catch (error) {
    missing.value = error instanceof Error ? error.message : 'chart api 加载失败'
  }
})

watch(
  () => [props.schema.api, props.data] as const,
  (curr, prev) => {
    if (!prev) return
    if (!isApiOutdated(prev[0], curr[0], prev[1], curr[1])) return
    void (async () => {
      try {
        await applyOption(await fetchOption())
      } catch (error) {
        missing.value = error instanceof Error ? error.message : 'chart api 加载失败'
      }
    })()
  },
)

function onResize() {
  chart?.resize()
}

onBeforeUnmount(() => {
  if (listeningResize) window.removeEventListener('resize', onResize)
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div>
    <div v-if="missing" class="rounded-md border border-dashed px-3 py-6 text-sm text-muted-foreground">
      {{ missing }}
    </div>
    <div v-show="!missing" ref="el" class="h-64 w-full" />
  </div>
</template>
