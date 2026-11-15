<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { provideScoped, provideValueHost, useScoped } from '@vamis/core'

/**
 * 「行」类宿主：槽里脱离表单的表单项（开关、输入框…）把改动交给这一行，而不是外层 CRUD / Page 的数据域。
 * 对齐 Amis `TableRow.handleChange`。宿主拿到 `change` 后要把行记录整体换新（`setByPathCopy`），不要原地改。
 * `init` 为真表示挂载当拍写入的默认值（`value` / `selectFirst` …），不算用户修改。
 */
const props = defineProps<{
  /**
   * 槽里是按 `name` 注册的表单项时打开：每行同名，收进本行自己的 scoped，
   * 页面那层按名字找不到（按 id 仍能找到）。
   */
  isolateNames?: boolean
}>()

const emit = defineEmits<{
  change: [payload: { name: string; value: unknown; init: boolean }]
}>()

const settled = ref(false)
onMounted(() => {
  void nextTick(() => {
    settled.value = true
  })
})
provideValueHost({
  setValue(name, value) {
    emit('change', { name, value, init: !settled.value })
  },
})
if (props.isolateNames) provideScoped(useScoped())
</script>

<template>
  <slot />
</template>
