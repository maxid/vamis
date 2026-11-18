<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  claimConfirmHost,
  dialogSizeClass,
  releaseConfirmHost,
  settleConfirm,
  useConfirmState,
} from '@vamis/core'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  levelToVariant,
} from '@vamis/ui'

const state = useConfirmState()
const hostId = ref(0)
const current = computed(() => (state.primaryHost === hostId.value ? state.current : null))
let settling = false

onMounted(() => {
  hostId.value = claimConfirmHost()
})
onUnmounted(() => {
  releaseConfirmHost(hostId.value)
})

function settle(ok: boolean) {
  if (!current.value || settling) return
  settling = true
  settleConfirm(ok)
  queueMicrotask(() => {
    settling = false
  })
}

function onEscape(event: Event) {
  if (!current.value?.closeOnEsc) {
    event.preventDefault()
    return
  }
  settle(false)
}

function preventOutside(event: Event) {
  event.preventDefault()
}
</script>

<template>
  <Dialog :open="!!current">
    <DialogContent
      v-if="current"
      data-vamis-confirm
      overlay-class="vamis-confirm-overlay"
      :class="[dialogSizeClass({ size: current.size }), current.className]"
      :show-close-button="false"
      @pointer-down-outside="preventOutside"
      @escape-key-down="onEscape"
    >
      <DialogHeader v-if="current.title" class="text-left">
        <DialogTitle>{{ current.title }}</DialogTitle>
      </DialogHeader>
      <DialogTitle v-else class="sr-only">系统消息</DialogTitle>
      <DialogDescription class="sr-only">{{ current.msg }}</DialogDescription>
      <div class="vamis-confirm-body" v-html="current.msg" aria-hidden="true" />
      <DialogFooter>
        <Button
          v-if="current.showCancel"
          type="button"
          :variant="levelToVariant(current.cancelBtnLevel)"
          @pointerdown.prevent="settle(false)"
        >
          {{ current.cancelText }}
        </Button>
        <Button
          type="button"
          :variant="levelToVariant(current.confirmBtnLevel)"
          @pointerdown.prevent="settle(true)"
        >
          {{ current.confirmText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
