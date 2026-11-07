<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { SchemaRenderer, type ToastItem } from '@vamis/core'
import { XIcon, levelToFeedbackIcon } from '@vamis/ui'

const props = defineProps<{ item: ToastItem }>()
const emit = defineEmits<{ dismiss: [] }>()

const visible = ref(true)
let timer: ReturnType<typeof setTimeout> | undefined

const levelIcon = computed(() => levelToFeedbackIcon(props.item.level))
const hasTitle = computed(() => Boolean(props.item.titleSchema || props.item.title))
const hasBody = computed(() => Boolean(props.item.bodySchema || props.item.body))

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
        <span v-if="hasTitle" class="vamis-toast__title">
          <SchemaRenderer
            v-if="item.titleSchema"
            :schema="item.titleSchema"
            :extra-data="item.data"
          />
          <template v-else>{{ item.title }}</template>
        </span>
        <div
          v-if="hasBody"
          class="vamis-toast__body"
          :class="{ 'vamis-toast__body--node': item.bodySchema }"
        >
          <SchemaRenderer
            v-if="item.bodySchema"
            :schema="item.bodySchema"
            :extra-data="item.data"
          />
          <div v-else-if="item.allowHtml" class="vamis-html" v-html="item.body" />
          <template v-else>{{ item.body }}</template>
        </div>
      </div>
      <a v-if="item.closeButton" class="vamis-toast__close" @click.stop="close">
        <XIcon />
      </a>
    </div>
  </Transition>
</template>
