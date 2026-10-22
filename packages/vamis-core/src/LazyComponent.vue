<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 对齐 Amis `amis-core/LazyComponent` 的开关与默认值。
 * 默认 `defaultVisible: false`：进视口才挂 slot；一旦可见就保持（`unMountOnHidden` 默认 false）。
 * 不是 Page 内核开关；Page / Form 的 initApi 仍走自身 `onMounted`。
 *
 * 文档栏是 overflow 容器：观察 root 用最近的 scroll 祖先（Amis 文档同样是内层滚动）。
 */
const props = withDefaults(
  defineProps<{
    defaultVisible?: boolean
    unMountOnHidden?: boolean
    partialVisibility?: boolean
    placeholder?: string
    className?: string
  }>(),
  {
    defaultVisible: false,
    unMountOnHidden: false,
    partialVisibility: true,
    placeholder: 'Loading...',
  },
)

function inTestEnv() {
  return typeof process !== 'undefined' && !!process.env.VITEST
}

const visible = ref(inTestEnv() || props.defaultVisible)
const skipSensor = computed(() => props.defaultVisible && !props.unMountOnHidden)
const el = ref<HTMLElement>()
let observer: IntersectionObserver | undefined
let scrollTarget: Element | Window | undefined

function stopObserve() {
  observer?.disconnect()
  observer = undefined
  if (scrollTarget) {
    scrollTarget.removeEventListener('scroll', onScrollCheck)
    scrollTarget = undefined
  }
}

function setVisible(next: boolean) {
  visible.value = next
  if (next && !props.unMountOnHidden) stopObserve()
}

function isInViewport(node: HTMLElement, root?: Element | null) {
  const rect = node.getBoundingClientRect()
  if (root && root !== document.documentElement) {
    const box = root.getBoundingClientRect()
    return rect.bottom > box.top && rect.right > box.left && rect.top < box.bottom && rect.left < box.right
  }
  const vh = window.innerHeight || document.documentElement.clientHeight || 0
  const vw = window.innerWidth || document.documentElement.clientWidth || 0
  return rect.bottom > 0 && rect.right > 0 && rect.top < vh && rect.left < vw
}

function scrollRoot(node: HTMLElement): Element | null {
  let cur: HTMLElement | null = node.parentElement
  while (cur && cur !== document.documentElement) {
    const oy = getComputedStyle(cur).overflowY
    if (oy === 'auto' || oy === 'scroll' || oy === 'overlay') return cur
    cur = cur.parentElement
  }
  return null
}

function onScrollCheck() {
  const node = el.value
  if (!node) return
  const root = scrollTarget instanceof Element ? scrollTarget : null
  if (isInViewport(node, root)) setVisible(true)
}

onMounted(() => {
  if (skipSensor.value || (visible.value && !props.unMountOnHidden)) return
  const node = el.value
  if (!node) {
    setVisible(true)
    return
  }
  if (inTestEnv() || typeof IntersectionObserver === 'undefined') {
    setVisible(true)
    return
  }
  const root = scrollRoot(node)
  if (!props.unMountOnHidden && isInViewport(node, root)) {
    setVisible(true)
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      const inView = entries.some((entry) => entry.isIntersecting)
      if (inView) setVisible(true)
      else if (props.unMountOnHidden) visible.value = false
    },
    { root, threshold: props.partialVisibility ? 0 : 1 },
  )
  observer.observe(node)
  scrollTarget = root || window
  scrollTarget.addEventListener('scroll', onScrollCheck, { passive: true })
})

onBeforeUnmount(stopObserve)
</script>

<template>
  <slot v-if="skipSensor" />
  <div
    v-else
    ref="el"
    class="visibility-sensor"
    :class="[visible ? 'in' : '', className]"
  >
    <slot v-if="visible" />
    <template v-else>{{ placeholder }}</template>
  </div>
</template>
