<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, groupChildSchema, type SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'

const props = defineProps<{ schema: SchemaObject }>()
const form = useForm()
const body = computed(() => asArray(props.schema.body || props.schema.controls))
const vertical = computed(() => props.schema.direction === 'vertical')
function childOf(node: SchemaObject) {
  return groupChildSchema(node, props.schema, form?.mode)
}
</script>

<template>
  <div
    class="vamis-form-group"
    :class="vertical ? 'vamis-form-group--ver' : 'vamis-form-group--hor'"
  >
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="childOf(node)" />
  </div>
</template>
