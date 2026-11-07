<script setup lang="ts">
/**
 * 密码显隐钮：转写 Amis `view` / `invisible` 16×16 线图，不要 lucide 块图标。
 * revealed=true 明文（睁眼），false 密文（看不见）。
 */
defineProps<{ revealed?: boolean }>()
</script>

<template>
  <span class="vamis-password-toggle" :class="{ 'is-revealed': revealed }" aria-hidden="true">
    <svg v-if="revealed" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="M8 3c3.989 0 7 3.873 7 5 0 .883-3.011 5-7 5-4.04 0-7-4.117-7-5 0-1.127 2.96-5 7-5Zm0 1C4.733 4 2.218 7.086 2.009 7.973 2.275 8.771 4.719 12 7.999 12c3.21 0 5.735-3.269 5.994-4.037C13.807 7.126 11.27 4 8 4Zm-.025 1.88a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0 1a1.001 1.001 0 0 0 0 2 1.001 1.001 0 0 0 0-2Z"
      />
    </svg>
    <svg v-else viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="M2.92 5c.24.56.57 1.078.977 1.535A5.655 5.655 0 0 0 8.14 8.44a5.664 5.664 0 0 0 4.212-1.87c.34-.375.628-.794.857-1.246l.13-.275.915.404a6.682 6.682 0 0 1-2.256 2.761l.959 1.66-.866.5-.95-1.645c-.763.384-1.6.622-2.473.69v1.553h-1V9.423a6.653 6.653 0 0 1-2.572-.715l-.947 1.64-.866-.5.96-1.662A6.694 6.694 0 0 1 3.15 7.2a6.638 6.638 0 0 1-1.022-1.527L2 5.393 2.92 5Z"
      />
    </svg>
  </span>
</template>
