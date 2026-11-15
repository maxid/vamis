<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  asArray,
  hboxColumnBody,
  hboxColumnLabel,
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
import { useListItemField } from '../listItemField'

const props = defineProps<{ schema: SchemaObject }>()
const data = useData()
const asListField = useListItemField()
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
    :data-list-field="asListField ? '' : undefined"
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
      <div v-if="asListField" data-vamis-list-field>
        <label v-if="hboxColumnLabel(col)" class="vamis-list-field__label">{{ hboxColumnLabel(col) }}</label>
        <div class="vamis-list-field__value">
          <SchemaRenderer
            v-for="(node, j) in hboxColumnBody(col)"
            :key="j"
            :schema="node"
          />
        </div>
      </div>
      <template v-else>
        <SchemaRenderer
          v-for="(node, j) in hboxColumnBody(col)"
          :key="j"
          :schema="node"
        />
      </template>
    </div>
  </div>
</template>
