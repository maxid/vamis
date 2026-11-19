<script setup lang="ts">
import VamisEditor from './VamisEditor.vue'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <VamisEditor mini v-bind="$attrs" />
</template>
