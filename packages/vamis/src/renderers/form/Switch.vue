<script setup lang="ts">
import { computed } from 'vue'
import { Switch } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const value = computed({
  get: () => !!props.schema.name && !!form?.getValue(props.schema.name),
  set: (v) => props.schema.name && form?.setValue(props.schema.name, v),
})
</script>

<template>
  <FormItem :schema="schema">
    <Switch :model-value="value" :disabled="disabled" @update:model-value="value = $event" />
  </FormItem>
</template>
