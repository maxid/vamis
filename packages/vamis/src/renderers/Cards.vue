<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  cardsCardSchema,
  cardsColumnsCount,
  cardsFooter,
  cardsHeader,
  cardsMasonry,
  cardsPlaceholder,
  cardsPlaceholderNode,
  cardsSource,
  cardsTitle,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
  items?: Record<string, any>[]
}>()

const rows = computed(() => cardsSource(props.schema, props.data || {}, props.items))
const card = computed(() => cardsCardSchema(props.schema))
const title = computed(() => cardsTitle(props.schema, props.data || {}))
const masonry = computed(() => cardsMasonry(props.schema))
const columnsCount = computed(() => cardsColumnsCount(props.schema))
const placeholder = computed(() => cardsPlaceholder(props.schema))
const placeholderNode = computed(() => cardsPlaceholderNode(props.schema))
const header = computed(() => cardsHeader(props.schema))
const footer = computed(() => cardsFooter(props.schema))
const colsStyle = computed(() => {
  if (!columnsCount.value) return undefined
  return { '--cards-cols': String(columnsCount.value) } as Record<string, string>
})
</script>

<template>
  <div class="vamis-cards-wrap">
    <div v-if="title" class="vamis-cards-title">{{ title }}</div>
    <SchemaRenderer v-for="(node, i) in header" :key="'h' + i" :schema="node" />
    <div
      v-if="rows.length"
      class="vamis-cards"
      :class="{
        'is-masonry': masonry,
        'is-count': columnsCount > 0,
      }"
      :style="colsStyle"
    >
      <div v-for="(row, i) in rows" :key="i" class="vamis-cards-item">
        <SchemaRenderer :schema="card" :extra-data="{ ...row, index: i }" />
      </div>
    </div>
    <div v-else class="vamis-cards-placeholder">
      <SchemaRenderer v-if="placeholderNode" :schema="placeholderNode" />
      <template v-else>{{ placeholder }}</template>
    </div>
    <SchemaRenderer v-for="(node, i) in footer" :key="'f' + i" :schema="node" />
  </div>
</template>

<style>
.vamis-cards-wrap {
  width: 100%;
}
.vamis-cards-title {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 500;
}
.vamis-cards {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
}
@media (min-width: 576px) {
  .vamis-cards:not(.is-count):not(.is-masonry) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .vamis-cards.is-count {
    grid-template-columns: repeat(var(--cards-cols, 1), minmax(0, 1fr));
  }
}
@media (min-width: 768px) {
  .vamis-cards:not(.is-count):not(.is-masonry) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (min-width: 992px) {
  .vamis-cards:not(.is-count):not(.is-masonry) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
.vamis-cards.is-masonry {
  display: block;
  column-count: 1;
  column-gap: 12px;
}
.vamis-cards.is-masonry.is-count {
  column-count: var(--cards-cols, 1);
}
@media (min-width: 576px) {
  .vamis-cards.is-masonry:not(.is-count) {
    column-count: 2;
  }
}
@media (min-width: 768px) {
  .vamis-cards.is-masonry:not(.is-count) {
    column-count: 3;
  }
}
@media (min-width: 992px) {
  .vamis-cards.is-masonry:not(.is-count) {
    column-count: 4;
  }
}
.vamis-cards:not(.is-masonry) .vamis-cards-item {
  display: flex;
  min-width: 0;
}
.vamis-cards:not(.is-masonry) .vamis-cards-item > .vamis-node {
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
}
.vamis-cards:not(.is-masonry) .vamis-card {
  height: 100%;
}
.vamis-cards.is-masonry .vamis-cards-item {
  display: block;
  break-inside: avoid;
  margin-bottom: 12px;
}
.vamis-cards-placeholder {
  width: 100%;
  height: 100px;
  line-height: 100px;
  text-align: center;
  color: var(--muted-foreground);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
</style>
