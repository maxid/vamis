<script setup lang="ts">
defineProps<{ kind: string; filename: string; src?: string }>()
</script>

<template>
  <div
    class="rounded-md border border-dashed px-3 py-6 text-sm text-muted-foreground"
    :data-slot="kind"
  >
    <p class="font-medium text-foreground">{{ kind }}</p>
    <p class="mt-1 font-mono text-xs text-foreground">{{ filename }}</p>
    <p v-if="src" class="mt-1 break-all font-mono text-[11px]">{{ src }}</p>
    <p class="mt-2">未接入预览</p>
  </div>
</template>
