<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { SchemaRenderer, asArray, resolveCssVars, useEnv, type SchemaObject } from '@vamis/core'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
}>()

const env = useEnv()
const body = computed(() => asArray(props.schema.body || props.schema.children))
const toolbar = computed(() => asArray(props.schema.toolbar))
const aside = computed(() => asArray(props.schema.aside))
const cssVars = computed(() =>
  resolveCssVars(props.schema.cssVars as Record<string, string> | undefined),
)

onMounted(async () => {
  const initApi = props.schema.initApi
  if (!initApi) return
  try {
    const payload = await env.fetcher(
      typeof initApi === 'string' ? { url: initApi, method: 'get' } : initApi,
      props.data,
    )
    if (payload.data && typeof payload.data === 'object') {
      Object.assign(props.data, payload.data)
    }
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '初始化失败')
  }
})
</script>

<template>
  <section class="w-full space-y-4" :style="cssVars">
    <header v-if="schema.title || toolbar.length" class="flex items-end justify-between gap-4">
      <div class="min-w-0">
        <h1 v-if="schema.title" class="text-pretty font-sans text-xl font-semibold tracking-tight">
          {{ schema.title }}
        </h1>
        <p v-if="schema.subTitle" class="mt-1 text-sm text-muted-foreground">{{ schema.subTitle }}</p>
        <p v-if="schema.remark" class="mt-1 text-sm text-muted-foreground">{{ schema.remark }}</p>
      </div>
      <div v-if="toolbar.length" class="flex flex-wrap gap-2">
        <SchemaRenderer v-for="(node, i) in toolbar" :key="i" :schema="node" />
      </div>
    </header>
    <div class="grid w-full min-w-0 gap-4" :class="aside.length ? 'lg:grid-cols-[minmax(0,1fr)_16rem]' : ''">
      <div class="w-full min-w-0 space-y-3 p-[var(--page-body-padding)]">
        <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
      </div>
      <aside v-if="aside.length" class="space-y-3">
        <SchemaRenderer v-for="(node, i) in aside" :key="'a'+i" :schema="node" />
      </aside>
    </div>
  </section>
</template>
