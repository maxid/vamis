<script setup lang="ts">
import { computed } from 'vue'
import { getByPath, useData, useValueHost, type SchemaObject } from '@vamis/core'
import EventEditor from './EventEditor.vue'

const props = defineProps<{
  schema: SchemaObject
}>()
const data = useData()
const host = useValueHost()
const value = computed(
  () => (props.schema.name ? getByPath(data.value, props.schema.name) : {}) as Record<string, any>,
)

function change(next: Record<string, any>) {
  if (props.schema.name) host?.setValue(props.schema.name, next)
}
</script>

<template>
  <EventEditor :value="value" @change="change" />
</template>
