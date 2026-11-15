<script setup lang="ts">
defineProps<{ kind: string; filename: string; src?: string }>()
</script>

<template>
  <div
    class="vamis-viewer-stub"
    :data-slot="kind"
  >
    <p class="vamis-viewer-stub__kind">{{ kind }}</p>
    <p class="vamis-viewer-stub__file">{{ filename }}</p>
    <p v-if="src" class="vamis-viewer-stub__src">{{ src }}</p>
    <p class="vamis-viewer-stub__hint">未接入预览</p>
  </div>
</template>
