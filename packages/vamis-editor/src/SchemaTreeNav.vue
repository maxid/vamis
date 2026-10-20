<script setup lang="ts">
import { Badge } from '@vamis/ui'
import type { SchemaTreeNode } from './tree'
import { PALETTE_MIME, TREE_MIME } from './palette'

defineProps<{
  nodes: SchemaTreeNode[]
  selectedPath: string
  depth?: number
}>()

const emit = defineEmits<{
  select: [path: string]
  drop: [path: string, type: string]
  move: [fromPath: string, toPath: string]
}>()

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

function onDragStart(event: DragEvent, path: string) {
  event.dataTransfer?.setData(TREE_MIME, path)
  event.dataTransfer?.setData('text/plain', path)
}

function onDrop(event: DragEvent, path: string) {
  event.preventDefault()
  event.stopPropagation()
  const from = event.dataTransfer?.getData(TREE_MIME) || ''
  if (from && from !== path) {
    emit('move', from, path)
    return
  }
  const type = event.dataTransfer?.getData(PALETTE_MIME) || event.dataTransfer?.getData('text/plain') || ''
  if (type && type !== from) emit('drop', path, type)
}
</script>

<template>
  <div>
    <div v-for="node in nodes" :key="node.id" class="space-y-0.5">
      <button
        type="button"
        draggable="true"
        class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-sidebar-accent"
        :class="selectedPath === node.path ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''"
        :style="{ paddingLeft: `${8 + (depth || 0) * 12}px` }"
        @click="emit('select', node.path)"
        @dragstart="onDragStart($event, node.path)"
        @dragover="onDragOver"
        @drop="onDrop($event, node.path)"
      >
        <Badge variant="outline" class="font-mono text-[10px]">{{ node.type }}</Badge>
        <span class="truncate">{{ node.label }}</span>
      </button>
      <SchemaTreeNav
        v-if="node.children.length"
        :nodes="node.children"
        :selected-path="selectedPath"
        :depth="(depth || 0) + 1"
        @select="emit('select', $event)"
        @drop="(childPath, type) => emit('drop', childPath, type)"
        @move="(from, to) => emit('move', from, to)"
      />
    </div>
  </div>
</template>
