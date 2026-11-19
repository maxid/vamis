<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, watch } from 'vue'
import {
  SchemaRenderer,
  createVamisEvent,
  dialogActions,
  dialogBody,
  dialogCloseOnEsc,
  dialogCloseOnOutside,
  dialogDisabled,
  dialogDraggable,
  dialogShowClose,
  dialogShowError,
  dialogShowLoading,
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
  eventEvalData,
  overlayFrameStyle,
  resolveClassName,
  runOnEvent,
  useEnv,
  useOverlay,
  useScoped,
  type OverlayLayerState,
  type ScopedComponent,
} from '@vamis/core'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  VamisSpinnerMark,
} from '@vamis/ui'
import RowValueHost from './renderers/data/RowValueHost.vue'

const overlay = useOverlay()
const env = useEnv()
const scoped = useScoped()
const drawer = computed(() => overlay?.state.drawer || null)
const extra = computed(() => overlay?.state.data || {})
const dialogLayers = computed<OverlayLayerState[]>(() => {
  if (overlay?.state.dialogs?.length) return overlay.state.dialogs
  const schema = overlay?.state.dialog
  return schema
    ? [{ key: 0, schema, data: extra.value, loading: false, error: '' }]
    : []
})

interface DragOffset {
  left: number
  top: number
}

interface DragSession {
  key: number
  startX: number
  startY: number
  originLeft: number
  originTop: number
  width: number
  height: number
}

const dragPositions = reactive<Record<number, DragOffset>>({})
let dragSession: DragSession | null = null
let resizeFrame = 0
const registeredDialogs = new Map<number, ScopedComponent>()

function onOverlayFieldChange(layerKey: number, payload: { name: string; value: unknown }) {
  if (!payload.name) return
  overlay?.setValueAt?.(layerKey, payload.name, payload.value)
}

function onTopOverlayFieldChange(payload: { name: string; value: unknown }) {
  if (payload.name) overlay?.setValue(payload.name, payload.value)
}

async function dispatchDialogEvent(
  layer: OverlayLayerState,
  eventName: 'confirm' | 'cancel',
  native?: Event,
) {
  const event = createVamisEvent(eventName, layer.data, native)
  await runOnEvent(layer.schema, eventName, {
    env,
    data: eventEvalData(layer.data, event),
    scoped,
    overlay,
    event,
  })
  return event
}

async function closeDialogLayer(layer: OverlayLayerState, native?: Event) {
  const event = await dispatchDialogEvent(layer, 'cancel', native)
  if (event.prevented) return false
  if (overlay?.closeDialogByKey) overlay.closeDialogByKey(layer.key)
  else overlay?.closeDialog()
  return true
}

function setDialogOpen(layer: OverlayLayerState, open: boolean) {
  if (!open) void closeDialogLayer(layer)
}

function onDialogOutside(layer: OverlayLayerState, event: Event) {
  event.preventDefault()
  if (dialogCloseOnOutside(layer.schema)) void closeDialogLayer(layer, event)
}

function onDialogEscape(layer: OverlayLayerState, event: Event) {
  event.preventDefault()
  if (dialogCloseOnEsc(layer.schema)) void closeDialogLayer(layer, event)
}

function setDrawerOpen(open: boolean) {
  if (!open && overlay?.state.drawer) overlay.closeDrawer()
}

function preventIf(condition: boolean, event: Event) {
  if (condition) event.preventDefault()
}

function dialogClass(layer: OverlayLayerState): Array<string | Record<string, unknown>> {
  return [
    dialogSizeClass(layer.schema),
    resolveClassName(layer.schema.className, layer.data),
  ]
}

function dialogStyle(layer: OverlayLayerState, index: number) {
  const full = String(layer.schema.size || '') === 'full'
  const position = dragPositions[layer.key]
  const baseTop = full ? 30 : 60 + index * 30
  if (position) {
    return {
      ...overlayFrameStyle(layer.schema, 'dialog'),
      left: `${position.left}px`,
      top: `${position.top}px`,
      transform: 'none',
      translate: 'none',
    }
  }
  return {
    ...overlayFrameStyle(layer.schema, 'dialog'),
    left: '50%',
    top: `${baseTop}px`,
  }
}

function dialogBodyClass(layer: OverlayLayerState): string {
  return typeof layer.schema.bodyClassName === 'string' ? layer.schema.bodyClassName : ''
}

function dialogInfo(layer: OverlayLayerState): boolean {
  return dialogShowError(layer.schema) && !!layer.error
}

function layerDisabled(layer: OverlayLayerState): boolean {
  return dialogDisabled(layer.schema) || layer.loading
}

function stopDragging() {
  dragSession = null
  document.removeEventListener('pointermove', moveDialog)
  document.removeEventListener('pointerup', stopDragging)
  document.removeEventListener('pointercancel', stopDragging)
}

function moveDialog(event: PointerEvent) {
  if (!dragSession) return
  event.preventDefault()
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
  const maxLeft = Math.max(10, window.innerWidth - dragSession.width - 10)
  const maxTop = Math.max(10, window.innerHeight - dragSession.height - 10)
  dragPositions[dragSession.key] = {
    left: clamp(dragSession.originLeft + event.clientX - dragSession.startX, 10, maxLeft),
    top: clamp(dragSession.originTop + event.clientY - dragSession.startY, 10, maxTop),
  }
}

function startDialogDrag(layer: OverlayLayerState, event: PointerEvent) {
  if (!dialogDraggable(layer.schema) || event.button !== 0) return
  if ((event.target as HTMLElement | null)?.closest('[data-slot="dialog-close"]')) return
  if (typeof window === 'undefined' || window.matchMedia('(max-width: 768px)').matches) return
  const content = (event.currentTarget as HTMLElement | null)?.closest<HTMLElement>(
    '[data-slot="dialog-content"]',
  )
  if (!content) return
  const rect = content.getBoundingClientRect()
  dragPositions[layer.key] = { left: rect.left, top: rect.top }
  dragSession = {
    key: layer.key,
    startX: event.clientX,
    startY: event.clientY,
    originLeft: rect.left,
    originTop: rect.top,
    width: rect.width,
    height: rect.height,
  }
  event.preventDefault()
  document.addEventListener('pointermove', moveDialog, { passive: false })
  document.addEventListener('pointerup', stopDragging)
  document.addEventListener('pointercancel', stopDragging)
}

function syncDialogRegistry(layers: OverlayLayerState[]) {
  const active = new Set(layers.map((layer) => layer.key))
  for (const key of Object.keys(dragPositions)) {
    if (!active.has(Number(key))) delete dragPositions[Number(key)]
  }
  for (const [key, component] of registeredDialogs) {
    if (active.has(key)) continue
    scoped?.unregister(component)
    registeredDialogs.delete(key)
  }
  for (const layer of layers) {
    if (registeredDialogs.has(layer.key)) continue
    if (layer.schema.id == null && layer.schema.name == null) continue
    const component: ScopedComponent = {
      id: layer.schema.id == null ? undefined : String(layer.schema.id),
      name: layer.schema.name == null ? undefined : String(layer.schema.name),
      type: 'dialog',
      schema: layer.schema,
      getData: () => dialogLayers.value.find((item) => item.key === layer.key)?.data || {},
      setData: (values, replace) => overlay?.setDataAt?.(layer.key, values, replace),
    }
    scoped?.register(component)
    registeredDialogs.set(layer.key, component)
  }
}

function clampDraggedDialogs() {
  if (typeof window === 'undefined') return
  for (const layer of dialogLayers.value) {
    const position = dragPositions[layer.key]
    if (!position) continue
    const el = document.querySelector<HTMLElement>(
      `[data-vamis-dialog-key="${layer.key}"]`,
    )
    if (!el) continue
    const rect = el.getBoundingClientRect()
    const maxLeft = Math.max(10, window.innerWidth - rect.width - 10)
    const maxTop = Math.max(10, window.innerHeight - rect.height - 10)
    dragPositions[layer.key] = {
      left: Math.min(maxLeft, Math.max(10, position.left)),
      top: Math.min(maxTop, Math.max(10, position.top)),
    }
  }
}

function onWindowResize() {
  if (resizeFrame) cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0
    clampDraggedDialogs()
  })
}

watch(dialogLayers, syncDialogRegistry, { immediate: true })
onMounted(() => window.addEventListener('resize', onWindowResize))
onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize)
  if (resizeFrame) cancelAnimationFrame(resizeFrame)
  stopDragging()
  for (const component of registeredDialogs.values()) scoped?.unregister(component)
  registeredDialogs.clear()
})
</script>

<template>
  <Dialog
    v-for="(layer, index) in dialogLayers"
    :key="layer.key"
    :open="true"
    @update:open="setDialogOpen(layer, $event)"
  >
    <DialogContent
      data-vamis-overlay="dialog"
      :data-vamis-dialog-key="layer.key"
      :class="dialogClass(layer)"
      :style="dialogStyle(layer, index)"
      :show-close-button="false"
      @pointer-down-outside="onDialogOutside(layer, $event)"
      @escape-key-down="onDialogEscape(layer, $event)"
    >
      <DialogHeader
        v-if="
          dialogTitleNode(layer.schema) ||
          dialogTitle(layer.schema, layer.data) ||
          (dialogShowClose(layer.schema) && !layer.loading)
        "
        :class="dialogDraggable(layer.schema) && 'cursor-move select-none'"
        @pointerdown="startDialogDrag(layer, $event)"
      >
        <DialogTitle v-if="dialogTitleNode(layer.schema) || dialogTitle(layer.schema, layer.data)">
          <SchemaRenderer
            v-if="dialogTitleNode(layer.schema)"
            :schema="dialogTitleNode(layer.schema)"
            :extra-data="layer.data"
          />
          <template v-else>{{ dialogTitle(layer.schema, layer.data) }}</template>
        </DialogTitle>
        <DialogTitle v-else class="sr-only">对话框</DialogTitle>
        <DialogCloseButton
          v-if="dialogShowClose(layer.schema) && !layer.loading"
        />
      </DialogHeader>
      <div
        data-vamis-overlay-body="dialog"
        class="min-h-0 flex-1 overflow-auto"
        :class="dialogBodyClass(layer)"
      >
        <div
          v-if="dialogShowLoading(layer.schema) && layer.loading"
          class="vamis-dialog-body-loading"
          aria-busy="true"
        >
          <div class="vamis-dialog-body-loading-mask" />
          <VamisSpinnerMark />
        </div>
        <RowValueHost @change="onOverlayFieldChange(layer.key, $event)">
          <SchemaRenderer
            v-for="(node, i) in dialogBody(layer.schema, layerDisabled(layer))"
            :key="`${layer.key}-${i}`"
            :schema="node"
            :extra-data="layer.data"
          />
        </RowValueHost>
      </div>
      <DialogFooter v-if="dialogActions(layer.schema).length || dialogInfo(layer)">
        <div v-if="dialogInfo(layer)" class="vamis-dialog-info">
          <span v-if="dialogShowError(layer.schema) && layer.error" class="vamis-dialog-error">
            {{ layer.error }}
          </span>
        </div>
        <SchemaRenderer
          v-for="(node, i) in dialogActions(layer.schema, layerDisabled(layer))"
          :key="i"
          :schema="node"
          :extra-data="layer.data"
        />
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
        <RowValueHost @change="onTopOverlayFieldChange">
          <SchemaRenderer
            v-for="(node, i) in drawerBody(drawer)"
            :key="`${overlay?.state.seq}-${i}`"
            :schema="node"
            :extra-data="extra"
          />
        </RowValueHost>
      </div>
      <SheetFooter v-if="drawerActions(drawer).length" class="flex-row justify-end gap-2">
        <SchemaRenderer v-for="(node, i) in drawerActions(drawer)" :key="i" :schema="node" :extra-data="extra" />
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
