<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  dialogActions,
  dialogBody,
  dialogCloseOnEsc,
  dialogCloseOnOutside,
  dialogShowClose,
  dialogSizeClass,
  dialogTitle,
  dialogTitleNode,
  drawerActions,
  drawerBody,
  drawerCloseOnEsc,
  drawerCloseOnOutside,
  drawerPosition,
  drawerShowClose,
  drawerShowOverlay,
  drawerSizeClass,
  drawerTitle,
  drawerTitleNode,
  overlayFrameStyle,
  useOverlay,
} from '@vamis/core'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@vamis/ui'

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

function preventIf(condition: boolean, event: Event) {
  if (condition) event.preventDefault()
}
</script>

<template>
  <Dialog :open="!!dialog" @update:open="setDialogOpen">
    <DialogContent
      v-if="dialog"
      data-vamis-overlay="dialog"
      :class="dialogSizeClass(dialog)"
      :style="overlayFrameStyle(dialog, 'dialog')"
      :show-close-button="dialogShowClose(dialog)"
      @pointer-down-outside="preventIf(!dialogCloseOnOutside(dialog), $event)"
      @escape-key-down="preventIf(!dialogCloseOnEsc(dialog), $event)"
    >
      <DialogHeader>
        <DialogTitle>
          <SchemaRenderer v-if="dialogTitleNode(dialog)" :schema="dialogTitleNode(dialog)" :extra-data="extra" />
          <template v-else>{{ dialogTitle(dialog, extra) || '对话框' }}</template>
        </DialogTitle>
      </DialogHeader>
      <div class="min-h-0 overflow-auto">
        <SchemaRenderer
          v-for="(node, i) in dialogBody(dialog)"
          :key="`${overlay?.state.seq}-${i}`"
          :schema="node"
          :extra-data="extra"
        />
      </div>
      <DialogFooter v-if="dialogActions(dialog).length">
        <SchemaRenderer v-for="(node, i) in dialogActions(dialog)" :key="i" :schema="node" :extra-data="extra" />
      </DialogFooter>
    </DialogContent>
  </Dialog>
  <Sheet :open="!!drawer" @update:open="setDrawerOpen">
    <SheetContent
      v-if="drawer"
      data-vamis-overlay="drawer"
      :side="drawerPosition(drawer)"
      :class="drawerSizeClass(drawer)"
      :style="overlayFrameStyle(drawer, 'drawer')"
      :show-close-button="drawerShowClose(drawer)"
      :overlay="drawerShowOverlay(drawer)"
      @pointer-down-outside="preventIf(!drawerCloseOnOutside(drawer), $event)"
      @escape-key-down="preventIf(!drawerCloseOnEsc(drawer), $event)"
    >
      <SheetHeader>
        <SheetTitle>
          <SchemaRenderer v-if="drawerTitleNode(drawer)" :schema="drawerTitleNode(drawer)" :extra-data="extra" />
          <template v-else>{{ drawerTitle(drawer, extra) || '抽屉' }}</template>
        </SheetTitle>
      </SheetHeader>
      <div class="min-h-0 flex-1 overflow-auto px-4">
        <SchemaRenderer
          v-for="(node, i) in drawerBody(drawer)"
          :key="`${overlay?.state.seq}-${i}`"
          :schema="node"
          :extra-data="extra"
        />
      </div>
      <SheetFooter v-if="drawerActions(drawer).length" class="flex-row justify-end gap-2">
        <SchemaRenderer v-for="(node, i) in drawerActions(drawer)" :key="i" :schema="node" :extra-data="extra" />
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
