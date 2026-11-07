<script setup lang="ts">
/**
 * Chrome caret：转写 Amis `right-arrow-bold`（10×10 线形箭头），不要 CSS 实心三角。
 * select：外壳 90°，展开时 svg 再转 180°（对标 `.Select-arrow`）。
 * dropdown：svg 90° → 展开 270°（对标 `.DropDown-caret`）。
 * tree：0° 朝右 → 展开 90° 朝下。
 */
withDefaults(
  defineProps<{
    open?: boolean
    variant?: 'select' | 'dropdown' | 'tree'
  }>(),
  { variant: 'select' },
)
</script>

<template>
  <span
    class="vamis-caret"
    :class="[`vamis-caret--${variant}`, { 'is-open': open }]"
    aria-hidden="true"
  >
    <svg viewBox="0 0 99 176" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <path
        fill="currentColor"
        d="M95.503 79.708a10.77 10.77 0 0 0-.914-.813L19.687 3.605c-4.17-4.17-10.932-4.17-15.102 0s-4.17 10.93 0 15.1L72.8 87.31 3.12 156.922c-4.17 4.17-4.17 10.931 0 15.102 4.17 4.17 10.931 4.17 15.102 0l76.366-76.301a10.645 10.645 0 0 0 4.04-8.414 10.643 10.643 0 0 0-3.125-7.601Z"
      />
    </svg>
  </span>
</template>
