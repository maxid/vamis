<script setup lang="ts">
import { VamisIcon } from '@vamis/ui'
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
import { provideForm, useForm } from '../formContext'

const props = defineProps<{ schema: SchemaObject }>()
const data = useData()
const parentForm = useForm()
const collapsed = ref(false)

const subFormMode = computed(() => {
  const mode = props.schema.subFormMode
  return mode ? String(mode) : parentForm?.mode
})
const subFormHorizontal = computed(() => {
  const horizontal = props.schema.subFormHorizontal
  return horizontal && typeof horizontal === 'object' && !Array.isArray(horizontal)
    ? horizontal
    : parentForm?.horizontal
})

if (parentForm) {
  provideForm({
    ...parentForm,
    get mode() {
      return subFormMode.value
    },
    get horizontal() {
      return subFormHorizontal.value
    },
  })
}

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
const headingControlClass = computed(() =>
  resolveClassName(props.schema.headerControlClassName, data.value),
)
const titleControlClass = computed(() =>
  resolveClassName(props.schema.headerTitleControlClassName, data.value),
)
const bodyClass = computed(() => resolveClassName(props.schema.bodyClassName, data.value))
const bodyControlClass = computed(() =>
  resolveClassName(props.schema.bodyControlClassName, data.value),
)
const footerClass = computed(() => resolveClassName(props.schema.footerClassName, data.value))
const actionsClass = computed(() => resolveClassName(props.schema.actionsClassName, data.value))
const actionsControlClass = computed(() =>
  resolveClassName(props.schema.actionsControlClassName, data.value),
)
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
      :class="[headingClass, headingControlClass, collapsible ? 'is-collapsible' : '']"
    >
      <template v-if="header != null">
        <SchemaRenderer v-for="(node, i) in headerNodes" :key="i" :schema="node" />
      </template>
      <template v-else>
        <h3 data-vamis-panel-title :class="titleControlClass">
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
          <VamisIcon name="chevron-down" width="12" height="12" />
        </button>
      </template>
    </div>
    <div
      v-if="showBody && !collapsed"
      data-vamis-panel-body
      :class="[bodyClass, bodyControlClass]"
    >
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </div>
    <div
      v-if="showFooterWrap && !collapsed"
      data-vamis-panel-footer-wrap
      :data-affix="affixFooter ? 'true' : undefined"
      :class="footerWrapClass"
    >
      <div
        v-if="actions.length"
        data-vamis-panel-actions
        :class="[actionsClass, actionsControlClass]"
      >
        <SchemaRenderer v-for="(node, i) in actions" :key="i" :schema="node" />
      </div>
      <div
        v-if="footer.length"
        data-vamis-panel-footer
        :class="[footerClass, actionsControlClass]"
      >
        <SchemaRenderer v-for="(node, i) in footer" :key="i" :schema="node" />
      </div>
    </div>
  </div>
</template>
