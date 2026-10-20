<script setup lang="ts">
import { computed } from 'vue'
import { Checkbox } from '@varmis/ui'
import type { SchemaObject } from '@varmis/core'
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
  <FormItem :schema="{ ...schema, label: schema.label !== false ? schema.option || schema.label : false }">
    <label class="flex items-center gap-2 text-sm">
      <Checkbox :model-value="value" :disabled="disabled" @update:model-value="value = $event === true" />
      <span v-if="schema.option">{{ schema.option }}</span>
    </label>
  </FormItem>
</template>
