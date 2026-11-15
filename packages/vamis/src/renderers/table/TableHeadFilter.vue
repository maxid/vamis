<script setup lang="ts">
/**
 * 表头快速过滤。对齐 Amis `HeadCellFilterDropdown`：漏斗 + 160px 下拉菜单，
 * 单选点一下即生效；`filterable.multiple` 是勾选框；有选中时末尾多一项「重置」。
 */
import { computed, ref } from 'vue'
import type { SchemaObject, TableFilterOption } from '@vamis/core'
import { Checkbox, VamisTableIcon } from '@vamis/ui'
import VamisOverlay from '../../overlay/VamisOverlay.vue'

const props = defineProps<{
  column: SchemaObject
  options: TableFilterOption[]
  /** 当前值；多选是逗号拼接。 */
  value?: unknown
  container?: string | HTMLElement
}>()

const emit = defineEmits<{ change: [value: string | undefined] }>()

const btnEl = ref<HTMLElement | null>(null)
const opened = ref(false)
const anchor = computed(() => (btnEl.value?.closest('th') as HTMLElement | null) || btnEl.value)
const multiple = computed(() => {
  const conf = props.column.filterable
  return !!conf && typeof conf === 'object' && (conf as SchemaObject).multiple === true
})
const picked = computed(() => {
  const raw = props.value
  if (raw == null || raw === '') return [] as string[]
  return Array.isArray(raw) ? raw.map(String) : String(raw).split(',')
})
const active = computed(() => picked.value.length > 0)

function isPicked(value: string) {
  return picked.value.includes(value)
}

function close() {
  opened.value = false
}

function pick(value: string) {
  close()
  emit('change', value)
}

function toggle(value: string) {
  const next = isPicked(value) ? picked.value.filter((item) => item !== value) : [...picked.value, value]
  emit('change', next.length ? next.join(',') : undefined)
}

function reset() {
  close()
  emit('change', undefined)
}
</script>

<template>
  <span
    ref="btnEl"
    class="vamis-table__filter-btn"
    :class="{ 'is-active': active, 'is-opened': opened }"
    @click.stop
  >
    <span role="button" :aria-label="`筛选${column.label ?? ''}`" @click="opened = !opened">
      <VamisTableIcon name="column-filter" />
    </span>
    <VamisOverlay
      :show="opened"
      :target="anchor"
      :container="container"
      layer-class="vamis-overlay--popover"
      @outside="close"
    >
      <ul class="vamis-dropdown-menu vamis-table-filter" @click.stop>
        <template v-if="!multiple">
          <li
            v-for="opt in options"
            :key="opt.value"
            class="vamis-dropdown-item"
            :class="{ 'is-active': isPicked(opt.value) }"
            @click="pick(opt.value)"
          >
            {{ opt.label }}
          </li>
        </template>
        <template v-else>
          <li v-for="opt in options" :key="opt.value" class="vamis-dropdown-item vamis-table-filter__check">
            <label>
              <Checkbox :model-value="isPicked(opt.value)" @update:model-value="toggle(opt.value)" />
              <span>{{ opt.label }}</span>
            </label>
          </li>
        </template>
        <li v-if="active" class="vamis-dropdown-item" @click="reset">重置</li>
      </ul>
    </VamisOverlay>
  </span>
</template>
