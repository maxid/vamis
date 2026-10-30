<script setup lang="ts">
import { computed } from 'vue'
import { evalTemplate, tplMaxLine, tplPlainText, type SchemaObject } from '@vamis/core'
import PopOverHost from './PopOverHost.vue'
import BadgeHost from './BadgeHost.vue'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
}>()

const tag = computed(() => {
  const wrap = props.schema.wrapperComponent
  if (wrap === 'div' || wrap === 'span') return wrap
  return props.schema.inline === false ? 'div' : 'span'
})

const rendered = computed(() => {
  if (props.schema.raw != null && props.schema.raw !== '') {
    const raw = String(props.schema.raw)
    return { text: raw, html: raw, usedFilters: [] as string[] }
  }
  const source = props.schema.html ?? props.schema.tpl ?? props.schema.text ?? ''
  const textOnly =
    props.schema.html == null && props.schema.tpl == null && props.schema.text != null
  return evalTemplate(source, props.data, { asHtml: !textOnly })
})

const maxLine = computed(() => tplMaxLine(props.schema))
const htmlContent = computed(() => rendered.value.html ?? rendered.value.text ?? '')
const nativeTitle = computed(() => {
  if (props.schema.showNativeTitle !== true) return undefined
  return tplPlainText(String(htmlContent.value)) || undefined
})
const maxLineStyle = computed(() =>
  maxLine.value > 0 ? { WebkitLineClamp: String(maxLine.value) } : undefined,
)
</script>

<template>
  <BadgeHost :schema="schema" :data="data">
    <PopOverHost :schema="schema" :data="data">
      <component
        v-if="maxLine > 0"
        :is="tag"
        class="vamis-html"
        :title="nativeTitle"
      >
        <span class="vamis-html-max-line" :style="maxLineStyle" v-html="htmlContent" />
      </component>
      <component
        :is="tag"
        v-else-if="rendered.html != null"
        class="vamis-html"
        :title="nativeTitle"
        v-html="rendered.html"
      />
      <component
        :is="tag"
        v-else
        class="vamis-html"
        :title="nativeTitle"
      >{{ rendered.text }}</component>
    </PopOverHost>
  </BadgeHost>
</template>
