<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  asArray,
  hboxColumnBody,
  hboxColumnStyle,
  hboxColumnVAlign,
  hboxColumnWidthMode,
  hboxGapToken,
  hboxHAlign,
  hboxVAlign,
  isVisible,
  resolveClassName,
  resolveInlineStyle,
  useData,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const data = useData()
const columns = computed(() =>
  asArray(props.schema.columns || props.schema.body).filter((col) =>
    typeof col !== 'object' || isVisible(col as SchemaObject, data.value),
  ),
)
const gap = computed(() => hboxGapToken(props.schema))
const align = computed(() => hboxHAlign(props.schema))
const valign = computed(() => hboxVAlign(props.schema))

function colClass(col: unknown) {
  return resolveClassName((col as SchemaObject).columnClassName, data.value)
}

function colStyle(col: unknown) {
  return resolveInlineStyle(hboxColumnStyle(col), data.value)
}
</script>

<template>
  <div
    data-vamis-hbox
    :data-gap="gap"
    :data-align="align"
    :data-valign="valign"
  >
    <div
      v-for="(col, i) in columns"
      :key="i"
      data-hbox-col
      :data-hbox-width="hboxColumnWidthMode(col)"
      :data-hbox-valign="hboxColumnVAlign(col)"
      :class="colClass(col)"
      :style="colStyle(col)"
    >
      <SchemaRenderer
        v-for="(node, j) in hboxColumnBody(col)"
        :key="j"
        :schema="node"
      />
    </div>
  </div>
</template>

<style scoped>
[data-vamis-hbox] {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  width: 100%;
  min-width: 0;
}
[data-vamis-hbox] > [data-hbox-col] {
  flex-basis: 0;
  flex-grow: 1;
  min-height: 1px;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
}
[data-vamis-hbox] > [data-hbox-col][data-hbox-width='custom'] {
  flex-grow: unset;
  flex-basis: unset;
}
[data-vamis-hbox] > [data-hbox-col][data-hbox-width='auto'] {
  flex: 0 0 auto;
  width: auto;
  max-width: 100%;
}

[data-vamis-hbox][data-align='right'] { justify-content: flex-end; }
[data-vamis-hbox][data-align='center'] { justify-content: center; }
[data-vamis-hbox][data-align='between'] { justify-content: space-between; }

[data-vamis-hbox][data-valign='middle'] > [data-hbox-col],
[data-vamis-hbox] > [data-hbox-col][data-hbox-valign='middle'] {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
[data-vamis-hbox][data-valign='bottom'] > [data-hbox-col],
[data-vamis-hbox] > [data-hbox-col][data-hbox-valign='bottom'] {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
[data-vamis-hbox][data-valign='between'] > [data-hbox-col],
[data-vamis-hbox] > [data-hbox-col][data-hbox-valign='between'] {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
[data-vamis-hbox] > [data-hbox-col][data-hbox-valign='top'] {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

[data-vamis-hbox][data-gap='xs'] {
  margin-left: calc(var(--gap-xs) * -0.5);
  margin-right: calc(var(--gap-xs) * -0.5);
}
[data-vamis-hbox][data-gap='xs'] > [data-hbox-col] {
  padding-left: calc(var(--gap-xs) * 0.5);
  padding-right: calc(var(--gap-xs) * 0.5);
}
[data-vamis-hbox][data-gap='sm'] {
  margin-left: calc(var(--gap-sm) * -0.5);
  margin-right: calc(var(--gap-sm) * -0.5);
}
[data-vamis-hbox][data-gap='sm'] > [data-hbox-col] {
  padding-left: calc(var(--gap-sm) * 0.5);
  padding-right: calc(var(--gap-sm) * 0.5);
}
[data-vamis-hbox][data-gap='base'] {
  margin-left: calc(var(--gap-base) * -0.5);
  margin-right: calc(var(--gap-base) * -0.5);
}
[data-vamis-hbox][data-gap='base'] > [data-hbox-col] {
  padding-left: calc(var(--gap-base) * 0.5);
  padding-right: calc(var(--gap-base) * 0.5);
}
[data-vamis-hbox][data-gap='md'] {
  margin-left: calc(var(--gap-md) * -0.5);
  margin-right: calc(var(--gap-md) * -0.5);
}
[data-vamis-hbox][data-gap='md'] > [data-hbox-col] {
  padding-left: calc(var(--gap-md) * 0.5);
  padding-right: calc(var(--gap-md) * 0.5);
}
[data-vamis-hbox][data-gap='lg'] {
  margin-left: calc(var(--gap-lg) * -0.5);
  margin-right: calc(var(--gap-lg) * -0.5);
}
[data-vamis-hbox][data-gap='lg'] > [data-hbox-col] {
  padding-left: calc(var(--gap-lg) * 0.5);
  padding-right: calc(var(--gap-lg) * 0.5);
}
</style>
