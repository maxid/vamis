<script setup lang="ts">
import { computed } from 'vue'
import {
  filterTpl,
  iconVendor,
  resolveIcon,
  useData,
  type SchemaObject,
} from '@vamis/core'
import BadgeHost from './BadgeHost.vue'
import IconMark from './IconMark.vue'

const props = defineProps<{ schema: SchemaObject }>()
const data = useData()
const resolved = computed(() => {
  const raw = props.schema.icon
  const icon = typeof raw === 'string' ? filterTpl(raw, data.value) : raw
  return resolveIcon(icon, { vendor: iconVendor(props.schema, 'fa') })
})
</script>

<template>
  <BadgeHost :schema="schema">
    <span v-if="resolved.kind === 'missing'" class="text-danger">没有 icon {{ schema.icon }}</span>
    <IconMark v-else :icon="resolved" img-class="inline-block size-4" />
  </BadgeHost>
</template>

<style>
.vamis-icon-svg svg {
  display: inline-block;
  width: 1em;
  height: 1em;
  fill: currentColor;
  vertical-align: -0.125em;
}
</style>
