<script setup lang="ts">
import { computed, ref } from 'vue'
import { Checkbox, VamisCaret, VamisIcon } from '@vamis/ui'
import { actionTooltipConfig, overlayContainerFrom, useEnv, type SchemaObject } from '@vamis/core'
import VamisOverlay from '../../overlay/VamisOverlay.vue'
import VamisTooltipLayer from '../../overlay/VamisTooltipLayer.vue'
import { useInjectedColumnToggle, useColumnToggle, colKey } from './crudHost'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, any>
}>()

const env = useEnv()
const injected = useInjectedColumnToggle()
const localColumns = computed(() => (props.schema.columns || []) as SchemaObject[])
const localToggle = useColumnToggle(localColumns)
const toggle = injected || localToggle
const open = ref(false)
const btnEl = ref<HTMLElement | null>(null)
const container = computed(() => overlayContainerFrom({ popOverContainerSelector: props.schema.popOverContainerSelector }, env))

const columns = computed(() => toggle.togglableColumns.value)
const iconOnly = computed(() => props.schema.label === false || props.schema.iconOnly === true)
const sizeSm = computed(() => props.schema.size === 'sm')
const label = computed(() => {
  if (iconOnly.value) return ''
  if (props.schema.label != null && props.schema.label !== '') return String(props.schema.label)
  return typeof props.schema.tooltip === 'string' && props.schema.tooltip ? props.schema.tooltip : '列显示'
})
/** Amis `renderColumnsToggler`：`tooltip: { content: config.tooltip || '点击选择显示列', placement: 'bottom' }`。 */
const tipConfig = computed(() => {
  const raw = props.schema.tooltip
  if (raw === false || raw === '') return null
  const tooltip =
    raw && typeof raw === 'object' ? { placement: 'bottom', ...(raw as object) } : { content: raw || '点击选择显示列', placement: 'bottom' }
  return actionTooltipConfig({ tooltip }, props.data || {})
})
const tipOpen = ref(false)
const placement = computed(() =>
  props.schema.align === 'right' ? 'right-bottom-right-top' : 'left-bottom-left-top',
)
const shown = computed(() => columns.value.filter((col) => toggle.isVisible(col)).length)
/** Amis ColumnToggler 首项「全选」：全显 = 勾，部分 = 半选。 */
const allState = computed<boolean | 'indeterminate'>(() => {
  if (!shown.value) return false
  return shown.value === columns.value.length ? true : 'indeterminate'
})

function toggleAll() {
  toggle.setAll(shown.value !== columns.value.length)
}

function toggleCol(col: SchemaObject, index: number) {
  if (col.toggable === false) return
  toggle.setVisible(col, !toggle.isVisible(col, index), index)
}
</script>

<template>
  <div v-if="columns.length" class="vamis-column-toggler" data-column-toggler>
    <button
      ref="btnEl"
      type="button"
      class="vamis-column-toggler__btn"
      :class="{ 'is-icon': iconOnly, 'is-sm': sizeSm, 'is-opened': open, 'is-actived': shown < columns.length }"
      :aria-label="iconOnly ? '列显示' : label"
      :aria-expanded="open"
      @click.stop="open = !open"
      @mouseenter="tipOpen = true"
      @mouseleave="tipOpen = false"
      @focus="tipOpen = true"
      @blur="tipOpen = false"
    >
      <VamisIcon name="columns" v-if="iconOnly" class="vamis-column-toggler__icon" />
      <span v-if="label">{{ label }}</span>
      <VamisCaret variant="dropdown" :open="open" />
    </button>
    <VamisOverlay
      :show="open"
      :target="btnEl"
      :container="container"
      :placement="placement"
      :gap="1"
      @outside="open = false"
    >
      <ul class="vamis-column-toggler__menu" @click.stop>
        <li class="vamis-column-toggler__item">
          <label @click.prevent="toggleAll">
            <Checkbox :model-value="allState" />
            <span>全选</span>
          </label>
        </li>
        <li v-for="(col, i) in columns" :key="colKey(col, i)" class="vamis-column-toggler__item">
          <label @click.prevent="toggleCol(col, i)">
            <Checkbox :model-value="toggle.isVisible(col, i)" :disabled="col.toggable === false" />
            <span>{{ col.title || col.label || col.name }}</span>
          </label>
        </li>
      </ul>
    </VamisOverlay>
    <VamisTooltipLayer
      v-if="tipConfig"
      :show="tipOpen"
      :target="btnEl"
      :container="container"
      :tooltip="tipConfig"
      :data="data"
      @outside="tipOpen = false"
    />
  </div>
</template>
