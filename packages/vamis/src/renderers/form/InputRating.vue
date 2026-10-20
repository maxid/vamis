<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const count = computed(() => Number(props.schema.count || 5))
const value = computed({
  get: () => Number(props.schema.name ? form?.getValue(props.schema.name) : 0) || 0,
  set: (v: number) => props.schema.name && form?.setValue(props.schema.name, v),
})
</script>

<template>
  <FormItem :schema="schema">
    <div class="flex items-center gap-1">
      <Button
        v-for="n in count"
        :key="n"
        type="button"
        variant="ghost"
        size="icon-xs"
        class="text-lg"
        :disabled="disabled"
        @click="value = n"
      >
        <span :class="n <= value ? 'text-amber-500' : 'text-muted-foreground'">★</span>
      </Button>
      <span class="text-xs text-muted-foreground">{{ value }}/{{ count }}</span>
    </div>
  </FormItem>
</template>
