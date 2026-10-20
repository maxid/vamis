<script setup lang="ts">
import { ref } from 'vue'
import { VarmisEditor } from '@varmis/editor'
import formPage from '../examples/form-page.yaml?raw'

const yaml = ref(formPage)
</script>

<template>
  <VarmisEditor v-model="yaml" />
</template>
