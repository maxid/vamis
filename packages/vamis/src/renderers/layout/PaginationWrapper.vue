<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'
import { Button, Input } from '@vamis/ui'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const page = ref(1)
const inputName = computed(() => String(props.schema.inputName || 'items'))
const outputName = computed(() => String(props.schema.outputName || 'items'))
const perPage = computed(() => Math.max(1, Number(props.schema.perPage || 10)))
const position = computed(() => String(props.schema.position || 'top'))
const showInput = computed(() => props.schema.showPageInput === true)
const body = computed(() => asArray(props.schema.body))

const source = computed(() => {
  const value = props.data?.[inputName.value]
  return Array.isArray(value) ? value : []
})
const lastPage = computed(() => Math.max(1, Math.ceil(source.value.length / perPage.value) || 1))
const sliced = computed(() => {
  const start = (page.value - 1) * perPage.value
  return source.value.slice(start, start + perPage.value)
})
const extraData = computed(() => ({ [outputName.value]: sliced.value }))

watch(lastPage, (value) => {
  if (page.value > value) page.value = value
})

function prev() {
  if (page.value > 1) page.value -= 1
}
function next() {
  if (page.value < lastPage.value) page.value += 1
}
function jump(value: string | number) {
  const nextPage = Number(value)
  if (Number.isFinite(nextPage)) {
    page.value = Math.min(lastPage.value, Math.max(1, Math.floor(nextPage)))
  }
}
</script>

<template>
  <div class="space-y-3" :class="schema.className">
    <div v-if="position === 'top'" class="flex items-center gap-1">
      <Button type="button" size="sm" variant="outline" :disabled="page <= 1" @click="prev">上一页</Button>
      <span class="px-2 text-xs text-muted-foreground">{{ page }} / {{ lastPage }}</span>
      <Button type="button" size="sm" variant="outline" :disabled="page >= lastPage" @click="next">下一页</Button>
      <Input v-if="showInput" class="h-8 w-16" type="number" :model-value="page" @update:model-value="jump" />
    </div>
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" :extra-data="extraData" />
    <div v-if="position === 'bottom'" class="flex items-center gap-1">
      <Button type="button" size="sm" variant="outline" :disabled="page <= 1" @click="prev">上一页</Button>
      <span class="px-2 text-xs text-muted-foreground">{{ page }} / {{ lastPage }}</span>
      <Button type="button" size="sm" variant="outline" :disabled="page >= lastPage" @click="next">下一页</Button>
      <Input v-if="showInput" class="h-8 w-16" type="number" :model-value="page" @update:model-value="jump" />
    </div>
  </div>
</template>
