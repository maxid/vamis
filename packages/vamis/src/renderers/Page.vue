<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { SchemaRenderer, asArray, useEnv, type SchemaObject } from '@vamis/core'
import { Card, CardContent, CardHeader, CardTitle } from '@vamis/ui'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
}>()

const env = useEnv()
const body = computed(() => asArray(props.schema.body || props.schema.children))
const toolbar = computed(() => asArray(props.schema.toolbar))
const aside = computed(() => asArray(props.schema.aside))

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
  <section class="space-y-4">
    <header v-if="schema.title || toolbar.length" class="flex items-end justify-between gap-4">
      <div>
        <p v-if="schema.subTitle || schema.title" class="font-mono text-[11px] tracking-[0.18em] text-primary uppercase">
          YAML / IR
        </p>
        <h1 v-if="schema.title" class="font-sans text-2xl font-semibold tracking-tight">
          {{ schema.title }}
        </h1>
        <p v-if="schema.subTitle" class="mt-1 text-sm text-muted-foreground">{{ schema.subTitle }}</p>
      </div>
      <div v-if="toolbar.length" class="flex flex-wrap gap-2">
        <SchemaRenderer v-for="(node, i) in toolbar" :key="i" :schema="node" />
      </div>
    </header>
    <div class="grid gap-4" :class="aside.length ? 'lg:grid-cols-[minmax(0,1fr)_16rem]' : ''">
      <Card class="shadow-xs">
        <CardHeader v-if="schema.remark" class="pb-2">
          <CardTitle class="text-base">说明</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3 pt-6">
          <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
        </CardContent>
      </Card>
      <aside v-if="aside.length" class="space-y-3">
        <SchemaRenderer v-for="(node, i) in aside" :key="'a'+i" :schema="node" />
      </aside>
    </div>
  </section>
</template>
