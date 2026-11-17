<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, formLayoutSkipCol, groupChildSchema, type SchemaNode, type SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'

const props = defineProps<{ schema: SchemaObject }>()
const form = useForm()
const body = computed(() => asArray(props.schema.body || props.schema.controls))
const vertical = computed(() => props.schema.direction === 'vertical')
function childOf(node: SchemaNode) {
  return groupChildSchema(node, props.schema, form?.mode)
}

function ratioStyle(node: SchemaNode) {
  if (!node || typeof node !== 'object') return undefined
  const raw = node.columnRatio
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return undefined
  const ratio = Math.min(12, Math.max(1, n))
  return {
    flex: `0 0 ${(ratio / 12) * 100}%`,
    maxWidth: `${(ratio / 12) * 100}%`,
    width: `${(ratio / 12) * 100}%`,
  }
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
      <div v-else class="vamis-form-group-col" :style="ratioStyle(node)">
        <SchemaRenderer :schema="childOf(node)" />
      </div>
    </template>
  </div>
</template>
