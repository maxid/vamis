<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import { dumpJoined, normalizeOptions, optionValuesEqual, parseJoined } from '../../options'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const multiple = computed(() => !!props.schema.multiple)
const options = computed(() => normalizeOptions(props.schema.options))
const selected = computed({
  get: () => parseJoined(props.schema.name ? form?.getValue(props.schema.name) : '', multiple.value, props.schema.joinValues !== false),
  set: (values: unknown[]) =>
    props.schema.name && form?.setValue(props.schema.name, dumpJoined(values, multiple.value, props.schema.joinValues !== false)),
})
function pick(value: unknown) {
  if (!multiple.value) {
    selected.value = [value]
    return
  }
  const has = selected.value.some((item) => optionValuesEqual(item, value))
  selected.value = has ? selected.value.filter((item) => !optionValuesEqual(item, value)) : [...selected.value, value]
}
</script>

<template>
  <FormItem :schema="schema">
    <div class="space-y-1">
      <Button
        v-for="opt in options"
        :key="String(opt.value)"
        type="button"
        class="w-full justify-start"
        :variant="selected.some((item) => optionValuesEqual(item, opt.value)) ? 'default' : 'outline'"
        :disabled="disabled"
        @click="pick(opt.value)"
      >
        {{ opt.label }}
      </Button>
    </div>
  </FormItem>
</template>
