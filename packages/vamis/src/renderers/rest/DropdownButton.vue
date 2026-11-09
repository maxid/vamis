<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
  SchemaRenderer,
  actionTooltipRootClose,
  actionTooltipTriggers,
  dropdownButtonTooltipConfig,
  filterTpl,
  iconVendor,
  overlayContainerFrom,
  overlayIsMobile,
  provideDropdownMenuItem,
  resolveIcon,
  dropdownButtonAlign,
  dropdownButtonCloseOnClick,
  dropdownButtonCloseOnOutside,
  dropdownButtonHideCaret,
  dropdownButtonItems,
  dropdownButtonTrigger,
  tooltipEnterable,
  tooltipMouseEnterDelay,
  tooltipMouseLeaveDelay,
  useData,
  useEnv,
  type SchemaObject,
} from '@vamis/core'
import { Button, VamisCaret, levelToVariant, sizeToButtonSize } from '@vamis/ui'
import IconMark from '../IconMark.vue'
import VamisOverlay from '../../overlay/VamisOverlay.vue'
import VamisTooltipLayer from '../../overlay/VamisTooltipLayer.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const data = useData()
const env = useEnv()
const root = ref<HTMLElement | null>(null)
const open = ref(props.schema.defaultIsOpened === true)
const tipOpen = ref(false)
const items = computed(() => dropdownButtonItems(props.schema, data.value))
const trigger = computed(() => dropdownButtonTrigger(props.schema))
const hideCaret = computed(() => dropdownButtonHideCaret(props.schema))
const align = computed(() => dropdownButtonAlign(props.schema))
const overlayContainer = computed(() => overlayContainerFrom(props.schema, env))
const overlayPlacement = computed(() =>
  align.value === 'right' ? 'right-bottom-right-top right-top-right-bottom' : 'auto',
)
const mobileMenu = computed(() => overlayIsMobile(props.schema, env))
const menuWidth = ref(0)
const tipConfig = computed(() => dropdownButtonTooltipConfig(props.schema, data.value, props.disabled === true))
const hasTip = computed(() => !!tipConfig.value)
const tipTriggers = computed(() => actionTooltipTriggers(tipConfig.value))
const tipEnterable = computed(() => (tipConfig.value ? tooltipEnterable(tipConfig.value) : false))
provideDropdownMenuItem()
watch(open, async (shown) => {
  if (!shown) return
  await nextTick()
  menuWidth.value = root.value?.offsetWidth || 0
})
const label = computed(() => {
  const rec = props.schema
  if (rec.label === false || rec.label === '') return ''
  if (typeof rec.label === 'string') return filterTpl(rec.label, data.value)
  if (typeof rec.title === 'string') return filterTpl(rec.title, data.value)
  return '下拉菜单'
})
function resolveSchemaIcon(raw: unknown) {
  const value = typeof raw === 'string' ? filterTpl(raw, data.value) : raw
  return resolveIcon(value, { vendor: iconVendor(props.schema) })
}
const icon = computed(() => resolveSchemaIcon(props.schema.icon))
const rightIcon = computed(() => resolveSchemaIcon(props.schema.rightIcon))
const showLabel = computed(() => props.schema.iconOnly !== true && props.schema.label !== false && props.schema.label !== '')

let hoverTimer: ReturnType<typeof setTimeout> | undefined
let tipEnterTimer: ReturnType<typeof setTimeout> | null = null
let tipLeaveTimer: ReturnType<typeof setTimeout> | null = null
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
  if (tipTriggers.value.includes('hover')) showTip()
  if (trigger.value !== 'hover') return
  clearHoverTimer()
  setOpen(true)
}

function onHoverLeave() {
  if (tipTriggers.value.includes('hover')) hideTip()
  if (trigger.value !== 'hover') return
  clearHoverTimer()
  hoverTimer = setTimeout(() => setOpen(false), 80)
}

function onFocusIn() {
  if (tipTriggers.value.includes('focus')) showTip()
}

function onFocusOut() {
  if (tipTriggers.value.includes('focus')) hideTip()
}

function clearTipTimers() {
  if (tipEnterTimer) clearTimeout(tipEnterTimer)
  if (tipLeaveTimer) clearTimeout(tipLeaveTimer)
  tipEnterTimer = null
  tipLeaveTimer = null
}

function showTip() {
  if (!hasTip.value) return
  clearTipTimers()
  const wait = tooltipMouseEnterDelay(tipConfig.value)
  if (!wait) {
    tipOpen.value = true
    return
  }
  tipEnterTimer = setTimeout(() => {
    tipOpen.value = true
  }, wait)
}

function hideTip(immediate = false) {
  clearTipTimers()
  const wait = immediate ? 0 : tooltipMouseLeaveDelay(tipConfig.value)
  if (!wait) {
    tipOpen.value = false
    return
  }
  tipLeaveTimer = setTimeout(() => {
    tipOpen.value = false
  }, wait)
}

function onTipOutside() {
  if (actionTooltipRootClose(tipConfig.value)) hideTip(true)
}

function onTipLayerEnter() {
  if (!tipEnterable.value) return
  clearTipTimers()
  tipOpen.value = true
}

function onTipLayerLeave() {
  if (!tipEnterable.value) return
  if (tipTriggers.value.includes('hover')) hideTip()
}

function onMenuClick() {
  if (dropdownButtonCloseOnClick(props.schema)) setOpen(false)
}

function onOutside() {
  if (dropdownButtonCloseOnOutside(props.schema)) setOpen(false)
}

onBeforeUnmount(() => {
  clearHoverTimer()
  clearTipTimers()
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
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <Button
      type="button"
      :variant="levelToVariant(schema.level)"
      :size="sizeToButtonSize(schema.size, schema.iconOnly === true)"
      :disabled="disabled"
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
      <ul
        class="vamis-dropdown-menu"
        :class="{ 'is-mobile': mobileMenu }"
        :style="menuWidth ? { width: `${menuWidth}px` } : undefined"
        role="menu"
        @mouseenter="onHoverEnter"
        @mouseleave="onHoverLeave"
        @click="onMenuClick"
      >
        <template v-for="(item, i) in items" :key="i">
          <li v-if="item.kind === 'divider'" class="vamis-dropdown-divider" />
          <li v-else-if="item.kind === 'group'" class="vamis-dropdown-group">
            <div class="vamis-dropdown-group-title">{{ item.label }}</div>
            <ul class="vamis-dropdown-menu vamis-dropdown-menu--nested">
              <li
                v-for="(child, ci) in item.children"
                :key="ci"
                :class="child.kind === 'divider' ? 'vamis-dropdown-divider' : ['vamis-dropdown-item', { 'is-disabled': child.disabled }]"
                role="none"
              >
                <SchemaRenderer v-if="child.kind !== 'divider'" :schema="child.schema" />
              </li>
            </ul>
          </li>
          <li
            v-else
            class="vamis-dropdown-item"
            :class="{ 'is-disabled': item.disabled }"
            role="none"
          >
            <SchemaRenderer :schema="item.schema" />
          </li>
        </template>
      </ul>
    </VamisOverlay>
    <VamisTooltipLayer
      v-if="tipConfig"
      :show="hasTip && tipOpen"
      :target="root"
      :container="overlayContainer"
      :tooltip="tipConfig"
      :data="data"
      @outside="onTipOutside"
      @enter="onTipLayerEnter"
      @leave="onTipLayerLeave"
    />
  </div>
</template>
