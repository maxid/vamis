<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'
import {
  createVamisEvent,
  eventEvalData,
  findOption,
  overlayContainerFrom,
  overlayIsMobile,
  optionsResetValue,
  POPUP_DEFAULT_HEIGHT,
  runOnEvent,
  treeNodeLabel,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type SchemaObject,
} from '@vamis/core'
import { VamisCaret, VamisClear, VamisClose } from '@vamis/ui'
import FormItem from '../FormItem.vue'
import TreeBranch from './TreeBranch.vue'
import VamisOverlay from '../../overlay/VamisOverlay.vue'
import VamisPopUp from '../../overlay/VamisPopUp.vue'
import VamisTooltipLayer from '../../overlay/VamisTooltipLayer.vue'
import { useTreeField } from './useTreeField'
import { optionValuesEqual, type OptionItem } from '../../options'
import { useFieldValue } from '../../formContext'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const env = useEnv()
const data = useData()
const scoped = useScoped()
const overlay = useOverlay()
const formApi = useFormApi()
const scope = useScope()
const fieldApi = useFieldValue()
const tree = useTreeField(toRef(props, 'schema'), toRef(props, 'disabled'))
const open = ref(false)
const draft = ref<unknown[]>([])
const rootEl = ref<HTMLElement | null>(null)
const triggerEl = ref<HTMLElement | null>(null)
const searchInputEl = ref<HTMLInputElement | null>(null)
const triggerWidth = ref(0)
const pristine = ref<unknown>()
const overflowEl = ref<HTMLElement | null>(null)
const overflowTip = ref(false)
let overflowHideTimer: ReturnType<typeof setTimeout> | undefined
const isMobile = computed(() => overlayIsMobile(props.schema, env))
const overlayContainer = computed(() =>
  overlayContainerFrom({ popOverContainerSelector: props.schema.popOverContainerSelector }, env),
)
const locked = computed(() => !!props.disabled)
const workingValues = computed(() => (isMobile.value && open.value ? draft.value : tree.selected.value))
const selectedItems = computed(() =>
  workingValues.value.map((value) => ({
    value,
    label: treeNodeLabel(tree.options.value, value, {
      hideNodePathLabel: tree.hideNodePathLabel.value,
      labelSeparator: ' / ',
      pathSeparator: tree.pathSeparator.value,
      valueField: tree.valueField.value,
    }),
  })),
)
const visibleSelectedItems = computed(() => {
  const maxTag = Number(props.schema.maxTagCount)
  if (!Number.isFinite(maxTag) || maxTag <= 0) return selectedItems.value
  return selectedItems.value.slice(0, maxTag)
})
const restSelectedItems = computed(() =>
  selectedItems.value.slice(visibleSelectedItems.value.length),
)
const overflowTooltip = computed(() => {
  const pop = props.schema.overflowTagPopover
  const extra =
    pop && typeof pop === 'object' && !Array.isArray(pop) ? { ...(pop as Record<string, unknown>) } : {}
  delete extra.children
  delete extra.content
  const extraClass = extra.tooltipClassName != null ? String(extra.tooltipClassName) : ''
  return {
    placement: 'auto',
    showArrow: false,
    enterable: true,
    ...extra,
    tooltipClassName: ['vamis-select-overflow', extraClass].filter(Boolean).join(' '),
  }
})
const placeholder = computed(() =>
  props.schema.placeholder != null ? String(props.schema.placeholder) : '请选择',
)
const allowTriggerInput = computed(
  () =>
    (tree.searchable.value || !!props.schema.autoComplete) &&
    !isMobile.value &&
    (tree.multiple.value || selectedItems.value.length === 0),
)
const popoverStyle = computed(() =>
  triggerWidth.value ? { minWidth: `${triggerWidth.value}px` } : undefined,
)

function currentValue(): unknown {
  return props.schema.name ? fieldApi.getValue(String(props.schema.name)) : props.schema.value
}

function selectedItemsFrom(values: unknown[]): OptionItem[] {
  return values
    .map((value) => findOption(tree.options.value, value, tree.valueField.value))
    .filter((item): item is OptionItem => !!item)
}

async function emitTreeEvent(
  eventName: 'focus' | 'blur' | 'change',
  value: unknown,
  values: unknown[] = tree.selected.value,
) {
  const items = tree.options.value
  const name = String(props.schema.name || '')
  const payload = {
    ...data.value,
    value,
    item: selectedItemsFrom(values)[0],
    items,
    options: items,
    selectedItems: selectedItemsFrom(values),
    ...(name ? { [name]: value } : {}),
  }
  const event = createVamisEvent(eventName, payload)
  await runOnEvent(props.schema, eventName, {
    env,
    data: eventEvalData(payload, event),
    scoped,
    overlay,
    form: formApi,
    scope: scope.value,
    event,
  })
  return event
}

async function commitSelected(values: unknown[]): Promise<boolean> {
  const next = tree.serializeSelected(values)
  const event = await emitTreeEvent('change', next, values)
  if (event.prevented) return false
  tree.writeSelected(values)
  return true
}

async function commitRaw(value: unknown): Promise<boolean> {
  const values = Array.isArray(value) ? value : value === '' || value == null ? [] : [value]
  const event = await emitTreeEvent('change', value, values)
  if (event.prevented) return false
  if (props.schema.name) fieldApi.setValue(String(props.schema.name), value)
  return true
}

function measureTrigger() {
  triggerWidth.value = rootEl.value?.offsetWidth ?? 0
}

function openMenu() {
  if (!locked.value) open.value = true
}

function toggleOpen() {
  if (locked.value) return
  if (!open.value && isMobile.value) draft.value = [...tree.selected.value]
  open.value = !open.value
}

function closeMenu() {
  open.value = false
  if (!tree.multiple.value || isMobile.value) tree.query.value = ''
}

async function confirmMobile() {
  if (!(await commitSelected([...draft.value]))) return
  tree.query.value = ''
  open.value = false
}

async function onPick(item: OptionItem) {
  const next = tree.applyToggle(item, workingValues.value)
  if (!next) return
  if (isMobile.value && open.value) {
    draft.value = next
    return
  }
  if (!(await commitSelected(next))) return
  tree.query.value = ''
  if (!tree.multiple.value) open.value = false
}

async function removeTag(item: { value: unknown }, event: Event) {
  event.stopPropagation()
  if (locked.value) return
  const next = workingValues.value.filter((value) => !optionValuesEqual(value, item.value))
  if (isMobile.value && open.value) draft.value = next
  else await commitSelected(next)
}

async function clearAll(event: Event) {
  event.stopPropagation()
  if (locked.value) return
  if (!(await commitRaw(optionsResetValue(props.schema)))) return
  draft.value = []
  tree.query.value = ''
}

function onSearchInput(event: Event) {
  tree.query.value = (event.target as HTMLInputElement).value
  openMenu()
}

function showOverflow() {
  if (overflowHideTimer) clearTimeout(overflowHideTimer)
  overflowTip.value = true
}

function hideOverflow() {
  if (overflowHideTimer) clearTimeout(overflowHideTimer)
  overflowHideTimer = setTimeout(() => {
    overflowTip.value = false
  }, 80)
}

let wasOpen = false
watch(open, (show) => {
  if (show) {
    void nextTick(() => {
      measureTrigger()
      searchInputEl.value?.focus()
    })
    if (!wasOpen) void emitTreeEvent('focus', currentValue())
  } else if (wasOpen) {
    void emitTreeEvent('blur', currentValue())
  }
  wasOpen = show
})

let resizeObserver: ResizeObserver | undefined

async function clearValue() {
  await commitRaw(optionsResetValue(props.schema))
}

async function resetValue() {
  const next =
    pristine.value !== undefined
      ? pristine.value
      : props.schema.value !== undefined
        ? props.schema.value
        : optionsResetValue(props.schema)
  await commitRaw(next)
}

const scopedApi = {
  id: String(props.schema.id || props.schema.name || ''),
  name: String(props.schema.name || props.schema.id || ''),
  type: 'tree-select',
  schema: props.schema,
  reload: () => tree.reloadOptions(),
  getData: () => ({ value: currentValue() }),
  setData(values: Record<string, unknown>) {
    const name = String(props.schema.name || '')
    const next = Object.prototype.hasOwnProperty.call(values, 'value')
      ? values.value
      : name
        ? values[name]
        : undefined
    if (name && next !== undefined) fieldApi.setValue(name, next)
  },
  async doAction(action: unknown) {
    const rec =
      action && typeof action === 'object' && !Array.isArray(action)
        ? (action as {
            actionType?: string
            value?: unknown
            args?: {
              item?: unknown
              originValue?: unknown
              parentValue?: unknown
              value?: unknown
            }
          })
        : {}
    const type = String(rec.actionType || '')
    if (type === 'clear') await clearValue()
    else if (type === 'reset') await resetValue()
    else if (type === 'reload') await tree.reloadOptions()
    else if (type === 'setValue') await commitRaw(rec.args?.value ?? rec.value)
    else if (type === 'add') {
      await tree.addOptionFromAction(rec.args?.item, rec.args?.parentValue)
    } else if (type === 'edit') {
      await tree.editOptionFromAction(rec.args?.item, rec.args?.originValue)
    } else if (type === 'delete') {
      await tree.deleteOptionFromAction(rec.args?.value)
    }
  },
}

onMounted(() => {
  pristine.value = currentValue()
  scoped?.register(scopedApi)
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(measureTrigger)
    if (rootEl.value) resizeObserver.observe(rootEl.value)
  }
  if (typeof window !== 'undefined') window.addEventListener('resize', measureTrigger)
  scheduleMeasure()
})

onBeforeUnmount(() => {
  scoped?.unregister(scopedApi)
  resizeObserver?.disconnect()
  if (overflowHideTimer) clearTimeout(overflowHideTimer)
  if (typeof window !== 'undefined') window.removeEventListener('resize', measureTrigger)
})

function scheduleMeasure() {
  void nextTick(measureTrigger)
}
</script>

<template>
  <FormItem :schema="schema">
    <div
      ref="rootEl"
      class="vamis-select vamis-tree-select"
      :class="{
        'is-opened': open,
        'is-disabled': locked,
        'is-multiple': tree.multiple.value,
        'is-mobile': isMobile,
        'is-fold': restSelectedItems.length > 0,
      }"
    >
      <div
        ref="triggerEl"
        class="vamis-select__input"
        :class="{ 'is-focused': open }"
        @click="toggleOpen"
      >
        <div class="vamis-select__value">
          <template v-if="tree.multiple.value && selectedItems.length">
            <span
              v-for="(item, index) in visibleSelectedItems"
              :key="`${String(item.value)}-${index}`"
              class="vamis-select__chip"
            >
              <span class="vamis-select__chip-label">{{ item.label }}</span>
              <button
                v-if="!locked"
                type="button"
                class="vamis-select__chip-close"
                aria-label="移除"
                @mousedown.prevent
                @click="removeTag(item, $event)"
              ><VamisClose /></button>
            </span>
            <span
              v-if="restSelectedItems.length"
              ref="overflowEl"
              class="vamis-select__chip vamis-select__overflow"
              @mouseenter="showOverflow"
              @mouseleave="hideOverflow"
            >+ {{ restSelectedItems.length }} ...</span>
          </template>
          <span v-else-if="!allowTriggerInput && selectedItems[0]" class="vamis-select__single">{{ selectedItems[0].label }}</span>
          <input
            v-if="allowTriggerInput"
            ref="searchInputEl"
            class="vamis-tree-select__search-input"
            type="text"
            :value="tree.query.value"
            :placeholder="selectedItems.length ? '' : placeholder"
            autocomplete="off"
            @click.stop="openMenu"
            @input="onSearchInput"
          >
          <span v-else-if="!selectedItems[0]" class="vamis-select__placeholder">{{ placeholder }}</span>
        </div>
        <span class="vamis-select__suffix">
          <button
            v-if="schema.clearable && (selectedItems.length || tree.query.value) && !locked"
            type="button"
            class="vamis-select__clear"
            aria-label="清除"
            @mousedown.prevent
            @click.stop="clearAll"
          >
            <VamisClear />
          </button>
          <VamisCaret class="vamis-select__caret" :open="!isMobile && open" />
        </span>
      </div>
      <VamisTooltipLayer
        :show="overflowTip && restSelectedItems.length > 0"
        :target="overflowEl"
        :container="overlayContainer"
        :tooltip="overflowTooltip"
        :data="data"
        @enter="showOverflow"
        @leave="hideOverflow"
      >
        <template #body>
          <div class="vamis-select-overflow__grid">
            <span
              v-for="(item, index) in restSelectedItems"
              :key="`rest-${String(item.value)}-${index}`"
              class="vamis-select__chip"
            >
              <span class="vamis-select__chip-label">{{ item.label }}</span>
              <button
                v-if="!locked"
                type="button"
                class="vamis-select__chip-close"
                aria-label="移除"
                @mousedown.prevent
                @click="removeTag(item, $event)"
              ><VamisClose /></button>
            </span>
          </div>
        </template>
      </VamisTooltipLayer>
      <VamisPopUp
        v-if="isMobile"
        :show="open"
        :height="POPUP_DEFAULT_HEIGHT"
        :container="overlayContainer"
        @cancel="closeMenu"
        @confirm="confirmMobile"
      >
        <TreeBranch
          :nodes="tree.filteredOptions.value"
          :checked="(item) => tree.checked(item, workingValues)"
          :partial="(item) => tree.partial(item, workingValues)"
          :check-disabled="(item) => tree.checkDisabled(item, workingValues)"
          :disabled="locked"
          :expanded="tree.isExpanded"
          :deferring="tree.isDeferring"
          :defer-field="tree.deferField.value"
          :loading-config="schema.loadingConfig"
          :outline="tree.showOutline.value"
          :show-icon="tree.showIcon.value"
          :multiple="tree.multiple.value"
          :show-radio="tree.showRadio.value"
          :query="tree.query.value"
          :creatable="tree.creatable.value"
          :editable="tree.editable.value"
          :removable="tree.removable.value"
          :root-creatable="tree.rootCreatable.value"
          :is-adding="tree.isAdding.value"
          :adding-parent="tree.addingParent.value"
          :editing-item="tree.editingItem.value"
          :draft-label="tree.draftLabel.value"
          :create-tip="tree.createTip.value"
          :edit-tip="tree.editTip.value"
          :remove-tip="tree.removeTip.value"
          :root-create-tip="tree.rootCreateTip.value"
          :item-actions="schema.itemActions"
          :menu-tpl="schema.menuTpl"
          :icon-field="schema.iconField"
          :enable-default-icon="schema.enableDefaultIcon"
          :node-behavior="schema.nodeBehavior"
          @pick="onPick"
          @expand="tree.toggleExpand"
          @add="tree.startAdd"
          @edit="tree.startEdit"
          @remove="tree.removeItem"
          @confirm="tree.confirmEdit"
          @cancel="tree.cancelEdit"
          @update:draft-label="tree.draftLabel.value = $event"
        />
      </VamisPopUp>
      <VamisOverlay
        v-else
        :show="open"
        :target="triggerEl"
        :container="overlayContainer"
        :gap="4"
        placement="auto"
        @outside="closeMenu"
      >
        <div class="vamis-select__popover vamis-tree-select__popover" :style="popoverStyle">
          <TreeBranch
            :nodes="tree.filteredOptions.value"
            :checked="(item) => tree.checked(item, workingValues)"
            :partial="(item) => tree.partial(item, workingValues)"
            :check-disabled="(item) => tree.checkDisabled(item, workingValues)"
            :disabled="locked"
            :expanded="tree.isExpanded"
            :deferring="tree.isDeferring"
            :defer-field="tree.deferField.value"
            :loading-config="schema.loadingConfig"
            :outline="tree.showOutline.value"
            :show-icon="tree.showIcon.value"
            :multiple="tree.multiple.value"
            :show-radio="tree.showRadio.value"
            :query="tree.query.value"
            :creatable="tree.creatable.value"
            :editable="tree.editable.value"
            :removable="tree.removable.value"
            :root-creatable="tree.rootCreatable.value"
            :is-adding="tree.isAdding.value"
            :adding-parent="tree.addingParent.value"
            :editing-item="tree.editingItem.value"
            :draft-label="tree.draftLabel.value"
            :create-tip="tree.createTip.value"
            :edit-tip="tree.editTip.value"
            :remove-tip="tree.removeTip.value"
            :root-create-tip="tree.rootCreateTip.value"
            :item-actions="schema.itemActions"
            :menu-tpl="schema.menuTpl"
            :icon-field="schema.iconField"
            :enable-default-icon="schema.enableDefaultIcon"
            :node-behavior="schema.nodeBehavior"
            @pick="onPick"
            @expand="tree.toggleExpand"
            @add="tree.startAdd"
            @edit="tree.startEdit"
            @remove="tree.removeItem"
            @confirm="tree.confirmEdit"
            @cancel="tree.cancelEdit"
            @update:draft-label="tree.draftLabel.value = $event"
          />
        </div>
      </VamisOverlay>
    </div>
  </FormItem>
</template>
