<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { normalizeApi, useEnv, type SchemaObject } from '@vamis/core'
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
    const payload = await env.fetcher(normalizeApi(props.schema.src, props.data), props.data)
    const body = payload.data
    remote.value = typeof body === 'string' ? body : body?.md || body?.markdown || body?.content || JSON.stringify(body)
  } catch (error) {
    remote.value = error instanceof Error ? error.message : 'markdown 加载失败'
  }
}

onMounted(load)
watch(() => props.schema.src, load)
</script>

<template>
  <div data-slot="markdown" data-testid="markdown-body" class="space-y-3 text-sm" v-html="html" />
</template>
