<script setup lang="ts">
import { reactive } from 'vue'
import { provideFormApi, type NodeState } from '@vamis/core'
import { provideForm } from './formContext'

const props = defineProps<{
  row: Record<string, any>
  persist: () => void
}>()

const errors = reactive<Record<string, string>>({})
const store = {
  id: 'combo-row',
  type: 'combo-row',
  data: props.row,
  pristine: props.row,
  fetching: false,
  saving: false,
  errors,
  items: [],
  page: 1,
  perPage: 10,
  total: 0,
  query: {},
  selectedItems: [],
  inited: true,
} as NodeState

function getValue(name: string) {
  return props.row[name]
}

function setValue(name: string, value: unknown) {
  props.row[name] = value
  if (errors[name]) delete errors[name]
  props.persist()
}

function setData(values: Record<string, any>) {
  Object.assign(props.row, values)
  props.persist()
}

function setError(name: string, message: string) {
  errors[name] = message
}

provideForm({
  store,
  getValue,
  setValue,
  submit: async () => undefined,
  reset: () => undefined,
  setError,
})
provideFormApi({
  getValue,
  setValue,
  setData,
  getData: () => ({ ...props.row }),
})
</script>

<template>
  <slot />
</template>
