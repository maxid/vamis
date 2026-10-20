<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaObject } from '@vamis/core'
import ViewerStub from './ViewerStub.vue'
import { fileNameOf, readSrc } from './prop'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const src = computed(() => readSrc(props.schema, props.data))
const filename = computed(() => fileNameOf(src.value, props.schema.name || 'pdf 文档'))
</script>

<template>
  <ViewerStub kind="pdf-viewer" :filename="filename" :src="src" />
</template>
