<script setup lang="ts">
/**
 * 表格 chrome 线图，转写 Amis `amis-ui/src/icons`（sort-* / column-filter / search / edit / drag / copy / retry；`drag` 是工具栏的开始排序，`drag-bar` 是行首手柄）。
 * 作者写的 `icon` 仍走 `resolveIcon`，这里只画表头与单元格自带的那几枚。
 */
defineProps<{
  name: 'sort-asc' | 'sort-desc' | 'sort-default' | 'column-filter' | 'search' | 'edit' | 'drag' | 'drag-bar' | 'check' | 'close' | 'copy' | 'retry'
}>()
</script>

<template>
  <svg
    v-if="name === 'retry'"
    class="icon"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <g fill="currentColor">
      <path d="M7 1v5l3.75-2.5z" />
      <path d="M8 3v1.44A4.56 4.56 0 1 0 12.56 9H14a6 6 0 1 1-6-6Z" />
    </g>
  </svg>
  <svg
    v-else-if="name === 'sort-desc'"
    class="icon"
    viewBox="0 0 7 10"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      fill-rule="nonzero"
      d="m3.5 10-.7-.703L0 6.486l.7-.703 2.305 2.314V0h.99v8.097L6.3 5.783l.7.703-2.8 2.811z"
    />
  </svg>
  <svg
    v-else-if="name === 'sort-asc'"
    class="icon"
    viewBox="0 0 7 10"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      fill-rule="nonzero"
      d="m3.5 0-.7.703L0 3.514l.7.703 2.305-2.314V10h.99V1.903L6.3 4.217l.7-.703L4.2.703z"
    />
  </svg>
  <svg
    v-else-if="name === 'sort-default'"
    class="icon"
    viewBox="0 0 7 12"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      fill-rule="nonzero"
      d="m3.535 0-.707.706L0 3.534l.707.708 2.328-2.329v3.122h1V1.913l2.328 2.33.707-.709L4.242.706zm-.5 7.035v3.12L.708 7.829 0 8.535l2.828 2.828.707.708.708-.708 2.828-2.828-.708-.707-2.327 2.328V7.035z"
    />
  </svg>
  <svg
    v-else-if="name === 'column-filter'"
    class="icon"
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="m0 0 4 4.999L4.082 10 8 12V4.999L12 0H0Zm5.053 9.054-.074-4.227-.006-.327-.217-.257L2 1h8L7.244 4.243l-.223.263V10l-1.968-.946Z"
    />
  </svg>
  <svg
    v-else-if="name === 'search'"
    class="icon"
    viewBox="0 0 18 18"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      d="M2 8c0-3.309 2.691-6 6-6s6 2.691 6 6-2.691 6-6 6-6-2.691-6-6Zm16 8.586L14.314 12.9A7.955 7.955 0 0 0 16 8a8 8 0 1 0-8 8 7.955 7.955 0 0 0 4.9-1.686L16.586 18 18 16.586Z"
    />
  </svg>
  <svg
    v-else-if="name === 'edit'"
    class="icon"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      d="M8.491 1.5v1H2.5v11h11V7.532h1V14.5h-13v-13h6.991Zm5.255.122.707.708-6.364 6.364-.708-.707 6.364-6.365Z"
    />
  </svg>
  <svg
    v-else-if="name === 'drag'"
    class="icon"
    viewBox="0 0 175 201"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      d="M104.295 11.995v177.5c0 6.2 5.1 11.3 11.3 11.3 3.4 0 6.5-1.5 8.7-4.1.8-.6 1.5-1.4 2.1-2.2l46.5-66.3c3.6-5.1 2.4-12.1-2.7-15.7-5.1-3.6-12.1-2.3-15.7 2.8l-27.6 39.3v-142.6c-.1-6.2-5.2-11.3-11.4-11.3s-11.2 5.1-11.2 11.3Zm-33.2 0c0-6.2-5.1-11.3-11.3-11.3-3.4 0-6.5 1.5-8.7 4.1-.8.7-1.5 1.4-2.1 2.2l-46.5 66.3c-1.3 1.9-2 4.1-2 6.5 0 3.7 1.8 7.1 4.8 9.2 2.5 1.7 5.4 2.4 8.4 1.9s5.5-2.2 7.3-4.6l27.6-39.3v142.5c0 6.2 5.1 11.3 11.3 11.3 6.2-.1 11.2-5.2 11.2-11.4v-177.4Z"
    />
  </svg>
  <svg
    v-else-if="name === 'drag-bar'"
    class="icon"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="M6 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0-5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0-5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0-5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0-5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
    />
  </svg>
  <svg
    v-else-if="name === 'check'"
    class="icon"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path fill="currentColor" d="M13.943 3 15 4.055l-8.531 8.54L1 7.12l1.057-1.056 4.412 4.418z" />
  </svg>
  <svg
    v-else-if="name === 'copy'"
    class="icon"
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <g fill="none" fill-rule="evenodd" stroke="currentColor">
      <path d="M2.5 9.5h-2v-9h9v2" />
      <path d="M2.5 11.5h9v-9h-9z" />
    </g>
  </svg>
  <svg
    v-else
    class="icon"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      d="m13.5 1.44 1.06 1.06L9.06 8l5.5 5.5-1.06 1.06L8 9.06l-5.5 5.5-1.06-1.06L6.938 8l-5.5-5.5L2.5 1.44 8 6.938z"
    />
  </svg>
</template>
