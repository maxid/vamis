<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  filterTpl,
  resolveIcon,
  useData,
  type SchemaObject,
} from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import IconMark from '../IconMark.vue'
import PopOverHost from '../PopOverHost.vue'

const props = defineProps<{ schema: SchemaObject; data?: Record<string, any> }>()
const form = useForm()
const injected = useData()

const watchData = computed(() => ({ ...injected.value, ...(props.data || {}) }))
const name = computed(() => (props.schema.name ? String(props.schema.name) : ''))

/** 当前值：表单域优先，其次 data，最后 schema.value。 */
const rawValue = computed(() => {
  if (name.value) {
    const fromForm = form?.getValue(name.value)
    if (fromForm !== undefined) return fromForm
    if (name.value in watchData.value) return watchData.value[name.value]
  }
  return props.schema.value
})

/** Amis：`static-xxx` 渲染 `<xxx>`；`static` 带 tpl 走 tpl，否则 plain。 */
const subType = computed(() => {
  const raw = String(props.schema.type || '')
  if (!/^static/.test(raw)) return raw
  const suffix = raw.slice(7).replace(/^-/, '')
  if (suffix) return suffix
  return props.schema.tpl != null ? 'tpl' : 'plain'
})

const textValue = computed(() => {
  if (props.schema.text != null) return filterTpl(String(props.schema.text), watchData.value)
  const value = rawValue.value
  if (value == null) return ''
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
})

const tplSchema = computed<SchemaObject>(() => ({
  type: 'tpl',
  tpl: props.schema.tpl != null ? props.schema.tpl : textValue.value,
  inline: true,
}))

const targetSchema = computed<SchemaObject>(() => {
  const { quickEdit, copyable, popOver, text, ...rest } = props.schema
  return {
    ...rest,
    type: subType.value,
    value: rawValue.value,
  } as SchemaObject
})

const targetData = computed(() => ({
  ...watchData.value,
  value: rawValue.value,
  ...(name.value ? { [name.value]: rawValue.value } : {}),
}))

const copyable = computed(() => !!props.schema.copyable)
const copyIcon = computed(() => resolveIcon('copy', { vendor: 'fa' }))
const copyContent = computed(() => {
  const conf = props.schema.copyable
  const raw =
    conf && typeof conf === 'object' && !Array.isArray(conf) && (conf as SchemaObject).content != null
      ? String((conf as SchemaObject).content)
      : name.value
        ? '${' + name.value + ' | raw}'
        : textValue.value
  return filterTpl(raw, watchData.value)
})
const copyTip = computed(() => {
  const conf = props.schema.copyable
  if (conf && typeof conf === 'object' && !Array.isArray(conf) && conf.tooltip != null) {
    return filterTpl(String(conf.tooltip), watchData.value)
  }
  return '复制'
})

async function copyText() {
  const content = copyContent.value
  if (!content) return
  try {
    await navigator.clipboard.writeText(content)
  } catch {
    /* 宿主禁用剪贴板时静默失败 */
  }
}

const borderMode = computed(() => {
  const raw = String(props.schema.borderMode || '')
  return raw === 'full' || raw === 'half' ? raw : ''
})
const formItemSchema = computed(() => ({ ...props.schema, static: false }))
</script>

<template>
  <FormItem :schema="formItemSchema">
    <PopOverHost :schema="schema" :data="watchData" default-position="right">
      <div
        class="vamis-form-static vamis-static"
        :class="borderMode ? `vamis-static--border-${borderMode}` : ''"
      >
        <span
          v-if="subType === 'plain'"
          class="vamis-static__text"
          :class="{ 'vamis-form-static__placeholder': !textValue }"
        >{{ textValue || schema.placeholder || '-' }}</span>
        <SchemaRenderer
          v-else-if="subType === 'tpl'"
          :schema="tplSchema"
          :extra-data="watchData"
        />
        <SchemaRenderer v-else :schema="targetSchema" :extra-data="targetData" />
        <button
          v-if="copyable && copyContent"
          type="button"
          class="vamis-static__copy"
          :data-tooltip="copyTip"
          data-position="right"
          :aria-label="copyTip"
          @click.stop="copyText"
        >
          <IconMark :icon="copyIcon" img-class="inline-block size-4" />
        </button>
      </div>
    </PopOverHost>
  </FormItem>
</template>
