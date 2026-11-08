<script setup lang="ts">
import { computed } from 'vue'
import { Label, cn } from '@vamis/ui'
import {
  SchemaRenderer,
  filterTpl,
  formItemHideLabel,
  formItemRequired,
  formItemStatic,
  formItemStaticSchema,
  formItemStaticSelectorNode,
  isControlSize,
  resolveClassName,
  statusStaticOf,
  type SchemaObject,
} from '@vamis/core'
import { useForm } from '../formContext'

const props = defineProps<{
  schema: SchemaObject
}>()

const form = useForm()
const itemData = computed(() => form?.store.data ?? {})
const error = computed(() =>
  props.schema.name ? form?.store.errors[String(props.schema.name)] : '',
)
const required = computed(() => formItemRequired(props.schema, itemData.value))
const layout = computed(() => {
  if (props.schema.inline === true) return 'inline'
  return props.schema.mode || form?.mode || 'normal'
})
const inline = computed(() => layout.value === 'inline')
const horizontal = computed(() => layout.value === 'horizontal')
const hideLabel = computed(() => formItemHideLabel(props.schema))
const showLabel = computed(() => !hideLabel.value && props.schema.label != null && props.schema.label !== '')
const labelText = computed(() =>
  showLabel.value ? filterTpl(String(props.schema.label ?? ''), itemData.value) : '',
)
const description = computed(() => {
  const raw = props.schema.description ?? props.schema.desc
  return raw != null && raw !== '' ? filterTpl(String(raw), itemData.value) : ''
})
const itemLayoutClass = computed(() => {
  if (inline.value) return 'vamis-form-item--inline'
  if (horizontal.value) return hideLabel.value ? 'vamis-form-item--horizontal vamis-form-item--no-label' : 'vamis-form-item--horizontal'
  return 'vamis-form-item--normal'
})
const sizeName = computed(() => (isControlSize(props.schema.size) ? props.schema.size : ''))
const labelClass = computed(() =>
  cn(
    resolveClassName(props.schema.className, itemData.value),
    resolveClassName(props.schema.labelClassName, itemData.value),
  ),
)
const inputClass = computed(() => resolveClassName(props.schema.inputClassName, itemData.value))
const descriptionClass = computed(() =>
  resolveClassName(props.schema.descriptionClassName, itemData.value),
)
const isStatic = computed(() =>
  formItemStatic(
    props.schema,
    itemData.value,
    form?.isStatic?.() === true,
    statusStaticOf(props.schema),
  ),
)
const staticNodes = computed(() => (isStatic.value ? formItemStaticSchema(props.schema) : null))
const selectorStatic = computed(() => {
  if (!isStatic.value || staticNodes.value) return null
  const name = props.schema.name
  const raw = (name ? form?.getValue(String(name)) : undefined) ?? props.schema.value
  return formItemStaticSelectorNode(props.schema, raw)
})
const staticText = computed(() => {
  const name = props.schema.name
  const raw = name ? form?.getValue(String(name)) : undefined
  if (raw == null || raw === '') return ''
  return String(raw)
})
const staticPlaceholder = computed(() =>
  props.schema.staticPlaceholder != null && props.schema.staticPlaceholder !== ''
    ? String(props.schema.staticPlaceholder)
    : '-',
)
const labelRemark = computed(() => {
  const raw = props.schema.labelRemark
  if (!raw) return null
  if (typeof raw === 'string') return { type: 'remark', content: raw } as SchemaObject
  if (typeof raw === 'object') {
    const rec = raw as SchemaObject
    return rec.type ? rec : ({ type: 'remark', ...rec } as SchemaObject)
  }
  return null
})
</script>

<template>
  <div
    class="vamis-form-item"
    :class="itemLayoutClass"
    :data-name="schema.name"
  >
    <Label
      v-if="!hideLabel"
      class="vamis-form-item__label"
      :class="labelClass"
    >
      <span v-if="required && (showLabel || labelRemark)" class="mr-0.5 text-destructive">*</span>
      <span v-if="showLabel" v-html="labelText" />
      <SchemaRenderer v-if="labelRemark" :schema="labelRemark" :extra-data="itemData" />
    </Label>
    <div class="vamis-form-item__value min-w-0">
      <div
        v-if="isStatic"
        class="vamis-form-static"
        :class="inputClass"
      >
        <template v-if="staticNodes">
          <SchemaRenderer
            v-for="(node, i) in staticNodes"
            :key="i"
            :schema="node"
            :extra-data="itemData"
          />
        </template>
        <SchemaRenderer
          v-else-if="selectorStatic"
          :schema="selectorStatic"
          :extra-data="itemData"
        />
        <span v-else-if="staticText">{{ staticText }}</span>
        <span v-else class="vamis-form-static__placeholder">{{ staticPlaceholder }}</span>
      </div>
      <div
        v-else
        class="min-w-0"
        :class="cn(sizeName ? `vamis-control--${sizeName}` : 'vamis-control--fluid', inputClass)"
      >
        <slot />
      </div>
      <p v-if="error" class="m-t-xs text-xs text-destructive">{{ error }}</p>
      <p
        v-else-if="description"
        class="m-t-xs text-xs text-muted-foreground"
        :class="descriptionClass"
      >
        {{ description }}
      </p>
    </div>
  </div>
</template>
