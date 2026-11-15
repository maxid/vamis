<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  asArray,
  dividerDirection,
  dividerHasTitle,
  dividerLineColor,
  dividerLineStyle,
  dividerTitlePosition,
  dividerTransform,
  filterTpl,
  useData,
  type SchemaNode,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const data = useData()

const lineStyle = computed(() => dividerLineStyle(props.schema))
const direction = computed(() => dividerDirection(props.schema))
const titlePos = computed(() => dividerTitlePosition(props.schema))
const hasTitle = computed(() => dividerHasTitle(props.schema))
const titleClass = computed(() => String(props.schema.titleClassName || ''))
const transform = computed(() => dividerTransform(undefined, props.schema.rotate))
const lineInline = computed(() => ({
  ...dividerLineColor(props.schema.color),
  ...(transform.value ? { transform: transform.value } : {}),
}))
const titleRaw = computed(() => props.schema.title)
const titleIsSchema = computed(() => {
  const raw = titleRaw.value
  return raw != null && typeof raw === 'object'
})
const titleText = computed(() => {
  const raw = titleRaw.value
  if (typeof raw === 'string' || typeof raw === 'number') return filterTpl(String(raw), data.value)
  return ''
})
const titleNodes = computed(() => (titleIsSchema.value ? asArray(titleRaw.value as SchemaNode) : []))
</script>

<template>
  <div
    data-vamis-divider
    :data-line="lineStyle"
    :data-dir="direction"
    :data-title="hasTitle ? titlePos : undefined"
    :style="lineInline"
  >
    <span v-if="hasTitle" data-vamis-divider-text :class="titleClass">
      <SchemaRenderer v-for="(node, i) in titleNodes" :key="i" :schema="node" />
      <template v-if="!titleIsSchema">{{ titleText }}</template>
    </span>
  </div>
</template>
