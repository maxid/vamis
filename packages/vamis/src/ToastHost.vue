<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  claimToastHost,
  dismissToast,
  releaseToastHost,
  useToastState,
  type ToastItem,
  type ToastPosition,
} from '@vamis/core'
import ToastMessage from './ToastMessage.vue'

const state = useToastState()
const hostId = ref(0)
const primary = computed(() => state.primaryHost === hostId.value)

onMounted(() => {
  hostId.value = claimToastHost()
})
onUnmounted(() => {
  releaseToastHost(hostId.value)
})

const groups = computed(() => {
  const map = new Map<ToastPosition, ToastItem[]>()
  for (const item of state.items) {
    const list = map.get(item.position) ?? []
    list.push(item)
    map.set(item.position, list)
  }
  return [...map.entries()]
})

function wrapMobile(items: ToastItem[]) {
  return items.some((item) => item.mobile)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="primary" class="vamis-toast-layer" data-vamis-toast="host">
      <div
        v-for="[position, items] in groups"
        :key="position"
        class="vamis-toast-wrap"
        :class="{ 'is-mobile': wrapMobile(items) }"
        :data-position="position"
      >
        <ToastMessage
          v-for="item in items"
          :key="item.id"
          :item="item"
          @dismiss="dismissToast(item.id)"
        />
      </div>
    </div>
  </Teleport>
</template>
