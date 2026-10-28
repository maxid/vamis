<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import type { ToastItem } from '@vamis/core'
import { XIcon, levelToFeedbackIcon } from '@vamis/ui'

const props = defineProps<{ item: ToastItem }>()
const emit = defineEmits<{ dismiss: [] }>()

const visible = ref(true)
let timer: ReturnType<typeof setTimeout> | undefined

const levelIcon = computed(() => levelToFeedbackIcon(props.item.level))

function clearTimer() {
  if (timer) clearTimeout(timer)
  timer = undefined
}

function startTimer() {
  clearTimer()
  const timeout = props.item.timeout
  if (timeout) timer = setTimeout(close, timeout)
}

function close() {
  clearTimer()
  visible.value = false
}

function onClick() {
  if (!props.item.closeButton) close()
}

onBeforeUnmount(clearTimer)
</script>

<template>
  <Transition
    appear
    enter-active-class="vamis-toast--in"
    leave-active-class="vamis-toast--out"
    @after-enter="startTimer"
    @after-leave="emit('dismiss')"
  >
    <div
      v-if="visible"
      class="vamis-toast"
      :class="[
        `vamis-toast--${item.level}`,
        { 'vamis-toast--has-icon': item.mobile && item.showIcon !== false },
      ]"
      :data-toast-level="item.level"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
      @click="onClick"
    >
      <div v-if="item.showIcon !== false" class="vamis-toast__icon" aria-hidden="true">
        <component :is="levelIcon" />
      </div>
      <div class="vamis-toast__content">
        <span v-if="item.title" class="vamis-toast__title">{{ item.title }}</span>
        <div v-if="item.body" class="vamis-toast__body">
          <div v-if="item.allowHtml" class="vamis-html" v-html="item.body" />
          <template v-else>{{ item.body }}</template>
        </div>
      </div>
      <a v-if="item.closeButton" class="vamis-toast__close" @click.stop="close">
        <XIcon />
      </a>
    </div>
  </Transition>
</template>
