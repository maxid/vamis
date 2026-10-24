<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  SchemaRenderer,
  asArray,
  filterTpl,
  panelActions,
  panelAffixFooter,
  panelBody,
  panelCollapsible,
  panelFooter,
  panelHeader,
  panelShowBody,
  panelShowHeading,
  panelTitle,
  resolveClassName,
  useData,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const data = useData()
const collapsed = ref(false)

const header = computed(() => panelHeader(props.schema))
const headerNodes = computed(() => asArray(header.value))
const title = computed(() => panelTitle(props.schema))
const titleIsSchema = computed(() => title.value != null && typeof title.value === 'object')
const titleText = computed(() => {
  const raw = title.value
  if (typeof raw === 'string' || typeof raw === 'number') return filterTpl(String(raw), data.value)
  return ''
})
const showHeading = computed(() => panelShowHeading(props.schema))
const showBody = computed(() => panelShowBody(props.schema))
const body = computed(() => panelBody(props.schema))
const footer = computed(() => panelFooter(props.schema))
const actions = computed(() => panelActions(props.schema))
const affixFooter = computed(() => panelAffixFooter(props.schema))
const collapsible = computed(() => panelCollapsible(props.schema))
const showFooterWrap = computed(() => actions.value.length > 0 || footer.value.length > 0)
const headingClass = computed(() => resolveClassName(props.schema.headerClassName, data.value))
const bodyClass = computed(() => resolveClassName(props.schema.bodyClassName, data.value))
const footerClass = computed(() => resolveClassName(props.schema.footerClassName, data.value))
const actionsClass = computed(() => resolveClassName(props.schema.actionsClassName, data.value))
const footerWrapClass = computed(() => resolveClassName(props.schema.footerWrapClassName, data.value))

function toggle() {
  if (!collapsible.value) return
  collapsed.value = !collapsed.value
}
</script>

<template>
  <div data-vamis-panel>
    <div
      v-if="showHeading"
      data-vamis-panel-heading
      :class="[headingClass, collapsible ? 'is-collapsible' : '']"
    >
      <template v-if="header != null">
        <SchemaRenderer v-for="(node, i) in headerNodes" :key="i" :schema="node" />
      </template>
      <template v-else>
        <h3 data-vamis-panel-title>
          <SchemaRenderer v-if="titleIsSchema" :schema="title as SchemaObject" />
          <template v-else>{{ titleText }}</template>
        </h3>
        <button
          v-if="collapsible"
          type="button"
          data-vamis-panel-arrow
          :data-collapsed="collapsed ? 'true' : undefined"
          aria-label="折叠"
          @click="toggle"
        >
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
            <path d="M2 4.5 L6 8.5 L10 4.5" fill="none" stroke="currentColor" stroke-width="1.4" />
          </svg>
        </button>
      </template>
    </div>
    <div v-if="showBody && !collapsed" data-vamis-panel-body :class="bodyClass">
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </div>
    <div
      v-if="showFooterWrap && !collapsed"
      data-vamis-panel-footer-wrap
      :data-affix="affixFooter ? 'true' : undefined"
      :class="footerWrapClass"
    >
      <div v-if="actions.length" data-vamis-panel-actions :class="actionsClass">
        <SchemaRenderer v-for="(node, i) in actions" :key="i" :schema="node" />
      </div>
      <div v-if="footer.length" data-vamis-panel-footer :class="footerClass">
        <SchemaRenderer v-for="(node, i) in footer" :key="i" :schema="node" />
      </div>
    </div>
  </div>
</template>

<style scoped>
[data-vamis-panel] {
  width: 100%;
  min-width: 0;
  margin: 0 0 var(--panel-margin-bottom, 20px);
  background: var(--card, #fff);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-sizing: border-box;
}
[data-vamis-panel-heading] {
  padding: var(--gap-sm, 8px) var(--gap-base, 12px);
  background: color-mix(in oklch, var(--muted) 55%, var(--card, #fff));
  color: color-mix(in oklch, var(--foreground) 72%, transparent);
  border-bottom: 1px solid var(--border);
  border-radius: var(--radius) var(--radius) 0 0;
  box-sizing: border-box;
}
[data-vamis-panel-heading].is-collapsible {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
[data-vamis-panel-title] {
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: inherit;
}
[data-vamis-panel-arrow] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transform: rotate(180deg);
  transition: transform 0.1s ease-in;
}
[data-vamis-panel-arrow][data-collapsed] {
  transform: rotate(0deg);
}
[data-vamis-panel-body] {
  padding: var(--gap-base, 12px);
  box-sizing: border-box;
}
[data-vamis-panel-footer],
[data-vamis-panel-actions] {
  padding: var(--gap-sm, 8px) var(--gap-base, 12px);
  border-top: 1px solid var(--border);
  background: transparent;
  box-sizing: border-box;
  clear: both;
}
[data-vamis-panel-actions] {
  text-align: right;
}
[data-vamis-panel-actions] > * {
  margin-left: var(--gap-sm, 8px);
}
[data-vamis-panel-footer-wrap][data-affix] {
  position: sticky;
  bottom: 0;
  z-index: 10;
  background: var(--card, #fff);
}
</style>
