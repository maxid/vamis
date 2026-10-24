<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  SchemaRenderer,
  asArray,
  flexLayoutStyle,
  flexResolvedSchema,
  type SchemaCollection,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{
  schema: SchemaObject
}>()

const isMobile = ref(false)
let media: MediaQueryList | undefined
let onMedia: (() => void) | undefined

onMounted(() => {
  if (typeof window === 'undefined' || !window.matchMedia) return
  media = window.matchMedia('(max-width: 767px)')
  onMedia = () => {
    isMobile.value = media?.matches === true
  }
  onMedia()
  media.addEventListener('change', onMedia)
})

onUnmounted(() => {
  if (media && onMedia) media.removeEventListener('change', onMedia)
})

const resolved = computed(() => flexResolvedSchema(props.schema, isMobile.value))
const items = computed(() =>
  asArray((resolved.value.items ?? resolved.value.body) as SchemaCollection | undefined),
)
const layoutStyle = computed(() => flexLayoutStyle(resolved.value))
</script>

<template>
  <div class="min-w-0" :style="layoutStyle">
    <SchemaRenderer v-for="(node, i) in items" :key="i" :schema="node" />
  </div>
</template>
