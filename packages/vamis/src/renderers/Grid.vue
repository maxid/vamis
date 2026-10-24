<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  asArray,
  gridColumnBody,
  gridColumnClass,
  gridColumnVAlign,
  gridGapToken,
  gridHAlign,
  gridVAlign,
  resolveClassName,
  resolveInlineStyle,
  useData,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{
  schema: SchemaObject
}>()
const data = useData()
const columns = computed(() => asArray(props.schema.columns || props.schema.body))
const gap = computed(() => gridGapToken(props.schema))
const align = computed(() => gridHAlign(props.schema))
const valign = computed(() => gridVAlign(props.schema))

function colClass(col: unknown) {
  return resolveClassName((col as SchemaObject).columnClassName, data.value)
}

function colStyle(col: unknown) {
  return resolveInlineStyle((col as SchemaObject).style, data.value)
}
</script>

<template>
  <div
    data-vamis-grid
    :data-gap="gap"
    :data-align="align"
    :data-valign="valign"
  >
    <div
      v-for="(col, i) in columns"
      :key="i"
      :data-col="gridColumnClass(col)"
      :data-col-valign="gridColumnVAlign(col)"
      :class="colClass(col)"
      :style="colStyle(col)"
    >
      <SchemaRenderer
        v-for="(node, j) in gridColumnBody(col)"
        :key="j"
        :schema="node"
      />
    </div>
  </div>
</template>

<style scoped>
[data-vamis-grid] {
  width: 100%;
  min-width: 0;
}
[data-vamis-grid] > [data-col] {
  min-height: 1px;
  box-sizing: border-box;
  padding-left: 8px;
  padding-right: 8px;
}
@media (min-width: 576px) {
  [data-vamis-grid] {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    min-height: 0;
    margin-left: -8px;
    margin-right: -8px;
  }
}
[data-col~='xs'] {
  flex-basis: 0;
  flex-grow: 1;
  width: 100%;
  max-width: 100%;
}
[data-col~='xsAuto'] {
  flex: 0 0 auto;
  width: auto;
  max-width: 100%;
}
[data-col~='xs1'] { flex: 0 0 calc(100% * 1 / 12); max-width: calc(100% * 1 / 12); }
[data-col~='xs2'] { flex: 0 0 calc(100% * 2 / 12); max-width: calc(100% * 2 / 12); }
[data-col~='xs3'] { flex: 0 0 calc(100% * 3 / 12); max-width: calc(100% * 3 / 12); }
[data-col~='xs4'] { flex: 0 0 calc(100% * 4 / 12); max-width: calc(100% * 4 / 12); }
[data-col~='xs5'] { flex: 0 0 calc(100% * 5 / 12); max-width: calc(100% * 5 / 12); }
[data-col~='xs6'] { flex: 0 0 calc(100% * 6 / 12); max-width: calc(100% * 6 / 12); }
[data-col~='xs7'] { flex: 0 0 calc(100% * 7 / 12); max-width: calc(100% * 7 / 12); }
[data-col~='xs8'] { flex: 0 0 calc(100% * 8 / 12); max-width: calc(100% * 8 / 12); }
[data-col~='xs9'] { flex: 0 0 calc(100% * 9 / 12); max-width: calc(100% * 9 / 12); }
[data-col~='xs10'] { flex: 0 0 calc(100% * 10 / 12); max-width: calc(100% * 10 / 12); }
[data-col~='xs11'] { flex: 0 0 calc(100% * 11 / 12); max-width: calc(100% * 11 / 12); }
[data-col~='xs12'] { flex: 0 0 calc(100% * 12 / 12); max-width: calc(100% * 12 / 12); }

@media (min-width: 576px) {
  [data-col~='sm'] {
    flex-basis: 0;
    flex-grow: 1;
    width: 100%;
    max-width: 100%;
  }
  [data-col~='smAuto'] {
    flex: 0 0 auto;
    width: auto;
    max-width: 100%;
  }
  [data-col~='sm1'] { flex: 0 0 calc(100% * 1 / 12); max-width: calc(100% * 1 / 12); }
  [data-col~='sm2'] { flex: 0 0 calc(100% * 2 / 12); max-width: calc(100% * 2 / 12); }
  [data-col~='sm3'] { flex: 0 0 calc(100% * 3 / 12); max-width: calc(100% * 3 / 12); }
  [data-col~='sm4'] { flex: 0 0 calc(100% * 4 / 12); max-width: calc(100% * 4 / 12); }
  [data-col~='sm5'] { flex: 0 0 calc(100% * 5 / 12); max-width: calc(100% * 5 / 12); }
  [data-col~='sm6'] { flex: 0 0 calc(100% * 6 / 12); max-width: calc(100% * 6 / 12); }
  [data-col~='sm7'] { flex: 0 0 calc(100% * 7 / 12); max-width: calc(100% * 7 / 12); }
  [data-col~='sm8'] { flex: 0 0 calc(100% * 8 / 12); max-width: calc(100% * 8 / 12); }
  [data-col~='sm9'] { flex: 0 0 calc(100% * 9 / 12); max-width: calc(100% * 9 / 12); }
  [data-col~='sm10'] { flex: 0 0 calc(100% * 10 / 12); max-width: calc(100% * 10 / 12); }
  [data-col~='sm11'] { flex: 0 0 calc(100% * 11 / 12); max-width: calc(100% * 11 / 12); }
  [data-col~='sm12'] { flex: 0 0 calc(100% * 12 / 12); max-width: calc(100% * 12 / 12); }
}

@media (min-width: 768px) {
  [data-col~='md'] {
    flex-basis: 0;
    flex-grow: 1;
    width: 100%;
    max-width: 100%;
  }
  [data-col~='mdAuto'] {
    flex: 0 0 auto;
    width: auto;
    max-width: 100%;
  }
  [data-col~='md1'] { flex: 0 0 calc(100% * 1 / 12); max-width: calc(100% * 1 / 12); }
  [data-col~='md2'] { flex: 0 0 calc(100% * 2 / 12); max-width: calc(100% * 2 / 12); }
  [data-col~='md3'] { flex: 0 0 calc(100% * 3 / 12); max-width: calc(100% * 3 / 12); }
  [data-col~='md4'] { flex: 0 0 calc(100% * 4 / 12); max-width: calc(100% * 4 / 12); }
  [data-col~='md5'] { flex: 0 0 calc(100% * 5 / 12); max-width: calc(100% * 5 / 12); }
  [data-col~='md6'] { flex: 0 0 calc(100% * 6 / 12); max-width: calc(100% * 6 / 12); }
  [data-col~='md7'] { flex: 0 0 calc(100% * 7 / 12); max-width: calc(100% * 7 / 12); }
  [data-col~='md8'] { flex: 0 0 calc(100% * 8 / 12); max-width: calc(100% * 8 / 12); }
  [data-col~='md9'] { flex: 0 0 calc(100% * 9 / 12); max-width: calc(100% * 9 / 12); }
  [data-col~='md10'] { flex: 0 0 calc(100% * 10 / 12); max-width: calc(100% * 10 / 12); }
  [data-col~='md11'] { flex: 0 0 calc(100% * 11 / 12); max-width: calc(100% * 11 / 12); }
  [data-col~='md12'] { flex: 0 0 calc(100% * 12 / 12); max-width: calc(100% * 12 / 12); }
}

@media (min-width: 992px) {
  [data-col~='lg'] {
    flex-basis: 0;
    flex-grow: 1;
    width: 100%;
    max-width: 100%;
  }
  [data-col~='lgAuto'] {
    flex: 0 0 auto;
    width: auto;
    max-width: 100%;
  }
  [data-col~='lg1'] { flex: 0 0 calc(100% * 1 / 12); max-width: calc(100% * 1 / 12); }
  [data-col~='lg2'] { flex: 0 0 calc(100% * 2 / 12); max-width: calc(100% * 2 / 12); }
  [data-col~='lg3'] { flex: 0 0 calc(100% * 3 / 12); max-width: calc(100% * 3 / 12); }
  [data-col~='lg4'] { flex: 0 0 calc(100% * 4 / 12); max-width: calc(100% * 4 / 12); }
  [data-col~='lg5'] { flex: 0 0 calc(100% * 5 / 12); max-width: calc(100% * 5 / 12); }
  [data-col~='lg6'] { flex: 0 0 calc(100% * 6 / 12); max-width: calc(100% * 6 / 12); }
  [data-col~='lg7'] { flex: 0 0 calc(100% * 7 / 12); max-width: calc(100% * 7 / 12); }
  [data-col~='lg8'] { flex: 0 0 calc(100% * 8 / 12); max-width: calc(100% * 8 / 12); }
  [data-col~='lg9'] { flex: 0 0 calc(100% * 9 / 12); max-width: calc(100% * 9 / 12); }
  [data-col~='lg10'] { flex: 0 0 calc(100% * 10 / 12); max-width: calc(100% * 10 / 12); }
  [data-col~='lg11'] { flex: 0 0 calc(100% * 11 / 12); max-width: calc(100% * 11 / 12); }
  [data-col~='lg12'] { flex: 0 0 calc(100% * 12 / 12); max-width: calc(100% * 12 / 12); }
}

[data-vamis-grid][data-gap='none'] {
  margin-left: 0;
  margin-right: 0;
}
[data-vamis-grid][data-gap='none'] > [data-col] {
  padding-left: 0;
  padding-right: 0;
}
[data-vamis-grid][data-gap='xs'] {
  margin-left: calc(var(--gap-xs) * -0.5);
  margin-right: calc(var(--gap-xs) * -0.5);
}
[data-vamis-grid][data-gap='xs'] > [data-col] {
  padding-left: calc(var(--gap-xs) * 0.5);
  padding-right: calc(var(--gap-xs) * 0.5);
}
[data-vamis-grid][data-gap='sm'] {
  margin-left: calc(var(--gap-sm) * -0.5);
  margin-right: calc(var(--gap-sm) * -0.5);
}
[data-vamis-grid][data-gap='sm'] > [data-col] {
  padding-left: calc(var(--gap-sm) * 0.5);
  padding-right: calc(var(--gap-sm) * 0.5);
}
[data-vamis-grid][data-gap='base'] {
  margin-left: calc(var(--gap-base) * -0.5);
  margin-right: calc(var(--gap-base) * -0.5);
}
[data-vamis-grid][data-gap='base'] > [data-col] {
  padding-left: calc(var(--gap-base) * 0.5);
  padding-right: calc(var(--gap-base) * 0.5);
}
[data-vamis-grid][data-gap='md'] {
  margin-left: calc(var(--gap-md) * -0.5);
  margin-right: calc(var(--gap-md) * -0.5);
}
[data-vamis-grid][data-gap='md'] > [data-col] {
  padding-left: calc(var(--gap-md) * 0.5);
  padding-right: calc(var(--gap-md) * 0.5);
}
[data-vamis-grid][data-gap='lg'] {
  margin-left: calc(var(--gap-lg) * -0.5);
  margin-right: calc(var(--gap-lg) * -0.5);
}
[data-vamis-grid][data-gap='lg'] > [data-col] {
  padding-left: calc(var(--gap-lg) * 0.5);
  padding-right: calc(var(--gap-lg) * 0.5);
}

@media (min-width: 576px) {
  [data-vamis-grid][data-align='right'] { justify-content: flex-end; }
  [data-vamis-grid][data-align='center'] { justify-content: center; }
  [data-vamis-grid][data-align='between'] { justify-content: space-between; }
  [data-vamis-grid][data-valign='middle'] > [data-col],
  [data-vamis-grid] > [data-col][data-col-valign='middle'] {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  [data-vamis-grid][data-valign='bottom'] > [data-col],
  [data-vamis-grid] > [data-col][data-col-valign='bottom'] {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  [data-vamis-grid][data-valign='between'] > [data-col],
  [data-vamis-grid] > [data-col][data-col-valign='between'] {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  [data-vamis-grid] > [data-col][data-col-valign='top'] {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
}
</style>
