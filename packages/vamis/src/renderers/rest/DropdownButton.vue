<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  SchemaRenderer,
  actionTooltip,
  filterTpl,
  iconVendor,
  overlayContainerFrom,
  resolveIcon,
  dropdownButtonAlign,
  dropdownButtonCloseOnClick,
  dropdownButtonCloseOnOutside,
  dropdownButtonHideCaret,
  dropdownButtonItems,
  dropdownButtonTrigger,
  useData,
  useEnv,
  type SchemaObject,
} from '@vamis/core'
import { Button, VamisCaret, levelToVariant, sizeToButtonSize } from '@vamis/ui'
import IconMark from '../IconMark.vue'
import VamisOverlay from '../../overlay/VamisOverlay.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const data = useData()
const env = useEnv()
const root = ref<HTMLElement | null>(null)
const open = ref(props.schema.defaultIsOpened === true)
const items = computed(() => dropdownButtonItems(props.schema, data.value))
const trigger = computed(() => dropdownButtonTrigger(props.schema))
const hideCaret = computed(() => dropdownButtonHideCaret(props.schema))
const align = computed(() => dropdownButtonAlign(props.schema))
const overlayContainer = computed(() => overlayContainerFrom(props.schema, env))
const overlayPlacement = computed(() =>
  align.value === 'right' ? 'right-bottom-right-top right-top-right-bottom' : 'auto',
)
const label = computed(() => {
  const rec = props.schema
  if (rec.label === false || rec.label === '') return ''
  if (typeof rec.label === 'string') return filterTpl(rec.label, data.value)
  if (typeof rec.title === 'string') return filterTpl(rec.title, data.value)
  return '下拉菜单'
})
const tooltip = computed(() => actionTooltip(props.schema, data.value))
function resolveSchemaIcon(raw: unknown) {
  const value = typeof raw === 'string' ? filterTpl(raw, data.value) : raw
  return resolveIcon(value, { vendor: iconVendor(props.schema) })
}
const icon = computed(() => resolveSchemaIcon(props.schema.icon))
const rightIcon = computed(() => resolveSchemaIcon(props.schema.rightIcon))
const showLabel = computed(() => props.schema.iconOnly !== true && props.schema.label !== false && props.schema.label !== '')

let hoverTimer: ReturnType<typeof setTimeout> | undefined
function clearHoverTimer() {
  if (hoverTimer) {
    clearTimeout(hoverTimer)
    hoverTimer = undefined
  }
}

function setOpen(next: boolean) {
  if (props.disabled) return
  open.value = next
}

function onToggle() {
  if (trigger.value !== 'click') return
  setOpen(!open.value)
}

function onHoverEnter() {
  if (trigger.value !== 'hover') return
  clearHoverTimer()
  setOpen(true)
}

function onHoverLeave() {
  if (trigger.value !== 'hover') return
  clearHoverTimer()
  hoverTimer = setTimeout(() => setOpen(false), 80)
}

function onMenuClick() {
  if (dropdownButtonCloseOnClick(props.schema)) setOpen(false)
}

function onOutside() {
  if (dropdownButtonCloseOnOutside(props.schema)) setOpen(false)
}

onBeforeUnmount(() => {
  clearHoverTimer()
})
</script>

<template>
  <div
    ref="root"
    data-vamis-dropdown-button
    class="relative inline-block"
    :class="schema.block === true ? 'w-full' : ''"
    @mouseenter="onHoverEnter"
    @mouseleave="onHoverLeave"
  >
    <Button
      type="button"
      :variant="levelToVariant(schema.level)"
      :size="sizeToButtonSize(schema.size, schema.iconOnly === true)"
      :disabled="disabled"
      :title="tooltip || undefined"
      :class="schema.block === true ? 'w-full' : undefined"
      @click="onToggle"
    >
      <IconMark v-if="icon.kind !== 'empty'" :icon="icon" img-class="size-4" />
      <template v-if="showLabel">{{ label }}</template>
      <IconMark v-if="rightIcon.kind !== 'empty'" :icon="rightIcon" img-class="size-4" />
      <VamisCaret v-if="!hideCaret" variant="dropdown" :open="open" />
    </Button>
    <VamisOverlay
      :show="open"
      :target="root"
      :container="overlayContainer"
      :gap="4"
      :placement="overlayPlacement"
      @outside="onOutside"
    >
      <div
        class="min-w-36 rounded-md border bg-popover p-1 shadow-md"
        @mouseenter="onHoverEnter"
        @mouseleave="onHoverLeave"
        @click="onMenuClick"
      >
        <template v-for="(item, i) in items" :key="i">
          <div v-if="item.kind === 'divider'" class="my-1 border-t" />
          <div v-else-if="item.kind === 'group'" class="px-1 py-1">
            <p class="px-2 py-1 text-xs text-muted-foreground">{{ item.label }}</p>
            <SchemaRenderer v-for="(child, ci) in item.children" :key="ci" :schema="child.schema" />
          </div>
          <SchemaRenderer v-else :schema="item.schema" />
        </template>
      </div>
    </VamisOverlay>
  </div>
</template>
