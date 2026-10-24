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

<style scoped>
[data-vamis-divider] {
  margin: 12px 0;
  font-size: 0;
}
[data-vamis-divider][data-dir='horizontal'] {
  position: relative;
  height: 2px;
  border-bottom: 1px solid var(--border);
  transform-origin: 0 center;
  clear: both;
}
[data-vamis-divider][data-dir='horizontal'][data-line='dashed'] {
  border-bottom-style: dashed;
}
[data-vamis-divider][data-dir='vertical'] {
  display: inline-block;
  height: 30px;
  border-left: 1px solid var(--border);
  transform-origin: center bottom;
}
[data-vamis-divider][data-dir='vertical'][data-line='dashed'] {
  border-left-style: dashed;
}
[data-vamis-divider][data-title] {
  display: flex;
  align-items: center;
  height: unset;
  border-bottom-width: 0 !important;
}
[data-vamis-divider][data-title]::before,
[data-vamis-divider][data-title]::after {
  content: '';
  height: 0;
  flex: 1;
  min-width: 0;
  min-height: 0;
  border-bottom: inherit;
  border-bottom-width: 1px;
}
[data-vamis-divider][data-title='left']::before,
[data-vamis-divider][data-title='right']::after {
  flex-basis: 5%;
  flex-grow: 0;
}
[data-vamis-divider] [data-vamis-divider-text] {
  margin: 0 16px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  color: var(--foreground);
  box-sizing: border-box;
}
</style>
