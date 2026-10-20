<script setup lang="ts">
import { computed, ref } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@varmis/core'
import { Button } from '@varmis/ui'

const props = defineProps<{ schema: SchemaObject }>()
const steps = computed(() => (props.schema.steps || []) as SchemaObject[])
const index = ref(0)
const current = computed(() => steps.value[index.value] || {})
const body = computed(() => asArray(current.value.body))

function prev() {
  if (index.value > 0) index.value -= 1
}

function next() {
  if (index.value < steps.value.length - 1) index.value += 1
}
</script>

<template>
  <div class="space-y-4">
    <ol class="flex flex-wrap gap-2 text-xs">
      <li
        v-for="(step, i) in steps"
        :key="i"
        class="rounded-full border px-3 py-1"
        :class="i === index ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground'"
      >
        {{ i + 1 }}. {{ step.title || `步骤 ${i + 1}` }}
      </li>
    </ol>
    <div class="rounded-md border bg-card p-4">
      <h3 v-if="current.title" class="mb-3 text-sm font-medium">{{ current.title }}</h3>
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </div>
    <div class="flex justify-end gap-2">
      <Button type="button" variant="outline" size="sm" :disabled="index <= 0" @click="prev">上一步</Button>
      <Button type="button" size="sm" :disabled="index >= steps.length - 1" @click="next">下一步</Button>
    </div>
  </div>
</template>
