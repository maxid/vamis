<script setup lang="ts">
import { computed } from 'vue'
import { filterTpl, type SchemaObject } from '@vamis/core'
import BadgeHost from './BadgeHost.vue'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const href = computed(() => filterTpl(props.schema.href || props.schema.body || props.schema.url || '', props.data))
const text = computed(() => filterTpl(props.schema.body || props.schema.label || props.schema.href || '链接', props.data))
</script>

<template>
  <BadgeHost :schema="schema" :data="data">
    <a :href="href" class="text-primary underline-offset-2 hover:underline" :target="schema.blank === false ? '_self' : '_blank'">
      {{ text }}
    </a>
  </BadgeHost>
</template>
