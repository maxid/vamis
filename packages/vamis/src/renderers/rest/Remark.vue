<script setup lang="ts">
import { computed } from 'vue'
import { filterTpl, type SchemaObject } from '@vamis/core'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@vamis/ui'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()

const content = computed(() => {
  const schema = props.schema
  const tip = schema.tooltip ?? schema.content ?? schema.body
  if (typeof tip === 'string') return filterTpl(tip, props.data)
  if (tip && typeof tip === 'object') {
    const text = (tip as SchemaObject).content || (tip as SchemaObject).body || (tip as SchemaObject).title
    return filterTpl(text || '', props.data)
  }
  return filterTpl(schema.title || '', props.data)
})
const label = computed(() => {
  const raw = props.schema.tooltip?.label ?? props.schema.label
  return typeof raw === 'string' ? filterTpl(raw, props.data) : ''
})
const side = computed(() => {
  const placement = String(props.schema.tooltip?.placement || props.schema.placement || 'bottom')
  if (placement === 'top' || placement === 'left' || placement === 'right') return placement
  return 'bottom'
})
const rounded = computed(() =>
  (props.schema.tooltip?.shape ?? props.schema.shape) === 'circle' ? 'rounded-full' : 'rounded-sm',
)
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <button
          type="button"
          class="ml-1 inline-flex shrink-0 cursor-help items-center align-middle text-muted-foreground/55 outline-none"
          :aria-label="label || content || '说明'"
        >
          <span v-if="label" class="mr-1 text-xs">{{ label }}</span>
          <span
            class="inline-flex size-4 items-center justify-center overflow-hidden border border-border bg-muted transition-colors hover:border-warning hover:bg-warning hover:text-warning-foreground"
            :class="rounded"
            aria-hidden="true"
          >
            <svg class="size-full" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
              <text font-size="12" fill="currentColor">
                <tspan x="3" y="10.5">？</tspan>
              </text>
            </svg>
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent v-if="content" :side="side">{{ content }}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
