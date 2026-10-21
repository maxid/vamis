<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'
import { Alert, AlertDescription, AlertTitle, levelToAlertVariant } from '@vamis/ui'

const props = defineProps<{ schema: SchemaObject }>()
const body = computed(() => asArray(props.schema.body))
const variant = computed(() => levelToAlertVariant(props.schema.level))
</script>

<template>
  <Alert :variant="variant">
    <AlertTitle v-if="schema.title">{{ schema.title }}</AlertTitle>
    <AlertDescription>
      <template v-if="body.length">
        <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
      </template>
      <span v-else>{{ schema.tpl || schema.msg || schema.body || '' }}</span>
    </AlertDescription>
  </Alert>
</template>
