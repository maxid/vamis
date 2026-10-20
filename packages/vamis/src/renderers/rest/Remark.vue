<script setup lang="ts">
import { computed } from 'vue'
import { filterTpl, type SchemaObject } from '@vamis/core'
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@vamis/ui'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const content = computed(() =>
  filterTpl(props.schema.content || props.schema.body || props.schema.title || '说明', props.data),
)
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button type="button" variant="ghost" size="icon-xs" class="text-muted-foreground" aria-label="备注">
          ?
        </Button>
      </TooltipTrigger>
      <TooltipContent>{{ content }}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
