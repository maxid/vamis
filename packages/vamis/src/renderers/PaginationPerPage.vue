<script setup lang="ts">
import { computed } from 'vue'
import { provideData, useData, useEnv, type SchemaObject } from '@vamis/core'
import Select from './form/Select.vue'

const props = defineProps<{
  value: number
  options: number[]
  disabled?: boolean
  popOverContainerSelector?: string
}>()
const emit = defineEmits<{
  change: [value: number]
}>()
const env = useEnv()
const parentData = useData()
const name = '__vamisPaginationPerPage'
provideData(computed(() => ({ ...parentData.value, [name]: props.value })))
const schema = computed<SchemaObject>(() => ({
  type: 'select',
  name,
  label: false,
  inputOnly: true,
  clearable: false,
  disabled: props.disabled,
  popOverContainerSelector: props.popOverContainerSelector,
  options: props.options.map((count) => ({
    label: env.translate('Pagination.select', { count }),
    value: count,
  })),
}))
</script>

<template>
  <div data-pagination="perpage" class="vamis-pagination__perpage">
    <Select
      :schema="schema"
      :disabled="disabled"
      :value="value"
      @value-change="emit('change', Number($event))"
    />
  </div>
</template>
