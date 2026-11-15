<script setup lang="ts">
/**
 * chrome 图标统一入口：按 `name` 取 `vamis-icons.ts` 里登记的字形。
 * class / width / height 透传到 `<svg>`，颜色跟 `currentColor`。
 */
import { computed } from 'vue'
import { VAMIS_ICONS, type VamisIconName } from './vamis-icons'

const props = defineProps<{ name: VamisIconName }>()
const icon = computed(() => VAMIS_ICONS[props.name])
</script>

<template>
  <!-- 字形是本包登记的常量，不含作者输入 -->
  <svg
    :viewBox="icon.viewBox"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    v-html="icon.body"
  />
</template>
