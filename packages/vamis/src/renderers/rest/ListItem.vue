<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, filterTpl, popOverFieldSchema, resolveClassName, type SchemaObject } from '@vamis/core'
import { provideListItemField } from '../listItemField'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
provideListItemField()
const body = computed(() => asArray(props.schema.body))
const actions = computed(() =>
  asArray(props.schema.actions || props.schema.buttons).map((node) => {
    const rec =
      node && typeof node === 'object' && !Array.isArray(node)
        ? (node as SchemaObject)
        : ({ type: 'button', label: String(node ?? '') } as SchemaObject)
    return { size: 'sm', level: 'link', type: 'button', ...rec }
  }),
)
const title = computed(() => filterTpl(props.schema.title || props.schema.itemTitle || '', props.data))
const subTitle = computed(() => filterTpl(props.schema.subTitle || '', props.data))
const desc = computed(() => props.schema.desc)
const avatar = computed(() => filterTpl(props.schema.avatar || '', props.data))
const titleClass = computed(() => resolveClassName(props.schema.titleClassName || 'h5', props.data))
const avatarClass = computed(() =>
  resolveClassName(props.schema.avatarClassName || 'thumb-sm avatar m-r', props.data),
)
const actionsAt = computed(() => (props.schema.actionsPosition === 'left' ? 'left' : 'right'))
const descNode = computed(() => {
  const value = desc.value
  if (value == null || value === '') return null
  if (typeof value === 'object') return value as SchemaObject
  return { type: 'tpl', tpl: String(value) } as SchemaObject
})
</script>

<template>
  <div
    data-vamis-list-item
    :class="[`vamis-list-item--actions-${actionsAt}`, schema.className]"
  >
    <div v-if="actions.length" class="vamis-list-item__actions">
      <SchemaRenderer v-for="(node, i) in actions" :key="'a' + i" :schema="node" />
    </div>
    <span v-if="avatar" class="vamis-list-item__avatar" :class="avatarClass">
      <img :src="avatar" alt="">
    </span>
    <div class="vamis-list-item__content">
      <p v-if="title" class="vamis-list-item__title" :class="titleClass">{{ title }}</p>
      <div v-if="subTitle">
        <small class="vamis-list-item__subtitle">{{ subTitle }}</small>
      </div>
      <SchemaRenderer v-if="descNode" :schema="descNode" />
      <div v-if="body.length" class="vamis-list-item__body">
        <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="popOverFieldSchema(node)" />
      </div>
    </div>
  </div>
</template>
