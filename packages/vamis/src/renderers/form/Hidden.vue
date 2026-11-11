<script setup lang="ts">
import type { SchemaObject } from '@vamis/core'
defineProps<{ schema: SchemaObject }>()
</script>

<template>
  <!-- Amis Hidden 渲染器返回 null：不落 DOM，值仍由 Form 初始化并参与提交。 -->
  <span v-if="false" />
</template>
