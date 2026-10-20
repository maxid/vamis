<script setup lang="ts">
import { ref } from 'vue'
import { VamisEditor } from '@vamis/editor'
import formPage from '../examples/form-page.yaml?raw'

const yaml = ref(formPage)
</script>

<template>
  <VamisEditor v-model="yaml" />
</template>
