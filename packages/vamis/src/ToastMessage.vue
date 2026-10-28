<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import type { ToastItem } from '@vamis/core'

const props = defineProps<{ item: ToastItem }>()
const emit = defineEmits<{ dismiss: [] }>()

const visible = ref(true)
let timer: ReturnType<typeof setTimeout> | undefined

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
        <svg
          v-if="item.mobile && item.level === 'warning'"
          viewBox="0 0 150 138"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M81.07 2.48a12.5 12.5 0 0 1 4.855 4.853l62.092 111.763a12.5 12.5 0 0 1-10.934 18.57H12.917a12.502 12.502 0 0 1-10.93-18.57L64.076 7.333C67.428 1.3 75.037-.873 81.071 2.48ZM75 13.403 12.913 125.167h124.17L75 13.404Zm6.25 86.763v12.5h-12.5v-12.5h12.5Zm0-53.992v45.658h-12.5V46.175h12.5Z"
            fill="currentColor"
          />
        </svg>
        <svg
          v-else-if="item.mobile && item.level === 'success'"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="none" fill-rule="evenodd" stroke-linejoin="round">
            <path
              d="M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z"
              stroke="currentColor"
              fill="currentColor"
            />
            <path stroke="#FFF" d="m11.512 5.975-4.537 4.537L4.5 8.037" />
          </g>
        </svg>
        <svg
          v-else-if="item.mobile && item.level === 'error'"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(1 1)" stroke-linejoin="round">
            <circle cx="7" cy="7" r="7" stroke="currentColor" fill="currentColor" />
            <path stroke="#FFF" fill="none" d="m4.643 9.357 4.714-4.714m-4.714 0 4.714 4.714" />
          </g>
        </svg>
        <svg
          v-else-if="item.mobile"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
        >
          <circle stroke="currentColor" fill="transparent" cx="8" cy="8" r="7.5" />
          <path fill="currentColor" d="M7 3h2v2H7zm0 3h2v7H7z" />
        </svg>
        <svg
          v-else-if="item.level === 'success'"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1024 1024"
        >
          <path
            d="m449.856 706.56-45.44-45.056.128-.064L268.16 526.016l45.12-45.44L449.6 616.064 720.192 343.68l45.376 45.056-315.712 317.888zM510.528 64A448 448 0 1 0 960 510.528 448 448 0 0 0 510.528 64z"
            fill="#30BF13"
          />
        </svg>
        <svg
          v-else-if="item.level === 'error'"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1024 1024"
        >
          <path
            d="M667.904 704.32 508.992 546.56 351.104 705.472l-45.376-45.056L463.552 501.44 304.64 343.488l45.12-45.376 158.912 157.824L666.56 297.088 712 342.144 553.984 501.12 712.96 659.008l-45.12 45.44zM510.528 64a448 448 0 1 0 2.944 896 448 448 0 0 0-2.944-896z"
            fill="#F33E3E"
          />
        </svg>
        <svg
          v-else-if="item.level === 'warning'"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1024 1024"
        >
          <path
            d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 627.2a38.4 38.4 0 1 0 0 76.8 38.4 38.4 0 0 0 0-76.8zM544 256h-64v349.12h64V256z"
            fill="#FF9326"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1024 1024"
        >
          <path
            d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm32 354.944h-64V768h64V418.944zM512 256a38.4 38.4 0 1 0-.128 76.672A38.4 38.4 0 0 0 512 256z"
            fill="#2468F2"
          />
        </svg>
      </div>
      <div class="vamis-toast__content">
        <span v-if="item.title" class="vamis-toast__title">{{ item.title }}</span>
        <div v-if="item.body" class="vamis-toast__body">
          <div v-if="item.allowHtml" class="vamis-html" v-html="item.body" />
          <template v-else>{{ item.body }}</template>
        </div>
      </div>
      <a v-if="item.closeButton" class="vamis-toast__close" @click.stop="close">
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="m12.549 2.65.707.707-4.597 4.595 4.597 4.597-.707.708-4.596-4.598-4.596 4.598-.707-.708 4.596-4.597L2.65 3.357l.707-.707 4.596 4.595 4.596-4.595Z"
            fill="currentColor"
            opacity=".5"
            fill-rule="evenodd"
          />
        </svg>
      </a>
    </div>
  </Transition>
</template>
