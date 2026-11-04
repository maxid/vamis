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
const primary = ref(false)
const current = computed(() => (primary.value ? state.current : null))

onMounted(() => {
  primary.value = claimConfirmHost()
})
onUnmounted(() => {
  releaseConfirmHost()
})

function setOpen(open: boolean) {
  if (!open) settleConfirm(false)
}

function preventIf(condition: boolean, event: Event) {
  if (condition) event.preventDefault()
}
</script>

<template>
  <Dialog :open="!!current" @update:open="setOpen">
    <DialogContent
      v-if="current"
      data-vamis-confirm
      overlay-class="vamis-confirm-overlay"
      :class="[dialogSizeClass({ size: current.size }), current.className]"
      :show-close-button="false"
      @pointer-down-outside="preventIf(true, $event)"
      @escape-key-down="preventIf(!current.closeOnEsc, $event)"
    >
      <DialogHeader v-if="current.title" class="text-left">
        <DialogTitle>{{ current.title }}</DialogTitle>
      </DialogHeader>
      <DialogTitle v-else class="sr-only">系统消息</DialogTitle>
      <DialogDescription class="sr-only">{{ current.msg }}</DialogDescription>
      <div class="vamis-confirm-body" v-html="current.msg" aria-hidden="true" />
      <DialogFooter>
        <Button
          type="button"
          :variant="levelToVariant(current.cancelBtnLevel)"
          @click="settleConfirm(false)"
        >
          {{ current.cancelText }}
        </Button>
        <Button
          type="button"
          :variant="levelToVariant(current.confirmBtnLevel)"
          @click="settleConfirm(true)"
        >
          {{ current.confirmText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
