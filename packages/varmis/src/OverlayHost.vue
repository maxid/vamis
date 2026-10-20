<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, useOverlay } from '@varmis/core'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@varmis/ui'

const overlay = useOverlay()
const dialog = computed(() => overlay?.state.dialog || null)
const drawer = computed(() => overlay?.state.drawer || null)
const extra = computed(() => overlay?.state.data || {})

function setDialogOpen(open: boolean) {
  if (!open) overlay?.closeDialog()
}

function setDrawerOpen(open: boolean) {
  if (!open) overlay?.closeDrawer()
}
</script>

<template>
  <Dialog :open="!!dialog" @update:open="setDialogOpen">
    <DialogContent v-if="dialog" class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{{ dialog.title || '对话框' }}</DialogTitle>
      </DialogHeader>
      <SchemaRenderer :schema="dialog.body || dialog" :extra-data="extra" />
    </DialogContent>
  </Dialog>
  <Sheet :open="!!drawer" @update:open="setDrawerOpen">
    <SheetContent v-if="drawer" class="w-full sm:max-w-md">
      <SheetHeader>
        <SheetTitle>{{ drawer.title || '抽屉' }}</SheetTitle>
      </SheetHeader>
      <div class="px-4 pb-4">
        <SchemaRenderer :schema="drawer.body || drawer" :extra-data="extra" />
      </div>
    </SheetContent>
  </Sheet>
</template>
