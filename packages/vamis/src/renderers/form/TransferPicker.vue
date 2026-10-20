<script setup lang="ts">
import { ref } from 'vue'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import Transfer from './Transfer.vue'

defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const open = ref(false)
</script>

<template>
  <div class="flex items-center gap-2">
    <Dialog v-model:open="open">
      <DialogTrigger as-child>
        <Button type="button" variant="outline" :disabled="disabled">{{ schema.pickerLabel || schema.label || '请选择' }}</Button>
      </DialogTrigger>
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ schema.label || '选择' }}</DialogTitle>
        </DialogHeader>
        <Transfer :schema="schema" :disabled="disabled" />
      </DialogContent>
    </Dialog>
    <span class="text-xs text-muted-foreground">弹层穿梭选择</span>
  </div>
</template>
