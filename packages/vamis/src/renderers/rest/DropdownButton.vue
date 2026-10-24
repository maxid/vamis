<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  SchemaRenderer,
  actionIconClass,
  actionIconSrc,
  actionTooltip,
  filterTpl,
  dropdownButtonAlign,
  dropdownButtonCloseOnClick,
  dropdownButtonCloseOnOutside,
  dropdownButtonHideCaret,
  dropdownButtonItems,
  dropdownButtonTrigger,
  useData,
  type SchemaObject,
} from '@vamis/core'
import { Button, levelToVariant, sizeToButtonSize } from '@vamis/ui'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const data = useData()
const root = ref<HTMLElement | null>(null)
const open = ref(props.schema.defaultIsOpened === true)
const items = computed(() => dropdownButtonItems(props.schema, data.value))
const trigger = computed(() => dropdownButtonTrigger(props.schema))
const hideCaret = computed(() => dropdownButtonHideCaret(props.schema))
const align = computed(() => dropdownButtonAlign(props.schema))
const label = computed(() => {
  const rec = props.schema
  if (rec.label === false || rec.label === '') return ''
  if (typeof rec.label === 'string') return filterTpl(rec.label, data.value)
  if (typeof rec.title === 'string') return filterTpl(rec.title, data.value)
  return '下拉菜单'
})
const tooltip = computed(() => actionTooltip(props.schema, data.value))
const iconSrc = computed(() => actionIconSrc(props.schema))
const iconClass = computed(() => actionIconClass(props.schema))
const rightSrc = computed(() => actionIconSrc(props.schema, 'rightIcon'))
const rightClass = computed(() => actionIconClass(props.schema, 'rightIcon'))
const showLabel = computed(() => props.schema.iconOnly !== true && props.schema.label !== false && props.schema.label !== '')

function setOpen(next: boolean) {
  if (props.disabled) return
  open.value = next
}

function onToggle() {
  if (trigger.value !== 'click') return
  setOpen(!open.value)
}

function onMenuClick() {
  if (dropdownButtonCloseOnClick(props.schema)) setOpen(false)
}

function onDocPointer(event: PointerEvent) {
  if (!dropdownButtonCloseOnOutside(props.schema)) return
  if (!open.value) return
  const target = event.target as Node | null
  if (target && root.value?.contains(target)) return
  setOpen(false)
}

onMounted(() => document.addEventListener('pointerdown', onDocPointer, true))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocPointer, true))
</script>

<template>
  <div
    ref="root"
    data-vamis-dropdown-button
    class="relative inline-block"
    :class="schema.block === true ? 'w-full' : ''"
    @mouseenter="trigger === 'hover' && setOpen(true)"
    @mouseleave="trigger === 'hover' && setOpen(false)"
  >
    <Button
      type="button"
      :variant="levelToVariant(schema.level)"
      :size="sizeToButtonSize(schema.size)"
      :disabled="disabled"
      :title="tooltip || undefined"
      :class="schema.block === true ? 'w-full' : undefined"
      @click="onToggle"
    >
      <img v-if="iconSrc" :src="iconSrc" alt="" class="size-4" />
      <span v-else-if="iconClass" :class="iconClass" aria-hidden="true" />
      <template v-if="showLabel">{{ label }}</template>
      <img v-if="rightSrc" :src="rightSrc" alt="" class="size-4" />
      <span v-else-if="rightClass" :class="rightClass" aria-hidden="true" />
      <span
        v-if="!hideCaret"
        aria-hidden="true"
        class="ml-2 inline-block size-0 border-x-[3.5px] border-x-transparent border-t-[4px] border-t-current"
        :class="open ? 'rotate-180' : ''"
      />
    </Button>
    <div
      v-if="open"
      class="absolute z-40 mt-1 min-w-36 rounded-md border bg-popover p-1 shadow-md"
      :class="align === 'right' ? 'right-0' : 'left-0'"
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
  </div>
</template>
