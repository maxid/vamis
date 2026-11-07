<script setup lang="ts">
/**
 * 月历标题箭头：原样转写 Amis `right-arrow` / `right-double-arrow`（svgr `className: icon`）。
 * 左翻用 `date-icon-arrow-left` + rotate(180deg)，不要另画一套 path。
 */
withDefaults(
  defineProps<{
    icon?: 'right-arrow' | 'right-double-arrow'
    left?: boolean
  }>(),
  { icon: 'right-arrow', left: false },
)
</script>

<template>
  <svg
    v-if="icon === 'right-double-arrow'"
    class="icon icon-right-double-arrow"
    :class="left ? 'date-icon-arrow-left' : 'date-icon-arrow'"
    viewBox="0 0 10 10"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="m.713.001 4.95 4.95-.003.003.003.003-4.95 4.95L0 9.194l4.24-4.24L0 .714.713.001Zm3.997 0 4.95 4.948-.004.004.004.003-4.95 4.95-.713-.714 4.24-4.239-4.24-4.24L4.71 0Z"
      fill="currentColor"
      fill-rule="evenodd"
    />
  </svg>
  <svg
    v-else
    class="icon icon-right-arrow"
    :class="left ? 'date-icon-arrow-left' : 'date-icon-arrow'"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path stroke="currentColor" fill="none" stroke-linejoin="round" d="m5.497 13.664 5.657-5.657L5.497 2.35" />
  </svg>
</template>
