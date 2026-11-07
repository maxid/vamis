<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { Checkbox, Pencil, VamisCaret, XIcon } from '@vamis/ui'
import { filterTpl, isAllSelected, useData, type SchemaObject } from '@vamis/core'
import FormItem from '../FormItem.vue'
import VamisOverlay from '../../overlay/VamisOverlay.vue'
import { useOptionsControl } from '../../optionsControl'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const schemaRef = toRef(props, 'schema')
const disabledRef = toRef(props, 'disabled')
const data = useData()
const rootEl = ref<HTMLElement | null>(null)
const triggerWidth = ref(0)
const creating = ref(false)
const createDraft = ref<Record<string, string>>({})

const ctl = useOptionsControl(schemaRef, disabledRef)
const locked = computed(() => !!props.disabled)
const checkAllLabel = computed(() =>
  props.schema.checkAllLabel != null ? String(props.schema.checkAllLabel) : '全选',
)
const addControls = computed(() => (Array.isArray(props.schema.addControls) ? props.schema.addControls : []))
const allChecked = computed(() => isAllSelected(ctl.selected.value, ctl.options.value, ctl.config.value.valueField))

function toggleOpen() {
  if (locked.value) return
  ctl.open.value = !ctl.open.value
  triggerWidth.value = rootEl.value?.offsetWidth || 0
  if (ctl.open.value && ctl.autoComplete.value) ctl.scheduleAutoComplete(ctl.keyword.value)
}

function startCreate() {
  creating.value = true
  const labelField = ctl.config.value.labelField || 'label'
  createDraft.value = { [labelField]: '' }
  for (const item of addControls.value) {
    if (item && typeof item === 'object' && (item as SchemaObject).name) {
      createDraft.value[String((item as SchemaObject).name)] = ''
    }
  }
}

async function confirmCreate() {
  const values = { ...createDraft.value }
  const labelField = ctl.config.value.labelField || 'label'
  if (!String(values[labelField] ?? values.label ?? '').trim() && !addControls.value.length) return
  creating.value = false
  await ctl.createOption(values)
  createDraft.value = {}
}

function cancelCreate() {
  creating.value = false
  createDraft.value = {}
}

function isSelected(value: unknown) {
  return ctl.selected.value.some((item) => String(item.value) === String(value))
}

async function onEdit(opt: (typeof ctl.options.value)[number], event: Event) {
  event.preventDefault()
  event.stopPropagation()
  ctl.open.value = false
  await ctl.editOption(opt)
}

async function onDelete(opt: (typeof ctl.options.value)[number], event: Event) {
  event.preventDefault()
  event.stopPropagation()
  ctl.open.value = false
  await ctl.deleteOption(opt)
}
</script>

<template>
  <FormItem :schema="schema">
    <div
      ref="rootEl"
      class="vamis-select"
      :class="{
        'is-opened': ctl.open.value,
        'is-disabled': locked,
        'is-multiple': ctl.config.value.multiple,
        'is-nowrap': ctl.config.value.valuesNoWrap,
      }"
    >
      <div
        class="vamis-select__input"
        :class="{ 'is-focused': ctl.open.value }"
        @click="toggleOpen"
      >
        <div class="vamis-select__value">
          <template v-if="ctl.config.value.multiple && ctl.selected.value.length">
            <span
              v-for="(item, index) in ctl.selected.value"
              :key="`${item.value}-${index}`"
              class="vamis-select__chip"
            >{{ item.label }}</span>
          </template>
          <span v-else-if="ctl.selected.value[0]" class="vamis-select__single">{{ ctl.selected.value[0].label }}</span>
          <span v-else class="vamis-select__placeholder">{{ filterTpl(ctl.placeholder.value, data) }}</span>
        </div>
        <button
          v-if="schema.clearable && ctl.hasValue.value && !locked"
          type="button"
          class="vamis-select__clear"
          aria-label="清除"
          @mousedown.prevent
          @click.stop="ctl.clear()"
        >
          ×
        </button>
        <VamisCaret class="vamis-select__caret" :open="ctl.open.value" />
      </div>
      <VamisOverlay
        :show="ctl.open.value"
        :target="rootEl"
        :container="ctl.overlayContainer.value"
        :gap="4"
        @outside="ctl.open.value = false"
      >
        <div class="vamis-select__popover" :style="{ minWidth: triggerWidth ? `${triggerWidth}px` : undefined }">
          <div v-if="ctl.config.value.searchable || ctl.autoComplete.value" class="vamis-select__search">
            <input
              :value="ctl.keyword.value"
              class="vamis-select__search-input"
              :placeholder="schema.searchPlaceholder ? String(schema.searchPlaceholder) : '搜索'"
              @mousedown.stop
              @input="ctl.keyword.value = ($event.target as HTMLInputElement).value"
            >
          </div>
          <button
            v-if="ctl.config.value.checkAll && ctl.config.value.multiple"
            type="button"
            class="vamis-select__checkall"
            @mousedown.prevent
            @click.stop="ctl.toggleAll()"
          >
            <Checkbox :model-value="allChecked" :disabled="locked" />
            <span>{{ checkAllLabel }}</span>
          </button>
          <div class="vamis-select__list">
            <div
              v-for="opt in ctl.filtered.value"
              :key="String(opt.value)"
              role="option"
              class="vamis-select__item"
              :class="{ 'is-active': isSelected(opt.value), 'is-disabled': opt.disabled || locked }"
              :title="opt.label"
              @mousedown.prevent
              @click.stop="!opt.disabled && !locked && ctl.toggle(opt)"
            >
              <Checkbox
                v-if="ctl.config.value.multiple"
                :model-value="isSelected(opt.value)"
                :disabled="!!opt.disabled || locked"
              />
              <span class="vamis-select__item-label">{{ opt.label }}</span>
              <span
                v-if="ctl.config.value.editable || ctl.config.value.removable"
                class="vamis-select__item-ops"
              >
                <button
                  v-if="ctl.config.value.editable"
                  type="button"
                  class="vamis-select__item-op"
                  aria-label="编辑"
                  :disabled="!!opt.disabled || locked"
                  @mousedown.prevent
                  @click="onEdit(opt, $event)"
                >
                  <Pencil />
                </button>
                <button
                  v-if="ctl.config.value.removable"
                  type="button"
                  class="vamis-select__item-op"
                  aria-label="删除"
                  :disabled="!!opt.disabled || locked"
                  @mousedown.prevent
                  @click="onDelete(opt, $event)"
                >
                  <XIcon />
                </button>
              </span>
            </div>
            <div v-if="ctl.loading.value && !ctl.filtered.value.length" class="vamis-select__empty">加载中…</div>
            <div v-else-if="!ctl.filtered.value.length" class="vamis-select__empty">暂无选项</div>
          </div>
          <div v-if="ctl.config.value.creatable" class="vamis-select__create">
            <button
              v-if="!creating"
              type="button"
              class="vamis-select__create-btn"
              :disabled="locked"
              @mousedown.prevent
              @click.stop="startCreate"
            >
              {{ ctl.createLabel.value }}
            </button>
            <div v-else class="vamis-select__create-form" @mousedown.stop>
              <template v-if="addControls.length">
                <input
                  v-for="item in addControls"
                  :key="String((item as SchemaObject).name)"
                  class="vamis-select__search-input"
                  :placeholder="String((item as SchemaObject).label || (item as SchemaObject).placeholder || (item as SchemaObject).name || '')"
                  :value="createDraft[String((item as SchemaObject).name)]"
                  @input="createDraft[String((item as SchemaObject).name)] = ($event.target as HTMLInputElement).value"
                >
              </template>
              <input
                v-else
                class="vamis-select__search-input"
                placeholder="请输入名称"
                :value="createDraft[ctl.config.value.labelField || 'label']"
                @input="createDraft[ctl.config.value.labelField || 'label'] = ($event.target as HTMLInputElement).value"
              >
              <div class="vamis-select__create-actions">
                <button type="button" class="vamis-select__create-btn" @click="confirmCreate">确定</button>
                <button type="button" class="vamis-select__create-btn is-muted" @click="cancelCreate">取消</button>
              </div>
            </div>
          </div>
        </div>
      </VamisOverlay>
    </div>
  </FormItem>
</template>
