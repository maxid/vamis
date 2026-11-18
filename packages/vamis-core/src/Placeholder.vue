<script setup lang="ts">
import { onMounted } from 'vue'
import { reportDiagnostic } from './diagnostic'
import { useEnv } from './context'
import type { SchemaObject } from './types'

const props = defineProps<{
  schema: SchemaObject
  reason?: string
}>()

const env = useEnv()
onMounted(() => {
  reportDiagnostic(env, {
    type: 'renderer',
    message: `未知类型：${props.schema.type || '(missing type)'}`,
    path: typeof props.schema.__editorPath === 'string' ? props.schema.__editorPath : props.schema.type,
  })
})
</script>

<template>
  <div
    class="rounded-md border border-dashed border-primary/40 bg-accent/40 px-3 py-2 text-sm text-muted-foreground"
    data-slot="unknown-renderer"
  >
    <p class="font-medium text-foreground">
      未知类型：<code class="font-mono text-primary">{{ schema.type || '(missing type)' }}</code>
    </p>
    <p class="mt-1">{{ reason || '运行时没有对应渲染器，已占位，页面继续执行。' }}</p>
  </div>
</template>
