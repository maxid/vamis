<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const ICONS = ['★', '♥', '⚙', '⚑', '●', '■', '▲', '➤']
const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const value = computed({
  get: () => String((props.schema.name ? form?.getValue(props.schema.name) : '') || ''),
  set: (v: string) => props.schema.name && form?.setValue(props.schema.name, v),
})
const icons = computed(() => (props.schema.options || ICONS).map((item: any) => (typeof item === 'object' ? item.value || item.label : item)))
</script>

<template>
  <FormItem :schema="schema">
    <div class="flex flex-wrap gap-1">
      <Button
        v-for="icon in icons"
        :key="String(icon)"
        type="button"
        size="icon-sm"
        :variant="value === String(icon) ? 'default' : 'outline'"
        :disabled="disabled"
        @click="value = String(icon)"
      >
        {{ icon }}
      </Button>
    </div>
  </FormItem>
</template>
