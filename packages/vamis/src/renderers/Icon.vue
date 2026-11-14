<script setup lang="ts">
import { computed } from 'vue'
import {
  filterTpl,
  iconBuiltinSvg,
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
  const builtin = iconBuiltinSvg(icon)
  if (builtin) return { kind: 'svg' as const, html: builtin }
  return resolveIcon(icon, { vendor: iconVendor(props.schema, 'fa') })
})
</script>

<template>
  <BadgeHost :schema="schema">
    <span v-if="resolved.kind === 'missing'" class="text-danger">没有 icon {{ schema.icon }}</span>
    <span v-else-if="resolved.kind === 'svg'" class="vamis-icon-host is-builtin">
      <IconMark :icon="resolved" />
    </span>
    <IconMark v-else :icon="resolved" />
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
/* Amis registerIcon SVG 没有 svg.icon 的 1em；包含块有定宽时跟文字撑开（按钮卡片 plus）。 */
.vamis-node:has(.vamis-icon-host.is-builtin) {
  display: block;
}
.vamis-icon-host.is-builtin {
  display: block;
}
.vamis-icon-host.is-builtin .vamis-icon-svg svg {
  display: inline;
  width: auto;
  height: auto;
  vertical-align: unset;
}
</style>
