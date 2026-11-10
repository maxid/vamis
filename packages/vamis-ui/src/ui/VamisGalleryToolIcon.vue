<script setup lang="ts">
/**
 * ImageGallery 工具栏图标：转写 Amis `rotate-left` / `rotate-right` / `zoom-in` /
 * `zoom-out` / `scale-origin`。不要用文字当按钮。
 */
import { computed } from 'vue'

const props = defineProps<{
  name: string
}>()

const kind = computed(() => {
  const n = props.name
  if (n === 'rotateLeft' || n === 'rotate-left') return 'rotate-left'
  if (n === 'rotateRight' || n === 'rotate-right') return 'rotate-right'
  if (n === 'zoomIn' || n === 'zoom-in') return 'zoom-in'
  if (n === 'zoomOut' || n === 'zoom-out') return 'zoom-out'
  if (n === 'scaleOrigin' || n === 'scale-origin') return 'scale-origin'
  return ''
})
</script>

<template>
  <svg
    v-if="kind === 'rotate-left'"
    class="icon"
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      d="M672 418H144c-17.7 0-32 14.3-32 32v414c0 17.7 14.3 32 32 32h528c17.7 0 32-14.3 32-32V450c0-17.7-14.3-32-32-32zm-44 402H188V494h440v326z"
    />
    <path
      fill="currentColor"
      d="M819.3 328.5c-78.8-100.7-196-153.6-314.6-154.2l-.2-64c0-6.5-7.6-10.1-12.6-6.1l-128 101c-4 3.1-3.9 9.1 0 12.3L492 318.6c5.1 4 12.7.4 12.6-6.1v-63.9c12.9.1 25.9.9 38.8 2.5 42.1 5.2 82.1 18.2 119 38.7 38.1 21.2 71.2 49.7 98.4 84.3 27.1 34.7 46.7 73.7 58.1 115.8 11 40.7 14 82.7 8.9 124.8-.7 5.4-1.4 10.8-2.4 16.1h74.9c14.8-103.6-11.3-213-81-302.3z"
    />
  </svg>
  <svg
    v-else-if="kind === 'rotate-right'"
    class="icon"
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      d="M480.5 251.2c13-1.6 25.9-2.4 38.8-2.5v63.9c0 6.5 7.5 10.1 12.6 6.1L660 217.6c4-3.2 4-9.2 0-12.3l-128-101c-5.1-4-12.6-.4-12.6 6.1l-.2 64c-118.6.5-235.8 53.4-314.6 154.2-69.6 89.2-95.7 198.6-81.1 302.4h74.9c-.9-5.3-1.7-10.7-2.4-16.1-5.1-42.1-2.1-84.1 8.9-124.8 11.4-42.2 31-81.1 58.1-115.8 27.2-34.7 60.3-63.2 98.4-84.3 37-20.6 76.9-33.6 119.1-38.8z"
    />
    <path
      fill="currentColor"
      d="M880 418H352c-17.7 0-32 14.3-32 32v414c0 17.7 14.3 32 32 32h528c17.7 0 32-14.3 32-32V450c0-17.7-14.3-32-32-32zm-44 402H396V494h440v326z"
    />
  </svg>
  <svg
    v-else-if="kind === 'zoom-in'"
    viewBox="0 0 201 200"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      d="m200.774 185.426-14.392 14.46-54.05-54.213a80.503 80.503 0 0 1-50.224 17.6c-37.958.228-71.066-25.737-79.89-62.657-8.824-36.92 8.964-75.05 42.924-92.01 33.96-16.96 75.128-8.275 99.343 20.959 24.214 29.233 25.083 71.3 2.097 101.508l54.192 54.353ZM82.108 18.666c-25.551-.097-48.642 15.22-58.488 38.798-9.845 23.58-4.504 50.768 13.53 68.87 18.034 18.102 45.203 23.545 68.819 13.788 23.615-9.758 39.019-32.79 39.016-58.343.026-34.775-28.102-63.008-62.877-63.113Zm9.117 99.787h-18.26v-27.51H45.583V72.609h27.382V45.12h18.26v27.49h27.402v18.334H91.225v27.51Z"
    />
  </svg>
  <svg
    v-else-if="kind === 'zoom-out'"
    viewBox="0 0 187 187"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      d="M45.455 90.91h72.727V72.726H45.455V90.91Zm100.254 41.945a81.39 81.39 0 0 0 17.927-51.037C163.636 36.628 127.01 0 81.818 0 36.628 0 0 36.627 0 81.818c0 45.191 36.627 81.818 81.818 81.818 19.318 0 37.037-6.727 51.037-17.927l40.972 40.973 12.855-12.855-40.973-40.972Zm-63.89 12.6c-35.146 0-63.637-28.491-63.637-63.637 0-35.145 28.49-63.636 63.636-63.636s63.637 28.49 63.637 63.636-28.491 63.637-63.637 63.637Z"
    />
  </svg>
  <svg
    v-else-if="kind === 'scale-origin'"
    class="icon"
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      d="M316 672h60c4.4 0 8-3.6 8-8V360c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v304c0 4.4 3.6 8 8 8zm196-50c22.1 0 40-17.9 40-39 0-23.1-17.9-41-40-41s-40 17.9-40 41c0 21.1 17.9 39 40 39zm0-140c22.1 0 40-17.9 40-39 0-23.1-17.9-41-40-41s-40 17.9-40 41c0 21.1 17.9 39 40 39z"
    />
    <path
      fill="currentColor"
      d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z"
    />
    <path
      fill="currentColor"
      d="M648 672h60c4.4 0 8-3.6 8-8V360c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v304c0 4.4 3.6 8 8 8z"
    />
  </svg>
</template>
