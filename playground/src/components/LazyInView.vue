<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/** 对齐 Amis 文档 Play 外包的 LazyComponent：进视口才挂载，一旦可见就保持。 */
const visible = ref(typeof IntersectionObserver === 'undefined')
const el = ref<HTMLElement>()
let observer: IntersectionObserver | undefined

function isInViewport(node: HTMLElement) {
  const rect = node.getBoundingClientRect()
  const vh = window.innerHeight || document.documentElement.clientHeight || 0
  const vw = window.innerWidth || document.documentElement.clientWidth || 0
  return rect.bottom > 0 && rect.right > 0 && rect.top < vh && rect.left < vw
}

onMounted(() => {
  const node = el.value
  if (!node || visible.value) return
  if (isInViewport(node)) {
    visible.value = true
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      visible.value = true
      observer?.disconnect()
      observer = undefined
    },
    { threshold: 0, rootMargin: '80px 0px' },
  )
  observer.observe(node)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="el">
    <slot v-if="visible" />
    <slot v-else name="placeholder" />
  </div>
</template>
