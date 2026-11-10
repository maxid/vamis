<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, formLayoutSkipCol, groupChildSchema, type SchemaObject } from '@vamis/core'
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
    <template v-for="(node, i) in body" :key="i">
      <SchemaRenderer
        v-if="vertical || formLayoutSkipCol(childOf(node))"
        :schema="childOf(node)"
      />
      <div v-else class="vamis-form-group-col">
        <SchemaRenderer :schema="childOf(node)" />
      </div>
    </template>
  </div>
</template>
