<script lang="ts" setup>
/** 轻提示已改走 VamisApp 里的 ToastHost（对齐 Amis Toast）。保留导出以免旧宿主 import 崩。 */
defineProps<{
  position?: string
  offset?: number | string
  class?: string
}>()
</script>

<template></template>
