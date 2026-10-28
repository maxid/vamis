<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  SchemaRenderer,
  cardsCardSchema,
  cardsCheckOnItemClick,
  cardsColumnsCount,
  cardsFooter,
  cardsHeader,
  cardsHideCheckToggler,
  cardsMasonry,
  cardsMultiple,
  cardsPlaceholder,
  cardsPlaceholderNode,
  cardsSelectable,
  cardsSource,
  cardsTitle,
  type SchemaObject,
} from '@vamis/core'
import { useCrudHost } from './data/crudHost'
import { provideCardsSelect } from './cardsSelect'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
  items?: Record<string, any>[]
}>()

const host = useCrudHost()
const localSelected = ref<Record<string, any>[]>([])
const rows = computed(() => cardsSource(props.schema, props.data || {}, props.items))
const card = computed(() => cardsCardSchema(props.schema))
const title = computed(() => cardsTitle(props.schema, props.data || {}))
const masonry = computed(() => cardsMasonry(props.schema))
const columnsCount = computed(() => cardsColumnsCount(props.schema))
const placeholder = computed(() => cardsPlaceholder(props.schema))
const placeholderNode = computed(() => cardsPlaceholderNode(props.schema))
const header = computed(() => cardsHeader(props.schema))
const footer = computed(() => cardsFooter(props.schema))
const selectable = computed(() => cardsSelectable(props.schema))
const checkOnItemClick = computed(() => cardsCheckOnItemClick(props.schema))
const hideCheckToggler = computed(() => cardsHideCheckToggler(props.schema))
const multiple = computed(() => cardsMultiple(props.schema))
const colsStyle = computed(() => {
  if (!columnsCount.value) return undefined
  return { '--cards-cols': String(columnsCount.value) } as Record<string, string>
})

function rowKey(row: Record<string, any>) {
  if (host?.primaryField && row[host.primaryField] != null && row[host.primaryField] !== '') {
    return String(row[host.primaryField])
  }
  return row.id != null && row.id !== '' ? String(row.id) : JSON.stringify(row)
}

function selectedList() {
  return host ? host.selectedItems : localSelected.value
}

function itemKey(row: Record<string, any>) {
  if (row.cardsItemKey != null && row.cardsItemKey !== '') return String(row.cardsItemKey)
  return rowKey(row)
}

function sourceRow(row: Record<string, any>) {
  const key = itemKey(row)
  return rows.value.find((item) => rowKey(item) === key) || row
}

function isSelected(row: Record<string, any>) {
  const key = itemKey(row)
  return selectedList().some((item) => rowKey(item) === key)
}

function setSelected(items: Record<string, any>[]) {
  if (host) host.setSelectedItems(items)
  else localSelected.value = items
}

function toggle(row: Record<string, any>, checked?: boolean) {
  const actual = sourceRow(row)
  const on = checked == null ? !isSelected(actual) : checked
  if (!multiple.value) {
    setSelected(on ? [actual] : [])
    return
  }
  if (on) {
    if (!isSelected(actual)) setSelected([...selectedList(), actual])
    return
  }
  const key = rowKey(actual)
  setSelected(selectedList().filter((item) => rowKey(item) !== key))
}

provideCardsSelect({
  selectable,
  checkOnItemClick,
  hideCheckToggler,
  multiple,
  isSelected,
  toggle,
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
        <SchemaRenderer :schema="card" :extra-data="{ ...row, index: i, cardsItemKey: rowKey(row) }" />
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
  width: 100%;
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
  display: inline-block;
  width: 100%;
  max-width: unset;
  break-inside: avoid;
  -webkit-column-break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 12px;
}
.vamis-cards.is-masonry .vamis-cards-item > .vamis-node {
  display: block;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
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
