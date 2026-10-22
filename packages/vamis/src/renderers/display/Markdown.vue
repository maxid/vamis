<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { isApiOutdated, requestApi, useEnv, type SchemaObject } from '@vamis/core'
import { renderMarkdown } from './markdown'
import { readText } from './prop'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const env = useEnv()
const remote = ref('')

const content = computed(() => {
  if (props.schema.src) return remote.value
  return readText(props.schema, props.data)
})
const html = computed(() => renderMarkdown(content.value || ''))

async function load() {
  if (!props.schema.src) {
    remote.value = ''
    return
  }
  try {
    const result = await requestApi(props.schema.src, { env, data: props.data, reason: 'init' })
    const body = result.data
    remote.value = typeof body === 'string' ? body : body?.md || body?.markdown || body?.content || JSON.stringify(body)
  } catch (error) {
    remote.value = error instanceof Error ? error.message : 'markdown 加载失败'
  }
}

onMounted(load)
watch(
  () => [props.schema.src, props.data] as const,
  (curr, prev) => {
    if (!prev) return
    if (isApiOutdated(prev[0] as any, curr[0] as any, prev[1], curr[1])) void load()
  },
)
</script>

<template>
  <div data-slot="markdown" data-testid="markdown-body" class="space-y-3 text-sm" v-html="html" />
</template>
