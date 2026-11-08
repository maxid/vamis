<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 滚轮遮罩必须把 Amis 的字面 `hsla()` 写进 inline style。
 * 放进 CSS 文件会被 lightningcss 编成 `#ffffffe6`，旧 WebView 当实心白。
 * 不要把 alpha 写进 custom property。
 */
const dark = ref(false)
let mo: MutationObserver | null = null

function syncDark() {
  dark.value =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
}

onMounted(() => {
  syncDark()
  if (typeof MutationObserver === 'undefined' || !document.documentElement) return
  mo = new MutationObserver(syncDark)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})
onBeforeUnmount(() => mo?.disconnect())

const fadeStyle = computed(() => {
  const from = dark.value ? 'hsla(216, 32%, 13%, 0.9)' : 'hsla(0, 0%, 100%, 0.9)'
  const to = dark.value ? 'hsla(216, 32%, 13%, 0.4)' : 'hsla(0, 0%, 100%, 0.4)'
  return {
    backgroundImage: `linear-gradient(180deg, ${from}, ${to}), linear-gradient(0deg, ${from}, ${to})`,
  }
})
</script>

<template>
  <div class="vamis-picker-fade" aria-hidden="true" :style="fadeStyle" />
</template>
