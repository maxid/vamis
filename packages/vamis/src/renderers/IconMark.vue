<script setup lang="ts">
import type { ResolvedIcon } from '@vamis/core'

defineProps<{
  icon: ResolvedIcon
  imgClass?: string
}>()
</script>

<template>
  <img v-if="icon.kind === 'url'" :src="icon.src" alt="" :class="imgClass" />
  <i v-else-if="icon.kind === 'class'" :class="icon.className" aria-hidden="true" />
  <svg v-else-if="icon.kind === 'symbol'" class="icon" aria-hidden="true">
    <use :href="`#${icon.id}`" />
  </svg>
  <span v-else-if="icon.kind === 'svg'" class="vamis-icon-svg" aria-hidden="true" v-html="icon.html" />
</template>
