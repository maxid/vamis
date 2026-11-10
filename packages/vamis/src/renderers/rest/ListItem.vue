<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, filterTpl, popOverFieldSchema, type SchemaObject } from '@vamis/core'
import { provideListItemField } from '../listItemField'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
provideListItemField()
const body = computed(() => asArray(props.schema.body))
const actions = computed(() => asArray(props.schema.actions || props.schema.buttons))
const title = computed(() => filterTpl(props.schema.title || props.schema.itemTitle || '', props.data))
const subTitle = computed(() => filterTpl(props.schema.subTitle || props.schema.desc || '', props.data))
</script>

<template>
  <div data-vamis-list-item>
    <div v-if="actions.length" class="vamis-list-item__actions">
      <SchemaRenderer v-for="(node, i) in actions" :key="'a' + i" :schema="node" />
    </div>
    <div class="vamis-list-item__content">
      <p v-if="title" class="vamis-list-item__title">{{ title }}</p>
      <p v-if="subTitle" class="vamis-list-item__subtitle">{{ subTitle }}</p>
      <div v-if="body.length" class="vamis-list-item__body">
        <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="popOverFieldSchema(node)" />
      </div>
    </div>
  </div>
</template>
